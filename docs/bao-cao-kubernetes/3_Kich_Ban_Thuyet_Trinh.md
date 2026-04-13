# Gợi ý làm Slide và Kịch bản Giới thiệu Demo (Speech) 
(Áp dụng dự án thật - Cực ViP)

## 1. Dàn ý Slide Cấu trúc:
- **Slide 1 - Cấu trúc đồ án**: "Đề tài 6: Ứng dụng Kubernetes Quản trị Container cho Hệ sinh thái Microservices VoltNexus".
- **Slide 2 - Vấn đề Khó Khăn (Nỗi đau)**: "Để vận hành dự án VoltNexus, nhóm chúng em đã chia kiến trúc thành hơn 10 microservices nhỏ (User, Sales, Dealer...) và 3 dịch vụ cơ sở hạ tầng nền. Vấn đề: Cần chạy cả 13 tiến trình trên Server như thế nào? Cấu hình mạng lưới port ra sao để chúng không đánh nhau? Nếu 2h sáng dịch vụ Thanh Toán bị sập thì ai đứng dậy khởi động lại?".
- **Slide 3 - Kubernetes Nhạc Trưởng**: Giải pháp Kubernetes thần thánh. Cấu trúc khai báo (Declarative): "Tôi cấp file YAML, K8s tự lo cấu hình máy móc" -> Đóng vai trò làm nhạc trưởng điều tiết toàn dự án.
- **Slide 4 - Giải thích Pod & Deployment**: Giải thích Pod (như lớp bọc ngoài, trong chứa 1 container springboot) và Deployment giám sát số lượng bản sao.
- **Slide 5 - Giải thích Service**: Lý do 1 dịch vụ (chẳng hạn User Service) cần một địa chỉ Service loại ClusterIP tĩnh để nội bộ gọi giao tiếp với nhau mà không sợ sai IP. Giải thích API Gateway cần 1 loại Service đặc biệt là LoadBalancer tiếp xúc với Internet công cộng.

---

## 2. Kịch bản lời nói lúc Click chuột màn hình diễn Demo:
> 🎤 *"Thưa HĐGV, phần tiếp sau đây, nhóm sẽ chuyển qua Live Demo trực tiếp ngay trên chính sản phẩm đồ án mà chúng ta đang thấy. Nhóm giả lập một cụm máy chủ với Kubernetes Minikube Dashboard hiển thị ở bên cạnh."*
>
> 📌 **Launch toàn hệ thống với K8s (Thần chú 1 chạm):** 
> Gõ các lệnh `kubectl apply` từ file config.
> *"Như thầy cô thấy, thay vì phải chạy hàng chục kịch bản bash/mở chục tab IDE tốn cả tiếng đồng hồ. Em chỉ cấu hình YAML tại folder k8s/, và bấm chạy apply. Xin thầy cô nhìn sang giao diện Dashboard: Toàn bộ 13 ứng dụng Microservices của sàn Giao dịch VoltNexus đồng loạt được tải vào các Pod và khởi tạo thông luồng với nhau chớp nhoáng."*
>
> 📌 **Expose Gateway (LoadBalancer):** 
> Chạy lệnh Minikube Tunnel. Mở tab web Browser.
> *"Hệ thống đứng im bên trong tường rào ảo. Ở K8s ta quy định API Gateway mang nhiệm vụ làm bảo vệ. Bằng cấu hình Kubernetes LoadBalancer, em xuất được cổng ra giao diện frontend ngoài mạng thực kết nối suôn sẻ trơn tru."*
> 
> **=> Đỉnh cao: Demo Xoá sập hệ thống thanh toán:**
> Bấm nút Delete Pod của Payment / Sales trên GUI. 
> *"Hệ thống càng to, lỗi vặt CVM chết càng cao. Em giả lập xoá sập 1 ổ đĩa khiến dịch vụ Payment-Service báo tử... Hãy xem! K8s Auto Healing lập tức gọi dậy 1 Replica (bản sao) mới thế chỗ bù lấp ngay lập tức. Tính năng này giúp các hệ thống Ngân hàng không bao giờ sập."*
> 
> **=> Phóng to Microservices thông minh:**
> Gõ lệnh Scale số lượng POD.
> *"Bình thường app truyền thống khi traffic cao, ta phải nhân bản nguyên Server vật lý nặng nề. Với k8s, em chỉ tăng đúng 1 phần nào bị nghẽn (ví dụ lúc này người ta truy cập Sales Sale nhiều). Em sẽ nâng cấp từ 1 thành 4 cái hộp chứa code sales-service bằng scale. Giúp xử lý mượt mà."*

---

## 📝 TODO List (Nhiệm vụ chuẩn bị trước giờ G):
- [ ] Soạn lại file Slide dùng dàn ý trên.
- [ ] Chạy lệnh `minikube start` từ trước. 
- [ ] Cực kỳ quan trọng: Mở sẵn cái Cửa sổ màn hình Dashboard `minikube dashboard` kéo sang 1 nửa sát bên rìa màn hình. Để lúc bạn gõ gõ thì Dashboard bên này các chấm xanh ngắt nó cứ chạy vù vù trông cực kỳ có học thuật và Pro.
- [ ] Verify xem namespace `voltnexus` đã có trong hệ thống Dashboard chưa khi demo (có thể lọc theo Namespace trên góc web menu).
- [ ] Lưu ý xóa bỏ 2 file `nginx-deployment.yaml` và `nginx-service.yaml` cũ để tránh nộp nhầm file của dự án cũ (mình đã dọn giúp bạn ở tin nhắn này không cần tạo nữa, bạn xoá tay nếu đã lỡ chép). Dùng luôn thư mục `k8s/` xịn của VoltNexus.
