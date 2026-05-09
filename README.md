# ລະບົບຈັດການສູນສ້ອມແປງຍານພາຫະນະ
# Vehicle Repair Center Management System (VRMS)

## ລາຍລະອຽດ (Overview)

ລະບົບຈັດການສູນສ້ອມແປງຍານພາຫະນະຄົບວົງຈອນ ທີ່ພັດທະນາດ້ວຍ HTML, CSS, JavaScript ແລະ ໃຊ້ Supabase ເປັນ Backend.

A complete vehicle repair center management system built with HTML, CSS, JavaScript and Supabase as backend.

## ຄຸນສົມບັດຫຼັກ (Key Features)

### 1. ຝ່າຍຕ້ອນຮັບ (Reception)
- ✅ ລົງທະບຽນລູກຄ້າໃໝ່
- ✅ ລົງທະບຽນຍານພາຫະນະ
- ✅ ເປີດໃບສັ່ງງານ (Job Card)
- ✅ ມອບຫມາຍງານໃຫ້ຊ່າງ
- ✅ ກວດສອບໃບເສັງລາຄາ
- ✅ ພິມໃບສັ່ງງານ

### 2. ຊ່າງສ້ອມແປງ (Mechanic)
- ✅ ຮັບງານທີ່ມອບຫມາຍ
- ✅ ຂໍອາໄຫຼ່ຈາກສາງ (ສະແກນ QR Code)
- ✅ ຄຳນວນຄ່າແຮງງານອັດຕະໂນມັດ
- ✅ ບັນທຶກຄ່າແຮງງານເພີ່ມເຕີມ
- ✅ ສົ່ງງານໄປກວດກາ PDI

### 3. ຝ່າຍສາງ (Warehouse)
- ✅ ຈັດການສາງອາໄຫຼ່
- ✅ ກວດສອບຄຳຂໍອາໄຫຼ່
- ✅ ອະນຸມັດ/ປະຕິເສດການຂໍອາໄຫຼ່
- ✅ ເບີກອາໄຫຼ່ອອກສາງ
- ✅ ພິມ QR Code ອາໄຫຼ່

### 4. ຝ່າຍກວດກາ PDI (PDI Inspector)
- ✅ ກວດກາຍານພາຫະນະຕາມ Checklist
- ✅ 5 ຫົວຂໍ້ກວດກາ (Exterior, Interior, Engine, Brake, Electrical)
- ✅ ບັນທຶກຜົນກວດກາ
- ✅ ສົ່ງມອບຍານພາຫະນະໃຫ້ລູກຄ້າ

### 5. ຜູ້ບໍລິຫານ (Admin)
- ✅ Dashboard ສະຫຼຸບຂໍ້ມູນ
- ✅ ຈັດການພະນັກງານ
- ✅ ລາຍງານລາຍຮັບ
- ✅ ກວດສອບສະຖິຕິ

## ເຕັກໂນໂລຢີ (Technology Stack)

| Technology | Purpose |
|-----------|---------|
| HTML5 | Structure |
| CSS3 | Styling (Custom CSS, no framework) |
| JavaScript (Vanilla) | Logic & Interactivity |
| Supabase | Backend (Database, Auth, Realtime) |
| html5-qrcode | QR Code Scanning |
| Font Awesome | Icons |
| Google Fonts (Noto Sans Lao) | Lao Typography |

## ໂຄງສ້າງໄຟລ໌ (File Structure)

```
vehicle-repair-center/
├── index.html              # Main entry point
├── css/
│   └── style.css           # All styles
├── js/
│   ├── config.js           # App configuration
│   ├── supabase-client.js  # Supabase client & DB helpers
│   ├── auth.js             # Authentication module
│   ├── utils.js            # Utility functions
│   ├── qr-scanner.js       # QR Code scanning
│   └── app.js              # Main application logic
└── README.md               # This file
```

## ການຕິດຕັ້ງ (Installation)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/vehicle-repair-center.git
cd vehicle-repair-center
```

### 2. Setup Supabase

#### 2.1 ສ້າງ Project ໃໝ່
- ໄປທີ່ [https://supabase.com](https://supabase.com)
- ສ້າງ Account ແລະ Project ໃໝ່

#### 2.2 ສ້າງ Tables
Run SQL ນີ້ໃນ Supabase SQL Editor:

```sql
-- Customers table
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    id_card TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    license_plate TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    color TEXT,
    vin TEXT,
    engine_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Staff table
CREATE TABLE staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('reception', 'mechanic', 'warehouse', 'pdi', 'admin')),
    email TEXT,
    phone TEXT,
    specialty TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Parts table
