-- ==============================================================================
-- MediLink: Connected Healthcare Platform - Complete MySQL Database Schema
-- Phase 2 Architecture Specification
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS medilink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medilink_db;

-- 1. Roles Definition
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- 'HOSPITAL_ADMIN', 'DOCTOR', 'PATIENT', 'PHARMACIST'
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- 3. Hospitals & Reception Info
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'BMSCE-HOSP', 'APOLLO-BLR'
    address TEXT NOT NULL,
    contact_phone VARCHAR(30),
    contact_email VARCHAR(191),
    emergency_helpline VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Doctors Profile
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    hospital_id VARCHAR(36) NOT NULL,
    specialization VARCHAR(100) NOT NULL, -- Cardiology, Neurology, General Medicine, etc.
    license_number VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    qualification VARCHAR(150),
    consultation_fee DECIMAL(10,2) DEFAULT 500.00,
    available_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    is_on_duty BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT
);

-- 5. Patients Profile
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(36) PRIMARY KEY, -- MediLink Patient ID e.g. 'ML-PAT-1001'
    user_id VARCHAR(36) NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    address TEXT,
    qr_code_hash VARCHAR(255) NOT NULL,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Health Profiles (Comprehensive Medical Baseline)
CREATE TABLE IF NOT EXISTS health_profiles (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL UNIQUE,
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    allergies JSON, -- ['Penicillin', 'Peanuts']
    chronic_conditions JSON, -- ['Type 2 Diabetes', 'Hypertension', 'Kidney Stones']
    current_medications JSON, -- [{name: 'Metformin', dosage: '500mg'}]
    family_medical_history TEXT,
    insurance_provider VARCHAR(150),
    insurance_policy_number VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 7. Pharmacists
CREATE TABLE IF NOT EXISTS pharmacists (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    hospital_id VARCHAR(36) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    counter_number VARCHAR(20) DEFAULT 'Counter 1',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT
);

-- 8. Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY,
    hospital_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL, -- '10:00 AM - 10:30 AM'
    department VARCHAR(100) NOT NULL,
    reason_for_visit TEXT,
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- 9. Consultations
CREATE TABLE IF NOT EXISTS consultations (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36) NOT NULL UNIQUE,
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    symptoms TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    vitals JSON, -- {bp_systolic: 120, bp_diastolic: 80, pulse: 72, temp: 98.6, spo2: 99}
    shared_notes TEXT, -- visible to patient and authorized physicians
    future_doctor_notes TEXT, -- specifically highlighted for continuing care
    is_private_doctor_notes BOOLEAN DEFAULT FALSE,
    private_notes TEXT, -- visible only to this doctor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- 10. Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id VARCHAR(36) PRIMARY KEY,
    consultation_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    hospital_id VARCHAR(36) NOT NULL,
    status ENUM('Sent', 'Preparing', 'Ready for Pickup', 'Dispensed', 'Cancelled') DEFAULT 'Sent',
    pickup_token VARCHAR(20),
    scanned_image_url VARCHAR(500), -- populated if scanned/uploaded prescription
    ocr_raw_text TEXT,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- 11. Prescription Items
CREATE TABLE IF NOT EXISTS prescription_items (
    id VARCHAR(36) PRIMARY KEY,
    prescription_id VARCHAR(36) NOT NULL,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(50) NOT NULL, -- '500 mg'
    frequency VARCHAR(50) NOT NULL, -- '1-0-1 (After Food)'
    duration VARCHAR(50) NOT NULL, -- '7 Days'
    instructions VARCHAR(255),
    is_out_of_stock BOOLEAN DEFAULT FALSE,
    dispensed_quantity INT DEFAULT 0,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- 12. Pharmacy Orders & Dispensation
CREATE TABLE IF NOT EXISTS pharmacy_orders (
    id VARCHAR(36) PRIMARY KEY,
    prescription_id VARCHAR(36) NOT NULL UNIQUE,
    pharmacist_id VARCHAR(36),
    status ENUM('Pending', 'Preparing', 'Ready', 'Dispensed') DEFAULT 'Pending',
    token_number VARCHAR(20) NOT NULL,
    bill_amount DECIMAL(10,2) DEFAULT 0.00,
    dispensed_at TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id),
    FOREIGN KEY (pharmacist_id) REFERENCES pharmacists(id)
);

-- 13. Dynamic Custom Record Types (Patient Defined)
CREATE TABLE IF NOT EXISTS custom_record_types (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL, -- 'Blood Glucose', 'Blood Pressure', 'Thyroid Panel'
    description TEXT,
    category VARCHAR(50) DEFAULT 'Vitals',
    icon VARCHAR(50) DEFAULT 'Activity',
    color VARCHAR(20) DEFAULT '#0d9488',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 14. Dynamic Custom Record Fields
CREATE TABLE IF NOT EXISTS custom_record_fields (
    id VARCHAR(36) PRIMARY KEY,
    record_type_id VARCHAR(36) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_key VARCHAR(50) NOT NULL, -- 'systolic', 'fasting_sugar'
    field_type ENUM('number', 'text', 'date', 'file') NOT NULL,
    unit VARCHAR(30), -- 'mg/dL', 'mmHg'
    is_required BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (record_type_id) REFERENCES custom_record_types(id) ON DELETE CASCADE
);

-- 15. Dynamic Custom Record Entries
CREATE TABLE IF NOT EXISTS custom_record_entries (
    id VARCHAR(36) PRIMARY KEY,
    record_type_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    values_json JSON NOT NULL, -- {'fasting_sugar': 110, 'notes': 'post exercise'}
    notes TEXT,
    file_attachment_url VARCHAR(500),
    FOREIGN KEY (record_type_id) REFERENCES custom_record_types(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 16. Patient Uploaded Documents & Scans
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category ENUM('Lab Report', 'X-Ray / Scan', 'Prescription', 'Discharge Summary', 'Insurance', 'Other') NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size_kb INT DEFAULT 0,
    report_date DATE NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 17. Access Requests (Consent Architecture)
CREATE TABLE IF NOT EXISTS access_requests (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    requesting_doctor_id VARCHAR(36) NOT NULL,
    hospital_id VARCHAR(36) NOT NULL,
    purpose TEXT NOT NULL, -- 'Second Opinion review for Cardiac Symptoms'
    requested_scope ENUM('FULL', 'PRESCRIPTIONS_ONLY', 'LABS_ONLY') DEFAULT 'FULL',
    requested_duration_hours INT DEFAULT 168, -- 7 days = 168 hrs
    status ENUM('Pending', 'Approved', 'Denied', 'Expired', 'Revoked') DEFAULT 'Pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (requesting_doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- 18. Access Grants (Active Consents)
CREATE TABLE IF NOT EXISTS access_grants (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) UNIQUE,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    granted_scope ENUM('FULL', 'PRESCRIPTIONS_ONLY', 'LABS_ONLY') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    FOREIGN KEY (request_id) REFERENCES access_requests(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- 19. Transparent Immutable Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    actor_user_id VARCHAR(36) NOT NULL,
    actor_name VARCHAR(150) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action ENUM('VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'CONSENT_GRANTED', 'CONSENT_REVOKED') NOT NULL,
    resource_type VARCHAR(100) NOT NULL, -- 'PATIENT_PROFILE', 'PRESCRIPTION', 'CUSTOM_RECORD', 'DOCUMENT'
    resource_id VARCHAR(100),
    description TEXT NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 20. Smart Reminder Rules Engine
CREATE TABLE IF NOT EXISTS reminder_rules (
    id VARCHAR(36) PRIMARY KEY,
    condition_keyword VARCHAR(100) NOT NULL, -- 'Diabetes', 'Hypertension', 'Kidney Stones'
    reminder_title VARCHAR(150) NOT NULL,
    reminder_message TEXT NOT NULL,
    default_frequency VARCHAR(50) NOT NULL, -- 'Every 2 hours', 'Daily at 8:00 AM'
    category ENUM('HYDRATION', 'MEDICATION', 'MEASUREMENT', 'LIFESTYLE') NOT NULL
);

-- 21. Patient Smart Reminders
CREATE TABLE IF NOT EXISTS reminders (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    source ENUM('RULE_ENGINE', 'PRESCRIPTION', 'APPOINTMENT', 'CUSTOM') NOT NULL,
    reference_id VARCHAR(36), -- appointment_id or prescription_id if applicable
    title VARCHAR(150) NOT NULL,
    description TEXT,
    time_schedule VARCHAR(100) NOT NULL, -- e.g. '08:00 AM, 02:00 PM, 08:00 PM'
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 22. In-App Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('APPOINTMENT', 'PRESCRIPTION', 'PHARMACY', 'CONSENT', 'REMINDER', 'SYSTEM') NOT NULL,
    link_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
