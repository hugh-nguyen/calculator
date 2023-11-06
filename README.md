# Kubernetes and Argo Learning 

This application runs a simple calculator app in a number of different ways

## Run locally with docker-compose 
```
docker-compose up --build
```

browse to http://localhost:3000/

## Upload to dockerhub 
```
docker login
docker build -t hughnguyen/calculator-frontend:latest .
docker build -t hughnguyen/calculator-backend:latest .
docker push hughnguyen/calculator-frontend:latest
docker push hughnguyen/calculator-backend:latest
```

## Run locally with minikube 
```
minikube start
kubectl apply -f manifests/deployment.yml
kubectl apply -f manifests/service.yml
kubectl port-forward svc/calculator-frontend-service 8081:80
kubectl port-forward svc/calculator-backend-service 8080:8080
```
browse to - http://localhost:8081/

## Run Argo CD 
```
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl port-forward svc/argocd-server -n argocd 8082:443
```
browse to http://localhost:8082
Get password
```
brew install argocd
argocd admin initial-password -n argocd
```
Register App
```
argocd login localhost:8082 --username admin --password XXX --insecure
argocd app create calculator \
  --repo https://github.com/hugh-nguyen/calculator.git \
  --path manifests \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default \
  --port-forward-namespace argocd
```
Sync App
```
argocd app sync calculator
```
Set automatic sync
```
argocd app set calculator --sync-policy automated
```
## Deploy with helm
```
brew install heml
helm create calculator-chart
helm install calculator ./calculator-chart
```
Uninstall a helm chart and register it with Argo CD
```
helm uninstall calculator
argocd app create calculator \
  --repo https://github.com/hugh-nguyen/calculator.git \
  --path calculator-chart \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default 
```
TODO: helm chart repository?

## EKS
```
brew install eksctl
eksctl create cluster -f cluster.yaml
aws eks update-kubeconfig --region ap-southeast-2 --name free-tier-cluste
```
asset setup
```
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl port-forward svc/argocd-server -n argocd 8082:443

argocd admin initial-password -n argocd
argocd login localhost:8082 --username admin --password XXX --insecure
argocd app create calculator \
  --repo https://github.com/hugh-nguyen/calculator.git \
  --path calculator-chart \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default 

# go to https://localhost:8082/ and sync
```

## Useful commands 
delete all pods
```
kubectl delete pods --all --all-namespaces
```
delete all deployments & services
```
kubectl delete deployments --all --namespace=default
kubectl delete services --all --namespace=default
```
service check
```
kubectl get svc calculator-frontend-service
```
get pods
```
kubectl get pods
```
get a service url 
```
minikube service calculator-frontend-service --url
```
port forward
```
kubectl port-forward svc/calculator-frontend-service 8081:80
kubectl port-forward svc/calculator-backend-service 8080:8080
```
delete cluster
```
eksctl delete cluster --region=ap-southeast-2 --name=free-tier-cluster
```