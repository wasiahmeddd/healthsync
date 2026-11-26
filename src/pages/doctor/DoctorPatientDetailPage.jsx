import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, User, Stethoscope, AlertCircle, Calendar, Pill, FileText } from 'lucide-react';

export const DoctorPatientDetailPage = () => {
  const { patientId } = useParams();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [p, t] = await Promise.all([
          doctorApi.getPatientDetails(patientId, user?.doctorId),
          doctorApi.getPatientTimeline(patientId, user?.doctorId)
        ]);
        setPatient(p);
        setTimeline(t);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) load();
  }, [patientId, user?.doctorId]);

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-64">
      <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
    </div>
  );

  if (error) return (
    <div className="p-6 max-w-lg mx-auto text-center py-20">
      <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
      <p className="font-bold text-slate-900 dark:text-white mb-2">Cannot Access Record</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
      <Link to="/doctor/queue" className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition">
        Back to Queue
      </Link>
    </div>
  );

  const hp = patient?.healthProfile || {};

  const typeIcons = {
    APPOINTMENT: Calendar,
    CONSULTATION: Stethoscope,
    PRESCRIPTION: Pill,
    DOCUMENT: FileText,
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link to="/doctor/queue" className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-2 w-fit">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Queue
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-teal-600" /> {patient?.name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{patient?.id} • {patient?.gender}, {patient?.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : '?'} yrs</p>
      </div>

      {/* Health Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-teal-600" /> Health Snapshot
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Blood Group', value: patient?.bloodGroup || '—' },
            { label: 'Height', value: hp.height ? `${hp.height} cm` : '—' },
            { label: 'Weight', value: hp.weight ? `${hp.weight} kg` : '—' },
            { label: 'BMI', value: hp.bmi || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
              <p className="font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>

        {hp.allergies?.length > 0 && hp.allergies[0] !== 'None' && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            <span className="font-bold">⚠ Allergies:</span> {Array.isArray(hp.allergies) ? hp.allergies.join(', ') : hp.allergies}
          </div>
        )}
        {hp.chronicConditions?.length > 0 && hp.chronicConditions[0] !== 'None' && (
          <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
            <span className="font-bold">Chronic Conditions:</span> {Array.isArray(hp.chronicConditions) ? hp.chronicConditions.join(', ') : hp.chronicConditions}
          </div>
        )}
      </div>

      {/* Visit Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-5 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600" /> Visit Timeline
        </h2>
        {timeline.length === 0 ? (
          <div className="py-10 text-center">
            <Calendar className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No visit history yet</p>
          </div>
        ) : (
          <div className="space-y-0">
            {timeline.map((event, i) => {
              const Icon = typeIcons[event.type] || FileText;
              return (
                <div key={event.id} className="flex gap-4 pb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-2 mb-0" />
                    )}
                  </div>
                  <div className="flex-1 pb-2 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{event.date}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {event.type}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{event.title}</p>
                    {event.subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.subtitle}</p>}
                    {event.description && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">{event.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
