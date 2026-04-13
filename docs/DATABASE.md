# Database Documentation — VoltNexus EV Enterprise Ecosystem

## Database Strategy: DB-per-Service

Each microservice owns its own MySQL database. No service accesses another service's database directly — cross-service queries go through the API layer. This ensures **full domain isolation and independent schema evolution**.

| Service | Database | Port (Local) | Notes |
|---|---|---|---|
| User Service | `user_db` | 3306 (via env) | Shared MySQL instance or isolated |
| Customer Service | `customer_db` | 3306 | Separate schema |
| Dealer Service | `dealer_db` | 3306 | Separate schema |
| Inventory Service | `inventory_db` | 3306 | Separate schema |
| Payment Service | `payment_db` | 3306 | Separate schema |
| Sales Service | `sales_db` | 3306 | SSL (Aiven cloud config detected) |
| Vehicle Service | `vehicle_db` | 3306 | Separate schema |
| Reporting Service | `reporting_db` | 3306 | Read-heavy / analytics |
| AI Service | `ai_db` | 3306 | Forecast & planning storage |

**ORM:** Hibernate (via Spring Data JPA) with `ddl-auto=update` in development.

---

## Schema per Service

### 1. User Service (`user_db`)

Manages authentication identities and role-based user profiles.

#### `users` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `email` | VARCHAR (unique, not null) | Login identifier |
| `password` | VARCHAR(2000) | Bcrypt hashed password |
| `status` | VARCHAR(20) | `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `last_login` | DATETIME | Last login timestamp |
| `created_at` | DATETIME (immutable) | Creation timestamp |

#### `roles` table
| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `name` | VARCHAR | `ADMIN`, `CUSTOMER`, `DEALER_MANAGER`, `DEALER_STAFF`, `EVM_STAFF` |

**Relationship:** `users` ↔ `roles` (Many-to-Many, fetch EAGER)

#### Profile tables (one per role type, 1:1 with user)
- `admin_profiles` — admin-specific data
- `customer_profiles` — customer CRM data
- `dealer_manager_profiles` — dealer manager association
- `dealer_staff_profiles` — dealer staff association + dealer ID
- `evm_staff_profiles` — EVM staff data

#### `user_devices` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID (FK) | Reference to user |
| `fcm_token` | VARCHAR | Firebase Cloud Messaging token |

#### `notifications` (User Service)
- User-facing promotional and system notifications
- Fields: `id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`

---

### 2. Customer Service (`customer_db`)

Manages customer relationships and interaction records.

#### `customers` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `profile_id` | UUID | Reference to `customer_profiles` (User Service) |
| `dealer_id` | UUID | Associated dealer (BINARY/VARBINARY) |
| `status` | ENUM | Customer lifecycle status |
| `type` | ENUM | Individual / Corporate |
| Audit fields | DATETIME | `created_at`, `updated_at` |

#### `cart_items` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `customer_id` | UUID (FK) | Owning customer |
| `variant_id` | UUID | Vehicle variant reference |
| `quantity` | INT | Cart quantity |
| `added_at` | DATETIME | When added to cart |

#### `test_drive_appointments` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `customer_id` | UUID (FK) | Customer |
| `profile_id` | UUID | Profile reference |
| `dealer_id` | UUID | Dealer location |
| `variant_id` | UUID | Requested vehicle variant |
| `appointment_date` | DATE | Scheduled date |
| `status` | ENUM | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| `notes` | TEXT | Customer notes |

#### `complaints` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `customer_id` | UUID (FK) | Customer who filed |
| `dealer_id` | UUID | Dealer involved |
| `assigned_staff_id` | UUID | Assigned staff member |
| `status` | ENUM | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` |
| `category` | VARCHAR | Complaint type |
| `description` | TEXT | |
| `resolution` | TEXT | Final resolution |

#### `vehicle_reviews` table
- Customer-submitted reviews for vehicle variants
- Fields: `id`, `customer_id`, `variant_id`, `rating`, `comment`, `created_at`

#### `charging_stations` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | VARCHAR | Station name |
| `address` | VARCHAR | Street address |
| `city` | VARCHAR | City |
| `province` | VARCHAR | Province |
| `latitude` | DOUBLE | GPS latitude |
| `longitude` | DOUBLE | GPS longitude |
| `status` | ENUM | Operational status |
| `connector_types` | VARCHAR | Supported plug types |

#### `customer_profile_audits` table
- Change audit trail for customer data
- Fields: `id`, `customer_id`, `field_changed`, `old_value`, `new_value`, `changed_by`, `changed_at`

---

### 3. Dealer Service (`dealer_db`)

