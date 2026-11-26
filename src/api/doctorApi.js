// ==============================================================================
// Doctor API Layer
// Handles Queue, Consultations, Prescription Builder, Second Opinion Requests
// ==============================================================================

import { getStoredData, setStoredData, delay } from './storage';

export const doctorApi = {
  getDoctors: async () => {
    await delay(100);
    const data = getStoredData();
    return data.doctors;
  },

  getDoctorById: async (id) => {
    await delay(100);
    const data = getStoredData();
    return data.doctors.find(d => d.id === id);
  },

  getPatientDetails: async (patientId, doctorId) => {
    const res = await doctorApi.getPatientDetailsForDoctor(doctorId, patientId);
    if (res.isRestricted) {
      throw new Error(res.message || "Access Restricted by Patient Consent");
    }
    return res.patient;
  },

  getPatientTimeline: async (patientId, doctorId) => {
    await delay(100);
    const data = getStoredData();
    const events = [];
    data.appointments.filter(a => a.patientId === patientId).forEach(apt => {
      events.push({
        id: `apt-${apt.id}`,
        type: 'APPOINTMENT',
        date: apt.date,
        title: `Appointment with ${apt.doctorName}`,
        subtitle: `${apt.hospitalName} • ${apt.department}`,
        description: apt.reason
      });
    });
    data.consultations.filter(c => c.patientId === patientId).forEach(cns => {
      events.push({
        id: `cns-${cns.id}`,
        type: 'CONSULTATION',
        date: cns.date,
        title: `Diagnosis: ${cns.diagnosis}`,
        subtitle: `Dr. ${cns.doctorName} • ${cns.hospitalName}`,
        description: cns.sharedNotes
      });
    });
    data.prescriptions.filter(p => p.patientId === patientId).forEach(rx => {
      events.push({
        id: `rx-${rx.id}`,
        type: 'PRESCRIPTION',
        date: rx.date,
        title: `Prescription #${rx.id}`,
        subtitle: `Prescribed by ${rx.doctorName}`,
        description: rx.items?.map(i => `${i.medicineName || i.name} (${i.dosage})`).join(', ')
      });
    });
    data.documents.filter(d => d.patientId === patientId).forEach(doc => {
      events.push({
        id: `doc-${doc.id}`,
        type: 'DOCUMENT',
        date: doc.reportDate || doc.uploadDate,
        title: doc.title || doc.fileName,
        subtitle: doc.category,
        description: doc.notes
      });
    });
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getDoctorQueue: async (doctorId) => {
    await delay(150);
    const data = getStoredData();
    return data.appointments
      .filter(a => a.doctorId === doctorId)
      .sort((a, b) => {
        // Today's appointments first, then by time slot
        if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
        return a.timeSlot.localeCompare(b.timeSlot);
      });
  },

  // Consent-aware patient details fetch
  // Allowed if:
  // 1. Doctor has an active appointment with the patient, OR
  // 2. Patient has granted access via active accessGrant
  getPatientDetailsForDoctor: async (doctorId, patientId) => {
    await delay(200);
    const data = getStoredData();

    const patient = data.patients.find(p => p.id === patientId);
    if (!patient) throw new Error("Patient ID not found in HealthSync system.");

    // Check relationship or consent
    const hasAppointment = data.appointments.some(
      a => a.doctorId === doctorId && a.patientId === patientId && a.status !== 'Cancelled'
    );

    const activeGrant = data.accessGrants.find(
      g => g.doctorId === doctorId && g.patientId === patientId && g.isActive
    );

    if (!hasAppointment && !activeGrant) {
      // Return redacted privacy shield
      return {
        isRestricted: true,
        patientId: patient.id,
        patientName: patient.name.split(' ')[0] + ' ***', // Redacted name
        gender: patient.gender,
        age: patient.age,
        message: "Consent Required: You do not have an active appointment or approved access grant to view this patient's full medical record."
      };
    }

    // Doctor has legitimate access -> Log audit
    const doctor = data.doctors.find(d => d.id === doctorId);
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      patientId,
      actorId: doctorId,
      actorName: doctor?.name || "Dr. Medical Officer",
      actorRole: `Doctor (${doctor?.specialization || 'Consultant'})`,
      action: "VIEW",
      resourceType: "PATIENT_PROFILE",
      description: `Accessed clinical record for consultation/review (Access mode: ${hasAppointment ? 'Appointment' : 'Second Opinion Grant'})`,
      timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ip: "192.168.1.10"
    });
    setStoredData(data);

    // Filter by scope if it's a grant
    let allowedScope = "FULL";
    if (!hasAppointment && activeGrant) {
      allowedScope = activeGrant.scope;
    }

    return {
      isRestricted: false,
      scope: allowedScope,
      patient,
      consultations: data.consultations.filter(c => c.patientId === patientId),
      prescriptions: data.prescriptions.filter(rx => rx.patientId === patientId),
      documents: allowedScope === "PRESCRIPTIONS_ONLY" ? [] : data.documents.filter(d => d.patientId === patientId),
      customRecordTypes: allowedScope === "PRESCRIPTIONS_ONLY" ? [] : data.customRecordTypes.filter(t => t.patientId === patientId),
      customRecordEntries: allowedScope === "PRESCRIPTIONS_ONLY" ? [] : data.customRecordEntries.filter(e => e.patientId === patientId)
    };
  },

  // Save consultation & auto-dispatch prescription to pharmacy queue
  saveConsultationAndPrescription: async (payload) => {
    await delay(300);
    const data = getStoredData();

    const {
      appointmentId,
      patientId,
      doctorId,
      diagnosis,
      symptoms,
      vitals,
      sharedNotes,
      futureDoctorNotes,
      isPrivateNotes,
      privateNotes,
      medicines,
      specialInstructions,
      scannedImageUrl,
      ocrRawText
    } = payload;

    const patient = data.patients.find(p => p.id === patientId);
    const doctor = data.doctors.find(d => d.id === doctorId);

    const consultationId = `CNS-${Date.now().toString().slice(-4)}`;
    const prescriptionId = `RX-${Date.now().toString().slice(-4)}`;

    // 1. Create Consultation
    const newConsultation = {
      id: consultationId,
      appointmentId: appointmentId || `APT-DIRECT-${Date.now()}`,
      patientId,
      doctorId,
      doctorName: doctor?.name || "Dr. Treating Physician",
      hospitalName: doctor?.hospitalName || "Apollo Multispeciality Hospital",
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      symptoms,
      vitals: vitals || {},
      sharedNotes,
      futureDoctorNotes,
      isPrivateNotes: !!isPrivateNotes,
      privateNotes: isPrivateNotes ? privateNotes : "",
      prescriptionId: medicines && medicines.length > 0 ? prescriptionId : null
    };
    data.consultations.unshift(newConsultation);

    // 2. If appointment exists, update status to Completed
    if (appointmentId) {
      const aptIndex = data.appointments.findIndex(a => a.id === appointmentId);
      if (aptIndex !== -1) {
        data.appointments[aptIndex].status = "Completed";
      }
    }

    // 3. Create Prescription if medicines provided
    let newPrescription = null;
    if (medicines && medicines.length > 0) {
      newPrescription = {
        id: prescriptionId,
        consultationId,
        patientId,
        patientName: patient?.name || "Patient",
        doctorId,
        doctorName: doctor?.name || "Dr. Treating Physician",
        hospitalId: doctor?.hospitalId || "HOSP-01",
        hospitalName: doctor?.hospitalName || "Apollo Multispeciality Hospital",
        date: new Date().toISOString().split('T')[0],
        status: "Sent", // Instantly routed to Pharmacist Live Queue
        pickupToken: null,
        items: medicines.map((m, idx) => ({
          id: `ITM-${Date.now()}-${idx}`,
          medicineName: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions || "",
          isOutOfStock: false
        })),
        specialInstructions: specialInstructions || "",
        scannedImageUrl: scannedImageUrl || null,
        ocrRawText: ocrRawText || null
      };

      data.prescriptions.unshift(newPrescription);

      // Auto-generate medication smart reminders for the patient
      medicines.forEach((med, i) => {
        data.reminders.push({
          id: `REM-${Date.now()}-${i}`,
          patientId,
          source: "PRESCRIPTION",
          title: `${med.medicineName} ${med.dosage}`,
          description: `Dosage: ${med.frequency} for ${med.duration}. Instructions: ${med.instructions || 'As prescribed'}.`,
          timeSchedule: med.frequency.includes('1-0-1') ? "08:30 AM & 08:30 PM" : "09:00 AM Daily",
          category: "MEDICATION",
          isEnabled: true
        });
      });

      // Dispatch alert to Pharmacists
      data.notifications.unshift({
        id: `NOTIF-${Date.now()}-ph`,
        userId: "USR-PHARM-01",
        title: "New Prescription Received",
        message: `Prescription #${prescriptionId} for ${patient?.name} sent by ${doctor?.name}.`,
        type: "PHARMACY",
        link: "/pharmacy/queue",
        time: "Just now",
        isRead: false
      });

      // Dispatch alert to Patient
      data.notifications.unshift({
        id: `NOTIF-${Date.now()}-pt`,
        userId: patient?.userId || "USR-PAT-01",
        title: "Prescription Sent to Pharmacy",
        message: `${doctor?.name} issued Prescription #${prescriptionId}. Processing at ${doctor?.hospitalName} Pharmacy.`,
        type: "PRESCRIPTION",
        link: "/patient/dashboard",
        time: "Just now",
        isRead: false
      });
    }

    // 4. Audit Log
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      patientId,
      actorId: doctorId,
      actorName: doctor?.name || "Doctor",
      actorRole: "Doctor",
      action: "CREATE",
      resourceType: "CONSULTATION_PRESCRIPTION",
      description: `Completed consultation & issued Prescription #${prescriptionId} with ${medicines?.length || 0} items`,
      timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ip: "192.168.1.10"
    });

    setStoredData(data);
    return { consultation: newConsultation, prescription: newPrescription };
  },

  // Second Opinion: Request Access
  requestSecondOpinionAccess: async ({ doctorId, patientId, purpose, requestedScope, requestedDuration }) => {
    await delay(250);
    const data = getStoredData();

    const patient = data.patients.find(p => p.id === patientId);
    if (!patient) throw new Error(`Patient ID "${patientId}" not found in HealthSync database.`);

    const doctor = data.doctors.find(d => d.id === doctorId);

    const newRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      patientId,
      patientName: patient.name,
      doctorId,
      doctorName: doctor?.name || "Dr. Medical Specialist",
      hospitalName: doctor?.hospitalName || "Partner Hospital",
      department: doctor?.department || "Specialist Clinic",
      purpose: purpose || "Second opinion clinical evaluation",
      requestedScope: requestedScope || "FULL",
      requestedDuration: requestedDuration || "7 Days",
      status: "Pending",
      requestedAt: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
      resolvedAt: null
    };

    data.accessRequests.unshift(newRequest);

    // Notify patient
    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      userId: patient.userId,
      title: "New Access Request",
      message: `${doctor?.name} (${doctor?.hospitalName}) requested access to your medical record for: "${purpose}"`,
      type: "CONSENT",
      link: "/patient/privacy",
      time: "Just now",
      isRead: false
    });

    setStoredData(data);
    return newRequest;
  },

  getDoctorAccessRequests: async (doctorId) => {
    await delay(120);
    const data = getStoredData();
    return data.accessRequests.filter(r => r.doctorId === doctorId);
  }
};
