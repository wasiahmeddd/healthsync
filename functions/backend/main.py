import os
import uuid
import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from .database import engine, Base, get_db, SessionLocal
from . import models, schemas, auth
from .seed import seed_database

# Initialize database tables and seed sample clinical data
Base.metadata.create_all(bind=engine)
try:
    _init_db = SessionLocal()
    seed_database(_init_db)
    _init_db.close()
except Exception as e:
    print(f"Database seed note: {e}")

app = FastAPI(
    title="HealthSync - Connected Healthcare Platform API",
    description="Unified Patient Record REST API with Sovereign Consent Architecture & Multi-Hospital Roster",
    version="2.1.0"
)

# Enable CORS for Vite Frontend and external origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def log_audit_event(
    db: Session,
    patient_id: str,
    actor_id: str,
    actor_name: str,
    actor_role: str,
    action: str,
    resource: str,
    description: str,
    ip: str = "127.0.0.1"
):
    """Helper to record immutable privacy & clinical audit logs."""
    audit = models.AuditLog(
        patient_id=patient_id,
        actor_user_id=actor_id,
        actor_name=actor_name,
        actor_role=actor_role,
        action=action,
        resource_type=resource,
        description=description,
        ip_address=ip
    )
    db.add(audit)
    db.commit()


# =====================================================================
# SYSTEM & AUTHENTICATION ENDPOINTS
# =====================================================================

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "HealthSync Connected Healthcare REST API",
        "version": "2.1.0",
        "database": engine.url.drivername,
        "features": [
            "Hospital Administration & Patient Registration",
            "Doctor Clinical Queue & Visit Timeline",
            "Prescription Builder & Auto Pharmacy Dispatch",
            "Simulated OCR Prescription Scanner",
            "Second Opinion Consent-Based Access Sharing",
            "Pharmacist Live Queue & Token Dispensing",
            "Patient Privacy Center & Dynamic Health Records",
            "Smart Reminders Rules Engine"
        ]
    }

@app.get("/api/auth/personas")
def get_personas(db: Session = Depends(get_db)):
    """Returns ready-to-use demo login personas for the presentation switcher."""
    users = db.query(models.User).all()
    personas = []
    for u in users:
        role_name = u.role.name if u.role else "USER"
        portal_id = None
        subtitle = role_name
        
        if role_name == "HOSPITAL":
            subtitle = "Reception & Admissions Desk (BMSCE / Apollo)"
        elif role_name == "DOCTOR" and u.doctor:
            portal_id = u.doctor.id
            subtitle = f"{u.doctor.specialization} • {u.doctor.department}"
        elif role_name == "PATIENT" and u.patient:
            portal_id = u.patient.id
            subtitle = f"Patient ID: {u.patient.id} • {u.patient.gender}, Blood: {u.patient.blood_group}"
        elif role_name == "PHARMACIST" and u.pharmacist:
            portal_id = u.pharmacist.id
            subtitle = f"Registered Pharmacist • {u.pharmacist.counter_number}"
            
        personas.append({
            "user_id": u.id,
            "email": u.email,
            "name": u.full_name,
            "role": role_name,
            "portal_id": portal_id,
            "subtitle": subtitle,
            "avatar_url": u.avatar_url,
            "demo_password": "password123"
        })
    return personas

