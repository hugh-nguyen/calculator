// import * as cdk from '@aws-cdk/core';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import * as iam from "aws-cdk-lib/aws-iam";
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
// import { ManagedPolicy } from 'aws-cdk/aws-iam';
// import { KubernetesManifest } from 'aws-cdk/aws-eks';

export class EksCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const clusterName = 'free-tier-cluster2';

    const cluster = new eks.Cluster(this, 'Cluster', {
      clusterName: clusterName,
      defaultCapacity: 0,
      version: eks.KubernetesVersion.V1_27,
      clusterLogging: [
        eks.ClusterLoggingTypes.API,
        eks.ClusterLoggingTypes.AUTHENTICATOR,
        eks.ClusterLoggingTypes.SCHEDULER,
        eks.ClusterLoggingTypes.CONTROLLER_MANAGER,
        eks.ClusterLoggingTypes.AUDIT,
      ],
    });

    const nodeGroup = cluster.addNodegroupCapacity('ng-free-tier', {
      minSize: 1,
      maxSize: 3,
      desiredSize: 3,
      instanceTypes: [new ec2.InstanceType('t3.medium')],
      diskSize: 20,
    });


    const awsAuth = new eks.AwsAuth(this, 'AwsAuth', {
      cluster: cluster,
    });


    // role
    const role = new iam.Role(this, 'EksClusterRole', {
      assumedBy: new iam.ArnPrincipal('arn:aws:iam::771856851144:user/sys_user'),
      roleName: 'eks-cluster-role',
    });

    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSClusterPolicy'));
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSWorkerNodePolicy'));
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'));

    awsAuth.addRoleMapping(role, {
      groups: ['system:masters'],
      username: 'eks-cluster-role',
    });

    // user
    const user = iam.User.fromUserArn(this, 'SysUser', 'arn:aws:iam::771856851144:user/sys_user');
    awsAuth.addUserMapping(user, {
      groups: ['system:masters'],
      username: 'sys_user',
    });


    // Load balancer
    const loadBalancerControllerPolicy = new iam.ManagedPolicy(this, 'LoadBalancerControllerPolicy', {
      managedPolicyName: 'LoadBalancerControllerPolicy',
      statements: [
        new iam.PolicyStatement({
          actions: [
            "elasticloadbalancing:*",
            "ec2:Describe*",
            "ec2:Get*",
            "ec2:AuthorizeSecurityGroupIngress",
            "ec2:CreateSecurityGroup",
            "ec2:DeleteSecurityGroup",
            "ec2:CreateTags",
            "wafv2:GetWebACLForResource",
            "wafv2:AssociateWebACL",
            "wafv2:DisassociateWebACL",
            "waf-regional:GetWebACLForResource",
            "shield:GetSubscriptionState",
            "shield:DescribeProtection",
            "shield:CreateProtection",
            "shield:DeleteProtection",
          ],
          resources: ['*'],
        }),
      ],
    });

    const oidcProviderArn = cluster.openIdConnectProvider.openIdConnectProviderArn;
    const oidcProviderIssuer = cluster.openIdConnectProvider.openIdConnectProviderIssuer;
    const conditions = new cdk.CfnJson(this, 'MyConditionJson', {
      value: {
        [`${oidcProviderIssuer}:sub`]: "system:serviceaccount:kube-system:lb-controller-sa"
      }
    });
    const loadBalancerControllerRole = new iam.Role(this, 'LoadBalancerControllerRole', {
      roleName: "lb-controller-role",
      assumedBy: new iam.WebIdentityPrincipal(
        oidcProviderArn,
        {
          "StringEquals": conditions
        }
      ),
    });

    loadBalancerControllerRole.addManagedPolicy(loadBalancerControllerPolicy);

    const sa = cluster.addServiceAccount('LoadBalancerControllerServiceAccount', {
      name: 'lb-controller-sa',
      namespace: 'kube-system',
      annotations: {
        'eks.amazonaws.com/role-arn': loadBalancerControllerRole.roleArn
      },
    });
    

    // helm charts

    cluster.addHelmChart('ArgoCD', {
      chart: 'argo-cd',
      repository: 'https://argoproj.github.io/argo-helm',
      namespace: 'argocd',
      release: 'argocd',
      values: {
        server: {
          ingress: {
            enabled: true,
            ingressClassName: 'alb',
            hosts: ['argocd.hugh-nguyen.com'],
            paths: ['/'],
            annotations: {
              'kubernetes.io/ingress.class': 'alb',
              'alb.ingress.kubernetes.io/scheme': 'internet-facing',
              'alb.ingress.kubernetes.io/target-type': 'ip',
            }
          }
        }
      },
      createNamespace: true,
    });

    const awsLoadBalancerControllerChart = cluster.addHelmChart('AwsLoadBalancerController', {
      chart: 'aws-load-balancer-controller',
      release: 'aws-load-balancer-controller',
      namespace: 'kube-system',
      repository: 'https://aws.github.io/eks-charts',
      version: "1.6.2",
      values: {
        clusterName: cluster.clusterName,
        serviceAccount: {
          create: false,
          name: sa.serviceAccountName,
        },
      },
    });

    awsLoadBalancerControllerChart.node.addDependency(sa);

  }
}

