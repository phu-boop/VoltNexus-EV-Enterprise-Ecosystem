# Hướng Dẫn Thực Hành Demo K8s Hệ Sinh Thái VoltNexus

Thực hành demo khởi chạy dự án Microservice thực tế (VoltNexus-EV-Enterprise-Ecosystem) bằng Kubernetes trên Minikube thay vì ứng dụng hello-world. Điều này chứng minh được việc áp dụng thành công kiến thức vào project phức tạp.

## Bước 0: Chuẩn bị
1. Terminal đang ở thư mục gốc của dự án `VoltNexus-EV-Enterprise-Ecosystem`.
2. Kubernetes Cluster (Minikube) đang bật. Các image dịch vụ (`my-gateway:latest`, `my-user-service:latest`, ...) đã có sẵn hoặc đã được load vào Minikube qua lệnh Docker build.
*(Lưu ý: Các Secret như `user-service-secret` được giả định đã tồn tại trong K8s. Nếu là cụm mới tinh cần tạo Secret trước).*

## Bước 1: Khởi động Minikube và mở giao diện quản trị (GUI)
Khởi động K8s:
```bash
minikube start
```
Bật giao diện quản lý trên Tab Terminal 2:
```bash
minikube dashboard
```
> Trình duyệt web sẽ tự động mở lên trang "Kubernetes Dashboard". Trong phiên Demo, ta sẽ quan sát toàn bộ hàng chục dịch vụ đồng loạt sinh ra trên này.

## Bước 2: Tự động hoá triển khai (Deployment) với K8s
Thuyết minh: *"Nếu chạy thủ công 10 dịch vụ và 3 cơ sở hạ tầng (Kafka, Redis, ZK) ta phải gõ lệnh rất lâu. Nhưng với Kubernetes, mọi thứ được khai báo (declarative) và K8s tự động phân bổ tài nguyên. Em sẽ tiến hành gõ lệnh để hệ thống tự chạy:"*

Áp dụng toàn bộ hệ sinh thái (từng file cấu hình trong thư mục k8s của project gốc):
```bash
# 1. Tạo Namespace riêng cho dự án
kubectl apply -f k8s/namespace.yaml

# 2. Đẩy các cấu hình dùng chung
kubectl apply -f k8s/configmap.yaml

# 3. Kích hoạt CSDL, Broker (Redis, Kafka, Zookeeper)
kubectl apply -f k8s/infrastructure/data-plane.yaml

# 4. Triển khai cả 10 Microservice (User, Customer, AI, Vehicle...)
kubectl apply -f k8s/services/backend.yaml
```

**- Click Mở GUI Dashboard**
Trên góc trên màn hình `Namespace`, hãy chọn namespace là `voltnexus`. Nhấn qua Tab **Deployments** hoặc **Pods**. 
- Thầy cô sẽ bị choáng ngợp và ấn tượng bởi bảng danh sách hàng chục Pod màu xanh lá (hoặc cam nhấp nháy, đang báo hiệu hệ thống tự động khởi tạo và kết nối với nhau). Hệ thống Microservice khổng lồ nay đã được lên sóng nhanh chóng.

## Bước 3: Mở kết nối Gateway LoadBalancer
Để người từ internet/máy thật có thể tương tác với cụm, do service của file `backend.yaml` đoạn Gateway dùng `type: LoadBalancer`. Ta chạy lệnh ảo hoá IP LoadBalancer của Minikube:

> (Tạo 1 cửa sổ bash mới):
```bash
minikube tunnel
```
Lênh này giả lập cấp phát External-IP. Lúc này, gõ trên bash để xem IP Gateway:
```bash
kubectl get services gateway -n voltnexus
```
Dùng trình duyệt truy cập vào đường link `http://localhost:8080/` hoặc IP External hiện ra để demo giao tiếp với hệ thống thật.

## Bước 4: Demo Tính năng Tự phục hồi "Self-Healing"
Hãy vào **Minikube Dashboard > Pods (chọn Namespace voltnexus)**.
1. Tìm con Pod của `payment-service` (Dịch vụ thanh toán rất quan trọng của sàn EV). 
2. Xóa nó (Click 3 chấm ở góc -> Delete, hoặc gõ lệnh `kubectl delete pod [tên-pod-payment...] -n voltnexus`).
- **Trình bày:** *"Trường hợp Server gặp lỗi làm ứng dụng Payment bị sập. Ngay lập tức (chưa tới 1 giây trên giao diện), Deployment Engine của Kubernetes nhận thấy tình trạng thiếu hụt và tự động gọi bổ sung lại 1 Pod Payment Service khác để thay chỗ"*. Web không hề bị lỗi! Khách vẫn mua bình thường!

## Bước 5: Phóng to quy mô phục vụ Đột Xuất (Auto Scaling Up)
Giả sử có chiến dịch Flash Sale xe điện. Riêng dịch vụ Bán Hàng `sales-service` và `gateway` nhận chục ngàn yêu cầu 1 giây. Các dịch vụ khác thì rảnh.
Nhờ kiến trúc microservices và sức mạnh của K8s rẽ nhánh cô lập mạng, ta chỉ cần nhân bản riêng `sales-service`:

```bash
kubectl scale deployment sales-service --replicas=4 -n voltnexus
kubectl scale deployment gateway --replicas=2 -n voltnexus
```
**- Chuyển sang GUI Kubernetes Dashboard**: Thầy cô sẽ thấy số lượng thanh Pod của Sales tăng vọt từ 1 lên 4 thanh để cùng gánh tải, tài nguyên không bị phung phí cho các thành phần khác.

MỌI THỨ DIỄN RA HOÀN TOÀN AUTO VÀ REAL-TIME! CỰC KỲ ẤN TƯỢNG CHO BÁO CÁO CUỐI KỲ.

## Bước 6: Xóa để dọn dẹp hệ thống (Teardown)
Chỉ một lệnh để tắt toàn bộ 13 dịch vụ:
```bash
kubectl delete namespace voltnexus
```