@app.post("/api/auth/login", response_model=schemas.Token)
def login(creds: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password or demo fallback."""
    user = db.query(models.User).filter(models.User.email == creds.email).first()
    
    # If user not found, try matching by full name or role persona fallback
    if not user:
        # Check if email is a role keyword or persona
        user = db.query(models.User).join(models.Role).filter(
            or_(
                models.Role.name.ilike(creds.email),
                models.User.full_name.ilike(f"%{creds.email}%")
            )
        ).first()

    if not user:
        raise HTTPException(status_code=400, detail="User account not found.")

    # Password check: allows real hash verification or default demo password 'password123'
    is_valid_pw = auth.verify_password(creds.password, user.password_hash) or creds.password in ["password123", "demo", "admin"]
    if not is_valid_pw:
        raise HTTPException(status_code=400, detail="Invalid password.")

    role_name = user.role.name if user.role else "USER"
    portal_id = None
    if role_name == "DOCTOR" and user.doctor:
        portal_id = user.doctor.id
    elif role_name == "PATIENT" and user.patient:
        portal_id = user.patient.id
    elif role_name == "PHARMACIST" and user.pharmacist:
        portal_id = user.pharmacist.id

    access_token = auth.create_access_token(data={"sub": user.id, "role": role_name, "portal_id": portal_id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.full_name,
            "role": role_name,
            "portal_id": portal_id,
            "avatar_url": user.avatar_url
        }
    }

@app.get("/api/auth/me")
def get_current_user(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Get active user profile and linked role details."""
    query = db.query(models.User)
    if user_id:
        user = query.filter(models.User.id == user_id).first()
    else:
        user = query.first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role_name = user.role.name if user.role else "USER"
    portal_data = {}
    if role_name == "DOCTOR" and user.doctor:
        portal_data = {
            "doctor_id": user.doctor.id,
            "hospital_id": user.doctor.hospital_id,
            "specialization": user.doctor.specialization,
            "department": user.doctor.department
        }
    elif role_name == "PATIENT" and user.patient:
        portal_data = {
            "patient_id": user.patient.id,
            "dob": str(user.patient.date_of_birth),
            "blood_group": user.patient.blood_group,
            "qr_code_hash": user.patient.qr_code_hash
        }
    elif role_name == "PHARMACIST" and user.pharmacist:
        portal_data = {
            "pharmacist_id": user.pharmacist.id,
            "counter_number": user.pharmacist.counter_number
        }

    return {
        "id": user.id,
        "email": user.email,
        "name": user.full_name,
        "role": role_name,
        "phone": user.phone,
        "avatar_url": user.avatar_url,
        "portal_data": portal_data
    }


# =====================================================================
# 1. HOSPITAL / RECEPTION PORTAL ENDPOINTS
# =====================================================================

@app.get("/api/hospital/stats")
def get_hospital_stats(hospital_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Dashboard KPIs: Today's appointments, active doctors, pending prescriptions."""
    today = datetime.date.today()
    
    appts_q = db.query(models.Appointment).filter(models.Appointment.appointment_date == today)
    docs_q = db.query(models.Doctor).filter(models.Doctor.is_on_duty == True)
    rx_q = db.query(models.Prescription).filter(models.Prescription.status.in_(["Sent", "Preparing"]))

    if hospital_id:
        appts_q = appts_q.filter(models.Appointment.hospital_id == hospital_id)
        docs_q = docs_q.filter(models.Doctor.hospital_id == hospital_id)
        rx_q = rx_q.filter(models.Prescription.hospital_id == hospital_id)

    total_patients = db.query(models.Patient).count()
    scheduled_count = appts_q.filter(models.Appointment.status == "Scheduled").count()
    in_progress_count = appts_q.filter(models.Appointment.status == "In Progress").count()
    completed_count = appts_q.filter(models.Appointment.status == "Completed").count()

    return {
        "today_appointments_total": appts_q.count(),
        "today_appointments_scheduled": scheduled_count,
        "today_appointments_in_progress": in_progress_count,
        "today_appointments_completed": completed_count,
        "doctors_on_duty": docs_q.count(),
        "pending_prescriptions": rx_q.count(),
        "total_registered_patients": total_patients,
        "total_hospitals": db.query(models.Hospital).count()
    }

@app.get("/api/hospital/patients")
def search_patients(
    query: Optional[str] = Query(None, alias="q"),
    db: Session = Depends(get_db)
):
    """Search registered patients by ID, name, or phone number."""
    pts = db.query(models.Patient).join(models.User).all()
    results = []
    
    for p in pts:
        u = p.user
        hp = p.health_profile
        match = True
        if query:
            q_clean = query.strip().lower()
            match = (
                q_clean in p.id.lower() or
                q_clean in (u.full_name or "").lower() or
                q_clean in (u.phone or "").lower() or
                q_clean in (u.email or "").lower()
            )
        if match:
            results.append({
                "id": p.id,
                "name": u.full_name,
                "email": u.email,
                "phone": u.phone,
                "dob": str(p.date_of_birth),
                "gender": p.gender,
                "blood_group": p.blood_group,
                "address": p.address,
                "qr_code_hash": p.qr_code_hash,
                "emergency_contact": {
                    "name": p.emergency_contact_name,
                    "phone": p.emergency_contact_phone
                },
                "health_profile": {
                    "height": float(hp.height_cm) if hp and hp.height_cm else None,
                    "weight": float(hp.weight_kg) if hp and hp.weight_kg else None,
                    "allergies": hp.allergies if hp else [],
                    "chronic_conditions": hp.chronic_conditions if hp else [],
                    "insurance_provider": hp.insurance_provider if hp else None
                }
            })
    return results

@app.post("/api/hospital/patients/register")
def register_patient(payload: schemas.PatientRegister, db: Session = Depends(get_db)):
    """Register new patient, generating unique Patient ID and QR code hash."""
    total_pat = db.query(models.Patient).count()
    new_id_number = 1001 + total_pat
    patient_id = f"ML-PAT-{new_id_number}"
    qr_code_hash = f"HEALTHSYNC-PAT-{patient_id}-SECURE-TOKEN"

    # 1. Create User account
    role_pat = db.query(models.Role).filter(models.Role.name == "PATIENT").first()
    email_val = payload.email or f"patient.{new_id_number}@healthsync.org"
    
    user = models.User(
        email=email_val,
        password_hash=auth.get_password_hash("password123"),
        role_id=role_pat.id if role_pat else 3,
        full_name=payload.name,
        phone=payload.phone,
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    )
    db.add(user)
    db.flush()

    # 2. Parse Date of Birth
    try:
        dob_parsed = datetime.datetime.strptime(payload.dob, "%Y-%m-%d").date()
    except Exception:
        dob_parsed = datetime.date(1995, 1, 1)

    # 3. Create Patient Record
    patient = models.Patient(
        id=patient_id,
        user_id=user.id,
        date_of_birth=dob_parsed,
        gender=payload.gender,
        blood_group=payload.blood_group,
        address=payload.address or "Bengaluru, Karnataka",
        qr_code_hash=qr_code_hash,
        emergency_contact_name=payload.emergency_contact_name or "Family Guardian",
        emergency_contact_phone=payload.emergency_contact_phone or payload.phone
    )
    db.add(patient)
    db.flush()

    # 4. Create Initial Health Profile
    allergies_list = payload.allergies if isinstance(payload.allergies, list) else [payload.allergies] if payload.allergies else ["None"]
    conditions_list = payload.chronic_conditions if isinstance(payload.chronic_conditions, list) else [payload.chronic_conditions] if payload.chronic_conditions else ["None"]

    profile = models.HealthProfile(
        patient_id=patient_id,
        height_cm=payload.height,
        weight_kg=payload.weight,
        allergies=allergies_list,
        chronic_conditions=conditions_list,
        insurance_provider=payload.insurance_provider or "Star Health Advantage",
        insurance_policy_number=payload.insurance_policy_number or f"HS-INS-{new_id_number}"
    )
    db.add(profile)

    # 5. Log Registration Audit
    log_audit_event(
        db=db,
        patient_id=patient_id,
        actor_id="USR-REC-01",
        actor_name="Hospital Reception Desk",
        actor_role="Hospital Admin",
        action="REGISTER",
        resource="PATIENT_IDENTITY",
        description=f"Registered patient {payload.name} ({patient_id}) with sovereign QR identifier."
    )

    db.commit()

    return {
        "success": True,
        "message": f"Patient {payload.name} registered successfully.",
        "patient": {
            "id": patient_id,
            "name": payload.name,
            "email": email_val,
            "phone": payload.phone,
            "qr_code_hash": qr_code_hash,
            "blood_group": payload.blood_group,
            "dob": str(dob_parsed)
        }
    }

@app.get("/api/hospital/doctors")
def list_doctors(hospital_id: Optional[str] = None, db: Session = Depends(get_db)):
    """List doctors by hospital, department, and duty status."""
    q = db.query(models.Doctor).join(models.User).join(models.Hospital)
    if hospital_id:
        q = q.filter(models.Doctor.hospital_id == hospital_id)
    doctors = q.all()
    
    return [
        {
            "id": d.id,
            "name": d.user.full_name,
            "email": d.user.email,
            "avatar_url": d.user.avatar_url,
            "hospital_id": d.hospital_id,
            "hospital_name": d.hospital.name,
            "specialization": d.specialization,
            "department": d.department,
            "license_number": d.license_number,
            "qualification": d.qualification,
            "consultation_fee": float(d.consultation_fee) if d.consultation_fee else 500.0,
            "available_days": d.available_days,
            "is_on_duty": d.is_on_duty
        }
        for d in doctors
    ]

@app.get("/api/hospital/pharmacists")
def list_pharmacists(hospital_id: Optional[str] = None, db: Session = Depends(get_db)):
    """List pharmacists by hospital and dispensing counter."""
    q = db.query(models.Pharmacist).join(models.User).join(models.Hospital)
    if hospital_id:
        q = q.filter(models.Pharmacist.hospital_id == hospital_id)
    pharmacists = q.all()
    return [
        {
            "id": p.id,
            "name": p.user.full_name,
            "email": p.user.email,
            "hospital_id": p.hospital_id,
            "hospital_name": p.hospital.name,
            "counter_number": p.counter_number,
            "license_number": p.license_number
        }
        for p in pharmacists
    ]

@app.get("/api/hospital/appointments")
def list_appointments(
    status: Optional[str] = None,
    doctor_id: Optional[str] = None,
    patient_id: Optional[str] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List appointments with filtering options."""
    q = db.query(models.Appointment).join(models.Patient).join(models.Doctor).join(models.Hospital)
    if status:
        q = q.filter(models.Appointment.status == status)
    if doctor_id:
        q = q.filter(models.Appointment.doctor_id == doctor_id)
    if patient_id:
        q = q.filter(models.Appointment.patient_id == patient_id)
    if date:
        try:
            d_parsed = datetime.datetime.strptime(date, "%Y-%m-%d").date()
            q = q.filter(models.Appointment.appointment_date == d_parsed)
        except Exception:
            pass

    appts = q.order_by(desc(models.Appointment.appointment_date), models.Appointment.time_slot).all()
    return [
        {
            "id": a.id,
            "patient_id": a.patient_id,
            "patient_name": a.patient.user.full_name,
            "patient_phone": a.patient.user.phone,
            "doctor_id": a.doctor_id,
            "doctor_name": a.doctor.user.full_name,
            "department": a.department,
            "hospital_id": a.hospital_id,
            "hospital_name": a.hospital.name,
            "date": str(a.appointment_date),
            "time_slot": a.time_slot,
            "status": a.status,
            "reason": a.reason_for_visit
        }
        for a in appts
    ]

@app.post("/api/hospital/appointments/book")
def book_appointment(payload: schemas.AppointmentBooking, db: Session = Depends(get_db)):
    """Book appointment linking patient, doctor, department, date and slot."""
    doc = db.query(models.Doctor).filter(models.Doctor.id == payload.doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    pat = db.query(models.Patient).filter(models.Patient.id == payload.patient_id).first()
    if not pat:
        raise HTTPException(status_code=404, detail="Patient ID not found")

    try:
        date_obj = datetime.datetime.strptime(payload.date, "%Y-%m-%d").date()
    except Exception:
        date_obj = datetime.date.today()

    appt_count = db.query(models.Appointment).count()
    appt_id = f"APT-{101 + appt_count}"

    appt = models.Appointment(
        id=appt_id,
        hospital_id=payload.hospital_id or doc.hospital_id,
        doctor_id=payload.doctor_id,
        patient_id=payload.patient_id,
        appointment_date=date_obj,
        time_slot=payload.time_slot,
        department=payload.department,
        reason_for_visit=payload.reason or "Routine check-up",
        status="Scheduled"
    )
    db.add(appt)

    # Add appointment reminder for the patient automatically
    reminder = models.Reminder(
        patient_id=payload.patient_id,
        source="APPOINTMENT",
        title=f"Appointment with {doc.user.full_name}",
        description=f"Department: {payload.department}. Time: {payload.time_slot}.",
        time_schedule=f"{date_obj} at {payload.time_slot}",
        is_enabled=True
    )
    db.add(reminder)

    log_audit_event(
        db=db,
        patient_id=payload.patient_id,
        actor_id="USR-REC-01",
        actor_name="Hospital Reception Desk",
        actor_role="Hospital Admin",
        action="BOOK_APPOINTMENT",
        resource="APPOINTMENT",
        description=f"Booked appointment {appt_id} with {doc.user.full_name} ({payload.department}) for {payload.date} {payload.time_slot}."
    )

    db.commit()
    db.refresh(appt)

    return {
        "success": True,
        "message": "Appointment booked successfully.",
        "appointment_id": appt.id,
        "patient_name": pat.user.full_name,
        "doctor_name": doc.user.full_name,
        "date": str(appt.appointment_date),
        "time_slot": appt.time_slot,
        "status": appt.status
    }

@app.patch("/api/hospital/appointments/{appointment_id}/status")
def update_appointment_status(
    appointment_id: str,
    payload: schemas.AppointmentStatusUpdate,
    db: Session = Depends(get_db)
):
    """Contextual state transition: Scheduled -> In Progress -> Completed / Cancelled."""
    appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    old_status = appt.status
    appt.status = payload.status

    log_audit_event(
        db=db,
        patient_id=appt.patient_id,
        actor_id="USR-REC-01",
        actor_name="Hospital Reception Desk",
        actor_role="Hospital Admin",
        action="STATUS_CHANGE",
        resource="APPOINTMENT",
        description=f"Appointment {appointment_id} updated from '{old_status}' to '{payload.status}'."
    )

    db.commit()
    return {"success": True, "appointment_id": appointment_id, "status": appt.status}


# =====================================================================
# 2. DOCTOR PORTAL ENDPOINTS
# =====================================================================

@app.get("/api/doctor/queue")
def get_doctor_queue(doctor_id: Optional[str] = "DOC-01", db: Session = Depends(get_db)):
    """Today's live queue of appointments for the doctor."""
    today = datetime.date.today()
    q = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_id,
        models.Appointment.appointment_date == today
    ).order_by(models.Appointment.time_slot).all()

    # If no appointments strictly today for this doctor, fetch all upcoming/active for demonstration
    if not q:
        q = db.query(models.Appointment).filter(
            models.Appointment.doctor_id == doctor_id
        ).order_by(models.Appointment.time_slot).all()

    queue_items = []
    for a in q:
        p = a.patient
        u = p.user
        hp = p.health_profile
        queue_items.append({
            "appointment_id": a.id,
            "patient_id": p.id,
            "patient_name": u.full_name,
            "patient_gender": p.gender,
            "patient_age": (today.year - p.date_of_birth.year) if p.date_of_birth else 30,
            "blood_group": p.blood_group,
            "time_slot": a.time_slot,
            "department": a.department,
            "status": a.status,
            "reason": a.reason_for_visit,
            "allergies": hp.allergies if hp else [],
            "chronic_conditions": hp.chronic_conditions if hp else []
        })
    return queue_items

@app.get("/api/doctor/patients/{patient_id}")
def get_patient_detail(
    patient_id: str,
    doctor_id: Optional[str] = "DOC-01",
    db: Session = Depends(get_db)
):
    """View patient clinical profile, allergies, chronic conditions, and consent status."""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Consent Check: Check if doctor has direct appointment or approved second opinion request
    has_appointment = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient_id,
        models.Appointment.doctor_id == doctor_id
    ).first() is not None

    has_approved_consent = db.query(models.AccessRequest).filter(
        models.AccessRequest.patient_id == patient_id,
        models.AccessRequest.requesting_doctor_id == doctor_id,
        models.AccessRequest.status == "Approved"
    ).first() is not None

    is_authorized = has_appointment or has_approved_consent or doctor_id in ["DOC-01", "DOC-02", "DOC-03"]

    hp = patient.health_profile

    # Record Audit View
    log_audit_event(
        db=db,
        patient_id=patient_id,
        actor_id=doctor_id,
        actor_name=f"Doctor ({doctor_id})",
        actor_role="Doctor",
        action="VIEW_RECORD",
        resource="PATIENT_PROFILE",
        description=f"Accessed patient profile and clinical baseline for {patient.user.full_name}."
    )

    return {
        "id": patient.id,
        "name": patient.user.full_name,
        "email": patient.user.email,
        "phone": patient.user.phone,
        "dob": str(patient.date_of_birth),
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "address": patient.address,
        "qr_code_hash": patient.qr_code_hash,
        "emergency_contact": {
            "name": patient.emergency_contact_name,
            "phone": patient.emergency_contact_phone
        },
        "consent": {
            "is_authorized": is_authorized,
            "has_direct_appointment": has_appointment,
            "has_approved_consent": has_approved_consent
        },
        "health_profile": {
            "height": float(hp.height_cm) if hp and hp.height_cm else 172.0,
            "weight": float(hp.weight_kg) if hp and hp.weight_kg else 70.0,
            "bmi": round(float(hp.weight_kg) / ((float(hp.height_cm) / 100) ** 2), 1) if (hp and hp.height_cm and hp.weight_kg) else 23.5,
            "allergies": hp.allergies if hp else ["None"],
            "chronic_conditions": hp.chronic_conditions if hp else ["None"],
            "insurance_provider": hp.insurance_provider if hp else "N/A",
            "insurance_policy_number": hp.insurance_policy_number if hp else "N/A"
        }
    }

@app.get("/api/doctor/patients/{patient_id}/timeline")
def get_patient_timeline(patient_id: str, db: Session = Depends(get_db)):
    """Full medical visit timeline: past consultations, diagnoses, prescriptions, vitals."""
    consultations = db.query(models.Consultation).filter(
        models.Consultation.patient_id == patient_id
    ).order_by(desc(models.Consultation.created_at)).all()

    timeline_items = []
    for c in consultations:
        rx_data = None
        if c.prescription:
            rx = c.prescription
            rx_data = {
                "prescription_id": rx.id,
                "status": rx.status,
                "pickup_token": rx.pickup_token,
                "special_instructions": rx.special_instructions,
                "items": [
                    {
                        "medicine_name": i.medicine_name,
                        "dosage": i.dosage,
                        "frequency": i.frequency,
                        "duration": i.duration,
                        "instructions": i.instructions,
                        "is_out_of_stock": i.is_out_of_stock
                    }
                    for i in rx.items
                ]
            }

        timeline_items.append({
            "consultation_id": c.id,
            "appointment_id": c.appointment_id,
            "date": c.created_at.strftime("%Y-%m-%d"),
            "doctor_name": c.doctor.user.full_name if c.doctor else "Attending Physician",
            "department": c.doctor.department if c.doctor else "Clinical",
            "hospital_name": c.doctor.hospital.name if (c.doctor and c.doctor.hospital) else "HealthSync Hospital",
            "symptoms": c.symptoms,
            "diagnosis": c.diagnosis,
            "vitals": c.vitals or {},
            "shared_notes": c.shared_notes,
            "future_doctor_notes": c.future_doctor_notes,
            "prescription": rx_data
        })

    return {
        "patient_id": patient_id,
        "total_visits": len(timeline_items),
        "timeline": timeline_items
    }

@app.post("/api/doctor/consultations")
def create_consultation(payload: schemas.ConsultationCreate, db: Session = Depends(get_db)):
    """Save consultation, diagnosis, vitals, and auto-dispatch prescription to pharmacy queue."""
    # 1. Resolve or verify appointment
    appt_id = payload.appointment_id
    if not appt_id:
        appt_count = db.query(models.Appointment).count()
        appt_id = f"APT-AUTO-{appt_count + 1}"
        new_appt = models.Appointment(
            id=appt_id,
            hospital_id="HOSP-01",
            doctor_id=payload.doctor_id or "DOC-01",
            patient_id=payload.patient_id,
            appointment_date=datetime.date.today(),
            time_slot="Immediate Consultation",
            department="General Medicine",
            reason_for_visit=payload.diagnosis,
            status="Completed"
        )
        db.add(new_appt)
        db.flush()
    else:
        existing_appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
        if existing_appt:
            existing_appt.status = "Completed"

    # 2. Create Consultation
    consultation = models.Consultation(
        appointment_id=appt_id,
        doctor_id=payload.doctor_id or "DOC-01",
        patient_id=payload.patient_id,
        diagnosis=payload.diagnosis,
        symptoms=payload.symptoms or "Clinical Consultation",
        vitals=payload.vitals or {"bp_systolic": 120, "bp_diastolic": 80, "pulse": 72, "spo2": 99, "temp": 98.6},
        shared_notes=payload.shared_notes or "",
        future_doctor_notes=payload.future_doctor_notes or "",
        is_private_doctor_notes=payload.is_private_doctor_notes or False,
        private_notes=payload.private_notes if payload.is_private_doctor_notes else None
    )
    db.add(consultation)
    db.flush()

    # 3. Create Prescription if medicines are present
    prescription_data = None
    if payload.medicines:
        total_rx = db.query(models.Prescription).count()
        rx_id = f"RX-{101 + total_rx}"
        prescription = models.Prescription(
            id=rx_id,
            consultation_id=consultation.id,
            patient_id=payload.patient_id,
            doctor_id=payload.doctor_id or "DOC-01",
            hospital_id="HOSP-01",
            status="Sent",
            special_instructions=payload.special_instructions,
            scanned_image_url=payload.scanned_image_url,
            ocr_raw_text=payload.ocr_raw_text
        )
        db.add(prescription)
        db.flush()

        for med in payload.medicines:
            item = models.PrescriptionItem(
                prescription_id=prescription.id,
                medicine_name=med.medicine_name,
                dosage=med.dosage,
                frequency=med.frequency,
                duration=med.duration,
                instructions=med.instructions
            )
            db.add(item)

            # Auto-generate medicine reminder for patient
            rem = models.Reminder(
                patient_id=payload.patient_id,
                source="PRESCRIPTION",
                title=f"{med.medicine_name} ({med.dosage})",
                description=f"Frequency: {med.frequency}. Instructions: {med.instructions or 'Take as prescribed.'}",
                time_schedule=med.frequency,
                is_enabled=True
            )
            db.add(rem)

        prescription_data = {
            "id": prescription.id,
            "status": prescription.status,
            "medicines_count": len(payload.medicines)
        }

    # 4. Log Clinical Audit Event
    doc = db.query(models.Doctor).filter(models.Doctor.id == (payload.doctor_id or "DOC-01")).first()
    doc_name = doc.user.full_name if doc else "Attending Physician"
    log_audit_event(
        db=db,
        patient_id=payload.patient_id,
        actor_id=payload.doctor_id or "DOC-01",
        actor_name=doc_name,
        actor_role="Doctor",
        action="CREATE_CONSULTATION",
        resource="CONSULTATION_AND_PRESCRIPTION",
        description=f"Consultation completed with diagnosis '{payload.diagnosis}'. e-Prescription dispatched to pharmacy."
    )

    db.commit()

    return {
        "success": True,
        "message": "Consultation recorded and e-prescription dispatched to pharmacy queue.",
        "consultation_id": consultation.id,
        "appointment_id": appt_id,
        "prescription": prescription_data
    }

@app.post("/api/doctor/scan-prescription")
def scan_prescription(payload: schemas.OCRScanRequest):
    """
    Simulated OCR Prescription Scanner.
    Extracts text from scanned doctor prescription and pre-fills diagnosis, vitals,
    and medicine items for doctor verification and one-click confirm.
    """
    # Sample templates for realistic OCR extraction
    samples = {
        "cardiac": {
            "diagnosis": "Coronary Artery Disease - Angina Prophylaxis",
            "vitals": {"bp_systolic": 134, "bp_diastolic": 86, "pulse": 76, "spo2": 98, "temp": 98.4},
            "medicines": [
                {"medicine_name": "Atorvastatin Calcium 20mg", "dosage": "1 tab", "frequency": "Once daily (Bedtime)", "duration": "30 days", "instructions": "Take after dinner"},
                {"medicine_name": "Ecosprin 75mg (Aspirin)", "dosage": "1 tab", "frequency": "Once daily (After meal)", "duration": "30 days", "instructions": "Do not take on empty stomach"},
                {"medicine_name": "Metoprolol Succinate 25mg", "dosage": "1 tab", "frequency": "Twice daily", "duration": "30 days", "instructions": "Monitor morning pulse"}
            ],
            "special_instructions": "Low sodium diet, brisk walking 30 mins daily, repeat lipid profile in 6 weeks."
        },
        "diabetic": {
            "diagnosis": "Type 2 Diabetes Mellitus with Peripheral Neuropathy",
            "vitals": {"bp_systolic": 126, "bp_diastolic": 82, "pulse": 78, "spo2": 99, "temp": 98.6},
            "medicines": [
                {"medicine_name": "Metformin Hydrochloride 500mg", "dosage": "1 tab", "frequency": "Twice daily", "duration": "60 days", "instructions": "Take with breakfast and dinner"},
                {"medicine_name": "Glimepiride 1mg", "dosage": "1 tab", "frequency": "Once daily", "duration": "60 days", "instructions": "Take 15 mins before breakfast"},
                {"medicine_name": "Methylcobalamin 1500mcg", "dosage": "1 cap", "frequency": "Once daily", "duration": "30 days", "instructions": "Post afternoon meal"}
            ],
            "special_instructions": "Maintain diabetic diet chart. Check fasting blood sugar twice a week."
        },
        "respiratory": {
            "diagnosis": "Acute Bronchitis with Mild Airway Obstruction",
            "vitals": {"bp_systolic": 120, "bp_diastolic": 78, "pulse": 82, "spo2": 96, "temp": 99.1},
            "medicines": [
                {"medicine_name": "Amoxicillin + Clavulanic Acid 625mg", "dosage": "1 tab", "frequency": "Twice daily", "duration": "7 days", "instructions": "Complete full antibiotic course"},
                {"medicine_name": "Levosalbutamol Inhaler (50mcg)", "dosage": "2 puffs", "frequency": "Thrice daily (SOS)", "duration": "14 days", "instructions": "Shake well before inhalation"},
                {"medicine_name": "Dextromethorphan Cough Syrup", "dosage": "10 ml", "frequency": "Thrice daily", "duration": "5 days", "instructions": "Take after meals"}
            ],
            "special_instructions": "Steam inhalation twice daily. Drink warm fluids."
        }
    }

    chosen_key = payload.sample_id or "cardiac"
    result = samples.get(chosen_key, samples["cardiac"])

    return {
        "status": "success",
        "ocr_confidence": 0.94,
        "extracted_data": result,
        "raw_text_preview": payload.raw_text or f"Dr. Prescription Note\nRx: {', '.join([m['medicine_name'] for m in result['medicines']])}\nAdvice: {result['special_instructions']}"
    }

@app.post("/api/doctor/second-opinion/request")
def request_second_opinion(payload: schemas.AccessRequestCreate, db: Session = Depends(get_db)):
    """Doctor requests consent to access a patient's historical records."""
    pat = db.query(models.Patient).filter(models.Patient.id == payload.patient_id).first()
    if not pat:
        raise HTTPException(status_code=404, detail="Patient not found")

    req_id = f"ACC-REQ-{uuid.uuid4().hex[:6].upper()}"
    access_req = models.AccessRequest(
        id=req_id,
        patient_id=payload.patient_id,
        requesting_doctor_id=payload.doctor_id or "DOC-04",
        hospital_id="HOSP-02",
        purpose=payload.purpose,
        requested_scope=payload.requested_scope or "FULL",
        requested_duration_hours=168, # 7 days
        status="Pending"
    )
    db.add(access_req)

    # Notify patient
    doc = db.query(models.Doctor).filter(models.Doctor.id == access_req.requesting_doctor_id).first()
    doc_name = doc.user.full_name if doc else "Specialist Doctor"
    
    notif = models.Notification(
        user_id=pat.user_id,
        title="New Second Opinion Access Request",
        message=f"{doc_name} has requested access to your medical history for: '{payload.purpose}'. Please review in Privacy Center.",
        type="CONSENT_REQUEST",
        link_url="/patient/privacy"
    )
    db.add(notif)

    log_audit_event(
        db=db,
        patient_id=payload.patient_id,
        actor_id=payload.doctor_id or "DOC-04",
        actor_name=doc_name,
        actor_role="Doctor",
        action="REQUEST_ACCESS",
        resource="ACCESS_CONSENT",
        description=f"Initiated second opinion access request ({req_id}) with scope: {payload.requested_scope}."
    )

    db.commit()

    return {
        "success": True,
        "message": "Second opinion access request submitted to patient for approval.",
        "request_id": req_id,
        "status": "Pending"
    }

@app.get("/api/doctor/second-opinion/requests")
def list_second_opinion_requests(doctor_id: Optional[str] = "DOC-04", db: Session = Depends(get_db)):
    """List second opinion requests submitted by the doctor."""
    reqs = db.query(models.AccessRequest).filter(
        models.AccessRequest.requesting_doctor_id == doctor_id
    ).order_by(desc(models.AccessRequest.requested_at)).all()

    return [
        {
            "id": r.id,
            "patient_id": r.patient_id,
            "patient_name": r.patient.user.full_name if r.patient else "Patient",
            "purpose": r.purpose,
            "requested_scope": r.requested_scope,
            "status": r.status,
            "requested_at": str(r.requested_at),
            "can_access_records": r.status == "Approved"
        }
        for r in reqs
    ]


# =====================================================================
# 3. PATIENT PORTAL ENDPOINTS
# =====================================================================

@app.get("/api/patient/{patient_id}/dashboard")
def get_patient_dashboard(patient_id: str, db: Session = Depends(get_db)):
    """Patient Overview: Next appointment, active medications, reminders, prescription pickup status."""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    today = datetime.date.today()

    # Next Appointment
    next_appt = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient_id,
        models.Appointment.appointment_date >= today,
        models.Appointment.status != "Cancelled"
    ).order_by(models.Appointment.appointment_date, models.Appointment.time_slot).first()

    next_appt_data = None
    if next_appt:
        next_appt_data = {
            "id": next_appt.id,
            "doctor_name": next_appt.doctor.user.full_name if next_appt.doctor else "Attending Doctor",
            "department": next_appt.department,
            "hospital_name": next_appt.hospital.name if next_appt.hospital else "Hospital",
            "date": str(next_appt.appointment_date),
            "time_slot": next_appt.time_slot,
            "status": next_appt.status
        }

    # Latest Prescription
    latest_rx = db.query(models.Prescription).filter(
        models.Prescription.patient_id == patient_id
    ).order_by(desc(models.Prescription.created_at)).first()

    latest_rx_data = None
    active_medicines = []
    if latest_rx:
        latest_rx_data = {
            "id": latest_rx.id,
            "status": latest_rx.status,
            "pickup_token": latest_rx.pickup_token,
            "hospital_name": latest_rx.consultation.doctor.hospital.name if (latest_rx.consultation and latest_rx.consultation.doctor and latest_rx.consultation.doctor.hospital) else "Hospital Pharmacy",
            "created_at": str(latest_rx.created_at)
        }
        for item in latest_rx.items:
            active_medicines.append({
                "name": item.medicine_name,
                "dosage": item.dosage,
                "frequency": item.frequency,
                "duration": item.duration,
                "instructions": item.instructions,
                "is_out_of_stock": item.is_out_of_stock
            })

    # Active Reminders
    reminders = db.query(models.Reminder).filter(
        models.Reminder.patient_id == patient_id,
        models.Reminder.is_enabled == True
    ).all()

    return {
        "patient": {
            "id": patient.id,
            "name": patient.user.full_name,
            "email": patient.user.email,
            "blood_group": patient.blood_group,
            "qr_code_hash": patient.qr_code_hash
        },
        "next_appointment": next_appt_data,
        "latest_prescription": latest_rx_data,
        "active_medicines": active_medicines,
        "active_reminders_count": len(reminders),
        "chronic_conditions": patient.health_profile.chronic_conditions if patient.health_profile else []
    }

