import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doctorApi, patientApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { PrescriptionScannerModal } from '../../components/scan/PrescriptionScannerModal';
import {
  Stethoscope,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  AlertTriangle,
  Heart,
  Activity,
  ChevronLeft,
  ArrowRight,
  Send
} from 'lucide-react';

export const ConsultationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotification();

  const appointmentId = searchParams.get('aptId') || 'APT-101';
  const patientId = searchParams.get('patientId') || 'ML-PAT-1001';

  const [activeTab, setActiveTab] = useState('FORM'); // 'FORM' or 'TIMELINE'
  const [patientRecord, setPatientRecord] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [vitals, setVitals] = useState({
    bpSystolic: 120,
    bpDiastolic: 80,
    pulse: 72,
    temperature: 98.6,
    spo2: 99,
    weight: 76
  });

  const [sharedNotes, setSharedNotes] = useState('');
  const [futureDoctorNotes, setFutureDoctorNotes] = useState('');
  const [isPrivateNotes, setIsPrivateNotes] = useState(false);
  const [privateNotes, setPrivateNotes] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Prescription Items Builder
  const [medicines, setMedicines] = useState([
    {
      medicineName: 'Metformin Hydrochloride',
      dosage: '500 mg',
      frequency: '1-0-1 (After Food)',
      duration: '90 Days',
      instructions: 'Take with breakfast and dinner.'
    }
  ]);

  const loadPatientData = async () => {
    try {
      const docId = user?.doctorId || 'DOC-01';
      const record = await doctorApi.getPatientDetailsForDoctor(docId, patientId);
      setPatientRecord(record);

      if (!record.isRestricted) {
        const tl = await patientApi.getTimeline(patientId);
        setTimeline(tl);
      }
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientData();
    const unsub = subscribeToData(() => loadPatientData());
    return unsub;
  }, [patientId, user]);

  const handleAddMedicine = () => {
    setMedicines(prev => [
      ...prev,
      {
        medicineName: '',
        dosage: '',
        frequency: '1-0-0 (Morning)',
        duration: '7 Days',
        instructions: ''
      }
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  // Called when AI/OCR prescription is scanned and reviewed
  const handleImportParsedScan = (parsed) => {
    if (parsed.diagnosis) setDiagnosis(parsed.diagnosis);
    if (parsed.symptoms) setSymptoms(parsed.symptoms);
    if (parsed.vitals) setVitals(parsed.vitals);
    if (parsed.medicines && parsed.medicines.length > 0) {
      setMedicines(parsed.medicines);
    }
    if (parsed.specialInstructions) setSpecialInstructions(parsed.specialInstructions);
    addToast("OCR Prescription successfully parsed into consultation form!", "success");
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!diagnosis) {
      addToast("Please provide a primary diagnosis", "warning");
      return;
    }
    setSaving(true);
    try {
      const docId = user?.doctorId || 'DOC-01';
      await doctorApi.saveConsultationAndPrescription({
        appointmentId,
        patientId,
        doctorId: docId,
        diagnosis,
        symptoms,
        vitals,
        sharedNotes,
        futureDoctorNotes,
        isPrivateNotes,
        privateNotes,
        medicines,
        specialInstructions
      });

      addToast("Consultation saved & prescription routed to Pharmacy Live Queue! 💊", "success");
      navigate('/doctor/queue');
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Loading patient clinical chart & verified consent...
      </div>
    );
  }

  // Handle Privacy Shield if access is restricted
  if (patientRecord?.isRestricted) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Sovereign Privacy Shield Active
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {patientRecord.message}
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigate('/doctor/second-opinion')}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition"
          >
            Request Consent in Second Opinion Portal
          </button>
        </div>
      </div>
    );
  }

  const patient = patientRecord?.patient;

  return (
    <div className="space-y-6">
      
      {/* Top Patient Clinical Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/doctor/queue')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition mt-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

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

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>{patient?.gender}, {patient?.age} yrs (DOB: {patient?.dob})</span>
              <span>•</span>
              <span>Height: {patient?.healthProfile?.height} cm</span>
              <span>•</span>
              <span>Weight: {patient?.healthProfile?.weight} kg (BMI: {patient?.healthProfile?.bmi})</span>
            </div>

            {/* Allergies & Conditions Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Allergies:
              </span>
              {patient?.healthProfile?.allergies?.length > 0 ? (
                patient.healthProfile.allergies.map((all, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {all}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400">None reported</span>
              )}

              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-3">
                Chronic:
              </span>
              {patient?.healthProfile?.chronicConditions?.map((cond, i) => (
                <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                  {cond}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Switcher & Scan Button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('FORM')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'FORM'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Consultation Form
            </button>
            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'TIMELINE'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Past Visit Timeline ({timeline.length})
            </button>
          </div>

          <button
            onClick={() => setShowScannerModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-xs shadow-md shadow-teal-500/20 hover:opacity-95 transition"
            title="Scan / Upload prescription with simulated OCR"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan / Upload Rx (OCR)</span>
          </button>
        </div>
      </div>

      {/* Main Consultation Form Body */}
      {activeTab === 'FORM' ? (
        <form onSubmit={handleSaveConsultation} className="space-y-6">
          
          {/* Section 1: Diagnosis & Vitals */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>1. Clinical Diagnosis & Patient Vitals</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes with high fasting sugar & mild hypertension"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chief Symptoms & Complaint
                </label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Occasional morning dizziness, palpitations after meals"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                />
              </div>
            </div>

            {/* Vitals row */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Recorded Vitals (Auto-recorded from clinic or manual input):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={vitals.bpSystolic}
                    onChange={(e) => setVitals({ ...vitals, bpSystolic: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={vitals.bpDiastolic}
                    onChange={(e) => setVitals({ ...vitals, bpDiastolic: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    value={vitals.pulse}
                    onChange={(e) => setVitals({ ...vitals, pulse: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={vitals.spo2}
                    onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temperature}
                    onChange={(e) => setVitals({ ...vitals, temperature: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={vitals.weight}
                    onChange={(e) => setVitals({ ...vitals, weight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Prescription Builder */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  <span>2. Prescription Builder & Pharmacy Dispatch</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  On save, these items are automatically routed to the Pharmacist live dispensary queue
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMedicine}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs hover:bg-teal-100 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medicine</span>
              </button>
            </div>

            {/* Medicines List */}
            <div className="space-y-3">
              {medicines.map((med, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-end"
                >
                  <div className="sm:col-span-4">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Medicine Name *</label>
                    <input
                      type="text"
                      required
                      value={med.medicineName}
                      onChange={(e) => handleMedicineChange(index, 'medicineName', e.target.value)}
                      placeholder="e.g. Telmisartan"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dosage</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      placeholder="e.g. 40 mg"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Frequency</label>
                    <select
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white font-medium"
                    >
                      <option value="1-0-0 (Morning)">1-0-0 (Morning)</option>
                      <option value="1-0-1 (After Food)">1-0-1 (After Food)</option>
                      <option value="0-0-1 (Bedtime)">0-0-1 (Bedtime)</option>
                      <option value="1-1-1 (TID)">1-1-1 (Three times a day)</option>
                      <option value="SOS (As needed)">SOS (As needed)</option>
                      <option value="Once Weekly">Once Weekly</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Duration</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                      placeholder="e.g. 30 Days"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(index)}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition"
                        title="Remove Medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                Pharmacist & Patient Instructions
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Avoid high sodium foods, repeat serum creatinine after 45 days."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs dark:text-white"
              />
            </div>
          </div>

          {/* Section 3: Clinical Notes & Future Doctor Notes */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>3. Clinical Notes & Multi-Hospital Handover</span>
            </h3>

            {/* Note for Future Doctors (Prominent feature requested in spec!) */}
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-teal-800 dark:text-teal-300 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Note for Future Doctors (Cross-Hospital Continuity)</span>
              </div>
              <p className="text-[11px] text-teal-700/80 dark:text-teal-400">
                This note will be prominently highlighted to any authorized physician treating this patient across network hospitals.
              </p>
              <textarea
                rows="2"
                value={futureDoctorNotes}
                onChange={(e) => setFutureDoctorNotes(e.target.value)}
                placeholder="e.g. Patient has history of mild pedal edema on amlodipine. Please monitor BP and consider ARB titration."
                className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 text-xs dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Shared Notes */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                General Shared Clinical Advice (Visible to Patient in their Portal)
              </label>
              <textarea
                rows="2"
                value={sharedNotes}
                onChange={(e) => setSharedNotes(e.target.value)}
                placeholder="e.g. 30 minutes brisk walk daily, avoid sugar intake, monitor fasting sugars."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs dark:text-white"
              />
            </div>

            {/* Private Notes vs Shared Notes Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confidential Physician Notes (Private - visible only to you)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivateNotes}
                    onChange={(e) => setIsPrivateNotes(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {isPrivateNotes && (
                <textarea
                  rows="2"
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  placeholder="e.g. Suspected poor medication adherence due to travel stress. Keep under observation."
                  className="w-full p-2.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 text-xs dark:text-white"
                />
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/doctor/queue')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-500/20 transition"
            >
              <Send className="w-4 h-4" />
              <span>{saving ? 'Processing...' : 'Complete Consultation & Dispatch Prescription'}</span>
            </button>
          </div>

        </form>
      ) : (
        /* Section 4: Patient Past Visit Timeline */
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Chronological Medical Timeline
          </h3>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-4 pl-2">
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold z-10 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {item.title}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {item.date} • {item.time}
                    </span>
                  </div>
                  <p className="text-teal-600 dark:text-teal-400 font-medium">
                    {item.subtitle}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                  {item.futureNotes && (
                    <div className="mt-2 p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-medium">
                      ★ Handover Note: {item.futureNotes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI / OCR Prescription Scanner Modal */}
      <PrescriptionScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onImportParsedData={handleImportParsedScan}
      />

    </div>
  );
};
