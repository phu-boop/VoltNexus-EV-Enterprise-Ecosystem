# API Documentation — VoltNexus EV Enterprise Ecosystem

All APIs are accessible through the **API Gateway at `http://localhost:8080`** (or the production domain).

> **Authentication:** All endpoints (unless noted as Public) require `Authorization: Bearer <JWT>` header.
> The JWT is issued on login and contains: `email`, `role`, `userId`, `profileId`, `dealerId`.

---

## Gateway Route Prefixes

| Gateway Prefix | Downstream Service |
|---|---|
| `/auth/**`, `/users/**`, `/oauth2/**` | User Service |
| `/customers/**`, `/cart/**`, `/test-drives/**` | Customer Service |
| `/dealers/**` | Dealer Service |
| `/inventory/**` | Inventory Service |
| `/payments/**` | Payment Service |
| `/sales/**` | Sales Service |
| `/vehicles/**` | Vehicle Service |
| `/reporting/**` | Reporting Service |
| `/ai/**` | AI Service |

---

## User Service (`:8081`)

### Authentication — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register/customer` | Public | Register new customer account |
| `POST` | `/auth/login` | Public | Login with email/password → JWT access + refresh tokens |
| `GET` | `/auth/me` | Bearer | Get current authenticated user profile |
| `POST` | `/auth/refresh` | Bearer | Exchange refresh token for new access token |
| `POST` | `/auth/logout` | Bearer | Invalidate token (adds to Redis blacklist) |
| `POST` | `/auth/forgot-password` | Public | Send password reset email |
| `POST` | `/auth/reset-password` | Public | Reset password with token |
| `POST` | `/auth/change-password` | Bearer | Change password (authenticated user) |

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Login Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "CUSTOMER",
  "userId": "uuid-here"
}
```

### User Management — `/users`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/users` | ADMIN | List all users |
| `GET` | `/users/dealer-managers` | ADMIN | List dealer managers |
| `GET` | `/users/dealer-staffs` | ADMIN, DEALER_MANAGER | List dealer staff |
| `GET` | `/users/{id}` | ADMIN | Get user by ID |
| `GET` | `/users/internal/{id}` | Internal | Internal service call to get user |
| `POST` | `/users/register` | Public | Register a general user |
| `POST` | `/users/register/dealerStaff` | ADMIN, DEALER_MANAGER | Register dealer staff |
| `POST` | `/users/register/evmStaff` | ADMIN | Register EVM staff |
| `POST` | `/users/register/dealerManager` | ADMIN | Register dealer manager |
| `POST` | `/users/register/admin` | Public (Bootstrap) | Register admin (one-time bootstrap) |
| `PUT` | `/users/{id}` | ADMIN | Update user |
| `DELETE` | `/users/{id}` | ADMIN | Delete user |
| `POST` | `/users/{userId}/fcm-token` | Bearer | Register device FCM token |
| `GET` | `/users/{userId}/fcm-tokens` | Bearer | Get user's FCM tokens |
| `POST` | `/users/profile` | Bearer | Create user profile |
| `PUT` | `/users/profile` | Bearer | Update user profile |
| `GET` | `/users/statistics` | ADMIN | User statistics |
| `GET` | `/users/search` | ADMIN | Search users |

### Notifications — `/users/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/users/notifications/promotions` | Bearer | Subscribe to promotions |
| `GET` | `/users/notifications` | Bearer | Get user notifications |
| `PUT` | `/users/notifications/{id}/read` | Bearer | Mark notification as read |
| `PUT` | `/users/notifications/mark-all-read` | Bearer | Mark all as read |
| `DELETE` | `/users/notifications/{id}` | Bearer | Delete notification |
| `DELETE` | `/users/notifications` | Bearer | Delete all notifications |

---

## Customer Service (`:8082`)

