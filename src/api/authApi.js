// ==============================================================================
// Authentication & Persona Switcher API Layer
// ==============================================================================

import { getStoredData, delay } from './storage';

export const authApi = {
  // Pre-configured demo personas for fast switching in presentation
  getDemoPersonas: async () => {
    await delay(50);
    return [
      {
        role: "PATIENT",
        name: "Rahul Verma",
        id: "ML-PAT-1001",
        email: "rahul@gmail.com",
        title: "Patient (Type 2 Diabetes, HTN)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        badge: "Patient Portal",
        portalPath: "/patient/dashboard"
      },
      {
        role: "DOCTOR",
        name: "Dr. Priya Sharma",
        id: "DOC-01",
        email: "dr.priya@healthsync.com",
        title: "Chief Cardiologist (Apollo Hospital)",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
        badge: "Doctor Portal",
        portalPath: "/doctor/queue"
      },
      {
        role: "DOCTOR",
        name: "Dr. Arjun Menon",
        id: "DOC-04",
        email: "dr.arjun@healthsync.com",
        title: "Consultant Surgeon (Second Opinion Requester)",
        avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
        badge: "Second Opinion Doctor",
        portalPath: "/doctor/second-opinion"
      },
      {
        role: "HOSPITAL",
        name: "Anita Desai",
        id: "REC-01",
        email: "reception@bmsce.edu",
        title: "Hospital Receptionist (BMSCE Healthcare)",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        badge: "Hospital Admin Portal",
        portalPath: "/hospital/overview"
      },
      {
        role: "PHARMACIST",
        name: "Suresh Gupta, R.Ph.",
        id: "PHARM-01",
        email: "pharmacy.apollo@healthsync.com",
        title: "Lead Pharmacist (Apollo Dispensary)",
        avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80",
        badge: "Pharmacy Portal",
        portalPath: "/pharmacist/queue"
      }
    ];
  },

  login: async (email, password, requestedRole = null) => {
    await delay(120);
    const data = getStoredData();
    const cleanEmail = (email || '').toLowerCase().trim();

    // 1. Check patients
    const patient = data.patients?.find(p => p.email?.toLowerCase() === cleanEmail);
    if (patient) {
      return {
        token: `mock-jwt-token-patient-${patient.id}`,
        user: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          role: "PATIENT",
          patientId: patient.id,
          avatar: patient.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        }
      };
    }

    // 2. Check doctors
    const doctor = data.doctors?.find(d => d.email?.toLowerCase() === cleanEmail);
    if (doctor) {
      return {
        token: `mock-jwt-token-doc-${doctor.id}`,
        user: {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          role: "DOCTOR",
          doctorId: doctor.id,
          hospitalId: doctor.hospitalId,
          hospitalName: doctor.hospitalName,
          specialization: doctor.specialization,
          avatar: doctor.avatar
        }
      };
    }

    // 3. Check pharmacists
    const pharmacist = data.pharmacists?.find(ph => ph.email?.toLowerCase() === cleanEmail);
    if (pharmacist) {
      return {
        token: `mock-jwt-token-pharm-${pharmacist.id}`,
        user: {
          id: pharmacist.id,
          name: pharmacist.name,
          email: pharmacist.email,
          role: "PHARMACIST",
          pharmacistId: pharmacist.id,
          hospitalId: pharmacist.hospitalId,
          hospitalName: pharmacist.hospitalName,
          counter: pharmacist.counter,
          avatar: pharmacist.avatar || "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80"
        }
      };
    }

    // 4. Check receptionists / hospital admin
    const receptionist = data.receptionists?.find(r => r.email?.toLowerCase() === cleanEmail);
    if (receptionist) {
      return {
        token: `mock-jwt-token-rec-${receptionist.id}`,
        user: {
          id: receptionist.id,
          name: receptionist.name,
          email: receptionist.email,
          role: "HOSPITAL",
          hospitalId: receptionist.hospitalId,
          hospitalName: receptionist.hospitalName,
          title: receptionist.role,
          avatar: receptionist.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
        }
      };
    }

    // 5. Automatic Fallback: instant demo login for the selected role
    const role = (requestedRole || 'PATIENT').toUpperCase();
    if (role === 'DOCTOR') {
      return {
        token: 'mock-jwt-token-doc-DOC-01',
        user: {
          id: 'DOC-01',
          name: 'Dr. Priya Sharma',
          email: cleanEmail || 'dr.priya@healthsync.com',
          role: 'DOCTOR',
          doctorId: 'DOC-01',
          hospitalId: 'HOSP-01',
          hospitalName: 'Apollo Multispeciality Hospital',
          specialization: 'Chief Cardiologist',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
        }
      };
    } else if (role === 'HOSPITAL') {
      return {
        token: 'mock-jwt-token-rec-REC-01',
        user: {
          id: 'REC-01',
          name: 'Anita Desai',
          email: cleanEmail || 'reception@bmsce.edu',
          role: 'HOSPITAL',
          hospitalId: 'HOSP-02',
          hospitalName: 'BMSCE Healthcare & Research',
          title: 'Front Desk Administrator',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        }
      };
    } else if (role === 'PHARMACIST') {
      return {
        token: 'mock-jwt-token-pharm-PHARM-01',
        user: {
          id: 'PHARM-01',
          name: 'Suresh Gupta, R.Ph.',
          email: cleanEmail || 'pharmacy.apollo@healthsync.com',
          role: 'PHARMACIST',
          pharmacistId: 'PHARM-01',
          hospitalId: 'HOSP-01',
          hospitalName: 'Apollo Main Pharmacy',
          counter: 'Counter 1 - FastTrack',
          avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80'
        }
      };
    } else {
      // Default to PATIENT
      return {
        token: 'mock-jwt-token-patient-ML-PAT-1001',
        user: {
          id: 'ML-PAT-1001',
          name: 'Rahul Verma',
          email: cleanEmail || 'rahul@gmail.com',
          role: 'PATIENT',
          patientId: 'ML-PAT-1001',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        }
      };
    }
  }
};
