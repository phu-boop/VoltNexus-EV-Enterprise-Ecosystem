import random
import datetime
import os
import uuid

# --- Configuration ---
NUM_CUSTOMERS = 500
NUM_PROMOTIONS = 200
NUM_APPOINTMENTS = 300
NUM_COMPLAINTS = 100

DEALER_UUIDS = [
    '3ec76f92-7d44-49f4-ada1-b47d4f55b418',
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000003'
]

LAST_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"]
FIRST_NAMES = ["Anh", "Bảo", "Cường", "Dũng", "Đức", "Gia", "Hải", "Hùng", "Huy", "Khoa", "Lâm", "Minh", "Nam", "Phong", "Quân", "Sơn", "Thắng", "Thành", "Trung", "Tùng", "Việt", "An", "Bình", "Chi", "Diệp", "Giang", "Hà", "Hạnh", "Hoa", "Huệ", "Lan", "Linh", "Mai", "Ngọc", "Oanh", "Phương", "Quỳnh", "Thảo", "Trang", "Tuyết", "Vy"]

def random_date(start_year=2024, end_year=2026):
    start = datetime.date(start_year, 1, 1)
    end = datetime.date(end_year, 12, 31)
    return start + datetime.timedelta(days=random.randint(0, (end - start).days))

def escape_sql(text):
    if text is None: return "NULL"
    return "'" + str(text).replace("'", "''") + "'"

def uuid_to_sql(uid_str):
    return f"UNHEX(REPLACE('{uid_str}', '-', ''))"

def generate_customers():
    sql = "USE customer_db;\n"
    sql += "INSERT INTO customers (first_name, last_name, email, phone, address, customer_type, status, preferred_dealer_id, registration_date, customer_code) VALUES\n"
    values = []
    for i in range(NUM_CUSTOMERS):
        values.append(f"({escape_sql(random.choice(FIRST_NAMES))}, {escape_sql(random.choice(LAST_NAMES))}, 'b{i}@ev.com', '09{random.randint(10000000, 99999999)}', 'Street {i}', 'INDIVIDUAL', 'NEW', {random.randint(1,3)}, {escape_sql(random_date(2022, 2024))}, 'CUS-B-{i:05d}')")
    return sql + ",\n".join(values) + ";\n"

def generate_appointments():
    sql = "USE customer_db;\n"
    sql += "INSERT INTO test_drive_appointments (customer_id, dealer_id, model_id, appointment_date, status, staff_notes) VALUES\n"
    values = []
    for i in range(NUM_APPOINTMENTS):
        values.append(f"({random.randint(1, 500)}, {uuid_to_sql(random.choice(DEALER_UUIDS))}, {random.randint(1,6)}, {escape_sql(datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))}, 'PENDING', 'Bulk appointment')")
    return sql + ",\n".join(values) + ";\n"

def generate_complaints():
    sql = "USE customer_db;\n"
    sql += "INSERT INTO complaints (customer_id, dealer_id, description, severity, status, created_at) VALUES\n"
    values = []
    for i in range(NUM_COMPLAINTS):
        # Note: dealer_id is varchar(36) here NOT binary(16) based on earlier DESCRIBE
        values.append(f"({random.randint(1, 500)}, '{random.choice(DEALER_UUIDS)}', 'Phản ánh chất lượng dịch vụ lần thứ {i}', 'MEDIUM', 'NEW', {escape_sql(random_date())})")
    return sql + ",\n".join(values) + ";\n"

def generate_promotions():
    sql = "USE sales_db;\n"
    sql += "INSERT INTO promotions (promotion_id, promotion_name, description, discount_rate, start_date, end_date, status, dealer_id_json) VALUES\n"
    values = []
    for i in range(NUM_PROMOTIONS):
        promo_id = str(uuid.uuid4())
        dealers_json = f'["{random.choice(DEALER_UUIDS)}"]'
        values.append(f"({uuid_to_sql(promo_id)}, 'Sale {i}', 'Giảm giá cực sốc', 10, {escape_sql(random_date())}, {escape_sql(random_date(2026, 2026))}, 'ACTIVE', {escape_sql(dealers_json)})")
    return sql + ",\n".join(values) + ";\n"

if __name__ == "__main__":
    os.makedirs("sql/bulk", exist_ok=True)
    with open("sql/bulk/customers_bulk.sql", "w", encoding="utf-8") as f: f.write(generate_customers())
    with open("sql/bulk/appointments_bulk.sql", "w", encoding="utf-8") as f: f.write(generate_appointments())
    with open("sql/bulk/complaints_bulk.sql", "w", encoding="utf-8") as f: f.write(generate_complaints())
    with open("sql/bulk/sales_bulk.sql", "w", encoding="utf-8") as f: f.write(generate_promotions())
    print("Regeneration successful!")
