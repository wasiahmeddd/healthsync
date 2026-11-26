import React, { useState, useEffect } from 'react';
import { patientApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  Calendar,
  Stethoscope,
  Pill,
  FileText,
  Filter,
  CheckCircle2,
  ChevronDown,
  Building2,
  AlertCircle
} from 'lucide-react';

export const PatientTimeline = () => {
  const { user } = useAuth();
  const patientId = user?.patientId || 'ML-PAT-1001';

  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadTimeline = async () => {
    try {
      const data = await patientApi.getTimeline(patientId);
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
    const unsub = subscribeToData(() => loadTimeline());
    return unsub;
  }, [patientId]);

  const filteredEvents = events.filter(e => {
    if (filterType === 'ALL') return true;
    return e.type === filterType;
  });

  const getEventIcon = (type) => {
    switch (type) {
      case 'APPOINTMENT': return Calendar;
      case 'CONSULTATION': return Stethoscope;
      case 'PRESCRIPTION': return Pill;
      case 'DOCUMENT': return FileText;
      default: return Clock;
    }
  };

  const getEventBadgeColor = (type, badge) => {
    switch (type) {
      case 'CONSULTATION':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';
      case 'PRESCRIPTION':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'DOCUMENT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Unified Patient Medical Timeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete chronological record of consultations, prescriptions, hospital visits, and diagnostic files
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'All Events' },
            { key: 'CONSULTATION', label: 'Diagnoses' },
            { key: 'PRESCRIPTION', label: 'Prescriptions' },
            { key: 'APPOINTMENT', label: 'Appointments' },
            { key: 'DOCUMENT', label: 'Uploaded Reports' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterType === f.key
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No medical events found matching the selected filter.
            </div>
          ) : (
            filteredEvents.map((evt, idx) => {
              const Icon = getEventIcon(evt.type);
              const badgeStyle = getEventBadgeColor(evt.type, evt.badge);

              return (
                <div key={evt.id || idx} className="relative flex items-start gap-4 pl-1">
                  
                  {/* Timeline Node Bullet */}
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border-2 border-teal-500 flex items-center justify-center text-teal-600 dark:text-teal-400 z-10 shadow-sm flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {evt.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeStyle}`}>
                          {evt.badge}
                        </span>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {evt.date} • {evt.time}
                      </span>
                    </div>

                    <p className="text-teal-700 dark:text-teal-400 font-semibold">
                      {evt.subtitle}
                    </p>

                    {evt.description && (
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                        {evt.description}
                      </p>
                    )}

                    {/* Vitals snapshot if present */}
                    {evt.vitals && (
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono">
                        <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          BP: {evt.vitals.bpSystolic}/{evt.vitals.bpDiastolic} mmHg
                        </span>
                        <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          HR: {evt.vitals.pulse} bpm
                        </span>
                        <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          SpO2: {evt.vitals.spo2}%
                        </span>
                      </div>
                    )}

                    {/* Future doctor handover notes */}
                    {evt.futureNotes && (
                      <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 font-medium text-[11px]">
                        ★ <strong>Continuity of Care Note:</strong> {evt.futureNotes}
                      </div>
                    )}

                    {/* Prescription items list if present */}
                    {evt.items && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                        <span className="font-semibold text-slate-400 text-[11px] block">
                          Prescribed Medication Items:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {evt.items.map((item, i) => (
                            <div key={i} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="font-bold text-slate-800 dark:text-white">{item.medicineName}</span>
                              <div className="text-slate-400 text-[10px]">
                                {item.dosage} • {item.frequency} ({item.duration})
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