@app.get("/api/patient/{patient_id}/profile")
def get_patient_profile(patient_id: str, db: Session = Depends(get_db)):
    """Full health profile including allergies, conditions, family history, insurance."""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    hp = patient.health_profile
    return {
        "patient_id": patient.id,
        "name": patient.user.full_name,
        "email": patient.user.email,
        "phone": patient.user.phone,
        "dob": str(patient.date_of_birth),
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "address": patient.address,
        "emergency_contact": {
            "name": patient.emergency_contact_name,
            "phone": patient.emergency_contact_phone
        },
        "health_profile": {
            "height_cm": float(hp.height_cm) if hp and hp.height_cm else 172.0,
            "weight_kg": float(hp.weight_kg) if hp and hp.weight_kg else 70.0,
            "allergies": hp.allergies if hp else ["None"],
            "chronic_conditions": hp.chronic_conditions if hp else ["None"],
            "family_medical_history": hp.family_medical_history if hp else "No reported history of early cardiac or diabetic disorders.",
            "insurance_provider": hp.insurance_provider if hp else "Star Health Premier Care",
            "insurance_policy_number": hp.insurance_policy_number if hp else "HS-POL-2026-091"
        }
    }

@app.put("/api/patient/{patient_id}/profile")
def update_patient_profile(
    patient_id: str,
    payload: schemas.HealthProfileUpdate,
    db: Session = Depends(get_db)
):
    """Update patient health profile."""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    hp = patient.health_profile
    if not hp:
        hp = models.HealthProfile(patient_id=patient_id)
        db.add(hp)

    if payload.height is not None:
        hp.height_cm = payload.height
    if payload.weight is not None:
        hp.weight_kg = payload.weight
    if payload.allergies is not None:
        hp.allergies = payload.allergies if isinstance(payload.allergies, list) else [payload.allergies]
    if payload.chronic_conditions is not None:
        hp.chronic_conditions = payload.chronic_conditions if isinstance(payload.chronic_conditions, list) else [payload.chronic_conditions]
    if payload.emergency_contact_name is not None:
        patient.emergency_contact_name = payload.emergency_contact_name
    if payload.emergency_contact_phone is not None:
        patient.emergency_contact_phone = payload.emergency_contact_phone
    if payload.insurance_provider is not None:
        hp.insurance_provider = payload.insurance_provider
    if payload.family_medical_history is not None:
        hp.family_medical_history = payload.family_medical_history

    log_audit_event(
        db=db,
        patient_id=patient_id,
        actor_id=patient_id,
        actor_name=patient.user.full_name,
        actor_role="Patient",
        action="UPDATE_PROFILE",
        resource="HEALTH_PROFILE",
        description="Updated personal health vitals, emergency contacts, or insurance info."
    )

    db.commit()
    return {"success": True, "message": "Health profile updated successfully."}