### Customer Profile — `/customers`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/customers/health` | Public | Health check |
| `GET` | `/customers` | ADMIN, EVM_STAFF | List all customers |
| `GET` | `/customers/dealer` | DEALER_MANAGER, DEALER_STAFF | List dealer's customers |
| `GET` | `/customers/paged` | ADMIN | Paginated customer list |
| `GET` | `/customers/{id}` | ADMIN, DEALER_* | Get customer by ID |
| `GET` | `/customers/profile/{profileId}` | Bearer | Get customer by profile ID |
| `POST` | `/customers` | ADMIN | Create customer |
| `POST` | `/customers/dealer` | DEALER_MANAGER, DEALER_STAFF | Create customer in dealer context |
| `PUT` | `/customers/{id}` | ADMIN, CUSTOMER | Update customer |
| `DELETE` | `/customers/{id}` | ADMIN | Delete customer (triggers Kafka event) |
| `GET` | `/customers/enums/statuses` | Bearer | Get customer status enum values |
| `GET` | `/customers/enums/types` | Bearer | Get customer type enum values |
| `GET` | `/customers/{id}/audit-history` | ADMIN | Get customer audit trail |

### Complaints — `/customers/api/complaints`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/customers/api/complaints` | CUSTOMER | Submit complaint |
| `PUT` | `/customers/api/complaints/{id}/assign` | DEALER_MANAGER | Assign complaint to staff |
| `POST` | `/customers/api/complaints/{id}/progress` | DEALER_STAFF | Add progress note |
| `PUT` | `/customers/api/complaints/{id}/resolve` | DEALER_STAFF | Resolve complaint |
| `PUT` | `/customers/api/complaints/{id}/close` | DEALER_MANAGER | Close complaint |
| `GET` | `/customers/api/complaints/{id}` | Bearer | Get complaint detail |
| `GET` | `/customers/api/complaints/dealer/{dealerId}` | DEALER_* | Get dealer complaints |
| `POST` | `/customers/api/complaints/filter` | Bearer | Filter complaints |
| `GET` | `/customers/api/complaints/statistics` | ADMIN, DEALER_MANAGER | Complaint statistics |
| `POST` | `/customers/api/complaints/{id}/send-notification` | DEALER_* | Send notification on complaint |

### Test Drive Appointments — `/customers/api/test-drives`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/customers/api/test-drives/dealer/{dealerId}` | DEALER_* | Get dealer's test drives |
| `GET` | `/customers/api/test-drives/profile/{profileId}` | Bearer | Get customer's test drives |
| `GET` | `/customers/api/test-drives/customer/{customerId}` | Bearer | Get by customer ID |
| `GET` | `/customers/api/test-drives/{id}` | Bearer | Get test drive detail |

### Charging Stations — `/customers/api/charging-stations`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/customers/api/charging-stations` | Public | List all stations |
| `GET` | `/customers/api/charging-stations/{stationId}` | Public | Get station by ID |
| `GET` | `/customers/api/charging-stations/nearby` | Public | Find nearby stations (lat/lon query) |
| `GET` | `/customers/api/charging-stations/search` | Public | Search stations |
| `GET` | `/customers/api/charging-stations/city/{city}` | Public | Filter by city |
| `GET` | `/customers/api/charging-stations/province/{province}` | Public | Filter by province |
| `POST` | `/customers/api/charging-stations` | ADMIN | Create station |
| `PUT` | `/customers/api/charging-stations/{stationId}` | ADMIN | Update station |
| `DELETE` | `/customers/api/charging-stations/{stationId}` | ADMIN | Delete station |

---

## Dealer Service (`:8083`)

### Dealer Management — `/dealers → /api/dealers`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/dealers` | ADMIN, EVM_STAFF | List all dealers |
| `GET` | `/dealers/{id}` | Bearer | Get dealer by ID |
| `GET` | `/dealers/code/{code}` | Bearer | Get dealer by code |
| `POST` | `/dealers` | ADMIN | Create dealer |
| `PUT` | `/dealers/{id}` | ADMIN, DEALER_MANAGER | Update dealer |
| `DELETE` | `/dealers/{id}` | ADMIN | Delete dealer |
| `PUT` | `/dealers/{id}/suspend` | ADMIN | Suspend dealer |
| `PUT` | `/dealers/{id}/activate` | ADMIN | Activate dealer |
| `GET` | `/dealers/list-all` | Bearer | List all dealers (simplified) |

