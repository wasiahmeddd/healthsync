import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public / Landing
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { EditPage } from './pages/dev/EditPage';

// 1. Hospital Portal
import { HospitalOverviewPage } from './pages/hospital/HospitalOverviewPage';
import { HospitalAppointmentsPage } from './pages/hospital/HospitalAppointmentsPage';
import { HospitalBookAppointmentPage } from './pages/hospital/HospitalBookAppointmentPage';
import { HospitalRegisterPatientPage } from './pages/hospital/HospitalRegisterPatientPage';
import { ManageStaffPage } from './pages/hospital/ManageStaffPage';

// 2. Doctor Portal
import { DoctorQueue } from './pages/doctor/DoctorQueue';
import { ConsultationPage } from './pages/doctor/ConsultationPage';
import { SecondOpinionPage } from './pages/doctor/SecondOpinionPage';
import { DoctorPatientDetailPage } from './pages/doctor/DoctorPatientDetailPage';
import { ScanPrescriptionPage } from './pages/doctor/ScanPrescriptionPage';

// 3. Patient Portal
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientTimeline } from './pages/patient/PatientTimeline';
import { HealthProfilePage } from './pages/patient/HealthProfilePage';
import { DynamicRecordsPage } from './pages/patient/DynamicRecordsPage';
import { PrivacyCenterPage } from './pages/patient/PrivacyCenterPage';
import { SmartRemindersPage } from './pages/patient/SmartRemindersPage';
import { PatientPrescriptionsPage } from './pages/patient/PatientPrescriptionsPage';
import { PatientDocumentsPage } from './pages/patient/PatientDocumentsPage';

// 4. Pharmacist Portal
import { PharmacyQueue } from './pages/pharmacy/PharmacyQueue';
import { PharmacyStockPage } from './pages/pharmacy/PharmacyStockPage';

// Shared
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Standalone Landing & Presentation Links */}
              <Route path="/home" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/edit" element={<EditPage />} />

              {/* 4 Portals in MainLayout — 100% Clickable & Open for Presentation */}
              <Route element={<MainLayout />}>
                {/* Default route jumps straight into Hospital Portal */}
                <Route path="/" element={<Navigate to="/hospital" replace />} />

                {/* ── 1. HOSPITAL PORTAL ── */}
                <Route path="/hospital" element={<HospitalOverviewPage />} />
                <Route path="/hospital/overview" element={<HospitalOverviewPage />} />
                <Route path="/hospital/appointments" element={<HospitalAppointmentsPage />} />
                <Route path="/hospital/book-appointment" element={<HospitalBookAppointmentPage />} />
                <Route path="/hospital/register-patient" element={<HospitalRegisterPatientPage />} />
                <Route path="/hospital/staff" element={<ManageStaffPage />} />
                <Route path="/hospital/dashboard" element={<Navigate to="/hospital" replace />} />
                <Route path="/hospital/register" element={<Navigate to="/hospital/register-patient" replace />} />
                <Route path="/hospital/book" element={<Navigate to="/hospital/book-appointment" replace />} />

                {/* ── 2. DOCTOR PORTAL ── */}
                <Route path="/doctor" element={<DoctorQueue />} />
                <Route path="/doctor/queue" element={<DoctorQueue />} />
                <Route path="/doctor/patients/:patientId" element={<DoctorPatientDetailPage />} />
                <Route path="/doctor/consultation/:appointmentId" element={<ConsultationPage />} />
                <Route path="/doctor/consultation" element={<ConsultationPage />} />
                <Route path="/doctor/scan-prescription" element={<ScanPrescriptionPage />} />
                <Route path="/doctor/second-opinion" element={<SecondOpinionPage />} />

                {/* ── 3. PATIENT PORTAL ── */}
                <Route path="/patient" element={<PatientDashboard />} />
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/patient/timeline" element={<PatientTimeline />} />
                <Route path="/patient/health-profile" element={<HealthProfilePage />} />
                <Route path="/patient/records" element={<DynamicRecordsPage />} />
                <Route path="/patient/prescriptions" element={<PatientPrescriptionsPage />} />
                <Route path="/patient/documents" element={<PatientDocumentsPage />} />
                <Route path="/patient/privacy" element={<PrivacyCenterPage />} />
                <Route path="/patient/reminders" element={<SmartRemindersPage />} />
                <Route path="/patient/profile" element={<Navigate to="/patient/health-profile" replace />} />
                <Route path="/patient/dynamic-records" element={<Navigate to="/patient/records" replace />} />

                {/* ── 4. PHARMACIST PORTAL ── */}
                <Route path="/pharmacist" element={<PharmacyQueue />} />
                <Route path="/pharmacist/queue" element={<PharmacyQueue />} />
                <Route path="/pharmacist/history" element={<PharmacyStockPage />} />
                <Route path="/pharmacist/stock" element={<PharmacyStockPage />} />
                <Route path="/pharmacy" element={<Navigate to="/pharmacist" replace />} />
                <Route path="/pharmacy/queue" element={<Navigate to="/pharmacist" replace />} />
                <Route path="/pharmacy/history" element={<Navigate to="/pharmacist/history" replace />} />
                <Route path="/pharmacy/stock" element={<Navigate to="/pharmacist/stock" replace />} />

                {/* Shared utilities */}
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
