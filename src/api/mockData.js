// ==============================================================================
// HealthSync Mock Database Seed Data
// Realistic multi-hospital, multi-doctor, multi-patient medical environment
// ==============================================================================

export const INITIAL_DATA = {
  hospitals: [
    {
      id: "HOSP-01",
      name: "Apollo Multispeciality Hospital",
      code: "APOLLO-BLR",
      city: "Bangalore",
      address: "154/11, Bannerghatta Main Rd, Bengaluru, Karnataka 560076",
      phone: "+91 80 2630 4050",
      email: "contact@apollo-blr.healthsync.in",
      emergency: "1066",
      departments: ["Cardiology", "General Medicine", "Endocrinology", "Neurology", "Orthopedics"]
    },
    {
      id: "HOSP-02",
      name: "BMSCE Healthcare & Research Institute",
      code: "BMSCE-HEALTH",
      city: "Bangalore",
      address: "Bull Temple Road, Basavanagudi, Bengaluru, Karnataka 560019",
      phone: "+91 80 2662 2130",
      email: "healthcentre@bmsce.ac.in",
      emergency: "+91 80 2662 2139",
      departments: ["General Medicine", "Pulmonology", "Surgery", "Dermatology", "Pediatrics"]
    }
  ],

  doctors: [
    {
      id: "DOC-01",
      userId: "USR-DOC-01",
      name: "Dr. Priya Sharma",
      email: "dr.priya@healthsync.com",
      hospitalId: "HOSP-01",
      hospitalName: "Apollo Multispeciality Hospital",
      specialization: "Chief Cardiologist",
      department: "Cardiology",
      qualification: "MBBS, MD (Cardiology), FACC",
      licenseNumber: "KMC-48291",
      consultationFee: 750,
      isOnDuty: true,
      availableSlots: ["09:00 AM", "09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "04:00 PM"],
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "DOC-02",
      userId: "USR-DOC-02",
      name: "Dr. Rajesh Kumar",
      email: "dr.rajesh@healthsync.com",
      hospitalId: "HOSP-02",
      hospitalName: "BMSCE Healthcare & Research",
      specialization: "Senior Neurologist",
      department: "General Medicine",
      qualification: "MBBS, MD, DM (Neurology)",
      licenseNumber: "KMC-39102",
      consultationFee: 600,
      isOnDuty: true,
      availableSlots: ["10:00 AM", "11:00 AM", "01:30 PM", "03:00 PM", "05:00 PM"],
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "DOC-03",
      userId: "USR-DOC-03",
      name: "Dr. Sneha Patel",
      email: "dr.sneha@healthsync.com",
      hospitalId: "HOSP-01",
      hospitalName: "Apollo Multispeciality Hospital",
      specialization: "Endocrinologist & Diabetologist",
      department: "Endocrinology",
      qualification: "MBBS, MD (Internal Medicine), FACE",
      licenseNumber: "KMC-51044",
      consultationFee: 700,
      isOnDuty: true,
      availableSlots: ["09:30 AM", "11:00 AM", "12:00 PM", "03:30 PM"],
      avatar: "https://images.unsplash.com/photo-1594824813637-23f2f01f65d6?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "DOC-04",
      userId: "USR-DOC-04",
      name: "Dr. Arjun Menon",
      email: "dr.arjun@healthsync.com",
      hospitalId: "HOSP-02",
      hospitalName: "BMSCE Healthcare & Research",
      specialization: "Consultant Physician & Surgeon",
      department: "Surgery",
      qualification: "MBBS, MS (General Surgery)",
      licenseNumber: "KMC-62910",
      consultationFee: 650,
      isOnDuty: false,
      availableSlots: ["10:30 AM", "02:00 PM", "04:30 PM"],
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
    }
  ],

  pharmacists: [
    {
      id: "PHARM-01",
      userId: "USR-PHARM-01",
      name: "Suresh Gupta, R.Ph.",
      email: "pharmacy.apollo@healthsync.com",
      hospitalId: "HOSP-01",
      hospitalName: "Apollo Main Pharmacy",
      counter: "Counter 1 - FastTrack",
      licenseNumber: "PH-KAR-8831"
    },
    {
      id: "PHARM-02",
      userId: "USR-PHARM-02",
      name: "Deepa Nair, B.Pharm",
      email: "pharmacy.bmsce@healthsync.com",
      hospitalId: "HOSP-02",
      hospitalName: "BMSCE Central Dispensary",
      counter: "Counter 2 - Outpatients",
      licenseNumber: "PH-KAR-9214"
    },
    {
      id: "PHARM-03",
      userId: "USR-PHARM-03",
      name: "K. Ramesh",
      email: "pharmacy.express@healthsync.com",
      hospitalId: "HOSP-01",
      hospitalName: "Apollo Express Dispensary",
      counter: "Counter 3 - Inpatient Pickups",
      licenseNumber: "PH-KAR-7411"
    }
  ],

  receptionists: [
    {
      id: "REC-01",
      userId: "USR-REC-01",
      name: "Anita Desai",
      email: "reception@bmsce.edu",
      hospitalId: "HOSP-02",
      hospitalName: "BMSCE Healthcare & Research",
      role: "Front Desk Administrator"
    },
    {
      id: "REC-02",
      userId: "USR-REC-02",
      name: "Karthik N.",
      email: "frontdesk@apollo.com",
      hospitalId: "HOSP-01",
      hospitalName: "Apollo Multispeciality Hospital",
      role: "Admissions Supervisor"
    }
  ],

  patients: [
    {
      id: "ML-PAT-1001",
      userId: "USR-PAT-01",
      name: "Rahul Verma",
      email: "rahul@gmail.com",
      phone: "+91 98451 22345",
      dob: "1990-05-14",
      age: 34,
      gender: "Male",
      bloodGroup: "B+",
      address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru",
      qrCode: "HEALTHSYNC-PAT-ML-PAT-1001-AUTH-TOKEN",
      emergencyContact: {
        name: "Sunita Verma",
        relation: "Spouse",
        phone: "+91 98451 99887"
      },
      healthProfile: {
        height: 174,
        weight: 76,
        bmi: 25.1,
        allergies: ["Sulfa drugs", "Dust / Pollen"],
        chronicConditions: ["Type 2 Diabetes", "Hypertension"],
        familyHistory: "Father had coronary artery disease at age 58; Mother has osteoarthritis.",
        insurance: {
          provider: "Star Health Insurance",
          policyNumber: "SH-BLR-2024-88392",
          validTill: "2027-03-31",
          coverageLimit: "₹10,00,000"
        }
      }
    },
    {
      id: "ML-PAT-1002",
      userId: "USR-PAT-02",
      name: "Ananya Rao",
      email: "ananya@gmail.com",
      phone: "+91 99002 44321",
      dob: "1996-08-22",
      age: 28,
      gender: "Female",
      bloodGroup: "O+",
      address: "12/A, 4th Main, Malleshwaram, Bengaluru",
      qrCode: "HEALTHSYNC-PAT-ML-PAT-1002-AUTH-TOKEN",
      emergencyContact: {
        name: "Vikram Rao",
        relation: "Brother",
        phone: "+91 99002 88990"
      },
      healthProfile: {
        height: 162,
        weight: 54,
        bmi: 20.6,
        allergies: ["Penicillin", "NSAIDs"],
        chronicConditions: ["Kidney Stones (Calcium Oxalate)"],
        familyHistory: "Maternal grandmother had diabetes.",
        insurance: {
          provider: "HDFC ERGO Health Suraksha",
          policyNumber: "HE-992-01934",
          validTill: "2026-11-30",
          coverageLimit: "₹5,00,000"
        }
      }
    },
    {
      id: "ML-PAT-1003",
      userId: "USR-PAT-03",
      name: "Vikram Malhotra",
      email: "vikram@gmail.com",
      phone: "+91 97311 00223",
      dob: "1968-11-03",
      age: 56,
      gender: "Male",
      bloodGroup: "A+",
      address: "Villa 18, Palm Meadows, Whitefield, Bengaluru",
      qrCode: "HEALTHSYNC-PAT-ML-PAT-1003-AUTH-TOKEN",
      emergencyContact: {
        name: "Pooja Malhotra",
        relation: "Daughter",
        phone: "+91 97311 88112"
      },
      healthProfile: {
        height: 178,
        weight: 84,
        bmi: 26.5,
        allergies: ["None known"],
        chronicConditions: ["Coronary Artery Disease", "High Cholesterol"],
        familyHistory: "Both parents had cardiovascular issues.",
        insurance: {
          provider: "ICICI Lombard Healthcare",
          policyNumber: "IL-CAR-55291",
          validTill: "2027-01-15",
          coverageLimit: "₹15,00,000"
        }
      }
    },
    {
      id: "ML-PAT-1004",
      userId: "USR-PAT-04",
      name: "Meera Iyer",
      email: "meera@gmail.com",
      phone: "+91 94480 33119",
      dob: "1982-01-19",
      age: 42,
      gender: "Female",
      bloodGroup: "AB+",
      address: "88, 7th Cross, Jayanagar 4th Block, Bengaluru",
      qrCode: "HEALTHSYNC-PAT-ML-PAT-1004-AUTH-TOKEN",
      emergencyContact: {
        name: "Ganesh Iyer",
        relation: "Spouse",
        phone: "+91 94480 44220"
      },
      healthProfile: {
        height: 158,
        weight: 63,
        bmi: 25.2,
        allergies: ["Aspirin"],
        chronicConditions: ["Hypothyroidism"],
        familyHistory: "Mother has thyroid disorders.",
        insurance: {
          provider: "Care Health Insurance",
          policyNumber: "CH-882-901",
          validTill: "2026-09-20",
          coverageLimit: "₹7,00,000"
        }
      }
    },
    {
      id: "ML-PAT-1005",
      userId: "USR-PAT-05",
      name: "David D'Souza",
      email: "david@gmail.com",
      phone: "+91 96112 55443",
      dob: "2001-09-09",
      age: 23,
      gender: "Male",
      bloodGroup: "O-",
      address: "51, Richards Town, Fraser Town, Bengaluru",
      qrCode: "HEALTHSYNC-PAT-ML-PAT-1005-AUTH-TOKEN",
      emergencyContact: {
        name: "Maria D'Souza",
        relation: "Mother",
        phone: "+91 96112 11009"
      },
      healthProfile: {
        height: 181,
        weight: 71,
        bmi: 21.7,
        allergies: ["Peanuts", "Dust mites"],
        chronicConditions: ["Mild Bronchial Asthma"],
        familyHistory: "No hereditary major conditions.",
        insurance: {
          provider: "Niva Bupa Health",
          policyNumber: "NB-330-9182",
          validTill: "2027-05-10",
          coverageLimit: "₹5,00,000"
        }
      }
    }
  ],

  appointments: [
    {
      id: "APT-101",
      patientId: "ML-PAT-1001",
      patientName: "Rahul Verma",
      patientPhone: "+91 98451 22345",
      doctorId: "DOC-01",
      doctorName: "Dr. Priya Sharma",
      hospitalId: "HOSP-01",
      hospitalName: "Apollo Multispeciality Hospital",
      department: "Cardiology",
      date: "2026-11-04",
      timeSlot: "10:30 AM",
      status: "In Progress",
      reason: "Routine quarterly cardiac & BP follow-up, occasional palpitations",
      tokenNumber: "A-12"
    },
    {
      id: "APT-102",
      patientId: "ML-PAT-1002",
      patientName: "Ananya Rao",
      patientPhone: "+91 99002 44321",
      doctorId: "DOC-02",
      doctorName: "Dr. Rajesh Kumar",
      hospitalId: "HOSP-02",
      hospitalName: "BMSCE Healthcare & Research",
      department: "General Medicine",
      date: "2026-11-04",
      timeSlot: "11:00 AM",
      status: "Scheduled",
      reason: "Left flank pain review & ultrasound follow-up",
      tokenNumber: "B-04"
    },
    {
      id: "APT-103",
      patientId: "ML-PAT-1003",
      patientName: "Vikram Malhotra",
      patientPhone: "+91 97311 00223",
      doctorId: "DOC-01",
      doctorName: "Dr. Priya Sharma",
      hospitalId: "HOSP-01",
      hospitalName: "Apollo Multispeciality Hospital",
      department: "Cardiology",
      date: "2026-11-04",
      timeSlot: "11:30 AM",
      status: "Scheduled",
      reason: "Post-stent annual angiography checkup",
      tokenNumber: "A-14"
    },
    {
      id: "APT-104",
      patientId: "ML-PAT-1004",
      patientName: "Meera Iyer",
      patientPhone: "+91 94480 33119",
      doctorId: "DOC-03",
      doctorName: "Dr. Sneha Patel",
      hospitalId: "HOSP-01",
      hospitalName: "Apollo Multispeciality Hospital",
      department: "Endocrinology",
      date: "2026-11-04",
      timeSlot: "12:00 PM",
      status: "Scheduled",
      reason: "Thyroid profile review and lethargy",
      tokenNumber: "E-02"
    },
    {
      id: "APT-105",
      patientId: "ML-PAT-1005",
      patientName: "David D'Souza",
      patientPhone: "+91 96112 55443",
      doctorId: "DOC-04",
      doctorName: "Dr. Arjun Menon",
      hospitalId: "HOSP-02",
      hospitalName: "BMSCE Healthcare & Research",
      department: "Surgery",
      date: "2026-11-04",
      timeSlot: "02:00 PM",
      status: "Scheduled",
      reason: "Minor cyst excision consultation",
      tokenNumber: "S-01"
    },
    {
      id: "APT-106",
      patientId: "ML-PAT-1001",
      patientName: "Rahul Verma",
      patientPhone: "+91 98451 22345",
      doctorId: "DOC-03",
      doctorName: "Dr. Sneha Patel",
      hospitalId: "HOSP-01",
      hospitalName: "Apollo Multispeciality Hospital",
      department: "Endocrinology",
      date: "2026-10-15",
      timeSlot: "03:30 PM",
      status: "Completed",
      reason: "HbA1c quarterly review - target under 7.0%",
      tokenNumber: "E-09"
    },
    {
      id: "APT-107",
      patientId: "ML-PAT-1002",
      patientName: "Ananya Rao",
      patientPhone: "+91 99002 44321",
      doctorId: "DOC-01",
      doctorName: "Dr. Priya Sharma",
      hospitalId: "HOSP-01",
      hospitalName: "Apollo Multispeciality Hospital",
      department: "Cardiology",
      date: "2026-09-20",
      timeSlot: "02:30 PM",
      status: "Completed",
      reason: "Pre-operative ECG & fitness certificate",
      tokenNumber: "A-08"
    },
    {
      id: "APT-108",
      patientId: "ML-PAT-1001",
      patientName: "Rahul Verma",
      patientPhone: "+91 98451 22345",
      doctorId: "DOC-02",
      doctorName: "Dr. Rajesh Kumar",
      hospitalId: "HOSP-02",
      hospitalName: "BMSCE Healthcare & Research",
      department: "General Medicine",
      date: "2026-08-05",
      timeSlot: "10:00 AM",
      status: "Completed",
      reason: "Viral fever & body ache consultation",
      tokenNumber: "B-11"
    },
    {
      id: "APT-109",
      patientId: "ML-PAT-1003",
      patientName: "Vikram Malhotra",
      patientPhone: "+91 97311 00223",
      doctorId: "DOC-03",
      doctorName: "Dr. Sneha Patel",
      hospitalId: "HOSP-01",
      hospitalName: "Apollo Multispeciality Hospital",
      department: "Endocrinology",
      date: "2026-11-02",
      timeSlot: "09:30 AM",
      status: "Cancelled",
      reason: "Patient had travel emergency",
      tokenNumber: "E-01"
    },
    {
      id: "APT-110",
      patientId: "ML-PAT-1004",
      patientName: "Meera Iyer",
      patientPhone: "+91 94480 33119",
      doctorId: "DOC-02",
      doctorName: "Dr. Rajesh Kumar",
      hospitalId: "HOSP-02",
      hospitalName: "BMSCE Healthcare & Research",
      department: "General Medicine",
      date: "2026-11-06",
      timeSlot: "11:00 AM",
      status: "Scheduled",
      reason: "Migraine headaches worsening during work",
      tokenNumber: "B-18"
    }
  ],

  consultations: [
    {
      id: "CNS-501",
      appointmentId: "APT-106",
      patientId: "ML-PAT-1001",
      doctorId: "DOC-03",
      doctorName: "Dr. Sneha Patel",
      hospitalName: "Apollo Multispeciality Hospital",
      date: "2026-10-15",
      diagnosis: "Type 2 Diabetes Mellitus with fair glycemic control (HbA1c 7.1%)",
      symptoms: "Mild afternoon fatigue, occasional polyuria after sweet intake.",
      vitals: {
        bpSystolic: 128,
        bpDiastolic: 82,
        pulse: 74,
        temperature: 98.4,
        spo2: 99,
        weight: 76
      },
      sharedNotes: "Dietary compliance has improved. Continue 30 min daily brisk walking. Limit carbohydrate intake in dinner.",
      futureDoctorNotes: "Patient responds well to Metformin. If fasting stays above 125 mg/dL, consider adding DPP-4 inhibitor.",
      isPrivateNotes: false,
      privateNotes: "",
      prescriptionId: "RX-801"
    },
    {
      id: "CNS-502",
      appointmentId: "APT-108",
      patientId: "ML-PAT-1001",
      doctorId: "DOC-02",
      doctorName: "Dr. Rajesh Kumar",
      hospitalName: "BMSCE Healthcare & Research",
      date: "2026-08-05",
      diagnosis: "Acute Viral Pharyngitis with upper respiratory tract irritation",
      symptoms: "Sore throat, fever spikes up to 101F, body fatigue for 2 days.",
      vitals: {
        bpSystolic: 122,
        bpDiastolic: 80,
        pulse: 82,
        temperature: 100.8,
        spo2: 98,
        weight: 76.5
      },
      sharedNotes: "Warm saline gargles 3x/day. Adequate hydration. Complete Paracetamol course.",
      futureDoctorNotes: "Throat clear of bacterial exudates. No antibiotics indicated at this stage.",
      isPrivateNotes: true,
      privateNotes: "Patient seemed anxious about potential dengue; platelet count confirmed normal (2.4 lakhs).",
      prescriptionId: "RX-802"
    }
  ],

  prescriptions: [
    {
      id: "RX-801",
      consultationId: "CNS-501",
      patientId: "ML-PAT-1001",
      patientName: "Rahul Verma",
      doctorId: "DOC-03",
      doctorName: "Dr. Sneha Patel",
      hospitalId: "HOSP-01",
      hospitalName: "Apollo Multispeciality Hospital",
      date: "2026-10-15",
      status: "Dispensed",
      pickupToken: "TK-101",
      items: [
        {
          id: "ITM-01",
          medicineName: "Metformin Hydrochloride",
          dosage: "500 mg",
          frequency: "1-0-1 (After meals)",
          duration: "90 Days",
          instructions: "Take with breakfast and dinner. Do not skip.",
          isOutOfStock: false
        },
        {
          id: "ITM-02",
          medicineName: "Telmisartan",
          dosage: "40 mg",
          frequency: "1-0-0 (Morning empty stomach)",
          duration: "90 Days",
          instructions: "Monitor BP weekly.",
          isOutOfStock: false
        },
        {
          id: "ITM-03",
          medicineName: "Vitamin D3 (Cholecalciferol)",
          dosage: "60,000 IU",
          frequency: "Once a week (Sunday morning)",
          duration: "8 Weeks",
          instructions: "Take after a full glass of milk.",
          isOutOfStock: false
        }
      ],
      specialInstructions: "Repeat HbA1c and Serum Creatinine after 3 months before next review."
    },
    {
      id: "RX-802",
      consultationId: "CNS-502",
      patientId: "ML-PAT-1001",
      patientName: "Rahul Verma",
      doctorId: "DOC-02",
      doctorName: "Dr. Rajesh Kumar",
      hospitalId: "HOSP-02",
      hospitalName: "BMSCE Healthcare & Research",
      date: "2026-08-05",
      status: "Dispensed",
      pickupToken: "TK-84",
      items: [
        {
          id: "ITM-04",
          medicineName: "Paracetamol (Dolo 650)",
          dosage: "650 mg",
          frequency: "1-1-1 (SOS if fever > 99.5F)",
          duration: "5 Days",
          instructions: "Minimum 6 hours gap between doses.",
          isOutOfStock: false
        },
        {
          id: "ITM-05",
          medicineName: "Cetirizine Hydrochloride",
          dosage: "10 mg",
          frequency: "0-0-1 (Night before sleep)",
          duration: "5 Days",
          instructions: "May cause drowsiness.",
          isOutOfStock: false
        }
      ],
      specialInstructions: "Report immediately if fever persists beyond 4 days."
    },
    {
      id: "RX-803",
      consultationId: "CNS-PENDING-01",
      patientId: "ML-PAT-1002",
      patientName: "Ananya Rao",
      doctorId: "DOC-02",
      doctorName: "Dr. Rajesh Kumar",
      hospitalId: "HOSP-02",
      hospitalName: "BMSCE Healthcare & Research",
      date: "2026-11-04",
      status: "Preparing",
      pickupToken: "TK-23",
      items: [
        {
          id: "ITM-06",
          medicineName: "Potassium Citrate Oral Solution",
          dosage: "15 ml in glass of water",
          frequency: "1-0-1 (After food)",
          duration: "30 Days",
          instructions: "To alkalize urine and prevent stone formation.",
          isOutOfStock: false
        },
        {
          id: "ITM-07",
          medicineName: "Drotaverine Hydrochloride (Drotin)",
          dosage: "80 mg",
          frequency: "SOS (During acute flank spasm)",
          duration: "10 Days",
          instructions: "For antispasmodic pain relief.",
          isOutOfStock: false
        }
      ],
      specialInstructions: "Strictly drink 3.5 Liters of water daily."
    },
    {
      id: "RX-804",
      consultationId: "CNS-PENDING-02",
      patientId: "ML-PAT-1003",
      patientName: "Vikram Malhotra",
      doctorId: "DOC-01",
      doctorName: "Dr. Priya Sharma",
      hospitalId: "HOSP-01",
      hospitalName: "Apollo Multispeciality Hospital",
      date: "2026-11-04",
      status: "Sent",
      pickupToken: "TK-29",
      items: [
        {
          id: "ITM-08",
          medicineName: "Atorvastatin Calcium",
          dosage: "20 mg",
          frequency: "0-0-1 (Bedtime)",
          duration: "60 Days",
          instructions: "Cholesterol management.",
          isOutOfStock: false
        },
        {
          id: "ITM-09",
          medicineName: "Ecosprin (Aspirin enteric coated)",
          dosage: "75 mg",
          frequency: "0-1-0 (After lunch)",
          duration: "60 Days",
          instructions: "Antiplatelet therapy.",
          isOutOfStock: true
        }
      ],
      specialInstructions: "Check lipid profile after 60 days."
    }
  ],

  // Patient Custom Dynamic Record Types (Defined by patient Rahul Verma)
  customRecordTypes: [
    {
      id: "REC-TYPE-01",
      patientId: "ML-PAT-1001",
      name: "Blood Glucose (Sugar)",
      category: "Vitals",
      icon: "Activity",
      color: "#0d9488", // teal-600
      description: "Daily fasting & post-prandial blood sugar tracker",
      fields: [
        { key: "fastingSugar", label: "Fasting Sugar", type: "number", unit: "mg/dL", required: true },
        { key: "postPrandialSugar", label: "Post-Prandial Sugar (2 hrs)", type: "number", unit: "mg/dL", required: false },
        { key: "mealNotes", label: "Meal Context / Notes", type: "text", unit: "", required: false },
        { key: "logDate", label: "Date & Time", type: "date", unit: "", required: true }
      ]
    },
    {
      id: "REC-TYPE-02",
      patientId: "ML-PAT-1001",
      name: "Blood Pressure & Pulse",
      category: "Cardio",
      icon: "Heart",
      color: "#ef4444", // red-500
      description: "At-home digital cuff BP recordings",
      fields: [
        { key: "systolic", label: "Systolic Pressure", type: "number", unit: "mmHg", required: true },
        { key: "diastolic", label: "Diastolic Pressure", type: "number", unit: "mmHg", required: true },
        { key: "pulseRate", label: "Pulse Rate", type: "number", unit: "bpm", required: true },
        { key: "armSide", label: "Arm (Left/Right)", type: "text", unit: "", required: false },
        { key: "logDate", label: "Date & Time", type: "date", unit: "", required: true }
      ]
    },
    {
      id: "REC-TYPE-03",
      patientId: "ML-PAT-1001",
      name: "Thyroid & Lipid Lab Panel",
      category: "Lab Diagnostics",
      icon: "FlaskConical",
      color: "#8b5cf6", // purple-500
      description: "Periodic blood test quantitative markers",
      fields: [
        { key: "tsh", label: "TSH Level", type: "number", unit: "uIU/mL", required: true },
        { key: "cholesterolTotal", label: "Total Cholesterol", type: "number", unit: "mg/dL", required: false },
        { key: "hdl", label: "HDL Good Cholesterol", type: "number", unit: "mg/dL", required: false },
        { key: "labName", label: "Testing Laboratory", type: "text", unit: "", required: false },
        { key: "logDate", label: "Test Date", type: "date", unit: "", required: true }
      ]
    }
  ],

  // Entries for the Custom Record Types
  customRecordEntries: [
    // Sugar Entries for charts
    {
      id: "ENT-101",
      recordTypeId: "REC-TYPE-01",
      patientId: "ML-PAT-1001",
      date: "2026-10-25",
      values: { fastingSugar: 108, postPrandialSugar: 142, mealNotes: "Oatmeal with almonds", logDate: "2026-10-25" }
    },
    {
      id: "ENT-102",
      recordTypeId: "REC-TYPE-01",
      patientId: "ML-PAT-1001",
      date: "2026-10-27",
      values: { fastingSugar: 114, postPrandialSugar: 155, mealNotes: "Rice & dal lunch", logDate: "2026-10-27" }
    },
    {
      id: "ENT-103",
      recordTypeId: "REC-TYPE-01",
      patientId: "ML-PAT-1001",
      date: "2026-10-29",
      values: { fastingSugar: 102, postPrandialSugar: 138, mealNotes: "Salad & grilled paneer", logDate: "2026-10-29" }
    },
    {
      id: "ENT-104",
      recordTypeId: "REC-TYPE-01",
      patientId: "ML-PAT-1001",
      date: "2026-10-31",
      values: { fastingSugar: 122, postPrandialSugar: 168, mealNotes: "Festival sweets evening before", logDate: "2026-10-31" }
    },
    {
      id: "ENT-105",
      recordTypeId: "REC-TYPE-01",
      patientId: "ML-PAT-1001",
      date: "2026-11-02",
      values: { fastingSugar: 110, postPrandialSugar: 144, mealNotes: "Normal light dinner", logDate: "2026-11-02" }
    },
    {
      id: "ENT-106",
      recordTypeId: "REC-TYPE-01",
      patientId: "ML-PAT-1001",
      date: "2026-11-04",
      values: { fastingSugar: 105, postPrandialSugar: 139, mealNotes: "Morning walk done before check", logDate: "2026-11-04" }
    },

    // BP Entries for charts
    {
      id: "ENT-201",
      recordTypeId: "REC-TYPE-02",
      patientId: "ML-PAT-1001",
      date: "2026-10-20",
      values: { systolic: 132, diastolic: 86, pulseRate: 76, armSide: "Left Arm", logDate: "2026-10-20" }
    },
    {
      id: "ENT-202",
      recordTypeId: "REC-TYPE-02",
      patientId: "ML-PAT-1001",
      date: "2026-10-25",
      values: { systolic: 128, diastolic: 84, pulseRate: 74, armSide: "Left Arm", logDate: "2026-10-25" }
    },
    {
      id: "ENT-203",
      recordTypeId: "REC-TYPE-02",
      patientId: "ML-PAT-1001",
      date: "2026-10-30",
      values: { systolic: 124, diastolic: 82, pulseRate: 72, armSide: "Left Arm", logDate: "2026-10-30" }
    },
    {
      id: "ENT-204",
      recordTypeId: "REC-TYPE-02",
      patientId: "ML-PAT-1001",
      date: "2026-11-03",
      values: { systolic: 120, diastolic: 80, pulseRate: 71, armSide: "Left Arm", logDate: "2026-11-03" }
    }
  ],

  // Patient Uploaded Documents
  documents: [
    {
      id: "DOC-FILE-01",
      patientId: "ML-PAT-1001",
      title: "Comprehensive Metabolic Panel & HbA1c Report",
      category: "Lab Report",
      fileName: "hba1c_oct2026_apollo.pdf",
      fileSize: "1.4 MB",
      uploadDate: "2026-10-15",
      reportDate: "2026-10-14",
      notes: "Apollo Diagnostics Centre - Fasting blood test",
      previewUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "DOC-FILE-02",
      patientId: "ML-PAT-1001",
      title: "2D Echocardiography & Color Doppler Report",
      category: "X-Ray / Scan",
      fileName: "echo_doppler_aug2026.pdf",
      fileSize: "3.2 MB",
      uploadDate: "2026-08-10",
      reportDate: "2026-08-09",
      notes: "Normal left ventricular systolic function (LVEF 60%), no regional wall motion abnormality.",
      previewUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "DOC-FILE-03",
      patientId: "ML-PAT-1001",
      title: "Chest X-Ray PA View",
      category: "X-Ray / Scan",
      fileName: "chest_xray_pa_2026.jpg",
      fileSize: "2.1 MB",
      uploadDate: "2026-05-12",
      reportDate: "2026-05-12",
      notes: "Clear lung fields, normal cardiothoracic ratio.",
      previewUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop&q=80"
    }
  ],

  // Access Requests & Privacy Center Consents
  accessRequests: [
    {
      id: "REQ-901",
      patientId: "ML-PAT-1001",
      patientName: "Rahul Verma",
      doctorId: "DOC-04",
      doctorName: "Dr. Arjun Menon",
      hospitalName: "BMSCE Healthcare & Research",
      department: "Surgery",
      purpose: "Second Opinion Consultation: Review cardiac history before planned elective surgery",
      requestedScope: "FULL", // "FULL", "PRESCRIPTIONS_ONLY", "LABS_ONLY"
      requestedDuration: "7 Days",
      status: "Pending", // "Pending", "Approved", "Denied", "Revoked"
      requestedAt: "2026-11-04 09:15 AM",
      resolvedAt: null
    },
    {
      id: "REQ-902",
      patientId: "ML-PAT-1001",
      patientName: "Rahul Verma",
      doctorId: "DOC-02",
      doctorName: "Dr. Rajesh Kumar",
      hospitalName: "BMSCE Healthcare & Research",
      department: "General Medicine",
      purpose: "Follow-up review for persistent seasonal allergies and headache",
      requestedScope: "PRESCRIPTIONS_ONLY",
      requestedDuration: "30 Days",
      status: "Approved",
      requestedAt: "2026-10-01 10:00 AM",
      resolvedAt: "2026-10-01 10:30 AM",
      expiresAt: "2026-11-30 10:30 AM"
    }
  ],

  // Active Grants
  accessGrants: [
    {
      id: "GRANT-01",
      requestId: "REQ-902",
      patientId: "ML-PAT-1001",
      doctorId: "DOC-02",
      doctorName: "Dr. Rajesh Kumar",
      hospitalName: "BMSCE Healthcare & Research",
      department: "General Medicine",
      scope: "PRESCRIPTIONS_ONLY",
      grantedAt: "2026-10-01 10:30 AM",
      expiresAt: "2026-11-30 10:30 AM",
      isActive: true
    }
  ],

  // Audit Logs
  auditLogs: [
    {
      id: "LOG-01",
      patientId: "ML-PAT-1001",
      actorId: "DOC-01",
      actorName: "Dr. Priya Sharma",
      actorRole: "Doctor (Cardiology)",
      action: "VIEW",
      resourceType: "PATIENT_PROFILE",
      description: "Dr. Priya Sharma accessed Rahul Verma's clinical profile and vitals before appointment #APT-101",
      timestamp: "2026-11-04 10:28 AM",
      ip: "192.168.1.42"
    },
    {
      id: "LOG-02",
      patientId: "ML-PAT-1001",
      actorId: "DOC-03",
      actorName: "Dr. Sneha Patel",
      actorRole: "Doctor (Endocrinology)",
      action: "CREATE",
      resourceType: "PRESCRIPTION",
      description: "Dr. Sneha Patel generated Prescription #RX-801 with 3 medications",
      timestamp: "2026-10-15 03:45 PM",
      ip: "192.168.1.18"
    },
    {
      id: "LOG-03",
      patientId: "ML-PAT-1001",
      actorId: "PHARM-01",
      actorName: "Suresh Gupta",
      actorRole: "Pharmacist",
      action: "UPDATE",
      resourceType: "PHARMACY_ORDER",
      description: "Dispensed Prescription #RX-801 and issued Token #TK-101",
      timestamp: "2026-10-15 04:12 PM",
      ip: "192.168.1.80"
    },
    {
      id: "LOG-04",
      patientId: "ML-PAT-1001",
      actorId: "USR-PAT-01",
      actorName: "Rahul Verma",
      actorRole: "Patient",
      action: "CONSENT_GRANTED",
      resourceType: "PRIVACY_ACCESS",
      description: "Approved Access Request #REQ-902 for Dr. Rajesh Kumar (Scope: Prescriptions Only)",
      timestamp: "2026-10-01 10:30 AM",
      ip: "106.51.72.19"
    }
  ],

  // Smart Reminders Rules Config
  reminderRules: [
    {
      conditionKeyword: "Kidney Stones",
      title: "Hydration Alert (Urolithiasis Care)",
      message: "Drink at least 250ml of water to prevent stone crystallisation.",
      defaultSchedule: "Every 2 Hours (08:00 AM - 10:00 PM)",
      category: "HYDRATION"
    },
    {
      conditionKeyword: "Type 2 Diabetes",
      title: "Blood Glucose Check",
      message: "Check fasting blood sugar before breakfast and log into Dynamic Records.",
      defaultSchedule: "Daily at 08:00 AM",
      category: "MEASUREMENT"
    },
    {
      conditionKeyword: "Hypertension",
      title: "Blood Pressure Reading",
      message: "Rest for 5 minutes and record your sitting BP with digital cuff.",
      defaultSchedule: "Every Mon & Thu at 09:00 AM",
      category: "MEASUREMENT"
    },
    {
      conditionKeyword: "Asthma",
      title: "Peak Flow & Inhaler Readiness",
      message: "Check peak flow meter and keep emergency inhaler within reach.",
      defaultSchedule: "Daily at 07:30 AM",
      category: "LIFESTYLE"
    }
  ],

  // Patient Reminders
  reminders: [
    {
      id: "REM-01",
      patientId: "ML-PAT-1001",
      source: "RULE_ENGINE",
      title: "Fasting Glucose Morning Check",
      description: "Rule-triggered for Type 2 Diabetes management. Keep under 115 mg/dL.",
      timeSchedule: "08:00 AM Daily",
      category: "MEASUREMENT",
      isEnabled: true
    },
    {
      id: "REM-02",
      patientId: "ML-PAT-1001",
      source: "RULE_ENGINE",
      title: "Sitting Blood Pressure Record",
      description: "Rule-triggered for Hypertension. Normal target < 130/80 mmHg.",
      timeSchedule: "09:00 AM Mon, Wed, Fri",
      category: "MEASUREMENT",
      isEnabled: true
    },
    {
      id: "REM-03",
      patientId: "ML-PAT-1001",
      source: "PRESCRIPTION",
      title: "Metformin 500mg Morning Dose",
      description: "Prescribed by Dr. Sneha Patel. Take after breakfast.",
      timeSchedule: "08:30 AM Daily",
      category: "MEDICATION",
      isEnabled: true
    },
    {
      id: "REM-04",
      patientId: "ML-PAT-1001",
      source: "PRESCRIPTION",
      title: "Telmisartan 40mg (BP Control)",
      description: "Prescribed by Dr. Sneha Patel. Take in morning.",
      timeSchedule: "07:30 AM Daily",
      category: "MEDICATION",
      isEnabled: true
    },
    {
      id: "REM-05",
      patientId: "ML-PAT-1001",
      source: "APPOINTMENT",
      title: "Upcoming Appointment with Dr. Priya Sharma",
      description: "Cardiology consultation at Apollo Multispeciality Hospital.",
      timeSchedule: "Today at 10:30 AM (1 hour before)",
      category: "APPOINTMENT",
      isEnabled: true
    },
    {
      id: "REM-06",
      patientId: "ML-PAT-1002",
      source: "RULE_ENGINE",
      title: "Hydration Alert (Urolithiasis Care)",
      description: "Rule-triggered for Kidney Stones. Drink 250ml water now.",
      timeSchedule: "Every 2 Hours",
      category: "HYDRATION",
      isEnabled: true
    }
  ],

  // Notifications
  notifications: [
    {
      id: "NOTIF-01",
      userId: "USR-PAT-01",
      title: "New Access Request",
      message: "Dr. Arjun Menon (BMSCE Healthcare) requested access to your medical records for a Second Opinion.",
      type: "CONSENT",
      link: "/patient/privacy",
      time: "10 mins ago",
      isRead: false
    },
    {
      id: "NOTIF-02",
      userId: "USR-PAT-01",
      title: "Prescription Prepared",
      message: "Your prescription from Apollo Hospital is being prepared. Pick-up token #TK-101.",
      type: "PHARMACY",
      link: "/patient/dashboard",
      time: "2 hours ago",
      isRead: true
    },
    {
      id: "NOTIF-03",
      userId: "USR-DOC-01",
      title: "Patient Checked In",
      message: "Rahul Verma (ML-PAT-1001) has checked in for the 10:30 AM appointment.",
      type: "APPOINTMENT",
      link: "/doctor/queue",
      time: "5 mins ago",
      isRead: false
    },
    {
      id: "NOTIF-04",
      userId: "USR-PHARM-01",
      title: "New Prescription Incoming",
      message: "New prescription received from Dr. Priya Sharma for Vikram Malhotra.",
      type: "PHARMACY",
      link: "/pharmacy/queue",
      time: "15 mins ago",
      isRead: false
    }
  ]
};