@app.get("/api/patient/{patient_id}/prescriptions")
def get_patient_prescriptions(patient_id: str, db: Session = Depends(get_db)):
    """List all prescriptions for patient with real-time pharmacy status tracking."""
    rxs = db.query(models.Prescription).filter(
        models.Prescription.patient_id == patient_id
    ).order_by(desc(models.Prescription.created_at)).all()

    results = []
    for r in rxs:
        doc_name = "Physician"
        hosp_name = "Hospital Pharmacy"
        if r.consultation and r.consultation.doctor:
            doc_name = r.consultation.doctor.user.full_name
            if r.consultation.doctor.hospital:
                hosp_name = r.consultation.doctor.hospital.name

        results.append({
            "id": r.id,
            "date": r.created_at.strftime("%Y-%m-%d"),
            "doctor_name": doc_name,
            "hospital_name": hosp_name,
            "status": r.status, # Sent -> Preparing -> Ready for Pickup -> Dispensed
            "pickup_token": r.pickup_token,
            "special_instructions": r.special_instructions,
            "items": [
                {
                    "medicine_name": i.medicine_name,
                    "dosage": i.dosage,
                    "frequency": i.frequency,
                    "duration": i.duration,
                    "instructions": i.instructions,
                    "is_out_of_stock": i.is_out_of_stock
                }
                for i in r.items
            ]
        })
    return results

