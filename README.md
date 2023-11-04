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
kubectl apply -f deployment.yml
kubectl apply -f service.yml
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
argocd login localhost:8082 --username admin --password XXXX --insecure
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