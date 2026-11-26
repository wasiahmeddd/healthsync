import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Text, Boolean, Date, DateTime,
    ForeignKey, Numeric, Enum, JSON
)
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(191), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    full_name = Column(String(150), nullable=False)
    phone = Column(String(30))
    avatar_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    role = relationship("Role", back_populates="users")
    doctor = relationship("Doctor", back_populates="user", uselist=False)
    patient = relationship("Patient", back_populates="user", uselist=False)
    pharmacist = relationship("Pharmacist", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    address = Column(Text, nullable=False)
    contact_phone = Column(String(30))
    contact_email = Column(String(191))
    emergency_helpline = Column(String(30))
    created_at = Column(DateTime, default=datetime.utcnow)

    doctors = relationship("Doctor", back_populates="hospital")
    pharmacists = relationship("Pharmacist", back_populates="hospital")
    appointments = relationship("Appointment", back_populates="hospital")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    hospital_id = Column(String(36), ForeignKey("hospitals.id"), nullable=False)
    specialization = Column(String(100), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    department = Column(String(100), nullable=False)
    qualification = Column(String(150))
    consultation_fee = Column(Numeric(10, 2), default=500.00)
    available_days = Column(String(100), default="Mon,Tue,Wed,Thu,Fri")
    is_on_duty = Column(Boolean, default=True)

    user = relationship("User", back_populates="doctor")
    hospital = relationship("Hospital", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")
    consultations = relationship("Consultation", back_populates="doctor")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True) # e.g. 'ML-PAT-1001'
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(20), nullable=False)
    blood_group = Column(String(10))
    address = Column(Text)
    qr_code_hash = Column(String(255), nullable=False)
    emergency_contact_name = Column(String(100))
    emergency_contact_phone = Column(String(30))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="patient")
    health_profile = relationship("HealthProfile", back_populates="patient", uselist=False)
    appointments = relationship("Appointment", back_populates="patient")
    consultations = relationship("Consultation", back_populates="patient")
    custom_record_types = relationship("CustomRecordType", back_populates="patient")
    documents = relationship("Document", back_populates="patient")
    access_requests = relationship("AccessRequest", back_populates="patient")
    audit_logs = relationship("AuditLog", back_populates="patient")
    reminders = relationship("Reminder", back_populates="patient")

class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), unique=True, nullable=False)
    height_cm = Column(Numeric(5, 2))
    weight_kg = Column(Numeric(5, 2))
    allergies = Column(JSON) # e.g. ["Penicillin", "Peanuts"]
    chronic_conditions = Column(JSON) # e.g. ["Type 2 Diabetes", "Hypertension"]
    current_medications = Column(JSON)
    family_medical_history = Column(Text)
    insurance_provider = Column(String(150))
    insurance_policy_number = Column(String(100))
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="health_profile")

class Pharmacist(Base):
    __tablename__ = "pharmacists"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    hospital_id = Column(String(36), ForeignKey("hospitals.id"), nullable=False)
    license_number = Column(String(100), nullable=False)
    counter_number = Column(String(20), default="Counter 1")

    user = relationship("User", back_populates="pharmacist")
    hospital = relationship("Hospital", back_populates="pharmacists")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    hospital_id = Column(String(36), ForeignKey("hospitals.id"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    appointment_date = Column(Date, nullable=False)
    time_slot = Column(String(30), nullable=False)
    department = Column(String(100), nullable=False)
    reason_for_visit = Column(Text)
    status = Column(String(30), default="Scheduled") # Scheduled, In Progress, Completed, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    hospital = relationship("Hospital", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    patient = relationship("Patient", back_populates="appointments")
    consultation = relationship("Consultation", back_populates="appointment", uselist=False)

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    appointment_id = Column(String(36), ForeignKey("appointments.id"), unique=True, nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    symptoms = Column(Text, nullable=False)
    diagnosis = Column(Text, nullable=False)
    vitals = Column(JSON) # {bp_systolic, bp_diastolic, pulse, spo2, temp, weight}
    shared_notes = Column(Text)
    future_doctor_notes = Column(Text)
    is_private_doctor_notes = Column(Boolean, default=False)
    private_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    appointment = relationship("Appointment", back_populates="consultation")
    doctor = relationship("Doctor", back_populates="consultations")
    patient = relationship("Patient", back_populates="consultations")
    prescription = relationship("Prescription", back_populates="consultation", uselist=False)

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    consultation_id = Column(String(36), ForeignKey("consultations.id"), nullable=False)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    hospital_id = Column(String(36), ForeignKey("hospitals.id"), nullable=False)
    status = Column(String(30), default="Sent") # Sent, Preparing, Ready for Pickup, Dispensed
    pickup_token = Column(String(20))
    scanned_image_url = Column(String(500))
    ocr_raw_text = Column(Text)
    special_instructions = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    consultation = relationship("Consultation", back_populates="prescription")
    items = relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan")

class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prescription_id = Column(String(36), ForeignKey("prescriptions.id"), nullable=False)
    medicine_name = Column(String(150), nullable=False)
    dosage = Column(String(50), nullable=False)
    frequency = Column(String(50), nullable=False)
    duration = Column(String(50), nullable=False)
    instructions = Column(String(255))
    is_out_of_stock = Column(Boolean, default=False)
    dispensed_quantity = Column(Integer, default=0)

    prescription = relationship("Prescription", back_populates="items")

class CustomRecordType(Base):
    __tablename__ = "custom_record_types"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    category = Column(String(50), default="Vitals")
    icon = Column(String(50), default="Activity")
    color = Column(String(20), default="#0d9488")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="custom_record_types")
    fields = relationship("CustomRecordField", back_populates="record_type", cascade="all, delete-orphan")
    entries = relationship("CustomRecordEntry", back_populates="record_type", cascade="all, delete-orphan")

class CustomRecordField(Base):
    __tablename__ = "custom_record_fields"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    record_type_id = Column(String(36), ForeignKey("custom_record_types.id"), nullable=False)
    field_name = Column(String(100), nullable=False)
    field_key = Column(String(50), nullable=False)
    field_type = Column(String(30), nullable=False) # number, text, date, file
    unit = Column(String(30))
    is_required = Column(Boolean, default=False)

    record_type = relationship("CustomRecordType", back_populates="fields")

class CustomRecordEntry(Base):
    __tablename__ = "custom_record_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    record_type_id = Column(String(36), ForeignKey("custom_record_types.id"), nullable=False)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    values_json = Column(JSON, nullable=False)
    notes = Column(Text)

    record_type = relationship("CustomRecordType", back_populates="entries")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    report_date = Column(Date, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)

    patient = relationship("Patient", back_populates="documents")

class AccessRequest(Base):
    __tablename__ = "access_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    requesting_doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    hospital_id = Column(String(36), ForeignKey("hospitals.id"), nullable=False)
    purpose = Column(Text, nullable=False)
    requested_scope = Column(String(30), default="FULL") # FULL, PRESCRIPTIONS_ONLY, LABS_ONLY
    requested_duration_hours = Column(Integer, default=168)
    status = Column(String(30), default="Pending") # Pending, Approved, Denied, Expired, Revoked
    requested_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)

    patient = relationship("Patient", back_populates="access_requests")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    actor_user_id = Column(String(36), nullable=False)
    actor_name = Column(String(150), nullable=False)
    actor_role = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)
    resource_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    ip_address = Column(String(45))
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="audit_logs")

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    source = Column(String(50), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text)
    time_schedule = Column(String(100), nullable=False)
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="reminders")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)
    link_url = Column(String(255))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
