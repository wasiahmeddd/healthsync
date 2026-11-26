from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None

class PatientRegister(BaseModel):
    name: str
    email: Optional[str] = None
    phone: str
    dob: str
    gender: str
    blood_group: str
    address: Optional[str] = "Bangalore"
    height: Optional[float] = 172.0
    weight: Optional[float] = 70.0
    allergies: Optional[Any] = "None"
    chronic_conditions: Optional[Any] = "None"
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    insurance_provider: Optional[str] = "Star Health"
    insurance_policy_number: Optional[str] = None

class HealthProfileUpdate(BaseModel):
    height: Optional[float] = None
    weight: Optional[float] = None
    allergies: Optional[Any] = None
    chronic_conditions: Optional[Any] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    insurance_provider: Optional[str] = None
    family_medical_history: Optional[str] = None

class AppointmentBooking(BaseModel):
    patient_id: str
    doctor_id: str
    hospital_id: Optional[str] = None
    department: str
    date: str
    time_slot: str
    reason: Optional[str] = "Routine consultation"

class AppointmentStatusUpdate(BaseModel):
    status: str # Scheduled, In Progress, Completed, Cancelled

class MedicineItemCreate(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

class ConsultationCreate(BaseModel):
    appointment_id: Optional[str] = None
    patient_id: str
    doctor_id: Optional[str] = "DOC-01"
    diagnosis: str
    symptoms: Optional[str] = "Patient consultation"
    vitals: Optional[Dict[str, Any]] = None
    shared_notes: Optional[str] = None
    future_doctor_notes: Optional[str] = None
    is_private_doctor_notes: Optional[bool] = False
    private_notes: Optional[str] = None
    medicines: Optional[List[MedicineItemCreate]] = None
    special_instructions: Optional[str] = None
    scanned_image_url: Optional[str] = None
    ocr_raw_text: Optional[str] = None

class PrescriptionStatusUpdate(BaseModel):
    status: str # Sent, Preparing, Ready for Pickup, Dispensed
    pickup_token: Optional[str] = None

class MedicineStockToggle(BaseModel):
    prescription_id: str
    medicine_name: str
    is_out_of_stock: bool

class AccessRequestCreate(BaseModel):
    patient_id: str
    doctor_id: Optional[str] = "DOC-04"
    purpose: str
    requested_scope: Optional[str] = "FULL"
    requested_duration: Optional[str] = "7 Days"

class AccessDecision(BaseModel):
    request_id: str
    decision: str # "APPROVE" or "DENY"
    granted_scope: Optional[str] = "FULL"
    duration: Optional[str] = "7 Days"

class CustomRecordTypeCreate(BaseModel):
    name: str
    category: Optional[str] = "Vitals"
    color: Optional[str] = "#0d9488"
    icon: Optional[str] = "Activity"
    description: Optional[str] = None
    fields: Optional[List[Dict[str, Any]]] = []

class CustomRecordEntryCreate(BaseModel):
    record_type_id: str
    values: Dict[str, Any]
    notes: Optional[str] = None
    log_date: Optional[str] = None

class DocumentUpload(BaseModel):
    title: str
    category: str
    file_name: Optional[str] = None
    report_date: Optional[str] = None
    notes: Optional[str] = None
    file_url: Optional[str] = None

class ReminderCreate(BaseModel):
    title: str
    description: Optional[str] = None
    time_schedule: str
    category: Optional[str] = "MEDICINE"
    is_enabled: Optional[bool] = True

class OCRScanRequest(BaseModel):
    raw_text: Optional[str] = None
    image_url: Optional[str] = None
    sample_id: Optional[str] = None