### Dealer Contracts — `/dealers/{dealerId}/contract`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/dealers/{dealerId}/contract` | Bearer | Get dealer contract |
| `GET` | `/dealers/contracts/{id}` | Bearer | Get contract by ID |
| `POST` | `/dealers/{dealerId}/contract` | ADMIN | Create dealer contract |
| `PUT` | `/dealers/contracts/{id}` | ADMIN | Update contract |
| `DELETE` | `/dealers/contracts/{id}` | ADMIN | Delete contract |

---

## Inventory Service (`:8084`)

### Inventory Management — `/inventory`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/inventory` | Bearer | List inventory (with filters) |
| `GET` | `/inventory/{variantId}` | Bearer | Get variant inventory |
| `GET` | `/inventory/my-stock` | DEALER_* | Get dealer's stock |
| `POST` | `/inventory/status-by-ids-detailed` | Bearer | Get detailed status by variant IDs |
| `POST` | `/inventory/transactions` | Bearer | Create inventory transaction |
| `GET` | `/inventory/transactions` | Bearer | List transactions |
| `POST` | `/inventory/status-by-ids` | Bearer | Get status by IDs |
| `GET` | `/inventory/variants/ids-by-status` | Bearer | Get variant IDs by status |
| `GET` | `/inventory/stats/summary` | ADMIN, EVM_STAFF | Inventory summary stats |
| `POST` | `/inventory/allocate` | EVM_STAFF | Allocate inventory to dealer |
| `POST` | `/inventory/ship-b2b` | EVM_STAFF | Ship B2B inventory |
| `POST` | `/inventory/transfer-requests` | DEALER_* | Request stock transfer |
| `POST` | `/inventory/vehicles/validate-vins` | Bearer | Validate VIN numbers |
| `GET` | `/inventory/vehicles/available-vins` | Bearer | Get available VINs |
| `PUT` | `/inventory/central-stock/reorder-level` | ADMIN | Set central reorder level |
| `PUT` | `/inventory/dealer-stock/reorder-level` | DEALER_MANAGER | Set dealer reorder level |
| `POST` | `/inventory/allocate-sync` | Internal | Synchronous allocation |
| `GET` | `/inventory/report/export` | ADMIN | Export inventory report |
| `POST` | `/inventory/return-by-order` | Bearer | Return inventory by order |
| `GET` | `/inventory/analytics/snapshots` | ADMIN | Get inventory snapshots |

### Stock Alerts — `/inventory/alerts`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/inventory/alerts` | ADMIN, DEALER_MANAGER | Get stock alerts |

---

## Payment Service (`:8085`)

### Admin Payments — `/payments/api/v1/payments/admin`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/payments/api/v1/payments/admin/booking-deposits` | ADMIN | List all booking deposits |
| `GET` | `/payments/api/v1/payments/admin/payment-records/{recordId}` | ADMIN | Get payment record |
| `PUT` | `/payments/api/v1/payments/admin/payment-records/{recordId}` | ADMIN | Update payment record |

### Dealer Payments — `/payments/api/v1/payments/dealer`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/payments/api/v1/payments/dealer/invoices` | DEALER_MANAGER | Create dealer invoice |
| `POST` | `/payments/api/v1/payments/dealer/invoices/{invoiceId}/pay` | DEALER_* | Pay invoice (cash) |
| `POST` | `/payments/api/v1/payments/dealer/invoices/{invoiceId}/vnpay/initiate` | DEALER_* | Initiate VNPay payment |
| `POST` | `/payments/api/v1/payments/dealer/transactions/{transactionId}/confirm` | DEALER_* | Confirm transaction |
| `GET` | `/payments/api/v1/payments/dealer/{dealerId}/invoices/{invoiceId}` | DEALER_* | Get specific invoice |
| `GET` | `/payments/api/v1/payments/dealer/{dealerId}/invoices` | DEALER_* | List dealer invoices |
| `GET` | `/payments/api/v1/payments/dealer/invoices/{invoiceId}` | DEALER_* | Get invoice by ID |
| `GET` | `/payments/api/v1/payments/dealer/debt-summary` | DEALER_MANAGER | Get dealer debt summary |
| `GET` | `/payments/api/v1/payments/dealer/orders/{orderId}/has-invoice` | DEALER_* | Check if order has invoice |
| `GET` | `/payments/api/v1/payments/dealer/pending-cash-payments` | DEALER_* | List pending cash payments |

