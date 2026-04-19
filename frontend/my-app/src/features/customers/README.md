# Customer Feature Module - Sub-features Structure

## 📁 Cấu trúc tổ chức theo Sub-features

```
features/customers/
│
├── testdrive/                      # 🚗 SUB-FEATURE: Test Drive Management
│   ├── components/                 # Components riêng cho Test Drive
│   │   ├── TestDriveCard.jsx
│   │   ├── TestDriveFilter.jsx
│   │   └── TestDriveFormModal.jsx
│   ├── pages/                      # Pages riêng cho Test Drive  
│   │   └── TestDriveManagement.jsx  ✅ ĐÃ TẠO
│   └── services/                   # Services phụ cho Test Drive
│       ├── testDriveService.js      ✅ ĐÃ TẠO
│       └── vehicleService.js        ✅ ĐÃ TẠO
│
├── management/                     # 👥 SUB-FEATURE: Customer Management
│   ├── components/                 # Components riêng cho Customer
│   │   ├── CreateCustomerModal.jsx
│   │   ├── EditCustomerModal.jsx
│   │   ├── ViewCustomerModal.jsx
│   │   └── CustomerCard.jsx
│   ├── pages/                      # Pages riêng cho Customer
│   │   └── CustomerList.jsx
│   └── services/                   # Services phụ cho Customer
│       └── customerService.js
│
├── assignment/                     # 📋 SUB-FEATURE: Staff Assignment
│   ├── components/                 # Components riêng cho Assignment
│   │   └── AssignStaffModal.jsx
│   └── services/                   # Services phụ cho Assignment
│       └── staffService.js
│
├── components/                     # ⚠️ Components DÙNG CHUNG (nếu cần)
│   └── (shared components across all sub-features)
│
├── hooks/                          # ⚠️ Hooks DÙNG CHUNG
│   └── useCustomers.js
│
├── pages/                          # ⚠️ Pages DÙNG CHUNG (nếu cần)
│
└── services/                       # ✅ SERVICES DÙNG CHUNG - KHÔNG THAY ĐỔI
    ├── apiConstCustomerService.js   # Axios instance cho Customer API
    ├── apiConstTestDrive.js         # Axios instance cho TestDrive API
    ├── customerService.js           # Customer service dùng chung (nếu cần)
    ├── staffService.js              # Staff service dùng chung (nếu cần)
    └── index.js                     # Export các services dùng chung
```

## 🎯 Nguyên tắc tổ chức

### 1. Services Dùng Chung (`features/customers/services/`)
**KHÔNG THAY ĐỔI** - Các file này giữ nguyên vị trí:
- `apiConstCustomerService.js` - Axios instance với baseURL customer
- `apiConstTestDrive.js` - Axios instance với baseURL test-drives
- Các service dùng chung cho nhiều sub-features

### 2. Sub-feature Services (`testdrive/services/`, `management/services/`, etc.)
**Services phụ** riêng cho từng sub-feature:
- `testDriveService.js` - Business logic cho test drive
- `vehicleService.js` - Business logic cho vehicles
- `customerService.js` - Business logic cho customer management

### 3. Import Paths
```javascript
// ✅ Import axios instance TỪ services dùng chung
import apiConstTestDrive from '../../services/apiConstTestDrive';

// ✅ Import service TỪ sub-feature
import { getTestDrivesByDealer } from '../services/testDriveService';

// ✅ Import component TỪ sub-feature
import TestDriveCard from '../components/TestDriveCard';
```

## 📦 Chi tiết các Sub-features

### 🚗 testdrive/ - ĐÃ HOÀN THÀNH
**Mục đích**: Quản lý lịch hẹn lái thử xe

**Pages**:
- ✅ `TestDriveManagement.jsx` - Trang quản lý lịch hẹn

**Components** (TODO - Cần di chuyển):
- `TestDriveCard.jsx` - Card hiển thị thông tin lịch hẹn
- `TestDriveFilter.jsx` - Bộ lọc lịch hẹn
- `TestDriveFormModal.jsx` - Form tạo/sửa lịch hẹn

**Services**:
- ✅ `testDriveService.js` - API calls cho test drive (CRUD, filter, confirm, etc.)
- ✅ `vehicleService.js` - API calls cho vehicles (getAllModels, getModelDetails, etc.)

### 👥 management/ - CHƯA HOÀN THÀNH
**Mục đích**: Quản lý thông tin khách hàng

**Pages** (TODO):
- `CustomerList.jsx` - Trang danh sách khách hàng

**Components** (TODO - Cần di chuyển):
- `CreateCustomerModal.jsx` - Modal tạo khách hàng mới
- `EditCustomerModal.jsx` - Modal sửa thông tin khách hàng
- `ViewCustomerModal.jsx` - Modal xem chi tiết khách hàng
- `CustomerCard.jsx` - Card hiển thị thông tin khách hàng

**Services** (TODO):
- `customerService.js` - Business logic cho customer (nếu cần tách riêng)

### 📋 assignment/ - CHƯA HOÀN THÀNH
**Mục đích**: Phân công nhân viên cho khách hàng

**Components** (TODO - Cần di chuyển):
- `AssignStaffModal.jsx` - Modal phân công nhân viên

**Services** (TODO):
- `staffService.js` - Business logic cho staff assignment (nếu cần tách riêng)

## 🔄 Các bước tiếp theo

### Bước 1: Di chuyển TestDrive Components
```
FROM: src/components/TestDrive/
TO:   src/features/customers/testdrive/components/

Files:
- TestDriveCard.jsx
- TestDriveFilter.jsx  
- TestDriveFormModal.jsx
```

### Bước 2: Di chuyển Customer Management
```
FROM: src/features/customers/components/
      src/features/customers/pages/
TO:   src/features/customers/management/

Files:
- components/CreateCustomerModal.jsx
- components/EditCustomerModal.jsx
- components/ViewCustomerModal.jsx
- components/CustomerCard.jsx
- pages/CustomerList (nếu có)
```

### Bước 3: Di chuyển Staff Assignment
```
FROM: src/features/customers/components/
TO:   src/features/customers/assignment/components/

Files:
- AssignStaffModal.jsx
```

### Bước 4: Copy Services phụ nếu cần
```
FROM: src/features/customers/services/
TO:   Sub-feature services folders

Files:
- customerService.js → management/services/ (nếu cần)
- staffService.js → assignment/services/ (nếu cần)
```

### Bước 5: Cập nhật Routes
```javascript
// src/routes/index.jsx
import TestDriveManagement from '@/features/customers/testdrive/pages/TestDriveManagement';
import CustomerList from '@/features/customers/management/pages/CustomerList';
```

## 💡 Lợi ích của cấu trúc này

1. **Tách biệt rõ ràng**: Mỗi sub-feature có components, pages, services riêng
2. **Dễ tìm kiếm**: Biết chính xác file ở đâu (testdrive, management, assignment)
3. **Dễ bảo trì**: Sửa 1 feature không ảnh hưởng features khác
4. **Scalable**: Dễ thêm sub-features mới (profiles, preferences, history, etc.)
5. **Services dùng chung**: apiConst* files vẫn ở chỗ cũ, không cần thay đổi

## ⚠️ Lưu ý quan trọng

- **KHÔNG di chuyển** `apiConstCustomerService.js` và `apiConstTestDrive.js`
- **GIỮ NGUYÊN** vị trí của các axios instances
- **Chỉ di chuyển** business logic services vào sub-features
- **Cập nhật import paths** sau khi di chuyển files
