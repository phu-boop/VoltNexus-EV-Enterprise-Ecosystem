# Hướng dẫn Demo: VoltNexus Enterprise Ecosystem on Kubernetes

Tài liệu này tổng hợp toàn bộ các lệnh và quy trình để bạn thực hiện buổi demo một hệ thống Microservices vận hành thực thụ trên Kubernetes, tích hợp Giám sát (Prometheus/Grafana) và Kiểm thử tải (K6).

---

## 🏗 Bước 1: Chuẩn bị Image và Môi trường

**1.1. Build Image (Sử dụng các config hiện tại):**
Bạn cần đảm bảo các image đã được build ở máy local.
```bash
# Ví dụ build Gateway (Thực hiện tương tự cho các service khác)
docker build -t my-gateway:latest -f gateway/Dockerfile .
```

**1.2. Load Image vào Minikube (Bắt buộc):**
Để Minikube không tốn thời gian kéo image từ internet và tránh lỗi ImagePull, hãy load chúng vào bộ nhớ đệm:
```bash
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
```

---

## 📊 Bước 2: Triển khai Infrastructure & Monitoring

**2.1. Cài đặt Helm (Nếu chưa có):**
```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

**2.2. Triển khai Prometheus & Grafana:**
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace monitoring
helm install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring
```

**2.3. Truy cập Grafana Dashboard:**
Mở một terminal mới và giữ lệnh này để truy cập giao diện giám sát:
```bash
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring
# Truy cập: http://localhost:3000 (User/Pass: admin / prom-operator)
```

---

## 🚀 Bước 3: Triển khai Microservices

Triển khai toàn bộ ecosystem vào namespace `voltnexus`:
```bash
# Tạo namespace và config
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml

# Triển khai hạ tầng (Redis, Kafka, Zookeeper)
kubectl apply -f k8s/infrastructure/data-plane.yaml

# Triển khai 10 Microservices (Đã cấu hình replicas: 2 cho Gateway và Sales)
kubectl apply -f k8s/services/backend.yaml
```

**Kiểm tra trạng thái:**
```bash
kubectl get pods -n voltnexus
```

---

## ⚡ Bước 4: Demo Load Testing (K6 in Cluster)

Đây là phần ấn tượng nhất của buổi demo: Chạy bài test tải trực tiếp bên trong cluster.

**4.1. Cập nhật kịch bản test (ConfigMap):**
```bash
kubectl apply -f k8s/performance/k6-configmap.yaml
```

**4.2. Chạy Job Load Test:**
```bash
# Xóa job cũ nếu có
kubectl delete job k6-load-test -n voltnexus || true

# Chạy job mới
kubectl apply -f k8s/performance/k6-job.yaml
```

**4.3. Xem kết quả bắn tải Real-time:**
```bash
kubectl logs -f job/k6-load-test -n voltnexus
```

---

## 🎯 Các kịch bản Demo bạn có thể nói:
1.  **Scaling:** Cho khán giả xem lệnh `kubectl get pods -n voltnexus` để thấy Gateway và Sales Service đang chạy **2 Pods** đồng thời để chia tải.
2.  **Resource Limits:** Vào Grafana, chỉ ra các biểu đồ CPU/RAM bị giới hạn (Resource Quotas) giúp hệ thống không bị "treo" khi bị bắn tải.
3.  **Self-healing:** Thử xóa một Pod đang chạy (`kubectl delete pod <tên-pod>`) và cho khách xem K8s tự động tạo lại Pod mới ngay lập tức.
4.  **Performance:** Chỉ vào kết quả log K6 để thấy latency cực thấp (**~10ms**) nhờ vào mạng nội bộ của Kubernetes.