### Customer Payments — `/payments/api/v1/payments/customer`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/payments/api/v1/payments/customer/orders/{orderId}/pay` | CUSTOMER | Pay for order |
| `POST` | `/payments/api/v1/payments/customer/transactions/{transactionId}/confirm` | CUSTOMER | Confirm payment transaction |
| `GET` | `/payments/api/v1/payments/customer/orders/{orderId}/history` | CUSTOMER | Payment history for order |
| `GET` | `/payments/api/v1/payments/customer/{customerId}/debt` | CUSTOMER | Customer debt balance |
| `GET` | `/payments/api/v1/payments/customer/statistics` | ADMIN | Payment statistics |
| `GET` | `/payments/api/v1/payments/customer/my-deposits` | CUSTOMER | My booking deposits |

### Payment Gateway (VNPay) — `/payments/api/v1/payments/gateway`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/payments/api/v1/payments/gateway/initiate-b2c` | CUSTOMER | Initiate B2C VNPay URL |
| `POST` | `/payments/api/v1/payments/gateway/callback/vnpay-ipn` | Public | VNPay IPN callback |
| `GET` | `/payments/api/v1/payments/gateway/callback/vnpay-return` | Public | VNPay return URL |

### Payment Methods — `/payments/api/v1/payments/methods`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/payments/api/v1/payments/methods` | ADMIN | Create payment method |
| `PUT` | `/payments/api/v1/payments/methods/{id}` | ADMIN | Update payment method |
| `GET` | `/payments/api/v1/payments/methods` | Bearer | List all methods |
| `GET` | `/payments/api/v1/payments/methods/active-public` | Public | List active public methods |
| `GET` | `/payments/api/v1/payments/methods/{id}` | Bearer | Get method by ID |
| `GET` | `/payments/api/v1/payments/methods/active-b2b` | DEALER_* | Get B2B payment methods |

---

## Sales Service (`:8086`)

### B2B Sales Orders — `/sales/api/v1/sales-orders`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/sales/api/v1/sales-orders/b2b` | DEALER_MANAGER | Create B2B order |
| `POST` | `/sales/api/v1/sales-orders/b2b/staff-placement` | EVM_STAFF | Staff-initiated B2B placement |
| `GET` | `/sales/api/v1/sales-orders/b2b` | EVM_STAFF, DEALER_MANAGER | List B2B orders |
| `GET` | `/sales/api/v1/sales-orders/{orderId}` | Bearer | Get order by ID |
| `PUT` | `/sales/api/v1/sales-orders/{orderId}/approve` | EVM_STAFF | Approve order |
| `PUT` | `/sales/api/v1/sales-orders/{orderId}/ship` | EVM_STAFF | Mark order shipped |
| `PUT` | `/sales/api/v1/sales-orders/{orderId}/deliver` | EVM_STAFF | Mark order delivered |
| `PUT` | `/sales/api/v1/sales-orders/{orderId}/report-issue` | DEALER_* | Report delivery issue |
| `GET` | `/sales/api/v1/sales-orders/my-orders` | DEALER_* | Dealer's own orders |
| `PUT` | `/sales/api/v1/sales-orders/{orderId}/cancel-by-dealer` | DEALER_MANAGER | Cancel as dealer |
| `PUT` | `/sales/api/v1/sales-orders/{orderId}/cancel-by-staff` | EVM_STAFF | Cancel as staff |
| `DELETE` | `/sales/api/v1/sales-orders/{orderId}` | ADMIN | Hard delete order |
| `PUT` | `/sales/api/v1/sales-orders/{orderId}/resolve-dispute` | EVM_STAFF | Resolve dispute |
| `PUT` | `/sales/api/v1/sales-orders/{orderId}/payment-status` | ADMIN | Update payment status |

