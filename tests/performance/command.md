docker run --rm --network voltnexus-ev-enterprise-ecosystem_app-network \
  -v $(pwd)/tests/performance:/src \
  -i grafana/k6 run /src/load-test.js




// start kerbunets
AWS
ssh -i voltnexus-key.pem ubuntu@54.242.202.65
// GUI
minikube GUI
minikube start --memory=8192 --cpus=4


// performance
// hybrid 
docker run --rm \
  --add-host=host.docker.internal:host-gateway \
  --network voltnexus-ev-enterprise-ecosystem_app-network \
  -v $(pwd)/tests/performance:/src \
  grafana/k6 run /src/load-test.js




// forward port in kubectl
kubectl port-forward service/gateway 8080:8080 -n voltnexus






lỗi 

customer 





step in kuber


 Phase 1: Docker Image Preparation
 Build all microservice images(  tôi dùng docker compose)
 minikube image load my-gateway:latest
minikube image load my-user-service:latest
minikube image load my-customer-service:latest
minikube image load my-dealer-service:latest
minikube image load my-inventory-service:latest
minikube image load my-payment-service:latest
minikube image load my-sales-service:latest
minikube image load my-vehicle-service:latest
minikube image load my-reporting-service:latest
minikube image load my-ai-service:latest

 Phase 2: Monitoring Infrastructure (Helm)
 Install Helm (if missing)
 Deploy kube-prometheus-stack
 Phase 3: Kubernetes Deployment
 Update namespace, configmaps, and secrets
 Update backend.yaml with scaling and internal DNS
 Apply all manifests to Minikube
 Phase 4: In-Cluster Performance Test
 Create K6 ConfigMap
 Deploy K6 Job
 Verify logs and Grafana metrics


passwword 
devphu@devphu:~$ kubectl --namespace monitoring get secrets monitoring-grafana \
-o jsonpath="{.data.admin-password}" | base64 --decode ; echo
5HWgruapsdCcuUNGYItHyig4o2i9HfQtIEmQfMdo
devphu@devphu:~$ 


// monitor
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring


// k6 

kubectl apply -f k8s/performance/k6-configmap.yaml && \
kubectl delete job k6-load-test -n voltnexus --ignore-not-found=true && \
kubectl apply -f k8s/performance/k6-job.yaml