-- =====================================================================
-- HEALTHSYNC CONNECTED HEALTHCARE PLATFORM - DATABASE SQL SPECIFICATION
-- Full Stack Development (FSD) Project - BMSCE
-- Relational Database Management System (RDBMS) - MySQL 8.0+ Dialect
-- Includes: DDL (Tables, Keys, Checks), DML (Seed Data), Triggers,
--           Stored Procedures, Views, Assertions, and Complex Analytics.
-- =====================================================================

DROP DATABASE IF EXISTS healthsync_db;
CREATE DATABASE healthsync_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE healthsync_db;

-- =====================================================================
-- SECTION 1: DATA DEFINITION LANGUAGE (DDL) - TABLES & CONSTRAINTS
-- =====================================================================

-- 1. Roles Table
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_role_name CHECK (name IN ('HOSPITAL', 'DOCTOR', 'PATIENT', 'PHARMACIST'))
) ENGINE=InnoDB;

-- 2. Master Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role_id)
) ENGINE=InnoDB;

-- 3. Hospitals Table
CREATE TABLE hospitals (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    contact_phone VARCHAR(30),
    contact_email VARCHAR(191),
    emergency_helpline VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Doctors Table
CREATE TABLE doctors (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    hospital_id VARCHAR(36) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    qualification VARCHAR(150),
    consultation_fee DECIMAL(10,2) DEFAULT 500.00,
    available_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    is_on_duty BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    CONSTRAINT chk_consultation_fee CHECK (consultation_fee >= 0.00),
    INDEX idx_doctor_dept (department),
    INDEX idx_doctor_hosp (hospital_id)
) ENGINE=InnoDB;

-- 5. Patients Table
CREATE TABLE patients (
    id VARCHAR(36) PRIMARY KEY, -- Sovereign ID: 'ML-PAT-1001'
    user_id VARCHAR(36) NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    address TEXT,
    qr_code_hash VARCHAR(255) NOT NULL UNIQUE,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_patient_gender CHECK (gender IN ('Male', 'Female', 'Other')),
    CONSTRAINT chk_patient_blood CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown')),
    INDEX idx_patient_dob (date_of_birth)
) ENGINE=InnoDB;

-- 6. Health Profiles Table (1-to-1 with Patient)
CREATE TABLE health_profiles (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL UNIQUE,
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    allergies JSON,
    chronic_conditions JSON,
    current_medications JSON,
    family_medical_history TEXT,
    insurance_provider VARCHAR(150),
    insurance_policy_number VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hp_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT chk_hp_height CHECK (height_cm IS NULL OR (height_cm > 20.00 AND height_cm < 300.00)),
    CONSTRAINT chk_hp_weight CHECK (weight_kg IS NULL OR (weight_kg > 1.00 AND weight_kg < 500.00))
) ENGINE=InnoDB;

-- 7. Pharmacists Table
CREATE TABLE pharmacists (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    hospital_id VARCHAR(36) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    counter_number VARCHAR(50) DEFAULT 'Counter 1',
    CONSTRAINT fk_pharmacist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pharmacist_hosp FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Appointments Table
CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY,
    hospital_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL,
    department VARCHAR(100) NOT NULL,
    reason_for_visit TEXT,
    status VARCHAR(30) DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appt_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT chk_appt_status CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    INDEX idx_appt_date_status (appointment_date, status),
    INDEX idx_appt_doc (doctor_id)
) ENGINE=InnoDB;

-- 9. Consultations Table
CREATE TABLE consultations (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36) NOT NULL UNIQUE,
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    symptoms TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    vitals JSON, -- {bp_systolic, bp_diastolic, pulse, spo2, temp, weight}
    shared_notes TEXT,
    future_doctor_notes TEXT,
    is_private_doctor_notes BOOLEAN DEFAULT FALSE,
    private_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cns_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    CONSTRAINT fk_cns_doc FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_cns_pat FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_cns_patient (patient_id)
) ENGINE=InnoDB;

-- 10. Prescriptions Table
CREATE TABLE prescriptions (
    id VARCHAR(36) PRIMARY KEY,
    consultation_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    hospital_id VARCHAR(36) NOT NULL,
    status VARCHAR(30) DEFAULT 'Sent',
    pickup_token VARCHAR(20),
    scanned_image_url VARCHAR(500),
    ocr_raw_text TEXT,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rx_cns FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE,
    CONSTRAINT fk_rx_pat FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_rx_doc FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_rx_hosp FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    CONSTRAINT chk_rx_status CHECK (status IN ('Sent', 'Preparing', 'Ready for Pickup', 'Dispensed')),
    INDEX idx_rx_status (status),
    INDEX idx_rx_patient (patient_id)
) ENGINE=InnoDB;