### Quotations — `/sales/api/v1/quotations`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/sales/api/v1/quotations/draft` | DEALER_STAFF | Create draft quotation |
| `PUT` | `/sales/api/v1/quotations/{quotationId}/calculate` | DEALER_STAFF | Calculate pricing |
| `PUT` | `/sales/api/v1/quotations/{quotationId}/send` | DEALER_STAFF | Send to customer |
| `GET` | `/sales/api/v1/quotations/public/confirm` | Public | Customer confirms quotation |
| `PUT` | `/sales/api/v1/quotations/{quotationId}/customer-response` | CUSTOMER | Customer accepts/declines |
| `POST` | `/sales/api/v1/quotations/{quotationId}/convert-to-order` | DEALER_STAFF | Convert to B2C order |
| `GET` | `/sales/api/v1/quotations/{quotationId}` | Bearer | Get quotation |
| `GET` | `/sales/api/v1/quotations` | DEALER_* | List quotations |
| `DELETE` | `/sales/api/v1/quotations/{quotationId}` | DEALER_MANAGER | Delete quotation |
| `GET` | `/sales/api/v1/quotations/staff/{staffId}` | DEALER_* | Quotations by staff |
| `GET` | `/sales/api/v1/quotations/dealer/{dealerId}` | DEALER_* | Quotations by dealer |

### Promotions — `/sales/promotions`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/sales/promotions` | ADMIN, EVM_STAFF | Create promotion |
| `PUT` | `/sales/promotions/{id}` | ADMIN, EVM_STAFF | Update promotion |
| `PUT` | `/sales/promotions/authentic/{id}` | ADMIN | Authenticate promotion |
| `GET` | `/sales/promotions/{id}` | Bearer | Get promotion by ID |
| `GET` | `/sales/promotions` | Bearer | List all promotions |
| `DELETE` | `/sales/promotions/{id}` | ADMIN | Delete promotion |
| `GET` | `/sales/promotions/active` | Public | Get active promotions |
| `GET` | `/sales/promotions/dealer/active` | DEALER_* | Active dealer promotions |

### Notifications (Sales) — `/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/sales/notifications/staff` | DEALER_*, EVM_STAFF | Get staff notifications |
| `DELETE` | `/sales/notifications/staff/all` | Bearer | Clear all notifications |
| `GET` | `/sales/notifications/staff/unread-count` | Bearer | Get unread count |
| `PUT` | `/sales/notifications/{id}/read` | Bearer | Mark as read |
| `PUT` | `/sales/notifications/staff/read-all` | Bearer | Mark all as read |
| `DELETE` | `/sales/notifications/{id}` | Bearer | Delete notification |

---

## Vehicle Service (`:8087`)

### Vehicle Catalog — `/vehicles/vehicle-catalog`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/vehicles/vehicle-catalog/models` | Public | List all vehicle models |
| `GET` | `/vehicles/vehicle-catalog/models/search` | Public | Search models by keyword |
| `GET` | `/vehicles/vehicle-catalog/models/{modelId}` | Public | Get model detail |
| `POST` | `/vehicles/vehicle-catalog/models` | ADMIN, EVM_STAFF | Create vehicle model |
| `PUT` | `/vehicles/vehicle-catalog/models/{modelId}` | ADMIN, EVM_STAFF | Update model |
| `DELETE` | `/vehicles/vehicle-catalog/models/{modelId}` | ADMIN | Delete model |
| `POST` | `/vehicles/vehicle-catalog/models/{modelId}/variants` | ADMIN, EVM_STAFF | Add variant to model |
| `GET` | `/vehicles/vehicle-catalog/models/{modelId}/variants` | Public | List model variants |
| `GET` | `/vehicles/vehicle-catalog/variants/search` | Public | Search variants |
| `GET` | `/vehicles/vehicle-catalog/variants/{variantId}` | Public | Get variant detail |
| `PUT` | `/vehicles/vehicle-catalog/variants/{variantId}` | ADMIN, EVM_STAFF | Update variant |
| `DELETE` | `/vehicles/vehicle-catalog/variants/{variantId}` | ADMIN | Delete variant |
| `POST` | `/vehicles/vehicle-catalog/compare` | Bearer | Compare vehicles (auth) |
| `POST` | `/vehicles/vehicle-catalog/public/compare` | Public | Compare vehicles (public) |
| `GET` | `/vehicles/vehicle-catalog/variants/paginated` | Public | Paginated variants |
| `GET` | `/vehicles/vehicle-catalog/features` | Public | List features |
| `POST` | `/vehicles/vehicle-catalog/variants/{variantId}/features` | ADMIN | Add feature to variant |
| `GET` | `/vehicles/vehicle-catalog/variants/{variantId}/price-history` | Bearer | Variant price history |
| `GET` | `/vehicles/vehicle-catalog/variants/{variantId}/history` | Bearer | Variant change history |

