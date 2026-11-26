// ==============================================================================
// Hospital Portal API Layer
// Handles Patient Registration, Appointment Booking, Staff Directory, Stats
// ==============================================================================

import { getStoredData, setStoredData, delay } from './storage';

export const hospitalApi = {
  getHospitals: async () => {
    await delay(100);
    const data = getStoredData();
    return data.hospitals;
  },

  getDashboardStats: async (hospitalId) => {
    return hospitalApi.getHospitalStats(hospitalId);
  },

  getDoctorsByHospital: async (hospitalId) => {
    await delay(100);
    const data = getStoredData();
    if (hospitalId) {
      return data.doctors.filter(d => d.hospitalId === hospitalId);
    }
    return data.doctors;
  },

  getHospitalStats: async (hospitalId) => {
    await delay(150);
    const data = getStoredData();
    const today = new Date().toISOString().split('T')[0];

    // Filter appointments for hospital (or all if not specified)
    const hospitalAppointments = hospitalId 
      ? data.appointments.filter(a => a.hospitalId === hospitalId)
      : data.appointments;

    const todayAppointments = hospitalAppointments.filter(a => a.date === today);
    const completedToday = todayAppointments.filter(a => a.status === 'Completed').length;
    const inProgressToday = todayAppointments.filter(a => a.status === 'In Progress').length;
    const scheduledToday = todayAppointments.filter(a => a.status === 'Scheduled').length;

    const doctors = hospitalId 
      ? data.doctors.filter(d => d.hospitalId === hospitalId)
      : data.doctors;
    const doctorsOnDuty = doctors.filter(d => d.isOnDuty).length;

    const pendingPrescriptions = data.prescriptions.filter(
      rx => rx.status === 'Sent' || rx.status === 'Preparing'
    ).length;

    return {
      todayTotalAppointments: todayAppointments.length,
      completedToday,
      inProgressToday,
      scheduledToday,
      totalDoctors: doctors.length,
      doctorsOnDuty,
      totalPatients: data.patients.length,
      pendingPrescriptions
    };
  },

  // Search patients by ID, Name, or Phone
  searchPatients: async (query) => {
    await delay(120);
    const data = getStoredData();
    if (!query || !query.trim()) return data.patients;

    const q = query.toLowerCase().trim();
    return data.patients.filter(p => 
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.email.toLowerCase().includes(q)
    );
  },

  // Register new patient with auto-generated HealthSync ID and QR code hash
  registerPatient: async (patientData) => {
    await delay(300);
    const data = getStoredData();

    // Generate unique Patient ID e.g. ML-PAT-1006
    const nextNum = 1000 + data.patients.length + 1;
    const patientId = `ML-PAT-${nextNum}`;
    const qrCode = `HEALTHSYNC-PAT-${patientId}-SECURE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const newPatient = {
      id: patientId,
      userId: `USR-PAT-${nextNum}`,
      name: patientData.name,
      email: patientData.email,
      phone: patientData.phone,
      dob: patientData.dob,
      age: patientData.age || 25,
      gender: patientData.gender,
      bloodGroup: patientData.bloodGroup,
      address: patientData.address,
      qrCode,
      emergencyContact: {
        name: patientData.emergencyContactName || "Guardian",
        relation: patientData.emergencyContactRelation || "Relative",
        phone: patientData.emergencyContactPhone || patientData.phone
      },
      healthProfile: {
        height: Number(patientData.height) || 170,
        weight: Number(patientData.weight) || 68,
        bmi: 23.5,
        allergies: patientData.allergies ? patientData.allergies.split(',').map(s => s.trim()) : [],
        chronicConditions: patientData.chronicConditions ? patientData.chronicConditions.split(',').map(s => s.trim()) : [],
        familyHistory: patientData.familyHistory || "No significant reported family history.",
        insurance: {
          provider: patientData.insuranceProvider || "Direct Self Pay",
          policyNumber: patientData.insurancePolicyNumber || "N/A",
          validTill: "2027-12-31",
          coverageLimit: "₹5,00,000"
        }
      }
    };

    data.patients.unshift(newPatient);

    // Initial audit log
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      patientId,
      actorId: "HOSP-ADMIN",
      actorName: "Hospital Reception Desk",
      actorRole: "Hospital Admin",
      action: "CREATE",
      resourceType: "PATIENT_PROFILE",
      description: `Registered new patient ${newPatient.name} with ID ${patientId}`,
      timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ip: "192.168.1.1"
    });

    setStoredData(data);
    return newPatient;
  },

  // Book an appointment
  bookAppointment: async ({ patientId, hospitalId, doctorId, department, date, timeSlot, reason }) => {
    await delay(250);
    const data = getStoredData();

    const patient = data.patients.find(p => p.id === patientId);
    if (!patient) throw new Error("Patient not found");

    const doctor = data.doctors.find(d => d.id === doctorId);
    if (!doctor) throw new Error("Doctor not found");

    const hospital = data.hospitals.find(h => h.id === (hospitalId || doctor.hospitalId));

    const tokenPrefix = department.charAt(0).toUpperCase();
    const tokenNum = Math.floor(Math.random() * 80) + 10;
    const tokenNumber = `${tokenPrefix}-${tokenNum}`;

    const newAppointment = {
      id: `APT-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      doctorId: doctor.id,
      doctorName: doctor.name,
      hospitalId: hospital?.id || "HOSP-01",
      hospitalName: hospital?.name || "Apollo Multispeciality Hospital",
      department: department || doctor.department,
      date,
      timeSlot,
      status: "Scheduled",
      reason: reason || "General Medical Consultation",
      tokenNumber
    };

    data.appointments.unshift(newAppointment);

    // Create appointment reminder for the patient
    data.reminders.push({
      id: `REM-APT-${newAppointment.id}`,
      patientId: patient.id,
      source: "APPOINTMENT",
      title: `Upcoming Consultation with ${doctor.name}`,
      description: `Scheduled at ${hospital?.name} (${newAppointment.department}) on ${date} at ${timeSlot}. Token #${tokenNumber}.`,
      timeSchedule: `${date} at ${timeSlot}`,
      category: "APPOINTMENT",
      isEnabled: true
    });

    // Notify patient
    data.notifications.unshift({
      id: `NOTIF-${Date.now()}-apt-pt`,
      userId: patient.userId,
      title: "Appointment Confirmed",
      message: `Your appointment with ${doctor.name} at ${hospital?.name} is confirmed for ${date} at ${timeSlot}. Token #${tokenNumber}.`,
      type: "APPOINTMENT",
      link: "/patient/dashboard",
      time: "Just now",
      isRead: false
    });

    // Notify doctor
    data.notifications.unshift({
      id: `NOTIF-${Date.now()}-apt-doc`,
      userId: doctor.userId,
      title: "New Appointment Booked",
      message: `New booking: ${patient.name} (${patient.id}) for ${date} at ${timeSlot}.`,
      type: "APPOINTMENT",
      link: "/doctor/queue",
      time: "Just now",
      isRead: false
    });

    setStoredData(data);
    return newAppointment;
  },

  // Get appointments with filtering
  getAppointments: async ({ hospitalId, status, date, search }) => {
    await delay(120);
    const data = getStoredData();
    let list = [...data.appointments];

    if (hospitalId) list = list.filter(a => a.hospitalId === hospitalId);
    if (status && status !== 'ALL') list = list.filter(a => a.status === status);
    if (date) list = list.filter(a => a.date === date);
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(a => 
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.patientId.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  updateAppointmentStatus: async (appointmentId, newStatus) => {
    await delay(150);
    const data = getStoredData();
    const aptIndex = data.appointments.findIndex(a => a.id === appointmentId);
    if (aptIndex === -1) throw new Error("Appointment not found");

    data.appointments[aptIndex].status = newStatus;
    setStoredData(data);
    return data.appointments[aptIndex];
  },

  // Staff Management (Add/List doctors & pharmacists)
  addDoctor: async (doctorData) => {
    await delay(250);
    const data = getStoredData();
    const newDoc = {
      id: `DOC-0${data.doctors.length + 1}`,
      userId: `USR-DOC-0${data.doctors.length + 1}`,
      name: doctorData.name,
      email: doctorData.email,
      hospitalId: doctorData.hospitalId || "HOSP-01",
      hospitalName: doctorData.hospitalName || "Apollo Multispeciality Hospital",
      specialization: doctorData.specialization,
      department: doctorData.department,
      qualification: doctorData.qualification || "MBBS, MD",
      licenseNumber: doctorData.licenseNumber,
      consultationFee: Number(doctorData.consultationFee) || 500,
      isOnDuty: true,
      availableSlots: ["09:30 AM", "11:30 AM", "02:30 PM", "04:30 PM"],
      avatar: doctorData.gender === "Female" 
        ? "https://images.unsplash.com/photo-1594824813637-23f2f01f65d6?w=150&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
    };

    data.doctors.push(newDoc);
    setStoredData(data);
    return newDoc;
  },

  addPharmacist: async (pharmData) => {
    await delay(250);
    const data = getStoredData();
    const newPharm = {
      id: `PHARM-0${data.pharmacists.length + 1}`,
      userId: `USR-PHARM-0${data.pharmacists.length + 1}`,
      name: pharmData.name,
      email: pharmData.email,
      hospitalId: pharmData.hospitalId || "HOSP-01",
      hospitalName: pharmData.hospitalName || "Apollo Main Pharmacy",
      counter: pharmData.counter || `Counter ${data.pharmacists.length + 1}`,
      licenseNumber: pharmData.licenseNumber || `PH-KAR-${Math.floor(Math.random() * 9000) + 1000}`
    };

    data.pharmacists.push(newPharm);
    setStoredData(data);
    return newPharm;
  }
};
