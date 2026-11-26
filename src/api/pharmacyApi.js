// ==============================================================================
// Pharmacist Portal API Layer
// Live Queue, Dispensation workflow, Token generation, and Stock alerts
// ==============================================================================

import { getStoredData, setStoredData, delay } from './storage';

export const pharmacyApi = {
  // Live prescription queue (Pending, Preparing, Ready, Dispensed)
  getPrescriptionQueue: async (hospitalId) => {
    await delay(150);
    const data = getStoredData();
    let queue = data.prescriptions;
    if (hospitalId) {
      queue = queue.filter(rx => rx.hospitalId === hospitalId);
    }
    // Newest first
    return queue.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  // Update status: Sent -> Preparing -> Ready for Pickup -> Dispensed
  updatePrescriptionStatus: async ({ prescriptionId, newStatus, pharmacistId, pharmacistName }) => {
    await delay(250);
    const data = getStoredData();

    const rxIndex = data.prescriptions.findIndex(rx => rx.id === prescriptionId);
    if (rxIndex === -1) throw new Error("Prescription not found");

    const rx = data.prescriptions[rxIndex];
    rx.status = newStatus;

    // If marked "Ready for Pickup", auto-assign a clean token if not already assigned
    if (newStatus === "Ready for Pickup" && !rx.pickupToken) {
      const tokenNumber = `TK-${Math.floor(Math.random() * 90) + 10}`;
      rx.pickupToken = tokenNumber;
    }

    const patient = data.patients.find(p => p.id === rx.patientId);

    // If marked "Ready for Pickup", trigger real-time patient notification with token!
    if (newStatus === "Ready for Pickup") {
      data.notifications.unshift({
        id: `NOTIF-${Date.now()}-ph-ready`,
        userId: patient?.userId || "USR-PAT-01",
        title: "Medicines Ready for Pickup! 💊",
        message: `Your prescription #${rx.id} is ready at ${rx.hospitalName} Pharmacy. Please show Token #${rx.pickupToken} at Counter.`,
        type: "PHARMACY",
        link: "/patient/dashboard",
        time: "Just now",
        isRead: false
      });
    }

    // If dispensed, log audit
    if (newStatus === "Dispensed") {
      data.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        patientId: rx.patientId,
        actorId: pharmacistId || "PHARM-SYS",
        actorName: pharmacistName || "Dispensing Pharmacist",
        actorRole: "Pharmacist",
        action: "UPDATE",
        resourceType: "PHARMACY_ORDER",
        description: `Prescription #${rx.id} marked as fully Dispensed to patient (Token #${rx.pickupToken})`,
        timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ip: "192.168.1.80"
      });
    }

    setStoredData(data);
    return rx;
  },

  // Toggle medicine stock-out flag
  toggleMedicineStock: async ({ prescriptionId, itemId, isOutOfStock }) => {
    await delay(200);
    const data = getStoredData();

    const rx = data.prescriptions.find(r => r.id === prescriptionId);
    if (!rx) throw new Error("Prescription not found");

    const item = rx.items.find(i => i.id === itemId);
    if (!item) throw new Error("Medicine item not found");

    item.isOutOfStock = isOutOfStock;

    if (isOutOfStock) {
      // Notify Doctor and Patient
      const patient = data.patients.find(p => p.id === rx.patientId);
      const doctor = data.doctors.find(d => d.id === rx.doctorId);

      if (patient) {
        data.notifications.unshift({
          id: `NOTIF-${Date.now()}-stock-pt`,
          userId: patient.userId,
          title: "Medicine Out of Stock Alert",
          message: `Notice: "${item.medicineName}" from Prescription #${rx.id} is currently out of stock. Alternate formulation requested.`,
          type: "PHARMACY",
          link: "/patient/dashboard",
          time: "Just now",
          isRead: false
        });
      }

      if (doctor) {
        data.notifications.unshift({
          id: `NOTIF-${Date.now()}-stock-doc`,
          userId: doctor.userId,
          title: "Medicine Stock-out Notice",
          message: `Pharmacy reported "${item.medicineName}" out of stock for patient ${rx.patientName}.`,
          type: "PHARMACY",
          link: "/doctor/queue",
          time: "Just now",
          isRead: false
        });
      }
    }

    setStoredData(data);
    return item;
  }
};
