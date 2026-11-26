import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi, reminderApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { QRModal } from '../../components/common/QRModal';
import {
  ShieldCheck,
  Calendar,
  Pill,
  Clock,
  QrCode,
  BellRing,
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Phone,
  FileText
} from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const patientId = user?.patientId || 'ML-PAT-1001';
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [pat, rxs, rems] = await Promise.all([
        patientApi.getPatientById(patientId),
        patientApi.getPrescriptions(patientId),
        reminderApi.getReminders(patientId)
      ]);
      setPatient(pat);
      setPrescriptions(rxs);
      setReminders(rems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToData(() => loadData());
    return unsub;
  }, [patientId]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Loading sovereign patient records...</div>;
  }

  // Find latest active prescription
  const latestRx = prescriptions[0];

  const getTrackerStep = (status) => {
    switch (status) {
      case 'Sent': return 1;
      case 'Preparing': return 2;
      case 'Ready for Pickup': return 3;
      case 'Dispensed': return 4;
      default: return 1;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Sovereign Profile Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={patient?.avatar || user?.avatar}
            alt={patient?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {patient?.name}
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {patient?.id}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {patient?.bloodGroup}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Age: {patient?.age} yrs • {patient?.gender} • {patient?.healthProfile?.insurance?.provider || "Direct Pay"}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Emergency Contact: {patient?.emergencyContact?.name} ({patient?.emergencyContact?.phone})</span>
            </div>
          </div>
        </div>

        {/* Digital QR Card Button */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Digital QR Passport</span>
          </button>
          <button
            onClick={() => navigate('/patient/privacy')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 font-bold text-xs transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Center</span>
          </button>
        </div>
      </div>

      {/* Live Pharmacy Prescription Status Tracker */}
      {latestRx && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Pill className="w-4 h-4" />
                  Live Prescription Status Tracker
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  #{latestRx.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Prescribed by <strong className="text-slate-700 dark:text-slate-200">{latestRx.doctorName}</strong> ({latestRx.hospitalName})
              </p>
            </div>

            {/* Token Badge */}
            {latestRx.pickupToken && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold text-xs self-start sm:self-auto">
                <span>Pickup Token:</span>
                <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                  {latestRx.pickupToken}
                </span>
              </div>
            )}
          </div>

          {/* Stepper Progress Bar */}
          <div className="pt-2">
            <div className="grid grid-cols-4 gap-2 relative">
              {[
                { title: 'Sent to Pharmacy', desc: 'Routed instantly' },
                { title: 'Preparing', desc: 'Pharmacist dispensing' },
                { title: 'Ready for Pickup', desc: 'Token generated' },
                { title: 'Dispensed', desc: 'Handed over' },
              ].map((step, idx) => {
                const currentStep = getTrackerStep(latestRx.status);
                const stepNum = idx + 1;
                const isPassed = currentStep >= stepNum;
                const isCurrent = currentStep === stepNum;

                return (
                  <div key={idx} className="text-center relative">
                    <div className="flex items-center justify-center mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isPassed
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-teal-500/20 animate-pulse' : ''}`}>
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                      </div>
                    </div>
                    <span className={`block font-bold text-xs ${
                      isPassed ? 'text-teal-700 dark:text-teal-300' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:block">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Medication summary */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 font-semibold self-center">Included Items:</span>
            {latestRx.items.map((item, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                {item.medicineName} ({item.dosage}) - {item.frequency}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Active Medicines & Smart Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Medications */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>Active Medications & Dosages</span>
            </h3>
            <button
              onClick={() => navigate('/patient/timeline')}
              className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View full timeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {prescriptions.flatMap(rx => rx.items).slice(0, 4).map((med, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {med.medicineName} <span className="text-teal-600 dark:text-teal-400">({med.dosage})</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Schedule: <strong className="text-slate-700 dark:text-slate-300">{med.frequency}</strong> • Duration: {med.duration}
                  </div>
                  {med.instructions && (
                    <div className="text-slate-400 italic mt-0.5 text-[11px]">
                      {med.instructions}
                    </div>
                  )}
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Reminders Preview */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BellRing className="w-4 h-4 text-teal-600" />
              <span>Smart Health Reminders</span>
            </h3>
            <button
              onClick={() => navigate('/patient/reminders')}
              className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Manage ({reminders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {reminders.slice(0, 3).map((rem) => (
              <div
                key={rem.id}
                className="p-3 rounded-2xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-white">
                    {rem.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-900 font-bold text-teal-700 dark:text-teal-300">
                    {rem.timeSchedule}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  {rem.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>Reminders automatically synchronize with your active prescriptions and chronic rules engine.</span>
          </div>
        </div>

      </div>

      {/* QR Modal */}
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        patient={patient}
      />

    </div>
  );
};