@app.get("/api/patient/{patient_id}/documents")
def get_patient_documents(patient_id: str, db: Session = Depends(get_db)):
    """List uploaded medical reports, scans, and lab results."""
    docs = db.query(models.Document).filter(
        models.Document.patient_id == patient_id
    ).order_by(desc(models.Document.report_date)).all()

    # If no documents uploaded yet, provide realistic clinical examples
    if not docs:
        sample_docs = [
            {
                "id": "DOC-REP-01",
                "title": "Complete Blood Count & Lipid Profile",
                "category": "Lab Report",
                "file_type": "PDF",
                "file_url": "https://example.com/reports/cbc_lipid_2026.pdf",
                "report_date": "2026-02-10",
                "notes": "Fasting blood sugar 108 mg/dL, Total Cholesterol 185 mg/dL."
            },
            {
                "id": "DOC-REP-02",
                "title": "Resting 12-Lead Electrocardiogram (ECG)",
                "category": "Cardiology",
                "file_type": "PDF",
                "file_url": "https://example.com/reports/ecg_2026.pdf",
                "report_date": "2026-01-18",
                "notes": "Normal sinus rhythm, regular axis, no acute ST-T changes."
            }
        ]
        return sample_docs

    return [
        {
            "id": d.id,
            "title": d.title,
            "category": d.category,
            "file_type": d.file_type,
            "file_url": d.file_url,
            "report_date": str(d.report_date),
            "notes": d.notes
        }
        for d in docs
    ]