-- 11. Prescription Items Table
CREATE TABLE prescription_items (
    id VARCHAR(36) PRIMARY KEY,
    prescription_id VARCHAR(36) NOT NULL,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    instructions VARCHAR(255),
    is_out_of_stock BOOLEAN DEFAULT FALSE,
    dispensed_quantity INT DEFAULT 0,
    CONSTRAINT fk_rx_items_rx FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    CONSTRAINT chk_dispensed_qty CHECK (dispensed_quantity >= 0),
    INDEX idx_rx_med_name (medicine_name)
) ENGINE=InnoDB;

-- 12. Dynamic Custom Record Types Table
CREATE TABLE custom_record_types (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'Vitals',
    icon VARCHAR(50) DEFAULT 'Activity',
    color VARCHAR(20) DEFAULT '#0d9488',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_crt_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. Dynamic Custom Record Entries Table (For Recharts graphing)
CREATE TABLE custom_record_entries (
    id VARCHAR(36) PRIMARY KEY,
    record_type_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    values_json JSON NOT NULL,
    notes TEXT,
    CONSTRAINT fk_cre_type FOREIGN KEY (record_type_id) REFERENCES custom_record_types(id) ON DELETE CASCADE,
    CONSTRAINT fk_cre_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_cre_rec_date (recorded_at)
) ENGINE=InnoDB;

-- 14. Sovereign Access Requests Table (Second Opinion & Cross-Hospital Consent)
CREATE TABLE access_requests (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    requesting_doctor_id VARCHAR(36) NOT NULL,
    hospital_id VARCHAR(36) NOT NULL,
    purpose TEXT NOT NULL,
    requested_scope VARCHAR(30) DEFAULT 'FULL',
    requested_duration_hours INT DEFAULT 168,
    status VARCHAR(30) DEFAULT 'Pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    CONSTRAINT fk_ar_pat FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_ar_doc FOREIGN KEY (requesting_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_ar_hosp FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    CONSTRAINT chk_ar_scope CHECK (requested_scope IN ('FULL', 'PRESCRIPTIONS_ONLY', 'LABS_ONLY')),
    CONSTRAINT chk_ar_status CHECK (status IN ('Pending', 'Approved', 'Denied', 'Revoked', 'Expired')),
    INDEX idx_ar_status (status)
) ENGINE=InnoDB;

-- 15. Immutable Security & Privacy Audit Logs Table
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    actor_user_id VARCHAR(36) NOT NULL,
    actor_name VARCHAR(150) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_pat FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_audit_created (created_at),
    INDEX idx_audit_patient (patient_id)
) ENGINE=InnoDB;

-- 16. Smart Reminders Table (Rules Engine)
CREATE TABLE reminders (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    source VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    time_schedule VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rem_pat FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT chk_rem_source CHECK (source IN ('APPOINTMENT', 'PRESCRIPTION', 'CONDITION_ENGINE', 'USER_CUSTOM'))
) ENGINE=InnoDB;

-- 17. Notifications Table
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    link_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- =====================================================================
-- SECTION 2: DATA MANIPULATION LANGUAGE (DML) - CLINICAL SEED DATA
-- =====================================================================

-- Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'HOSPITAL', 'Hospital Reception, Admissions & Administration Desk'),
(2, 'DOCTOR', 'Licensed Medical Physician & Clinical Specialist'),
(3, 'PATIENT', 'Registered Patient & Sovereign Health Data Owner'),
(4, 'PHARMACIST', 'Licensed Hospital Pharmacist & Dispensary Operator');

-- Hospitals
INSERT INTO hospitals (id, name, code, address, contact_phone, contact_email, emergency_helpline) VALUES
('HOSP-01', 'Apollo Multispeciality Hospital', 'APOLLO-BLR', '154/11, Bannerghatta Main Rd, Bengaluru, Karnataka 560076', '+91 80 2630 4050', 'contact@apollo-blr.healthsync.in', '1066'),
('HOSP-02', 'BMSCE Healthcare & Research Institute', 'BMSCE-HEALTH', 'Bull Temple Road, Basavanagudi, Bengaluru, Karnataka 560019', '+91 80 2662 2130', 'healthcentre@bmsce.ac.in', '+91 80 2662 2139');

