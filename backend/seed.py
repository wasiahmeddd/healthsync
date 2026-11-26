import datetime
from sqlalchemy.orm import Session
from . import models, auth

def seed_database(db: Session):
    """Populates the database with realistic multi-hospital clinical data if empty."""
    # Check if already seeded
    if db.query(models.Role).first() is not None:
        return

    print("🌱 Seeding HealthSync database with initial clinical data...")

    # 1. Seed Roles
    roles = {
        "HOSPITAL": models.Role(name="HOSPITAL", description="Hospital Reception & Administration"),
        "DOCTOR": models.Role(name="DOCTOR", description="Licensed Clinical Physician"),
        "PATIENT": models.Role(name="PATIENT", description="Registered Patient"),
        "PHARMACIST": models.Role(name="PHARMACIST", description="Registered Pharmacist / Dispensary")
    }
    for r in roles.values():
        db.add(r)
    db.flush()

    # 2. Seed Hospitals
    hosp_apollo = models.Hospital(
        id="HOSP-01",
        name="Apollo Multispeciality Hospital",
        code="APOLLO-BLR",
        address="154/11, Bannerghatta Main Rd, Bengaluru, Karnataka 560076",
        contact_phone="+91 80 2630 4050",
        contact_email="contact@apollo-blr.healthsync.in",
        emergency_helpline="1066"
    )
    hosp_bmsce = models.Hospital(
        id="HOSP-02",
        name="BMSCE Healthcare & Research Institute",
        code="BMSCE-HEALTH",
        address="Bull Temple Road, Basavanagudi, Bengaluru, Karnataka 560019",
        contact_phone="+91 80 2662 2130",
        contact_email="healthcentre@bmsce.ac.in",
        emergency_helpline="+91 80 2662 2139"
    )
    db.add_all([hosp_apollo, hosp_bmsce])
    db.flush()

    default_pw = auth.get_password_hash("password123")

    # 3. Seed Hospital Receptionist
    rec_user = models.User(
        id="USR-REC-01",
        email="reception@bmsce.edu",
        password_hash=default_pw,
        role_id=roles["HOSPITAL"].id,
        full_name="Anita Desai",
        phone="+91 80 2662 2130",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    )
    db.add(rec_user)

    # 4. Seed Doctors
    docs_data = [
        {
            "id": "DOC-01", "uid": "USR-DOC-01", "name": "Dr. Priya Sharma", "email": "dr.priya@healthsync.com",
            "hosp": "HOSP-01", "spec": "Chief Cardiologist", "dept": "Cardiology", "lic": "KMC-48291",
            "avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
        },
        {
            "id": "DOC-02", "uid": "USR-DOC-02", "name": "Dr. Rajesh Kulkarni", "email": "dr.rajesh@healthsync.com",
            "hosp": "HOSP-01", "spec": "Senior Endocrinologist", "dept": "Endocrinology", "lic": "KMC-39182",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
        },
        {
            "id": "DOC-03", "uid": "USR-DOC-03", "name": "Dr. Sneha Patil", "email": "dr.sneha@healthsync.com",
            "hosp": "HOSP-02", "spec": "Consultant Pulmonologist", "dept": "Pulmonology", "lic": "KMC-51029",
            "avatar": "https://images.unsplash.com/photo-1594824813637-23f2f01f65d6?w=150&auto=format&fit=crop&q=80"
        },
        {
            "id": "DOC-04", "uid": "USR-DOC-04", "name": "Dr. Arjun Menon", "email": "dr.arjun@healthsync.com",
            "hosp": "HOSP-02", "spec": "Consultant Surgeon (Second Opinion)", "dept": "Surgery", "lic": "KMC-62940",
            "avatar": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
        }
    ]
    for d in docs_data:
        u = models.User(
            id=d["uid"], email=d["email"], password_hash=default_pw, role_id=roles["DOCTOR"].id,
            full_name=d["name"], avatar_url=d["avatar"]
        )
        db.add(u)
        db.flush()
        doc = models.Doctor(
            id=d["id"], user_id=u.id, hospital_id=d["hosp"], specialization=d["spec"],
            license_number=d["lic"], department=d["dept"], qualification="MBBS, MD", consultation_fee=750.00
        )
        db.add(doc)

    # 5. Seed Pharmacists
    pharms_data = [
        {"id": "PHARM-01", "uid": "USR-PH-01", "name": "Suresh Gupta, R.Ph.", "email": "pharmacy.apollo@healthsync.com", "hosp": "HOSP-01", "cntr": "Counter 1 - FastTrack"},
        {"id": "PHARM-02", "uid": "USR-PH-02", "name": "Kavitha Nair, Pharm.D", "email": "pharmacy.bmsce@healthsync.com", "hosp": "HOSP-02", "cntr": "Counter 2 - Outpatient"},
        {"id": "PHARM-03", "uid": "USR-PH-03", "name": "Ramesh Bhat, R.Ph.", "email": "pharmacy.express@healthsync.com", "hosp": "HOSP-01", "cntr": "Counter 3 - Special Delivery"}
    ]
    for p in pharms_data:
        u = models.User(
            id=p["uid"], email=p["email"], password_hash=default_pw, role_id=roles["PHARMACIST"].id,
            full_name=p["name"], avatar_url="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80"
        )
        db.add(u)
        db.flush()
        pharm = models.Pharmacist(id=p["id"], user_id=u.id, hospital_id=p["hosp"], license_number=f"PH-KAR-{p['id']}", counter_number=p["cntr"])
        db.add(pharm)

    # 6. Seed Patients & HealthProfiles
    patients_data = [
        {
            "id": "ML-PAT-1001", "uid": "USR-PAT-01", "name": "Rahul Verma", "email": "rahul@gmail.com", "phone": "+91 98450 12345",
            "dob": datetime.date(1989, 6, 15), "gender": "Male", "blood": "B+", "height": 174, "weight": 78,
            "allergies": ["Penicillin", "Sulfa drugs"], "conditions": ["Type 2 Diabetes", "Hypertension"],
            "insurance": "Star Health Senior Comprehensive"
        },
        {
            "id": "ML-PAT-1002", "uid": "USR-PAT-02", "name": "Ananya Rao", "email": "ananya.rao@gmail.com", "phone": "+91 98451 23456",
            "dob": datetime.date(1996, 3, 22), "gender": "Female", "blood": "O+", "height": 162, "weight": 54,
            "allergies": ["Aspirin"], "conditions": ["Bronchial Asthma"],
            "insurance": "HDFC ERGO Health Suraksha"
        },
        {
            "id": "ML-PAT-1003", "uid": "USR-PAT-03", "name": "Vikram Malhotra", "email": "vikram.m@gmail.com", "phone": "+91 98452 34567",
            "dob": datetime.date(1968, 11, 8), "gender": "Male", "blood": "A+", "height": 168, "weight": 82,
            "allergies": ["None"], "conditions": ["Post-CABG (Coronary Stent)", "Hyperlipidemia"],
            "insurance": "Care Health Advantage"
        },
        {
            "id": "ML-PAT-1004", "uid": "USR-PAT-04", "name": "Sneha Kapoor", "email": "sneha.k@gmail.com", "phone": "+91 98453 45678",
            "dob": datetime.date(2001, 8, 30), "gender": "Female", "blood": "AB+", "height": 158, "weight": 49,
            "allergies": ["Peanuts"], "conditions": ["Hypothyroidism"],
            "insurance": "Niva Bupa ReAssure"
        },
        {
            "id": "ML-PAT-1005", "uid": "USR-PAT-05", "name": "Mohammed Farooq", "email": "farooq.m@gmail.com", "phone": "+91 98454 56789",
            "dob": datetime.date(1978, 1, 14), "gender": "Male", "blood": "O-", "height": 178, "weight": 86,
            "allergies": ["None"], "conditions": ["Chronic Kidney Disease (Stage 2)", "Hypertension"],
            "insurance": "ManipalCigna ProHealth"
        }
    ]
    for pt in patients_data:
        u = models.User(
            id=pt["uid"], email=pt["email"], password_hash=default_pw, role_id=roles["PATIENT"].id,
            full_name=pt["name"], phone=pt["phone"],
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        )
        db.add(u)
        db.flush()
        pat = models.Patient(
            id=pt["id"], user_id=u.id, date_of_birth=pt["dob"], gender=pt["gender"], blood_group=pt["blood"],
            address="Bengaluru, Karnataka", qr_code_hash=f"HEALTHSYNC-PAT-{pt['id']}-HASH",
            emergency_contact_name="Relative Guardian", emergency_contact_phone=pt["phone"]
        )
        db.add(pat)
        hp = models.HealthProfile(
            patient_id=pt["id"], height_cm=pt["height"], weight_kg=pt["weight"],
            allergies=pt["allergies"], chronic_conditions=pt["conditions"],
            insurance_provider=pt["insurance"], insurance_policy_number=f"POL-2026-{pt['id'].split('-')[-1]}"
        )
        db.add(hp)

    # 7. Seed Appointments
    today = datetime.date.today()
    appts = [
        {"id": "APT-01", "hosp": "HOSP-01", "doc": "DOC-01", "pat": "ML-PAT-1001", "dept": "Cardiology", "slot": "10:00 AM", "status": "Scheduled", "reason": "Follow-up for BP and angina episodes"},
        {"id": "APT-02", "hosp": "HOSP-01", "doc": "DOC-01", "pat": "ML-PAT-1003", "dept": "Cardiology", "slot": "11:30 AM", "status": "In Progress", "reason": "6-month post-angioplasty treadmill review"},
        {"id": "APT-03", "hosp": "HOSP-02", "doc": "DOC-03", "pat": "ML-PAT-1002", "dept": "Pulmonology", "slot": "02:00 PM", "status": "Completed", "reason": "Wheezing with seasonal change"},
        {"id": "APT-04", "hosp": "HOSP-01", "doc": "DOC-02", "pat": "ML-PAT-1004", "dept": "Endocrinology", "slot": "03:30 PM", "status": "Scheduled", "reason": "TSH review and dosage adjustment"},
        {"id": "APT-05", "hosp": "HOSP-02", "doc": "DOC-04", "pat": "ML-PAT-1005", "dept": "Surgery", "slot": "04:30 PM", "status": "Scheduled", "reason": "Renal cyst evaluation - second opinion"}
    ]
    for a in appts:
        appt = models.Appointment(
            id=a["id"], hospital_id=a["hosp"], doctor_id=a["doc"], patient_id=a["pat"],
            appointment_date=today, time_slot=a["slot"], department=a["dept"],
            reason_for_visit=a["reason"], status=a["status"]
        )
        db.add(appt)

    # 8. Seed Consultation & Prescriptions
    cons = models.Consultation(
        id="CNS-01", appointment_id="APT-03", doctor_id="DOC-03", patient_id="ML-PAT-1002",
        symptoms="Mild bilateral wheezing, nocturnal dry cough triggered by cold weather",
        diagnosis="Moderate Persistent Asthma - Acute Seasonal Exacerbation",
        vitals={"bp_systolic": 118, "bp_diastolic": 76, "pulse": 74, "spo2": 98, "temperature": 98.4, "weight": 54},
        shared_notes="PFT shows reversible airway obstruction. Initiated maintenance inhaler. Advised spirometry in 4 weeks.",
        future_doctor_notes="Patient has mild aspirin intolerance; avoid NSAIDs for pain relief."
    )
    db.add(cons)
    db.flush()

    rx = models.Prescription(
        id="RX-01", consultation_id=cons.id, patient_id="ML-PAT-1002", doctor_id="DOC-03", hospital_id="HOSP-02",
        status="Ready for Pickup", pickup_token="T-24", special_instructions="Rinse mouth with lukewarm water after using inhaler."
    )
    db.add(rx)
    db.flush()

    rx_items = [
        models.PrescriptionItem(prescription_id=rx.id, medicine_name="Budesonide + Formoterol Inhaler (200/6mcg)", dosage="2 puffs", frequency="Twice daily", duration="30 days", instructions="Inhale morning & night"),
        models.PrescriptionItem(prescription_id=rx.id, medicine_name="Montelukast Sodium 10mg", dosage="1 tablet", frequency="Once daily", duration="15 days", instructions="Take before bedtime"),
        models.PrescriptionItem(prescription_id=rx.id, medicine_name="Levocetirizine 5mg", dosage="1 tablet", frequency="SOS (As needed)", duration="7 days", instructions="For acute allergic rhinitis")
    ]
    db.add_all(rx_items)

    # 9. Seed Active Second Opinion Request
    sec_req = models.AccessRequest(
        id="ACC-REQ-01", patient_id="ML-PAT-1001", requesting_doctor_id="DOC-04", hospital_id="HOSP-02",
        purpose="Second Opinion Consultation: Reviewing cardiac clearance prior to elective orthopedic procedure",
        requested_scope="FULL", requested_duration_hours=168, status="Approved"
    )
    db.add(sec_req)

    # 10. Seed Smart Reminders
    rems = [
        models.Reminder(patient_id="ML-PAT-1001", source="PRESCRIPTION", title="Metformin 500mg Morning Dose", description="Take with breakfast to control fasting blood glucose", time_schedule="Daily at 08:30 AM", is_enabled=True),
        models.Reminder(patient_id="ML-PAT-1001", source="CONDITION_ENGINE", title="Daily Blood Pressure & Pulse Check", description="Measure sitting down after 5 minutes of rest", time_schedule="Daily at 09:00 AM", is_enabled=True),
        models.Reminder(patient_id="ML-PAT-1001", source="APPOINTMENT", title="Upcoming Cardiology Consultation", description="Appointment with Dr. Priya Sharma at Apollo Multispeciality Hospital", time_schedule="Today at 10:00 AM", is_enabled=True)
    ]
    db.add_all(rems)

    # 11. Seed Audit Logs
    logs = [
        models.AuditLog(patient_id="ML-PAT-1001", actor_user_id="DOC-01", actor_name="Dr. Priya Sharma", actor_role="Doctor", action="VIEW", resource_type="PATIENT_PROFILE", description="Viewed complete medical timeline for scheduled consultation", ip_address="192.168.1.10"),
        models.AuditLog(patient_id="ML-PAT-1001", actor_user_id="ML-PAT-1001", actor_name="Rahul Verma", actor_role="Patient", action="APPROVE", resource_type="ACCESS_REQUEST", description="Approved second opinion request from Dr. Arjun Menon (Scope: FULL, 7 Days)", ip_address="106.51.72.19"),
        models.AuditLog(patient_id="ML-PAT-1002", actor_user_id="DOC-03", actor_name="Dr. Sneha Patil", actor_role="Doctor", action="CREATE", resource_type="PRESCRIPTION", description="Generated e-Prescription #RX-01 (3 medicines) for Acute Asthma", ip_address="192.168.2.15")
    ]
    db.add_all(logs)

    db.commit()
    print(" Database seeded successfully with 2 hospitals, 4 doctors, 5 patients, appointments, prescriptions, reminders & audit logs.")