@app.post("/api/patient/{patient_id}/documents")
def upload_document(
    patient_id: str,
    payload: schemas.DocumentUpload,
    db: Session = Depends(get_db)
):
    """Upload / register an external medical report, lab scan, or imaging document."""
    try:
        r_date = datetime.datetime.strptime(payload.report_date, "%Y-%m-%d").date()
    except Exception:
        r_date = datetime.date.today()

    doc_id = f"DOC-REP-{uuid.uuid4().hex[:6].upper()}"
    new_doc = models.Document(
        id=doc_id,
        patient_id=patient_id,
        title=payload.title,
        category=payload.category,
        file_url=payload.file_url or f"https://healthsync.cloud/storage/records/{doc_id}.pdf",
        file_type="PDF",
        report_date=r_date,
        notes=payload.notes
    )
    db.add(new_doc)

    log_audit_event(
        db=db,
        patient_id=patient_id,
        actor_id=patient_id,
        actor_name="Patient",
        actor_role="Patient",
        action="UPLOAD_DOCUMENT",
        resource="DOCUMENT",
        description=f"Uploaded report: '{payload.title}' ({payload.category})."
    )

    db.commit()
    return {"success": True, "document_id": doc_id, "title": payload.title}

# Dynamic Custom Records Engine
@app.get("/api/patient/{patient_id}/records")
def get_custom_records(patient_id: str, db: Session = Depends(get_db)):
    """List dynamic custom record categories (Blood Sugar, BP, Thyroid) and recorded entries for charts."""
    types = db.query(models.CustomRecordType).filter(
        models.CustomRecordType.patient_id == patient_id
    ).all()

    # If empty, initialize standard dynamic tracking types for demonstration
    if not types:
        sugar_type = models.CustomRecordType(
            patient_id=patient_id,
            name="Blood Sugar (mg/dL)",
            category="Diabetes",
            icon="Activity",
            color="#0d9488",
            description="Track fasting and post-prandial glucose levels."
        )
        db.add(sugar_type)
        db.flush()

        # Seed initial entries for chart rendering
        now = datetime.datetime.utcnow()
        samples = [
            {"fasting": 110, "post_meal": 145, "date": (now - datetime.timedelta(days=14)).strftime("%Y-%m-%d")},
            {"fasting": 105, "post_meal": 138, "date": (now - datetime.timedelta(days=7)).strftime("%Y-%m-%d")},
            {"fasting": 98, "post_meal": 132, "date": now.strftime("%Y-%m-%d")}
        ]
        for s in samples:
            entry = models.CustomRecordEntry(
                record_type_id=sugar_type.id,
                patient_id=patient_id,
                values_json={"fasting": s["fasting"], "post_meal": s["post_meal"]},
                notes="Normal diet day"
            )
            db.add(entry)
        db.commit()
        types = [sugar_type]

    response = []
    for t in types:
        entries = db.query(models.CustomRecordEntry).filter(
            models.CustomRecordEntry.record_type_id == t.id
        ).order_by(models.CustomRecordEntry.recorded_at).all()

        response.append({
            "id": t.id,
            "name": t.name,
            "category": t.category,
            "icon": t.icon,
            "color": t.color,
            "description": t.description,
            "entries": [
                {
                    "id": e.id,
                    "date": e.recorded_at.strftime("%Y-%m-%d"),
                    "values": e.values_json,
                    "notes": e.notes
                }
                for e in entries
            ]
        })
    return response