#### `dealers` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `code` | VARCHAR (unique) | Dealer code |
| `name` | VARCHAR | Dealer name |
| `status` | ENUM | `ACTIVE`, `SUSPENDED`, `INACTIVE` |
| `region` | VARCHAR | Geographic region |

#### `dealer_locations` table
- Physical address(es) per dealer
- Fields: `id`, `dealer_id`, `address`, `city`, `province`, `lat`, `lon`

#### `dealer_contracts` table
- Legal agreements between manufacturer and dealer
- Fields: `id`, `dealer_id`, `start_date`, `end_date`, `terms`, `status`, `signed_at`

#### `dealer_targets` table
- Monthly/quarterly sales targets per dealer
- Fields: `id`, `dealer_id`, `period`, `target_units`, `target_revenue`

#### `dealer_performances` table
- Actual performance metrics vs. targets
- Fields: `id`, `dealer_id`, `period`, `units_sold`, `revenue`

---

### 4. Inventory Service (`inventory_db`)

#### `central_inventory` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `variant_id` | UUID | Vehicle variant |
| `quantity` | INT | Available at central |
| `reorder_level` | INT | Threshold for alerts |
| `updated_at` | DATETIME | Last update |

#### `dealer_allocations` table
- Stock allocated to specific dealers
- Fields: `id`, `dealer_id`, `variant_id`, `allocated_qty`, `available_qty`, `reorder_level`

#### `physical_vehicles` table
- Individual vehicle unit tracking by VIN
- Fields: `id`, `vin` (unique), `variant_id`, `dealer_id`, `status` (`AVAILABLE`, `RESERVED`, `SOLD`)

#### `inventory_transactions` table
- Full audit log of all inventory movements
- Fields: `id`, `type` (IN/OUT/TRANSFER), `variant_id`, `from_dealer`, `to_dealer`, `quantity`, `reference_id`, `created_at`

#### `transfer_requests` table
- Dealer-to-dealer or central-to-dealer transfer requests
- Fields: `id`, `from_dealer_id`, `to_dealer_id`, `variant_id`, `quantity`, `status`, `requested_at`

#### `stock_alerts` table
- Auto-generated when stock drops below `reorder_level`
- Fields: `id`, `dealer_id`, `variant_id`, `current_qty`, `reorder_level`, `severity`, `created_at`, `resolved_at`

---

### 5. Payment Service (`payment_db`)

#### `dealer_invoices` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `dealer_id` | UUID | Dealer |
| `order_id` | UUID | Linked sales order |
| `amount` | DECIMAL | Invoice amount |
| `status` | ENUM | `PENDING`, `PAID`, `OVERDUE` |
| `due_date` | DATE | Payment due date |

#### `dealer_transactions` table
- Records of individual dealer payments (cash, VNPay)

#### `dealer_debt_records` table
- Running debt balance per dealer
- Fields: `id`, `dealer_id`, `total_debt`, `last_updated`

#### `payment_records` table
- B2C customer payment records

#### `transactions` table
- Individual customer payment events

#### `payment_plans` table
- Installment structures for financed purchases
- Fields: `id`, `order_id`, `customer_id`, `total_amount`, `installments`, `start_date`

#### `installment_schedules` table
- Per-installment schedule rows
- Fields: `id`, `plan_id`, `due_date`, `amount`, `paid_at`, `status`

#### `payment_methods` table
- Configurable payment methods: Cash, VNPay, Bank Transfer, etc.
- Fields: `id`, `name`, `type`, `is_active`, `is_b2b`, `is_public`

---

### 6. Sales Service (`sales_db`)

#### `sales_orders` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `order_type` | ENUM | `B2B`, `B2C` |
| `dealer_id` | UUID | Dealer reference |
| `customer_id` | UUID | Customer (B2C only) |
| `status` | ENUM | `DRAFT`, `APPROVED`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| `payment_status` | ENUM | `UNPAID`, `PARTIAL`, `PAID` |
| `total_amount` | DECIMAL | Order value |

#### `order_items` table
- Line items per order: `id`, `order_id`, `variant_id`, `quantity`, `unit_price`, `subtotal`

#### `order_tracking` table
- Shipment tracking: `id`, `order_id`, `status`, `location`, `timestamp`, `notes`

#### `quotations` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `dealer_id` | UUID | Creating dealer |
| `staff_id` | UUID | Assigned staff |
| `customer_id` | UUID | Target customer |
| `status` | ENUM | `DRAFT`, `SENT`, `ACCEPTED`, `DECLINED`, `CONVERTED` |
| `expiry_date` | DATE | Validity period |

