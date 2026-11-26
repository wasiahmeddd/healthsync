import React, { useState, useEffect } from 'react';
import { patientApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Pill, CheckCircle2, Clock, Package } from 'lucide-react';

const STATUS_STEPS = ['Sent', 'Preparing', 'Ready for Pickup', 'Dispensed'];
const STEP_COLORS  = ['bg-blue-500', 'bg-amber-500', 'bg-teal-500', 'bg-emerald-500'];

export const PatientPrescriptionsPage = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user?.patientId) return;
    setLoading(true);
    try {
      const data = await patientApi.getPrescriptions(user.patientId);
      setPrescriptions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToData(() => loadData());
    return unsub;
  }, [user?.patientId]);

  if (loading) return (
    <div className="p-6 flex justify-center py-20">
      <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Pill className="w-6 h-6 text-teal-600" /> My Prescriptions
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="py-20 text-center">
          <Pill className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="font-semibold text-slate-900 dark:text-white mb-1">No prescriptions yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your prescriptions from doctors will appear here with live pharmacy status.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(rx => {
            const rawStatus = rx.status || rx.pharmacyStatus || 'Sent';
            const stepIdx = Math.max(0, STATUS_STEPS.indexOf(rawStatus));
            const medicines = rx.items || rx.medicines || [];
            const isDone = stepIdx >= STATUS_STEPS.length - 1;

            return (
              <div key={rx.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{rx.diagnosis || 'Prescription'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {rx.doctorName} &bull; {rx.date}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                    }`}>
                      {rawStatus}
                    </span>
                  </div>

                  {/* Progress Stepper */}
                  <div className="relative flex items-start justify-between mb-5">
                    {/* track line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 top-3.5 mx-3.5" />
                    <div
                      className={`absolute h-0.5 top-3.5 mx-3.5 transition-all duration-500 ${STEP_COLORS[stepIdx]}`}
                      style={{ width: `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                    {STATUS_STEPS.map((step, i) => (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
                          i < stepIdx
                            ? `${STEP_COLORS[i]} border-transparent text-white`
                            : i === stepIdx
                              ? `${STEP_COLORS[i]} border-transparent text-white`
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}>
                          {i < stepIdx
                            ? <CheckCircle2 className="w-4 h-4" />
                            : i === stepIdx
                              ? <Clock className="w-3.5 h-3.5" />
                              : <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-600" />
                          }
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center w-16 leading-tight">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pickup token */}
                  {rx.pickupToken && (
                    <div className="mb-3 p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-700 dark:text-teal-300 font-semibold">
                      🎫 Pickup Token: <span className="font-extrabold text-sm">{rx.pickupToken}</span>
                    </div>
                  )}

                  {/* Medicines */}
                  {medicines.length > 0 && (
                    <div className="mt-3 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                      {medicines.map((med, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <Package className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                          <span className="font-semibold">{med.medicineName || med.name}</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            — {med.dosage} &bull; {med.frequency} &bull; {med.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special instructions */}
                  {rx.specialInstructions && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 italic">
                      📋 {rx.specialInstructions}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