-- Users & Credentials (Default Demo PW: 'password123')
INSERT INTO users (id, email, password_hash, role_id, full_name, phone, avatar_url) VALUES
('USR-REC-01', 'reception@bmsce.edu', 'pbkdf2$100000$salt$hash', 1, 'Anita Desai', '+91 80 2662 2130', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
('USR-DOC-01', 'dr.priya@healthsync.com', 'pbkdf2$100000$salt$hash', 2, 'Dr. Priya Sharma', '+91 98450 11111', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'),
('USR-DOC-02', 'dr.rajesh@healthsync.com', 'pbkdf2$100000$salt$hash', 2, 'Dr. Rajesh Kulkarni', '+91 98450 22222', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'),
('USR-DOC-03', 'dr.sneha@healthsync.com', 'pbkdf2$100000$salt$hash', 2, 'Dr. Sneha Patil', '+91 98450 33333', 'https://images.unsplash.com/photo-1594824813637-23f2f01f65d6?w=150'),
('USR-DOC-04', 'dr.arjun@healthsync.com', 'pbkdf2$100000$salt$hash', 2, 'Dr. Arjun Menon', '+91 98450 44444', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'),
('USR-PAT-01', 'rahul@gmail.com', 'pbkdf2$100000$salt$hash', 3, 'Rahul Verma', '+91 98450 12345', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('USR-PAT-02', 'ananya.rao@gmail.com', 'pbkdf2$100000$salt$hash', 3, 'Ananya Rao', '+91 98451 23456', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
('USR-PH-01', 'pharmacy.apollo@healthsync.com', 'pbkdf2$100000$salt$hash', 4, 'Suresh Gupta, R.Ph.', '+91 80 2630 4055', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150');

-- Doctors
INSERT INTO doctors (id, user_id, hospital_id, specialization, license_number, department, qualification, consultation_fee, available_days, is_on_duty) VALUES
('DOC-01', 'USR-DOC-01', 'HOSP-01', 'Chief Cardiologist', 'KMC-48291', 'Cardiology', 'MBBS, MD, DM (Cardiology)', 850.00, 'Mon,Tue,Wed,Thu,Fri', TRUE),
('DOC-02', 'USR-DOC-02', 'HOSP-01', 'Senior Endocrinologist', 'KMC-39182', 'Endocrinology', 'MBBS, MD (General Medicine)', 750.00, 'Mon,Wed,Fri', TRUE),
('DOC-03', 'USR-DOC-03', 'HOSP-02', 'Consultant Pulmonologist', 'KMC-51029', 'Pulmonology', 'MBBS, MD (Pulmonary Medicine)', 700.00, 'Tue,Thu,Sat', TRUE),
('DOC-04', 'USR-DOC-04', 'HOSP-02', 'Consultant Surgeon', 'KMC-62940', 'Surgery', 'MBBS, MS (General Surgery)', 900.00, 'Mon,Tue,Wed,Thu,Fri', TRUE);

-- Pharmacists
INSERT INTO pharmacists (id, user_id, hospital_id, license_number, counter_number) VALUES
('PHARM-01', 'USR-PH-01', 'HOSP-01', 'PH-KAR-1001', 'Counter 1 - FastTrack');

-- Patients
INSERT INTO patients (id, user_id, date_of_birth, gender, blood_group, address, qr_code_hash, emergency_contact_name, emergency_contact_phone) VALUES
('ML-PAT-1001', 'USR-PAT-01', '1989-06-15', 'Male', 'B+', 'Jayanagar 4th Block, Bengaluru', 'HEALTHSYNC-PAT-ML-PAT-1001-TOKEN', 'Pooja Verma (Spouse)', '+91 98450 99999'),
('ML-PAT-1002', 'USR-PAT-02', '1996-03-22', 'Female', 'O+', 'Basavanagudi, Bengaluru', 'HEALTHSYNC-PAT-ML-PAT-1002-TOKEN', 'S. Rao (Father)', '+91 98451 88888');

-- Health Profiles
INSERT INTO health_profiles (id, patient_id, height_cm, weight_kg, allergies, chronic_conditions, insurance_provider, insurance_policy_number) VALUES
('HP-01', 'ML-PAT-1001', 174.00, 78.50, '["Penicillin", "Sulfa drugs"]', '["Type 2 Diabetes", "Hypertension"]', 'Star Health Premier Care', 'POL-STAR-2026-101'),
('HP-02', 'ML-PAT-1002', 162.00, 54.00, '["Aspirin"]', '["Bronchial Asthma"]', 'HDFC ERGO Health Suraksha', 'POL-HDFC-2026-202');

-- Appointments
INSERT INTO appointments (id, hospital_id, doctor_id, patient_id, appointment_date, time_slot, department, reason_for_visit, status) VALUES
('APT-01', 'HOSP-01', 'DOC-01', 'ML-PAT-1001', CURDATE(), '10:00 AM', 'Cardiology', 'Follow-up on blood pressure regulation and angina episodes', 'Scheduled'),
('APT-02', 'HOSP-02', 'DOC-03', 'ML-PAT-1002', CURDATE(), '02:00 PM', 'Pulmonology', 'Seasonal wheezing and nighttime persistent cough', 'Completed');

-- Consultations
INSERT INTO consultations (id, appointment_id, doctor_id, patient_id, symptoms, diagnosis, vitals, shared_notes, future_doctor_notes) VALUES
('CNS-01', 'APT-02', 'DOC-03', 'ML-PAT-1002',
 'Bilateral wheezing, nocturnal cough',
 'Moderate Persistent Asthma - Acute Seasonal Flare',
 '{"bp_systolic": 118, "bp_diastolic": 76, "pulse": 74, "spo2": 98, "temp": 98.4}',
 'Spirometry reveals reversible obstruction. Started Budesonide inhaler twice daily.',
 'Patient has documented aspirin intolerance; do NOT prescribe NSAIDs.');

-- Prescriptions
INSERT INTO prescriptions (id, consultation_id, patient_id, doctor_id, hospital_id, status, pickup_token, special_instructions) VALUES
('RX-01', 'CNS-01', 'ML-PAT-1002', 'DOC-03', 'HOSP-02', 'Ready for Pickup', 'T-24', 'Rinse mouth with lukewarm water after every inhalation.');

-- Prescription Items
INSERT INTO prescription_items (id, prescription_id, medicine_name, dosage, frequency, duration, instructions, is_out_of_stock) VALUES
('RXI-01', 'RX-01', 'Budesonide + Formoterol (200/6mcg)', '2 puffs', 'Twice daily', '30 days', 'Morning and night', FALSE),
('RXI-02', 'RX-01', 'Montelukast Sodium 10mg', '1 tablet', 'Once daily', '15 days', 'Take at bedtime', FALSE),
('RXI-03', 'RX-01', 'Levocetirizine 5mg', '1 tablet', 'SOS (As needed)', '7 days', 'For allergic rhinitis flares', FALSE);

-- Sovereign Access Request (Second Opinion)
INSERT INTO access_requests (id, patient_id, requesting_doctor_id, hospital_id, purpose, requested_scope, requested_duration_hours, status) VALUES
('ACC-REQ-01', 'ML-PAT-1001', 'DOC-04', 'HOSP-02', 'Second Opinion: Pre-operative cardiac clearance for elective knee arthroscopy', 'FULL', 168, 'Approved');

-- Audit Logs
INSERT INTO audit_logs (id, patient_id, actor_user_id, actor_name, actor_role, action, resource_type, description, ip_address) VALUES
('AUD-01', 'ML-PAT-1001', 'DOC-01', 'Dr. Priya Sharma', 'Doctor', 'VIEW', 'PATIENT_PROFILE', 'Viewed patient profile and past cardiology baseline.', '192.168.1.10'),
('AUD-02', 'ML-PAT-1001', 'ML-PAT-1001', 'Rahul Verma', 'Patient', 'APPROVE', 'ACCESS_GRANT', 'Approved 7-day FULL history access request for Dr. Arjun Menon.', '106.51.72.19'),
('AUD-03', 'ML-PAT-1002', 'DOC-03', 'Dr. Sneha Patil', 'Doctor', 'CREATE', 'PRESCRIPTION', 'Generated e-Prescription #RX-01 containing 3 medications for Asthma.', '192.168.2.15');


-- =====================================================================
-- SECTION 3: ADVANCED ACTIVE DATABASE TRIGGERS
-- =====================================================================

DELIMITER $$

-- Trigger 1: Auto-complete Appointment upon Consultation Creation
CREATE TRIGGER trg_after_consultation_insert
AFTER INSERT ON consultations
FOR EACH ROW
BEGIN
    UPDATE appointments
    SET status = 'Completed'
    WHERE id = NEW.appointment_id;
END$$

-- Trigger 2: Auto-assign Pickup Token and Log Notification on 'Ready for Pickup'
CREATE TRIGGER trg_prescription_status_update
BEFORE UPDATE ON prescriptions
FOR EACH ROW
BEGIN
    IF NEW.status = 'Ready for Pickup' AND (OLD.status != 'Ready for Pickup' OR OLD.pickup_token IS NULL) THEN
        IF NEW.pickup_token IS NULL THEN
            SET NEW.pickup_token = CONCAT('T-', LPAD(FLOOR(RAND() * 90 + 10), 2, '0'));
        END IF;
    END IF;
END$$

-- Trigger 3: Immutable Audit Trail Logging on Sovereign Access Consent Decision
CREATE TRIGGER trg_audit_access_decision
AFTER UPDATE ON access_requests
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO audit_logs (
            id, patient_id, actor_user_id, actor_name, actor_role,
            action, resource_type, description, ip_address
        ) VALUES (
            UUID(), NEW.patient_id, NEW.patient_id, 'Sovereign Patient', 'Patient',
            UPPER(NEW.status), 'ACCESS_REQUEST',
            CONCAT('Patient transitioned consent request to: ', NEW.status, ' (Scope: ', NEW.requested_scope, ')'),
            '127.0.0.1'
        );
    END IF;
END$$

DELIMITER ;


-- =====================================================================
-- SECTION 4: DATABASE VIEWS & STORED PROCEDURES
-- =====================================================================

-- View 1: Patient Longitudinal Visit Timeline
CREATE OR REPLACE VIEW vw_patient_visit_timeline AS
SELECT 
    p.id AS patient_id,
    u_p.full_name AS patient_name,
    p.blood_group,
    c.id AS consultation_id,
    c.created_at AS consultation_date,
    c.diagnosis,
    c.symptoms,
    c.vitals,
    c.shared_notes,
    u_d.full_name AS doctor_name,
    d.department,
    d.specialization,
    h.name AS hospital_name,
    rx.id AS prescription_id,
    rx.status AS pharmacy_status,
    rx.pickup_token
FROM patients p
JOIN users u_p ON p.user_id = u_p.id
JOIN consultations c ON p.id = c.patient_id
JOIN doctors d ON c.doctor_id = d.id
JOIN users u_d ON d.user_id = u_d.id
JOIN hospitals h ON d.hospital_id = h.id
LEFT JOIN prescriptions rx ON c.id = rx.consultation_id;

-- View 2: Pharmacist Live Dispensing Queue
CREATE OR REPLACE VIEW vw_pharmacy_live_queue AS
SELECT 
    rx.id AS prescription_id,
    rx.created_at AS dispatched_at,
    rx.status AS prescription_status,
    rx.pickup_token,
    p.id AS patient_id,
    u_p.full_name AS patient_name,
    u_p.phone AS patient_phone,
    u_d.full_name AS doctor_name,
    h.name AS hospital_name,
    COUNT(rxi.id) AS total_medicines,
    SUM(CASE WHEN rxi.is_out_of_stock = TRUE THEN 1 ELSE 0 END) AS out_of_stock_medicines
FROM prescriptions rx
JOIN patients p ON rx.patient_id = p.id
JOIN users u_p ON p.user_id = u_p.id
JOIN doctors d ON rx.doctor_id = d.id
JOIN users u_d ON d.user_id = u_d.id
JOIN hospitals h ON rx.hospital_id = h.id
LEFT JOIN prescription_items rxi ON rx.id = rxi.prescription_id
WHERE rx.status IN ('Sent', 'Preparing', 'Ready for Pickup')
GROUP BY rx.id, rx.created_at, rx.status, rx.pickup_token, p.id, u_p.full_name, u_p.phone, u_d.full_name, h.name
ORDER BY rx.created_at DESC;

DELIMITER $$

-- Stored Procedure: Transactional Appointment Booking with Availability Check
CREATE PROCEDURE sp_book_patient_appointment(
    IN p_hospital_id VARCHAR(36),
    IN p_doctor_id VARCHAR(36),
    IN p_patient_id VARCHAR(36),
    IN p_appointment_date DATE,
    IN p_time_slot VARCHAR(30),
    IN p_department VARCHAR(100),
    IN p_reason TEXT,
    OUT p_appointment_id VARCHAR(36),
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_doctor_on_duty BOOLEAN;
    DECLARE v_slot_conflict_count INT;
    
    START TRANSACTION;
    
    -- Check doctor duty status
    SELECT is_on_duty INTO v_doctor_on_duty FROM doctors WHERE id = p_doctor_id;
    IF v_doctor_on_duty IS FALSE THEN
        SET p_status_message = 'ERROR: Doctor is currently not on duty.';
        SET p_appointment_id = NULL;
        ROLLBACK;
    ELSE
        -- Check slot conflict
        SELECT COUNT(*) INTO v_slot_conflict_count 
        FROM appointments 
        WHERE doctor_id = p_doctor_id 
          AND appointment_date = p_appointment_date 
          AND time_slot = p_time_slot
          AND status != 'Cancelled';
          
        IF v_slot_conflict_count > 0 THEN
            SET p_status_message = 'ERROR: Doctor time slot is already booked.';
            SET p_appointment_id = NULL;
            ROLLBACK;
        ELSE
            SET p_appointment_id = CONCAT('APT-', LPAD(FLOOR(RAND() * 90000 + 10000), 5, '0'));
            
            INSERT INTO appointments (
                id, hospital_id, doctor_id, patient_id,
                appointment_date, time_slot, department, reason_for_visit, status
            ) VALUES (
                p_appointment_id, p_hospital_id, p_doctor_id, p_patient_id,
                p_appointment_date, p_time_slot, p_department, p_reason, 'Scheduled'
            );
            
            -- Insert appointment reminder
            INSERT INTO reminders (
                id, patient_id, source, title, description, time_schedule
            ) VALUES (
                UUID(), p_patient_id, 'APPOINTMENT',
                CONCAT('Appointment on ', p_appointment_date, ' at ', p_time_slot),
                CONCAT('Department: ', p_department, '. Reason: ', p_reason),
                CONCAT(p_appointment_date, ' ', p_time_slot)
            );
            
            SET p_status_message = 'SUCCESS: Appointment confirmed and patient reminder generated.';
            COMMIT;
        END IF;
    END IF;
END$$

DELIMITER ;


-- =====================================================================
-- SECTION 5: COMPLEX SQL QUERIES & ANALYTICAL WORKLOADS
-- =====================================================================

-- Complex Query 1: Longitudinal Patient Health Journey with Prescribed Medications
-- Demonstrates multi-table joins, JSON unnesting/parsing, and aggregate concatenation.
SELECT 
    p.id AS patient_id,
    u_pat.full_name AS patient_name,
    p.blood_group,
    hp.chronic_conditions,
    c.id AS consultation_id,
    c.created_at AS visit_date,
    u_doc.full_name AS attending_physician,
    d.department,
    h.name AS hospital_name,
    c.diagnosis,
    c.vitals->>'$.bp_systolic' AS bp_systolic,
    c.vitals->>'$.bp_diastolic' AS bp_diastolic,
    c.vitals->>'$.spo2' AS oxygen_saturation,
    rx.status AS pharmacy_dispense_status,
    rx.pickup_token,
    GROUP_CONCAT(CONCAT(rxi.medicine_name, ' (', rxi.dosage, ', ', rxi.frequency, ')') SEPARATOR ' | ') AS prescribed_medicines
FROM patients p
JOIN users u_pat ON p.user_id = u_pat.id
JOIN health_profiles hp ON p.id = hp.patient_id
JOIN consultations c ON p.id = c.patient_id
JOIN doctors d ON c.doctor_id = d.id
JOIN users u_doc ON d.user_id = u_doc.id
JOIN hospitals h ON d.hospital_id = h.id
LEFT JOIN prescriptions rx ON c.id = rx.consultation_id
LEFT JOIN prescription_items rxi ON rx.id = rxi.prescription_id
WHERE p.id = 'ML-PAT-1002'
GROUP BY p.id, u_pat.full_name, p.blood_group, hp.chronic_conditions, c.id, c.created_at, 
         u_doc.full_name, d.department, h.name, c.diagnosis, bp_systolic, bp_diastolic, 
         oxygen_saturation, rx.status, rx.pickup_token
ORDER BY c.created_at DESC;

-- Complex Query 2: Consent-Gated Doctor Authorization Check
-- Validates whether Dr. Arjun Menon (DOC-04) can legitimately access Patient ML-PAT-1001.
SELECT 
    d.id AS doctor_id,
    u_doc.full_name AS doctor_name,
    p.id AS patient_id,
    u_pat.full_name AS patient_name,
    CASE 
        WHEN appt.id IS NOT NULL THEN 'AUTHORIZED: Active Direct Appointment'
        WHEN consent.id IS NOT NULL THEN CONCAT('AUTHORIZED: Approved Consent (Scope: ', consent.requested_scope, ')')
        ELSE 'DENIED: Sovereign Consent Barrier Active'
    END AS access_authorization_verdict,
    consent.requested_scope,
    consent.requested_duration_hours,
    consent.requested_at
FROM doctors d
CROSS JOIN patients p
JOIN users u_doc ON d.user_id = u_doc.id
JOIN users u_pat ON p.user_id = u_pat.id
LEFT JOIN appointments appt ON appt.doctor_id = d.id 
                            AND appt.patient_id = p.id 
                            AND appt.appointment_date >= CURDATE()
                            AND appt.status IN ('Scheduled', 'In Progress')
LEFT JOIN access_requests consent ON consent.requesting_doctor_id = d.id 
                                 AND consent.patient_id = p.id 
                                 AND consent.status = 'Approved'
WHERE d.id = 'DOC-04' AND p.id = 'ML-PAT-1001';

-- Complex Query 3: Multi-Hospital Doctor Workload, Ranking & Consultation Fee Revenue
-- Uses SQL Window Functions: DENSE_RANK() and SUM() OVER()
SELECT 
    h.name AS hospital_name,
    d.department,
    u_doc.full_name AS doctor_name,
    d.consultation_fee,
    COUNT(a.id) AS total_appointments_handled,
    SUM(CASE WHEN a.status = 'Completed' THEN 1 ELSE 0 END) AS completed_consultations,
    SUM(CASE WHEN a.status = 'Completed' THEN d.consultation_fee ELSE 0 END) AS revenue_generated,
    DENSE_RANK() OVER (
        PARTITION BY h.id 
        ORDER BY COUNT(a.id) DESC
    ) AS doctor_activity_rank,
    SUM(COUNT(a.id)) OVER (PARTITION BY h.id) AS total_hospital_appointments
FROM hospitals h
JOIN doctors d ON h.id = d.hospital_id
JOIN users u_doc ON d.user_id = u_doc.id
LEFT JOIN appointments a ON d.id = a.doctor_id
GROUP BY h.id, h.name, d.id, d.department, u_doc.full_name, d.consultation_fee
ORDER BY h.name, doctor_activity_rank;

-- Complex Query 4: Common Diagnoses and Allergy Correlation Analytics
-- Uses JSON functions and conditional aggregation
SELECT 
    c.diagnosis,
    COUNT(c.id) AS total_diagnoses_count,
    GROUP_CONCAT(DISTINCT p.blood_group) AS patient_blood_groups,
    GROUP_CONCAT(DISTINCT JSON_UNQUOTE(JSON_EXTRACT(hp.allergies, '$[0]'))) AS primary_allergies_recorded,
    AVG(CAST(JSON_UNQUOTE(JSON_EXTRACT(c.vitals, '$.pulse')) AS UNSIGNED)) AS avg_recorded_pulse,
    AVG(CAST(JSON_UNQUOTE(JSON_EXTRACT(c.vitals, '$.bp_systolic')) AS UNSIGNED)) AS avg_systolic_bp
FROM consultations c
JOIN patients p ON c.patient_id = p.id
JOIN health_profiles hp ON p.id = hp.patient_id
GROUP BY c.diagnosis
HAVING total_diagnoses_count >= 1
ORDER BY total_diagnoses_count DESC;

-- Complex Query 5: Sovereign Patient Data Access & Audit Compliance Trail
-- Retrieves audit log of who accessed patient records with IP, action, and resource
SELECT 
    al.created_at AS audit_timestamp,
    al.patient_id,
    u_pat.full_name AS patient_name,
    al.actor_name,
    al.actor_role,
    al.action,
    al.resource_type,
    al.description,
    al.ip_address
FROM audit_logs al
JOIN patients p ON al.patient_id = p.id
JOIN users u_pat ON p.user_id = u_pat.id
WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY al.created_at DESC;

-- =====================================================================
-- END OF SQL SPECIFICATION CATALOG
-- =====================================================================