#### `promotions` table
- Discount programs: `id`, `name`, `discount_type`, `value`, `start_date`, `end_date`, `status`, `eligible_variants`

#### `outbox` table (Transactional Outbox Pattern)
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `event_type` | VARCHAR | e.g., `ORDER_CREATED` |
| `payload` | TEXT | JSON event payload |
| `status` | ENUM | `PENDING`, `SENT` |
| `created_at` | DATETIME | |
| `processed_at` | DATETIME | When dispatched to Kafka |

#### `notifications` (Sales Service)
- Staff-facing alerts: `id`, `audience` (DEALER_STAFF, EVM_STAFF, etc.), `title`, `message`, `is_read`, `created_at`

---

### 7. Vehicle Service (`vehicle_db`)

#### `vehicle_models` table
- Top-level EV model: `id`, `name`, `brand`, `description`, `category`, `status`

#### `vehicle_variants` table
- Specific trim/version of a model: `id`, `model_id`, `name`, `base_price`, `battery_capacity`, `range_km`, `color`, `status`

#### `vehicle_features` table
- Feature catalog: `id`, `name`, `category`, `description`

#### `variant_features` table
- Many-to-many: which variants have which features: `variant_id`, `feature_id`

#### `price_history` table
- Tracks price changes over time: `id`, `variant_id`, `old_price`, `new_price`, `changed_at`, `changed_by`

#### `vehicle_variant_history` table
- Audit log for variant changes: `id`, `variant_id`, `field`, `old_value`, `new_value`, `changed_at`

---

### 8. Reporting Service (`reporting_db`)

A **read-optimized** analytics store, populated via Kafka events and sync endpoints.

#### `sales_records` table
- Denormalized sales data: `id`, `order_id`, `dealer_id`, `variant_id`, `amount`, `quantity`, `sale_date`, `region`

#### `dealer_stock_snapshots` table
- Point-in-time inventory snapshots: `id`, `dealer_id`, `variant_id`, `qty`, `snapshot_date`

#### `inventory_summary_by_region` table
- Regional aggregation: `id`, `region`, `variant_id`, `total_qty`, `snapshotted_at`

#### `central_inventory_summary` table
- Central warehouse state: `id`, `variant_id`, `qty`, `reorder_level`, `updated_at`

#### `central_inventory_transaction_logs` table
- Log of central inventory movements for reporting

#### `forecast_logs` table
- History of AI forecast requests: `id`, `variant_id`, `predicted_demand`, `confidence`, `model_used`, `created_at`

#### `dealer_cache`, `vehicle_cache` tables
- Locally cached dealer/vehicle metadata for fast reporting without cross-service calls

---

### 9. AI Service (`ai_db`)

#### `production_plans` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID / BIGINT | Primary key |
| `plan_period` | VARCHAR | e.g., `2026-Q2` |
| `generated_by` | VARCHAR | AI model version |
| `status` | ENUM | `DRAFT`, `APPROVED` |
| `content` | TEXT | JSON plan details |
| `created_at` | DATETIME | |
| `approved_at` | DATETIME | |
| `approved_by` | UUID | Approving staff ID |

#### `sales_history` table
- Historical sales data cached for AI use: `id`, `variant_id`, `quantity_sold`, `sale_date`, `region`

---

## Cross-Service Data Relationships (Logical)

```
User Service (users)
    ├── Customer Service (customers.profile_id → customer_profiles.id)
    ├── Sales Service (sales_orders.staff_id → users.id)
    └── Dealer Service (dealer_staff_profiles.dealer_id → dealers.id)

Dealer Service (dealers)
    ├── Customer Service (customers.dealer_id)
    ├── Inventory Service (dealer_allocations.dealer_id)
    ├── Sales Service (sales_orders.dealer_id)
    └── Payment Service (dealer_invoices.dealer_id)

Vehicle Service (vehicle_variants)
    ├── Customer Service (cart_items.variant_id)
    ├── Inventory Service (central_inventory.variant_id)
    ├── Sales Service (order_items.variant_id)
    └── Reporting Service (sales_records.variant_id)
```

*Note: These are logical relationships only. No database-level foreign keys span services. Referential integrity is enforced at the application layer.*

---

## Redis Usage

| Service | Redis DB | Purpose |
|---|---|---|
| Gateway | 0 (default) | JWT token blacklist (logout) |
| User Service | 1 | Session / refresh token caching |
| Inventory Service | 2 | Stock level caching |
| Vehicle Service | 2 | Catalog response caching |
| Gateway (Rate Limit) | Bucket4j state | Guest rate limiter buckets |