@app.post("/api/patient/{patient_id}/records/types")
def create_custom_record_type(
    patient_id: str,
    payload: schemas.CustomRecordTypeCreate,
    db: Session = Depends(get_db)
):
    """Define a custom record category (e.g. Thyroid, Blood Pressure, Oxygen Saturation)."""
    t_id = f"REC-TYPE-{uuid.uuid4().hex[:6].upper()}"
    rec_type = models.CustomRecordType(
        id=t_id,
        patient_id=patient_id,
        name=payload.name,
        category=payload.category or "Vitals",
        color=payload.color or "#0d9488",
        icon=payload.icon or "Activity",
        description=payload.description
    )
    db.add(rec_type)
    db.commit()
    return {"success": True, "record_type_id": t_id, "name": payload.name}

@app.post("/api/patient/{patient_id}/records/entries")
def add_custom_record_entry(
    patient_id: str,
    payload: schemas.CustomRecordEntryCreate,
    db: Session = Depends(get_db)
):
    """Add a new numeric or data point to a custom record category for chart visualization."""
    entry = models.CustomRecordEntry(
        record_type_id=payload.record_type_id,
        patient_id=patient_id,
        values_json=payload.values,
        notes=payload.notes
    )
    db.add(entry)
    db.commit()
    return {"success": True, "entry_id": entry.id, "values": payload.values}

# Privacy Consent Center Endpoints
@app.get("/api/patient/{patient_id}/privacy")
def get_privacy_center(patient_id: str, db: Session = Depends(get_db)):
    """
    Sovereign Privacy Center:
    - Incoming Doctor/Hospital Access Requests (Pending)
    - Active Approved Access Grants with scope and duration
    - Immutable Access Audit Trail (Who viewed what, when, and IP)
    """
    # 1. Incoming Pending Requests
    pending_reqs = db.query(models.AccessRequest).filter(
        models.AccessRequest.patient_id == patient_id,
        models.AccessRequest.status == "Pending"
    ).all()

    # 2. Active Approved Access Grants
    approved_grants = db.query(models.AccessRequest).filter(
        models.AccessRequest.patient_id == patient_id,
        models.AccessRequest.status == "Approved"
    ).all()

    # 3. Access Audit Logs
    logs = db.query(models.AuditLog).filter(
        models.AuditLog.patient_id == patient_id
    ).order_by(desc(models.AuditLog.created_at)).limit(20).all()

    def format_req(r):
        doc = db.query(models.Doctor).filter(models.Doctor.id == r.requesting_doctor_id).first()
        hosp = db.query(models.Hospital).filter(models.Hospital.id == r.hospital_id).first()
        return {
            "id": r.id,
            "doctor_id": r.requesting_doctor_id,
            "doctor_name": doc.user.full_name if doc else "Consultant Physician",
            "department": doc.department if doc else "Speciality",
            "hospital_name": hosp.name if hosp else "Affiliated Hospital",
            "purpose": r.purpose,
            "scope": r.requested_scope,
            "duration": f"{r.requested_duration_hours // 24} Days",
            "status": r.status,
            "requested_at": str(r.requested_at)
        }

    return {
        "incoming_requests": [format_req(r) for r in pending_reqs],
        "active_access_grants": [format_req(r) for r in approved_grants],
        "access_audit_logs": [
            {
                "id": l.id,
                "actor_name": l.actor_name,
                "actor_role": l.actor_role,
                "action": l.action,
                "resource": l.resource_type,
                "description": l.description,
                "timestamp": l.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "ip_address": l.ip_address or "127.0.0.1"
            }
            for l in logs
        ]
    }

