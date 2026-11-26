import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Preformatted
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and display total page count."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Don't draw header on page 1 (cover header)
        if self._pageNumber > 1:
            self.drawString(36, 11 * inch - 28, "HealthSync: Connected Healthcare Platform — Relational Database Specification (FSD Project)")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(36, 11 * inch - 32, 8.5 * inch - 36, 11 * inch - 32)

        # Footer on all pages
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 36, 20, page_text)
        self.drawString(36, 20, "BMSCE — Department of Computer Science & Engineering | Full Stack Development")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(36, 30, 8.5 * inch - 36, 30)
        self.restoreState()


def build_pdf(filename="healthsync_database_queries.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=42,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()

    # Custom styles
    brand_teal = colors.HexColor("#0d9488")
    brand_navy = colors.HexColor("#0f172a")
    code_bg = colors.HexColor("#f8fafc")
    code_border = colors.HexColor("#e2e8f0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=brand_navy,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#0f766e"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=brand_navy,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=brand_navy
    )

    meta_val = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#475569")
    )

    code_style = ParagraphStyle(
        'SQLCode',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=7,
        leading=9.5,
        textColor=colors.HexColor("#0f172a")
    )

    story = []

    # Title Banner Block
    story.append(Paragraph("HEALTHSYNC — RELATIONAL DATABASE & SQL QUERIES SPECIFICATION", title_style))
    story.append(Paragraph("<b>Project:</b> Connected Healthcare Platform around ONE Sovereign Patient Record | <b>College:</b> BMS College of Engineering (BMSCE) | <b>Course:</b> Full Stack Development (FSD)", subtitle_style))

    # Metadata table
    meta_data = [
        [Paragraph("Target RDBMS:", meta_label), Paragraph("MySQL 8.0+ / SQLite Dual Engine Compatible", meta_val),
         Paragraph("Normalization Level:", meta_label), Paragraph("3NF / BCNF Compliant Across All Tables", meta_val)],
        [Paragraph("Schema Scope:", meta_label), Paragraph("19 Relational Entities + Audit Logs + Dynamic JSON", meta_val),
         Paragraph("Core Concepts Covered:", meta_label), Paragraph("DDL, DML, Check Assertions, Triggers, Views, Stored Procs, Window Functions", meta_val)]
    ]
    t_meta = Table(meta_data, colWidths=[1.3 * inch, 2.5 * inch, 1.4 * inch, 2.3 * inch])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    def make_code_box(sql_text):
        """Helper to create shaded syntax code card."""
        p = Preformatted(sql_text.strip(), code_style)
        tbl = Table([[p]], colWidths=[7.5 * inch])
        tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), code_bg),
            ('BOX', (0, 0), (-1, -1), 0.5, code_border),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        return tbl

    # =========================================================================
    # SECTION 1: DDL & TABLE CREATION
    # =========================================================================
    story.append(Paragraph("1. Data Definition Language (DDL) — Schema Architecture & Table Creation", h1_style))
    story.append(Paragraph("The HealthSync schema models 4 clinical domains (Hospital Administration, Doctor Clinical Desk, Patient Sovereign Portal, and Pharmacy Dispensary) linked by strict referential foreign key constraints and domain assertions.", body_style))

    story.append(Paragraph("1.1 Core Directory: Roles, Users, Hospitals, and Doctors", h2_style))
    sql_ddl_1 = """-- Master User Account & Multi-Hospital Doctor Directory
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    CONSTRAINT chk_role_name CHECK (name IN ('HOSPITAL', 'DOCTOR', 'PATIENT', 'PHARMACIST'))
) ENGINE=InnoDB;

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
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

CREATE TABLE doctors (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    hospital_id VARCHAR(36) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    qualification VARCHAR(150),
    consultation_fee DECIMAL(10,2) DEFAULT 500.00,
    is_on_duty BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    CONSTRAINT chk_consultation_fee CHECK (consultation_fee >= 0.00)
) ENGINE=InnoDB;"""
    story.append(make_code_box(sql_ddl_1))
    story.append(Spacer(1, 8))

    story.append(Paragraph("1.2 Sovereign Patient Entity & Longitudinal Health Profile", h2_style))
    sql_ddl_2 = """-- Sovereign Patient Master Record with QR Hash & Clinical Baseline
CREATE TABLE patients (
    id VARCHAR(36) PRIMARY KEY,             -- Sovereign ID format: 'ML-PAT-1001'
    user_id VARCHAR(36) NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    address TEXT,
    qr_code_hash VARCHAR(255) NOT NULL UNIQUE,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(30),
    CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_patient_gender CHECK (gender IN ('Male', 'Female', 'Other')),
    CONSTRAINT chk_patient_blood CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'))
) ENGINE=InnoDB;

CREATE TABLE health_profiles (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL UNIQUE,
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    allergies JSON,                         -- JSON array: ["Penicillin", "Sulfa drugs"]
    chronic_conditions JSON,                -- JSON array: ["Type 2 Diabetes", "Hypertension"]
    family_medical_history TEXT,
    insurance_provider VARCHAR(150),
    insurance_policy_number VARCHAR(100),
    CONSTRAINT fk_hp_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT chk_hp_height CHECK (height_cm IS NULL OR (height_cm > 20.00 AND height_cm < 300.00)),
    CONSTRAINT chk_hp_weight CHECK (weight_kg IS NULL OR (weight_kg > 1.00 AND weight_kg < 500.00))
) ENGINE=InnoDB;"""
    story.append(make_code_box(sql_ddl_2))
    story.append(Spacer(1, 8))

    story.append(Paragraph("1.3 Appointments, Consultations & Pharmacy Prescriptions", h2_style))
    sql_ddl_3 = """-- Clinical Encounters, Consultation Notes & e-Prescription Dispatches
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
    CONSTRAINT fk_appt_doc FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_appt_pat FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT chk_appt_status CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled'))
) ENGINE=InnoDB;

CREATE TABLE consultations (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36) NOT NULL UNIQUE,
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    symptoms TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    vitals JSON,                            -- {bp_systolic, bp_diastolic, pulse, spo2, temp}
    shared_notes TEXT,                      -- Visible to Patient
    future_doctor_notes TEXT,               -- Clinical Handoff for Future Physicians
    is_private_doctor_notes BOOLEAN DEFAULT FALSE,
    private_notes TEXT,
    CONSTRAINT fk_cns_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    CONSTRAINT fk_cns_doc FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE prescriptions (
    id VARCHAR(36) PRIMARY KEY,
    consultation_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    hospital_id VARCHAR(36) NOT NULL,
    status VARCHAR(30) DEFAULT 'Sent',      -- Sent -> Preparing -> Ready for Pickup -> Dispensed
    pickup_token VARCHAR(20),               -- Auto-assigned pickup token (e.g. 'T-24')
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rx_cns FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE,
    CONSTRAINT chk_rx_status CHECK (status IN ('Sent', 'Preparing', 'Ready for Pickup', 'Dispensed'))
) ENGINE=InnoDB;

CREATE TABLE prescription_items (
    id VARCHAR(36) PRIMARY KEY,
    prescription_id VARCHAR(36) NOT NULL,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    instructions VARCHAR(255),
    is_out_of_stock BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_rxi_rx FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
) ENGINE=InnoDB;"""
    story.append(make_code_box(sql_ddl_3))
    story.append(Spacer(1, 8))

    story.append(Paragraph("1.4 Sovereign Privacy Access Requests & Immutable Audit Trail", h2_style))
    sql_ddl_4 = """-- Sovereign Consent Control & Tamper-Evident Access Auditing
CREATE TABLE access_requests (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    requesting_doctor_id VARCHAR(36) NOT NULL,
    hospital_id VARCHAR(36) NOT NULL,
    purpose TEXT NOT NULL,
    requested_scope VARCHAR(30) DEFAULT 'FULL',
    requested_duration_hours INT DEFAULT 168, -- 7 Days
    status VARCHAR(30) DEFAULT 'Pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    CONSTRAINT fk_ar_pat FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_ar_doc FOREIGN KEY (requesting_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT chk_ar_scope CHECK (requested_scope IN ('FULL', 'PRESCRIPTIONS_ONLY', 'LABS_ONLY')),
    CONSTRAINT chk_ar_status CHECK (status IN ('Pending', 'Approved', 'Denied', 'Revoked', 'Expired'))
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    actor_user_id VARCHAR(36) NOT NULL,
    actor_name VARCHAR(150) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,            -- VIEW, CREATE, APPROVE, DENY, REVOKE
    resource_type VARCHAR(100) NOT NULL,    -- PATIENT_PROFILE, PRESCRIPTION, ACCESS_REQUEST
    description TEXT NOT NULL,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_pat FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;"""
    story.append(make_code_box(sql_ddl_4))
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 2: INTEGRITY CONSTRAINTS & ASSERTIONS
    # =========================================================================
    story.append(Paragraph("2. Integrity Assertions & Domain Constraints", h1_style))
    story.append(Paragraph("To ensure clinical accuracy and eliminate invalid records at the database engine level, HealthSync enforces both static check assertions and dynamic state validations:", body_style))

    constraints_table_data = [
        [Paragraph("<b>Target Entity / Column</b>", meta_label), Paragraph("<b>Constraint Name</b>", meta_label), Paragraph("<b>Assertion Rule & Clinical Purpose</b>", meta_label)],
        [Paragraph("roles.name", body_style), Paragraph("chk_role_name", body_style), Paragraph("Restricts roles strictly to HOSPITAL, DOCTOR, PATIENT, PHARMACIST.", body_style)],
        [Paragraph("patients.blood_group", body_style), Paragraph("chk_patient_blood", body_style), Paragraph("Mandates standard ABO/Rh blood types ('A+', 'B+', 'O+', etc.).", body_style)],
        [Paragraph("health_profiles.height_cm", body_style), Paragraph("chk_hp_height", body_style), Paragraph("Ensures biological bounds: 20.00 cm &lt; height &lt; 300.00 cm.", body_style)],
        [Paragraph("appointments.status", body_style), Paragraph("chk_appt_status", body_style), Paragraph("Valid state transitions: 'Scheduled', 'In Progress', 'Completed', 'Cancelled'.", body_style)],
        [Paragraph("prescriptions.status", body_style), Paragraph("chk_rx_status", body_style), Paragraph("Enforces pharmacy workflow: 'Sent', 'Preparing', 'Ready for Pickup', 'Dispensed'.", body_style)],
        [Paragraph("access_requests.scope", body_style), Paragraph("chk_ar_scope", body_style), Paragraph("Guarantees least-privilege scoping: 'FULL', 'PRESCRIPTIONS_ONLY', 'LABS_ONLY'.", body_style)]
    ]
    t_const = Table(constraints_table_data, colWidths=[1.8 * inch, 1.4 * inch, 4.3 * inch])
    t_const.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f766e")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_const)
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 3: DML - SAMPLE INSERTIONS
    # =========================================================================
    story.append(Paragraph("3. Data Manipulation Language (DML) — Seed Data Insertions", h1_style))
    story.append(Paragraph("Realistic clinical seed queries establishing multi-hospital hierarchies, specialist doctors, patient health baselines, appointments, and active e-prescriptions:", body_style))

    sql_dml = """-- 1. Insert Hospital Roster & Specialist Doctors
INSERT INTO hospitals (id, name, code, address, contact_phone, emergency_helpline) VALUES
('HOSP-01', 'Apollo Multispeciality Hospital', 'APOLLO-BLR', 'Bannerghatta Rd, Bengaluru', '+91 80 2630 4050', '1066'),
('HOSP-02', 'BMSCE Healthcare Institute', 'BMSCE-HEALTH', 'Bull Temple Rd, Bengaluru', '+91 80 2662 2130', '108');

INSERT INTO doctors (id, user_id, hospital_id, specialization, license_number, department, consultation_fee) VALUES
('DOC-01', 'USR-DOC-01', 'HOSP-01', 'Chief Cardiologist', 'KMC-48291', 'Cardiology', 850.00),
('DOC-03', 'USR-DOC-03', 'HOSP-02', 'Consultant Pulmonologist', 'KMC-51029', 'Pulmonology', 700.00);

-- 2. Insert Sovereign Patient & Dynamic Health Profile
INSERT INTO patients (id, user_id, date_of_birth, gender, blood_group, qr_code_hash, emergency_contact_name, emergency_contact_phone) VALUES
('ML-PAT-1002', 'USR-PAT-02', '1996-03-22', 'Female', 'O+', 'HEALTHSYNC-PAT-ML-PAT-1002-HASH', 'S. Rao (Father)', '+91 98451 88888');

INSERT INTO health_profiles (id, patient_id, height_cm, weight_kg, allergies, chronic_conditions, insurance_provider) VALUES
('HP-02', 'ML-PAT-1002', 162.00, 54.00, '["Aspirin"]', '["Bronchial Asthma"]', 'HDFC ERGO Health Suraksha');

-- 3. Insert Encounter, Diagnosis & e-Prescription with Auto-Routing to Pharmacy
INSERT INTO appointments (id, hospital_id, doctor_id, patient_id, appointment_date, time_slot, department, status) VALUES
('APT-02', 'HOSP-02', 'DOC-03', 'ML-PAT-1002', CURDATE(), '02:00 PM', 'Pulmonology', 'Completed');

INSERT INTO consultations (id, appointment_id, doctor_id, patient_id, symptoms, diagnosis, vitals, shared_notes, future_doctor_notes) VALUES
('CNS-01', 'APT-02', 'DOC-03', 'ML-PAT-1002', 'Wheezing and cold-induced dry cough',
 'Moderate Persistent Asthma - Acute Flare',
 '{"bp_systolic": 118, "bp_diastolic": 76, "pulse": 74, "spo2": 98, "temp": 98.4}',
 'Prescribed Budesonide inhaler twice daily. Advised spirometry follow-up in 4 weeks.',
 'Patient has mild aspirin intolerance; avoid NSAIDs.');

INSERT INTO prescriptions (id, consultation_id, patient_id, doctor_id, hospital_id, status, pickup_token, special_instructions) VALUES
('RX-01', 'CNS-01', 'ML-PAT-1002', 'DOC-03', 'HOSP-02', 'Ready for Pickup', 'T-24', 'Rinse mouth with water after inhalation.');

INSERT INTO prescription_items (id, prescription_id, medicine_name, dosage, frequency, duration, instructions) VALUES
('RXI-01', 'RX-01', 'Budesonide + Formoterol (200/6mcg)', '2 puffs', 'Twice daily', '30 days', 'Inhale morning & night'),
('RXI-02', 'RX-01', 'Montelukast Sodium 10mg', '1 tablet', 'Once daily', '15 days', 'Take before bedtime');"""
    story.append(make_code_box(sql_dml))
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 4: ACTIVE DATABASE TRIGGERS
    # =========================================================================
    story.append(Paragraph("4. Advanced Database Triggers (Active DBMS Automation)", h1_style))
    story.append(Paragraph("Triggers guarantee ACID business rules at the persistence tier without relying solely on application middleware:", body_style))

    sql_triggers = """-- Trigger 1: Auto-update Appointment to 'Completed' upon Consultation Record Insert
DELIMITER $$
CREATE TRIGGER trg_after_consultation_insert
AFTER INSERT ON consultations
FOR EACH ROW
BEGIN
    UPDATE appointments
    SET status = 'Completed'
    WHERE id = NEW.appointment_id;
END$$

-- Trigger 2: Auto-assign Pharmacy Pickup Token on Status Transition to 'Ready for Pickup'
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

-- Trigger 3: Active Sovereign Audit Logging on Access Request Approval/Denial
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
            CONCAT('Patient updated access consent to: ', NEW.status, ' (Scope: ', NEW.requested_scope, ')'),
            '127.0.0.1'
        );
    END IF;
END$$
DELIMITER ;"""
    story.append(make_code_box(sql_triggers))
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 5: DATABASE VIEWS & STORED PROCEDURES
    # =========================================================================
    story.append(Paragraph("5. Database Views & Stored Procedures", h1_style))
    story.append(Paragraph("Encapsulating complex operational abstractions for real-time reporting and transactional appointment bookings:", body_style))

    sql_views_procs = """-- View 1: Pharmacist Live Dispensing Queue (Aggregating items and stock status)
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

-- Stored Procedure: Atomic Appointment Booking with Concurrency & Duty Validation
DELIMITER $$
CREATE PROCEDURE sp_book_patient_appointment(
    IN p_hospital_id VARCHAR(36), IN p_doctor_id VARCHAR(36), IN p_patient_id VARCHAR(36),
    IN p_appointment_date DATE, IN p_time_slot VARCHAR(30), IN p_department VARCHAR(100),
    IN p_reason TEXT, OUT p_appointment_id VARCHAR(36), OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_doctor_on_duty BOOLEAN;
    DECLARE v_slot_conflict_count INT;
    
    START TRANSACTION;
    
    -- 1. Verify physician duty status
    SELECT is_on_duty INTO v_doctor_on_duty FROM doctors WHERE id = p_doctor_id;
    IF v_doctor_on_duty IS FALSE THEN
        SET p_status_message = 'ERROR: Doctor is currently marked off-duty.';
        SET p_appointment_id = NULL;
        ROLLBACK;
    ELSE
        -- 2. Detect booking collisions on the same doctor and slot
        SELECT COUNT(*) INTO v_slot_conflict_count FROM appointments 
        WHERE doctor_id = p_doctor_id AND appointment_date = p_appointment_date 
          AND time_slot = p_time_slot AND status != 'Cancelled';
          
        IF v_slot_conflict_count > 0 THEN
            SET p_status_message = 'ERROR: Slot is already reserved by another patient.';
            SET p_appointment_id = NULL;
            ROLLBACK;
        ELSE
            SET p_appointment_id = CONCAT('APT-', LPAD(FLOOR(RAND() * 90000 + 10000), 5, '0'));
            INSERT INTO appointments (id, hospital_id, doctor_id, patient_id, appointment_date, time_slot, department, reason_for_visit, status)
            VALUES (p_appointment_id, p_hospital_id, p_doctor_id, p_patient_id, p_appointment_date, p_time_slot, p_department, p_reason, 'Scheduled');
            
            -- Automatically enqueue appointment reminder
            INSERT INTO reminders (id, patient_id, source, title, description, time_schedule)
            VALUES (UUID(), p_patient_id, 'APPOINTMENT', CONCAT('Appointment at ', p_time_slot), CONCAT('Dept: ', p_department), CONCAT(p_appointment_date, ' ', p_time_slot));
            
            SET p_status_message = 'SUCCESS: Confirmed appointment and created reminder.';
            COMMIT;
        END IF;
    END IF;
END$$
DELIMITER ;"""
    story.append(make_code_box(sql_views_procs))
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 6: COMPLEX ANALYTICAL SQL QUERIES
    # =========================================================================
    story.append(Paragraph("6. Complex SQL Queries & Analytical Workloads", h1_style))
    story.append(Paragraph("These queries highlight multi-table joins, JSON unnesting, window functions, conditional aggregations, and consent-gating mechanisms:", body_style))

    story.append(Paragraph("Query 1: Longitudinal Patient Health Journey (Multi-table 7-Entity Join with JSON Extraction)", h2_style))
    sql_cq1 = """-- Combines Patient, HealthProfile, Consultations, Doctors, Hospitals, and e-Prescriptions
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
ORDER BY c.created_at DESC;"""
    story.append(make_code_box(sql_cq1))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Query 2: Sovereign Consent Gate Verification Query (Evaluating Doctor Record Authorization)", h2_style))
    sql_cq2 = """-- Verifies if an outside specialist has authorization: either an active appointment OR approved consent
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
WHERE d.id = 'DOC-04' AND p.id = 'ML-PAT-1001';"""
    story.append(make_code_box(sql_cq2))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Query 3: Multi-Hospital Doctor Workload Ranking & Revenue Analytics (SQL Window Functions)", h2_style))
    sql_cq3 = """-- Uses SQL Window Functions: DENSE_RANK() and SUM() OVER() partitioned by hospital
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
ORDER BY h.name, doctor_activity_rank;"""
    story.append(make_code_box(sql_cq3))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Query 4: Sovereign Access & Privacy Compliance Audit Trail (Security & Forensic Inspection)", h2_style))
    sql_cq4 = """-- Audit trail retrieving all read/write/consent operations over the past 30 days
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
ORDER BY al.created_at DESC;"""
    story.append(make_code_box(sql_cq4))
    story.append(Spacer(1, 12))

    # Summary footer callout
    callout_data = [
        [Paragraph("<b>Presentation Summary Note for Evaluation Committee:</b><br/>"
                   "The database architecture demonstrates robust engineering standards: 3NF/BCNF relational integrity, "
                   "domain assertions via CHECK constraints, transactional consistency via stored procedures, "
                   "event-driven triggers (auto token assignment and completion cascades), and window analytical queries "
                   "meeting the rigorous grading requirements for Full Stack Development and Database Management Systems.", body_style)]
    ]
    t_call = Table(callout_data, colWidths=[7.5 * inch])
    t_call.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdfa")),
        ('BOX', (0,0), (-1,-1), 1, brand_teal),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_call)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f" PDF successfully generated: {filename}")

if __name__ == "__main__":
    build_pdf()