### Vehicle Images — `/vehicles/vehicle-catalog/images`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/vehicles/vehicle-catalog/images/models` | ADMIN | Upload model images |
| `POST` | `/vehicles/vehicle-catalog/images/variants` | ADMIN | Upload variant images |
| `DELETE` | `/vehicles/vehicle-catalog/images` | ADMIN | Delete images |

---

## Reporting Service (`:8088`)

### Reports — `/reporting/api/reports`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/reporting/api/reports/sales` | ADMIN, EVM_STAFF | Generate sales report |
| `GET` | `/reporting/api/reports/sales/summary` | ADMIN, EVM_STAFF | Get sales summary |
| `POST` | `/reporting/api/reports/forecast` | ADMIN | Generate AI forecast |
| `GET` | `/reporting/api/reports/forecast/check` | ADMIN | Check forecast status |

### Inventory Reports — `/reporting/reports`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/reporting/reports/inventory` | ADMIN, EVM_STAFF | Inventory report |
| `GET` | `/reporting/reports/sales` | ADMIN, EVM_STAFF | Sales aggregation |
| `GET` | `/reporting/reports/inventory-velocity` | ADMIN | Stock turnover velocity |
| `GET` | `/reporting/reports/central-inventory` | ADMIN | Central warehouse report |
| `GET` | `/reporting/reports/central-inventory/transactions` | ADMIN | Central inventory transactions |

### Sync & Backfill — Internal

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/reporting/api/sync/sales` | Internal | Sync sales records |
| `POST` | `/reporting/api/sync/inventory` | Internal | Sync inventory data |
| `POST` | `/reporting/api/sync/metadata` | Internal | Sync metadata |
| `POST` | `/reporting/api/v1/admin/backfill/dealers` | ADMIN | Backfill dealer cache |
| `POST` | `/reporting/api/v1/admin/backfill/vehicles` | ADMIN | Backfill vehicle cache |

---

## AI Service (`:8500`)

### AI Chatbot — `/ai/chat`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/ai/chat/ask` | Public (Rate Limited) | Ask AI assistant a question about EV business |

**Request:**
```json
{
  "query": "What is the sales trend for the VoltX Pro variant this month?"
}
```

**Response:**
```json
{
  "response": "Based on the data, VoltX Pro has shown a 15% increase..."
}
```

### Sales Forecast — `/ai/forecast`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/ai/forecast/{variantId}` | Bearer | Generate 30-day sales forecast for a vehicle variant |

**Response:**
```json
{
  "prediction": 45,
  "confidence_score": 0.82,
  "reasoning": "Based on 6-month historical trend and current inventory of 12 units..."
}
```

### Production Planning — `/ai/production-plan`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/ai/production-plan/generate` | EVM_STAFF, ADMIN | Generate AI production plan |
| `GET` | `/ai/production-plan` | Bearer | List production plans |
| `PUT` | `/ai/production-plan/{planId}/approve` | ADMIN | Approve production plan |

### Analytics Dashboard — `/ai/analytics`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/ai/analytics/dashboard` | ADMIN, EVM_STAFF | Get AI analytics dashboard |

---

## Common Response Format

All APIs return a standardized response envelope (from `common-lib`):

```json
{
  "timestamp": "2026-04-13T11:00:00Z",
  "code": "SUCCESS",
  "message": "Operation completed successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "timestamp": "2026-04-13T11:00:00Z",
  "code": "UNAUTHORIZED",
  "message": "Token is invalid or expired",
  "data": null
}
```

---

## OpenAPI / Swagger

Each service exposes Swagger UI (via SpringDoc OpenAPI 2.8.13):

```
http://localhost:{port}/swagger-ui/index.html
http://localhost:{port}/v3/api-docs
```

*Note: Swagger is not exposed through the Gateway by default — access service directly for docs.*
