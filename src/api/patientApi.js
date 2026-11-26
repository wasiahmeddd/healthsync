// ==============================================================================
// Patient API Layer
// Handles Patient records, custom dynamic metrics, timeline, and health profile
// ==============================================================================

import { getStoredData, setStoredData, delay } from './storage';

export const patientApi = {
  getPatients: async () => {
    await delay(120);
    const data = getStoredData();
    return data.patients;
  },

  getPatientById: async (id) => {
    await delay(100);
    const data = getStoredData();
    const patient = data.patients.find(p => p.id === id);
    if (!patient) throw new Error(`Patient ${id} not found`);
    return patient;
  },

  updateHealthProfile: async (patientId, profileData) => {
    await delay(200);
    const data = getStoredData();
    const patientIndex = data.patients.findIndex(p => p.id === patientId);
    if (patientIndex === -1) throw new Error("Patient not found");

    data.patients[patientIndex].healthProfile = {
      ...data.patients[patientIndex].healthProfile,
      ...profileData
    };

    // Log audit
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      patientId,
      actorId: patientId,
      actorName: data.patients[patientIndex].name,
      actorRole: "Patient",
      action: "UPDATE",
      resourceType: "HEALTH_PROFILE",
      description: "Updated health profile vitals / conditions / allergies",
      timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ip: "106.51.72.19"
    });

    setStoredData(data);
    return data.patients[patientIndex];
  },

  // Dynamic Custom Record Categories
  getCustomRecordTypes: async (patientId) => {
    await delay(100);
    const data = getStoredData();
    return data.customRecordTypes.filter(t => t.patientId === patientId);
  },

  createCustomRecordType: async (patientId, recordTypeData) => {
    await delay(200);
    const data = getStoredData();
    const newType = {
      id: `REC-TYPE-${Date.now()}`,
      patientId,
      name: recordTypeData.name,
      category: recordTypeData.category || "Vitals",
      icon: recordTypeData.icon || "Activity",
      color: recordTypeData.color || "#0d9488",
      description: recordTypeData.description || "",
      fields: recordTypeData.fields || []
    };

    data.customRecordTypes.push(newType);
    setStoredData(data);
    return newType;
  },

  getCustomRecordEntries: async (patientId, recordTypeId) => {
    await delay(100);
    const data = getStoredData();
    let entries = data.customRecordEntries.filter(e => e.patientId === patientId);
    if (recordTypeId) {
      entries = entries.filter(e => e.recordTypeId === recordTypeId);
    }
    return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  addCustomRecordEntry: async (patientId, recordTypeId, values) => {
    await delay(200);
    const data = getStoredData();
    const newEntry = {
      id: `ENT-${Date.now()}`,
      recordTypeId,
      patientId,
      date: values.logDate || new Date().toISOString().split('T')[0],
      values: { ...values }
    };

    data.customRecordEntries.push(newEntry);

    // Audit log
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      patientId,
      actorId: patientId,
      actorName: data.patients.find(p => p.id === patientId)?.name || "Patient",
      actorRole: "Patient",
      action: "CREATE",
      resourceType: "CUSTOM_RECORD",
      description: `Added new measurement entry for ${data.customRecordTypes.find(t => t.id === recordTypeId)?.name || 'Custom Metric'}`,
      timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ip: "106.51.72.19"
    });

    setStoredData(data);
    return newEntry;
  },

  // Uploaded Documents
  getDocuments: async (patientId) => {
    await delay(100);
    const data = getStoredData();
    return data.documents.filter(d => d.patientId === patientId);
  },

  uploadDocument: async (patientId, documentData) => {
    await delay(250);
    const data = getStoredData();
    const newDoc = {
      id: `DOC-FILE-${Date.now()}`,
      patientId,
      title: documentData.title,
      category: documentData.category,
      fileName: documentData.fileName || "uploaded_document.pdf",
      fileSize: documentData.fileSize || "1.2 MB",
      uploadDate: new Date().toISOString().split('T')[0],
      reportDate: documentData.reportDate || new Date().toISOString().split('T')[0],
      notes: documentData.notes || "",
      previewUrl: documentData.previewUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80"
    };

    data.documents.unshift(newDoc);
    setStoredData(data);
    return newDoc;
  },

  // Prescriptions for patient
  getPrescriptions: async (patientId) => {
    await delay(120);
    const data = getStoredData();
    return data.prescriptions
      .filter(rx => rx.patientId === patientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  // Merged Timeline (Chronological aggregate of all clinical events)
  getTimeline: async (patientId) => {
    await delay(150);
    const data = getStoredData();
    const events = [];

    // 1. Appointments
    const appointments = data.appointments.filter(a => a.patientId === patientId);
    appointments.forEach(apt => {
      events.push({
        id: `evt-apt-${apt.id}`,
        type: "APPOINTMENT",
        date: apt.date,
        time: apt.timeSlot,
        title: `Appointment with ${apt.doctorName}`,
        badge: apt.status,
        subtitle: `${apt.hospitalName} • ${apt.department}`,
        description: apt.reason,
        raw: apt
      });
    });

    // 2. Consultations
    const consultations = data.consultations.filter(c => c.patientId === patientId);
    consultations.forEach(cns => {
      events.push({
        id: `evt-cns-${cns.id}`,
        type: "CONSULTATION",
        date: cns.date,
        time: "Clinical Note",
        title: `Diagnosis: ${cns.diagnosis}`,
        badge: "Diagnosis",
        subtitle: `Dr. ${cns.doctorName} • ${cns.hospitalName}`,
        description: cns.sharedNotes,
        futureNotes: cns.futureDoctorNotes,
        vitals: cns.vitals,
        raw: cns
      });
    });

    // 3. Prescriptions
    const prescriptions = data.prescriptions.filter(rx => rx.patientId === patientId);
    prescriptions.forEach(rx => {
      events.push({
        id: `evt-rx-${rx.id}`,
        type: "PRESCRIPTION",
        date: rx.date,
        time: "Prescription",
        title: `Prescription #${rx.id} (${rx.items.length} Medicines)`,
        badge: rx.status,
        subtitle: `Prescribed by ${rx.doctorName}`,
        items: rx.items,
        instructions: rx.specialInstructions,
        pickupToken: rx.pickupToken,
        raw: rx
      });
    });

    // 4. Documents
    const documents = data.documents.filter(d => d.patientId === patientId);
    documents.forEach(doc => {
      events.push({
        id: `evt-doc-${doc.id}`,
        type: "DOCUMENT",
        date: doc.reportDate,
        time: "Uploaded Report",
        title: doc.title,
        badge: doc.category,
        subtitle: `${doc.fileName} (${doc.fileSize})`,
        description: doc.notes,
        raw: doc
      });
    });

    // Sort descending by date
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
};