CREATE TABLE parts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    brand TEXT,
    description TEXT,
    stock_quantity INTEGER DEFAULT 0,
    price DECIMAL(12,2) DEFAULT 0,
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job Cards table
CREATE TABLE job_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_number TEXT NOT NULL UNIQUE,
    vehicle_id UUID REFERENCES vehicles(id),
    mechanic_id UUID REFERENCES staff(id),
    problem_description TEXT,
    initial_diagnosis TEXT,
    mileage_in INTEGER,
    oil_level TEXT,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'parts_requested', 'parts_approved', 'in_progress', 'completed', 'pdi_pending', 'pdi_passed', 'pdi_failed', 'released')),
    notes TEXT,
    created_by UUID REFERENCES staff(id),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    pdi_completed_at TIMESTAMP WITH TIME ZONE,
    pdi_result TEXT,
    pdi_notes TEXT,
    released_at TIMESTAMP WITH TIME ZONE,
    released_by UUID REFERENCES staff(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job Parts table (parts requests)
CREATE TABLE job_parts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_card_id UUID REFERENCES job_cards(id) ON DELETE CASCADE,
    part_id UUID REFERENCES parts(id),
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'issued', 'returned')),
    requested_by UUID REFERENCES staff(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    approved_at TIMESTAMP WITH TIME ZONE,
    issued_at TIMESTAMP WITH TIME ZONE,
    labor_cost_auto DECIMAL(12,2) DEFAULT 0
);

-- Job Labor table
CREATE TABLE job_labor (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_card_id UUID REFERENCES job_cards(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    labor_type TEXT DEFAULT 'general',
    hours DECIMAL(4,1) DEFAULT 1,
    hourly_rate DECIMAL(12,2) DEFAULT 50000,
    cost DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PDI Checklists table
CREATE TABLE pdi_checklists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_card_id UUID REFERENCES job_cards(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    result TEXT CHECK (result IN ('pass', 'fail', 'pending')),
    checked_by UUID REFERENCES staff(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES staff(id),
    title TEXT NOT NULL,
    message TEXT,
    type TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert sample staff for testing
INSERT INTO staff (name, role, email, phone, active) VALUES
('ທ. ສົມຊາຍ', 'reception', 'somchai@test.com', '02012345678', true),
('ທ. ວັນນາ', 'mechanic', 'vanna@test.com', '02023456789', true),
('ທ. ແກ້ວ', 'warehouse', 'kaew@test.com', '02034567890', true),
('ທ. ໄພລິນ', 'pdi', 'pailin@test.com', '02045678901', true),
('ທ. ສຸກ', 'admin', 'suk@test.com', '02056789012', true);

-- Insert sample parts
INSERT INTO parts (code, name, category, brand, stock_quantity, price, qr_code) VALUES
('OIL-001', 'ນໍ້າມັນເຄື່ອງລົດ 10W-40', 'engine', 'Shell', 50, 85000, 'PART:1:OIL-001'),
('BRK-001', 'ແຜ່ນເບຣກໜ້າ', 'brake', 'Bosch', 30, 120000, 'PART:2:BRK-001'),
('FLT-001', 'ໄສ້ກອງອາກາດ', 'engine', 'Mann', 25, 65000, 'PART:3:FLT-001'),
('BAT-001', 'ແບດເຕີຣີ 12V', 'electrical', 'GS', 20, 280000, 'PART:4:BAT-001'),
('SPK-001', 'ຫົວເທີນ 4 ອັນ', 'engine', 'NGK', 40, 45000, 'PART:5:SPK-001');
```

#### 2.3 Setup RLS Policies (Row Level Security)
```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_labor ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for demo - customize for production)
CREATE POLICY "Allow all" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON parts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON job_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON job_parts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON job_labor FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pdi_checklists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON notifications FOR ALL USING (true) WITH CHECK (true);
```

### 3. Configure Application

Edit `js/config.js`:
```javascript
SUPABASE_URL: 'https://your-project.supabase.co',
SUPABASE_ANON_KEY: 'your-anon-key-here',
```

### 4. Deploy
```bash
# Option 1: GitHub Pages
# Push to GitHub and enable GitHub Pages in repository settings

# Option 2: Netlify
# Drag and drop the folder to Netlify

# Option 3: Vercel
# Use Vercel CLI or import from GitHub
```

## ການໃຊ້ງານ (Usage)

### Login Credentials (Demo)
| Role | Email | Password |
|------|-------|----------|
| Reception | somchai@test.com | 123456 |
| Mechanic | vanna@test.com | 123456 |
| Warehouse | kaew@test.com | 123456 |
| PDI | pailin@test.com | 123456 |
| Admin | suk@test.com | 123456 |

### Workflow
1. **Reception** receives vehicle → creates Job Card → assigns to Mechanic
2. **Mechanic** receives Job Card → scans QR code to request parts → labor cost auto-calculated
3. **Warehouse** receives request → approves and issues parts → updates stock
4. **Mechanic** receives parts → completes job → sends to PDI
5. **PDI** performs checklist inspection → passes/fails → releases vehicle to customer

## Currency & Language
- **Currency**: LAK (Lao Kip) - ₭
- **Language**: Lao (ລາວ)
- **Date Format**: Lao locale

## License
MIT License - Free for personal and commercial use.

## Contact
For support or questions, please open an issue on GitHub.

---

**ສປປ ລາວ** | Developed with ❤️ for Lao Vehicle Repair Centers