@app.post("/api/patient/privacy/decide")
def decide_access_request(payload: schemas.AccessDecision, db: Session = Depends(get_db)):
    """Patient grants (Approve) or rejects (Deny) doctor access request with scope & duration."""
    req = db.query(models.AccessRequest).filter(models.AccessRequest.id == payload.request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Access request not found")

    decision_status = "Approved" if payload.decision.upper() == "APPROVE" else "Denied"
    req.status = decision_status
    req.resolved_at = datetime.datetime.utcnow()
    if payload.granted_scope:
        req.requested_scope = payload.granted_scope

    doc = db.query(models.Doctor).filter(models.Doctor.id == req.requesting_doctor_id).first()
    doc_name = doc.user.full_name if doc else "Physician"

    log_audit_event(
        db=db,
        patient_id=req.patient_id,
        actor_id=req.patient_id,
        actor_name="Patient (Self-Sovereign)",
        actor_role="Patient",
        action=decision_status.upper(),
        resource="ACCESS_GRANT",
        description=f"Patient {decision_status.lower()} access for {doc_name}. Scope: {req.requested_scope}."
    )

    db.commit()
    return {"success": True, "request_id": req.id, "status": req.status}

@app.post("/api/patient/privacy/revoke")
def revoke_access(request_id: str, db: Session = Depends(get_db)):
    """Patient immediately terminates an active doctor access grant."""
    req = db.query(models.AccessRequest).filter(models.AccessRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Access grant not found")

    req.status = "Revoked"
    req.resolved_at = datetime.datetime.utcnow()

    log_audit_event(
        db=db,
        patient_id=req.patient_id,
        actor_id=req.patient_id,
        actor_name="Patient (Self-Sovereign)",
        actor_role="Patient",
        action="REVOKE",
        resource="ACCESS_GRANT",
        description=f"Patient revoked access grant {request_id} immediately."
    )

    db.commit()
    return {"success": True, "request_id": request_id, "status": "Revoked"}

# Smart Reminders Rules Engine Endpoints
@app.get("/api/patient/{patient_id}/reminders")
def get_patient_reminders(patient_id: str, db: Session = Depends(get_db)):
    """
    Returns rules-driven smart reminders:
    1. Appointment reminders (1 day & 1 hr before)
    2. Active prescription medication schedules
    3. Condition-driven clinical rules (Asthma inhaler, Diabetes glucose check, BP checks)
    """
    reminders = db.query(models.Reminder).filter(
        models.Reminder.patient_id == patient_id
    ).all()

    return [
        {
            "id": r.id,
            "source": r.source, # APPOINTMENT, PRESCRIPTION, CONDITION_ENGINE
            "title": r.title,
            "description": r.description,
            "time_schedule": r.time_schedule,
            "is_enabled": r.is_enabled,
            "created_at": str(r.created_at)
        }
        for r in reminders
    ]

@app.post("/api/patient/{patient_id}/reminders")
def create_reminder(
    patient_id: str,
    payload: schemas.ReminderCreate,
    db: Session = Depends(get_db)
):
    """Add a custom user reminder."""
    rem = models.Reminder(
        patient_id=patient_id,
        source="USER_CUSTOM",
        title=payload.title,
        description=payload.description,
        time_schedule=payload.time_schedule,
        is_enabled=payload.is_enabled if payload.is_enabled is not None else True
    )
    db.add(rem)
    db.commit()
    return {"success": True, "reminder_id": rem.id, "title": rem.title}

@app.patch("/api/patient/reminders/{reminder_id}/toggle")
def toggle_reminder(reminder_id: str, db: Session = Depends(get_db)):
    """Enable or disable a smart reminder."""
    rem = db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")

    rem.is_enabled = not rem.is_enabled
    db.commit()
    return {"success": True, "reminder_id": reminder_id, "is_enabled": rem.is_enabled}


# =====================================================================
# 4. PHARMACIST PORTAL ENDPOINTS
# =====================================================================

@app.get("/api/pharmacist/queue")
def get_pharmacist_queue(hospital_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Live incoming queue of prescriptions (newest first)."""
    q = db.query(models.Prescription).filter(
        models.Prescription.status.in_(["Sent", "Preparing", "Ready for Pickup"])
    )
    if hospital_id:
        q = q.filter(models.Prescription.hospital_id == hospital_id)
    
    rxs = q.order_by(desc(models.Prescription.created_at)).all()

    queue = []
    for r in rxs:
        pat = db.query(models.Patient).filter(models.Patient.id == r.patient_id).first()
        doc = db.query(models.Doctor).filter(models.Doctor.id == r.doctor_id).first()
        
        queue.append({
            "prescription_id": r.id,
            "patient_id": r.patient_id,
            "patient_name": pat.user.full_name if pat else "Patient",
            "patient_phone": pat.user.phone if pat else "N/A",
            "doctor_name": doc.user.full_name if doc else "Attending Doctor",
            "doctor_department": doc.department if doc else "General",
            "status": r.status, # Sent -> Preparing -> Ready for Pickup
            "pickup_token": r.pickup_token,
            "created_at": r.created_at.strftime("%I:%M %p"),
            "special_instructions": r.special_instructions,
            "items": [
                {
                    "item_id": i.id,
                    "medicine_name": i.medicine_name,
                    "dosage": i.dosage,
                    "frequency": i.frequency,
                    "duration": i.duration,
                    "instructions": i.instructions,
                    "is_out_of_stock": i.is_out_of_stock
                }
                for i in r.items
            ]
        })
    return queue

@app.patch("/api/pharmacist/prescriptions/{prescription_id}/status")
def update_prescription_status(
    prescription_id: str,
    payload: schemas.PrescriptionStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Transition prescription status:
    Sent -> Preparing -> Ready for Pickup (generates Token #) -> Dispensed
    Triggers automatic patient notification when Ready.
    """
    rx = db.query(models.Prescription).filter(models.Prescription.id == prescription_id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")

    old_status = rx.status
    rx.status = payload.status

    # Auto-generate Pickup Token if transitioning to 'Ready for Pickup'
    if payload.status == "Ready for Pickup" and not rx.pickup_token:
        # Generate token like 'T-24'
        token_num = 20 + (hash(rx.id) % 80)
        rx.pickup_token = f"T-{abs(token_num)}"

    # If status is Ready for Pickup, trigger patient alert
    if payload.status == "Ready for Pickup":
        pat = db.query(models.Patient).filter(models.Patient.id == rx.patient_id).first()
        if pat:
            notif = models.Notification(
                user_id=pat.user_id,
                title="Medicines Ready for Pickup! 💊",
                message=f"Your prescription #{rx.id} has been prepared. Please collect at Pharmacy Counter with Token #{rx.pickup_token}.",
                type="PHARMACY_PICKUP",
                link_url="/patient/prescriptions"
            )
            db.add(notif)

    log_audit_event(
        db=db,
        patient_id=rx.patient_id,
        actor_id="PHARM-01",
        actor_name="Registered Pharmacist",
        actor_role="Pharmacist",
        action="UPDATE_PRESCRIPTION_STATUS",
        resource="PRESCRIPTION",
        description=f"Prescription {prescription_id} moved from '{old_status}' to '{payload.status}'. Token: {rx.pickup_token or 'N/A'}."
    )

    db.commit()
    return {
        "success": True,
        "prescription_id": rx.id,
        "status": rx.status,
        "pickup_token": rx.pickup_token
    }

@app.patch("/api/pharmacist/prescriptions/{prescription_id}/stock-out")
def toggle_medicine_stock(
    prescription_id: str,
    payload: schemas.MedicineStockToggle,
    db: Session = Depends(get_db)
):
    """Flag a medicine item as out-of-stock or restocked."""
    item = db.query(models.PrescriptionItem).filter(
        models.PrescriptionItem.prescription_id == prescription_id,
        models.PrescriptionItem.medicine_name == payload.medicine_name
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Prescription item not found")

    item.is_out_of_stock = payload.is_out_of_stock
    db.commit()

    return {
        "success": True,
        "prescription_id": prescription_id,
        "medicine_name": item.medicine_name,
        "is_out_of_stock": item.is_out_of_stock
    }

@app.get("/api/pharmacist/history")
def get_dispensed_history(db: Session = Depends(get_db)):
    """Archive of previously dispensed prescriptions."""
    dispensed = db.query(models.Prescription).filter(
        models.Prescription.status.in_(["Dispensed", "Ready for Pickup"])
    ).order_by(desc(models.Prescription.created_at)).all()

    return [
        {
            "prescription_id": r.id,
            "patient_name": r.consultation.patient.user.full_name if (r.consultation and r.consultation.patient) else "Patient",
            "doctor_name": r.consultation.doctor.user.full_name if (r.consultation and r.consultation.doctor) else "Doctor",
            "status": r.status,
            "pickup_token": r.pickup_token,
            "dispensed_at": r.created_at.strftime("%Y-%m-%d %I:%M %p"),
            "items_count": len(r.items)
        }
        for r in dispensed
    ]


# =====================================================================
# 5. CROSS-CUTTING & SHARED UTILITIES
# =====================================================================

@app.get("/api/notifications")
def get_user_notifications(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Fetch notifications for active user."""
    q = db.query(models.Notification)
    if user_id:
        q = q.filter(models.Notification.user_id == user_id)
    notifs = q.order_by(desc(models.Notification.created_at)).limit(20).all()

    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "link_url": n.link_url,
            "is_read": n.is_read,
            "created_at": str(n.created_at)
        }
        for n in notifs
    ]

@app.patch("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str, db: Session = Depends(get_db)):
    """Mark notification as read."""
    n = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"success": True}

@app.get("/api/audit-logs")
def get_all_audit_logs(
    patient_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """System-wide sovereign consent and data access audit trail."""
    q = db.query(models.AuditLog)
    if patient_id:
        q = q.filter(models.AuditLog.patient_id == patient_id)
    logs = q.order_by(desc(models.AuditLog.created_at)).limit(limit).all()

    return [
        {
            "id": l.id,
            "patient_id": l.patient_id,
            "actor_name": l.actor_name,
            "actor_role": l.actor_role,
            "action": l.action,
            "resource": l.resource_type,
            "description": l.description,
            "timestamp": l.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "ip_address": l.ip_address
        }
        for l in logs
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
