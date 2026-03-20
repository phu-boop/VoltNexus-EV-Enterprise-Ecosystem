# Migration Script - Di chuyển tất cả giao diện Customer

## ✅ ĐÃ HOÀN THÀNH

### testdrive/
- ✅ testdrive/pages/TestDriveManagement.jsx
- ✅ testdrive/services/testDriveService.js
- ✅ testdrive/services/vehicleService.js
- ✅ testdrive/components/TestDriveCard.jsx

## 📋 CẦN DI CHUYỂN

### 1. testdrive/components/ (Còn 2 files)

```bash
# TestDriveFilter.jsx
FROM: src/components/TestDrive/TestDriveFilter.jsx
TO:   src/features/customers/testdrive/components/TestDriveFilter.jsx

# TestDriveFormModal.jsx
FROM: src/components/TestDrive/TestDriveFormModal.jsx
TO:   src/features/customers/testdrive/components/TestDriveFormModal.jsx

# CustomerSelect.jsx (cho TestDrive)
FROM: src/components/TestDrive/CustomerSelect.jsx
TO:   src/features/customers/testdrive/components/CustomerSelect.jsx

# CustomerAutocomplete.jsx (cho TestDrive)
FROM: src/components/TestDrive/CustomerAutocomplete.jsx
TO:   src/features/customers/testdrive/components/CustomerAutocomplete.jsx
```

### 2. management/pages/ (3 files)

```bash
# CustomerList.jsx
FROM: src/features/customers/pages/CustomerList.jsx
TO:   src/features/customers/management/pages/CustomerList.jsx

# CustomerDetail.jsx
FROM: src/features/customers/pages/CustomerDetail.jsx
TO:   src/features/customers/management/pages/CustomerDetail.jsx

# CreateCustomer.jsx
FROM: src/features/customers/pages/CreateCustomer.jsx
TO:   src/features/customers/management/pages/CreateCustomer.jsx
```

### 3. management/components/ (3 files)

```bash
# CustomerTable.jsx
FROM: src/features/customers/components/CustomerTable.jsx
TO:   src/features/customers/management/components/CustomerTable.jsx

# CustomerFilter.jsx
FROM: src/features/customers/components/CustomerFilter.jsx
TO:   src/features/customers/management/components/CustomerFilter.jsx

# CustomerCard.jsx
FROM: src/features/customers/components/CustomerCard.jsx
TO:   src/features/customers/management/components/CustomerCard.jsx
```

### 4. management/services/

```bash
# customerService.js (business logic)
FROM: src/features/customers/services/customerService.js
TO:   src/features/customers/management/services/customerService.js

NOTE: Import từ ../../services/apiConstCustomerService
```

### 5. assignment/components/

```bash
# AssignStaffModal.jsx
FROM: src/features/customers/components/AssignStaffModal.jsx
TO:   src/features/customers/assignment/components/AssignStaffModal.jsx
```

### 6. assignment/services/

```bash
# staffService.js
FROM: src/features/customers/services/staffService.js
TO:   src/features/customers/assignment/services/staffService.js

NOTE: Import từ ../../services/apiConstCustomerService hoặc services dùng chung
```

## 🔄 CẬP NHẬT IMPORT PATHS

### Sau khi di chuyển, cần update imports trong:

1. **testdrive/pages/TestDriveManagement.jsx**
   ```javascript
   // OLD
   import TestDriveCard from '../../components/TestDrive/TestDriveCard';
   
   // NEW
   import TestDriveCard from '../components/TestDriveCard';
   ```

2. **management/pages/CustomerList.jsx**
   ```javascript
   // OLD
   import CustomerTable from '../components/CustomerTable';
   
   // NEW
   import CustomerTable from '../components/CustomerTable';
   ```

3. **Routes configuration**
   ```javascript
   // OLD
   import TestDriveManagement from '@/pages/TestDrive/TestDriveManagement';
   import CustomerList from '@/features/customers/pages/CustomerList';
   
   // NEW
   import TestDriveManagement from '@/features/customers/testdrive/pages/TestDriveManagement';
   import CustomerList from '@/features/customers/management/pages/CustomerList';
   ```

## 📝 CHECKLIST

- [x] testdrive/pages/TestDriveManagement.jsx
- [x] testdrive/services/testDriveService.js
- [x] testdrive/services/vehicleService.js
- [x] testdrive/components/TestDriveCard.jsx
- [ ] testdrive/components/TestDriveFilter.jsx
- [ ] testdrive/components/TestDriveFormModal.jsx
- [ ] testdrive/components/CustomerSelect.jsx
- [ ] testdrive/components/CustomerAutocomplete.jsx
- [ ] management/pages/CustomerList.jsx
- [ ] management/pages/CustomerDetail.jsx
- [ ] management/pages/CreateCustomer.jsx
- [ ] management/components/CustomerTable.jsx
- [ ] management/components/CustomerFilter.jsx
- [ ] management/components/CustomerCard.jsx
- [ ] management/services/customerService.js
- [ ] assignment/components/AssignStaffModal.jsx
- [ ] assignment/services/staffService.js

## 🎯 CẤU TRÚC CUỐI CÙNG

```
features/customers/
├── testdrive/
│   ├── components/
│   │   ├── TestDriveCard.jsx ✅
│   │   ├── TestDriveFilter.jsx
│   │   ├── TestDriveFormModal.jsx
│   │   ├── CustomerSelect.jsx
│   │   └── CustomerAutocomplete.jsx
│   ├── pages/
│   │   └── TestDriveManagement.jsx ✅
│   └── services/
│       ├── testDriveService.js ✅
│       └── vehicleService.js ✅
│
├── management/
│   ├── components/
│   │   ├── CustomerTable.jsx
│   │   ├── CustomerFilter.jsx
│   │   └── CustomerCard.jsx
│   ├── pages/
│   │   ├── CustomerList.jsx
│   │   ├── CustomerDetail.jsx
│   │   └── CreateCustomer.jsx
│   └── services/
│       └── customerService.js
│
├── assignment/
│   ├── components/
│   │   └── AssignStaffModal.jsx
│   └── services/
│       └── staffService.js
│
└── services/ (GIỮ NGUYÊN)
    ├── apiConstCustomerService.js
    ├── apiConstTestDrive.js
    ├── staffService.js
    └── index.js
```

## ⚠️ LƯU Ý

1. **KHÔNG di chuyển** các file trong `components/home/` (CustomerFeedback.jsx, TestDriveSection.jsx) - Đây là home page components
2. **KHÔNG di chuyển** file trong `features/dealer/` - Đây là dealer feature
3. **GIỮ NGUYÊN** `services/apiConst*.js` - Đây là shared axios instances
4. **Sau khi di chuyển xong**, xóa các folder cũ:
   - `src/components/TestDrive/`
   - `src/pages/TestDrive/`
   - `src/features/customers/components/` (nếu đã di chuyển hết)
   - `src/features/customers/pages/` (nếu đã di chuyển hết)
