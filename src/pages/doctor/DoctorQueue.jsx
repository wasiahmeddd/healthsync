import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  ClipboardList,
  Clock,
  User,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Phone,
  FileText
} from 'lucide-react';

export const DoctorQueue = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    try {
      const docId = user?.doctorId || 'DOC-01';
      const q = await doctorApi.getDoctorQueue(docId);
      setQueue(q);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const unsub = subscribeToData(() => loadQueue());
    return unsub;
  }, [user]);

  const handleStartConsultation = (appointment) => {
    navigate(`/doctor/consultation?aptId=${appointment.id}&patientId=${appointment.patientId}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {user?.name}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                On Duty
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {user?.specialization || "Cardiology"} • {user?.hospitalName || "Apollo Multispeciality Hospital"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/doctor/second-opinion')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 font-bold text-xs transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Second Opinion Portal</span>
          </button>
        </div>
      </div>

      {/* Queue Statistics Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Queue Total</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{queue.length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">In Progress / Next</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {queue.filter(a => a.status === 'In Progress' || a.status === 'Scheduled').length}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Completed Today</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {queue.filter(a => a.status === 'Completed').length}
          </span>
        </div>
      </div>

      {/* Patient Queue Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Today's Consultation Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Patients scheduled for consultation with token order
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Updated in real-time
          </span>
        </div>

        <div className="space-y-3">
          {queue.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No appointments in your queue for today.
            </div>
          ) : (
            queue.map((apt) => {
              const isDone = apt.status === 'Completed';
              const isInProgress = apt.status === 'In Progress';

              return (
                <div
                  key={apt.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isInProgress
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-sm'
                      : isDone
                      ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-80'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-teal-500'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Token Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 flex flex-col items-center justify-center text-teal-700 dark:text-teal-300 flex-shrink-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Token</span>
                      <span className="text-base font-black font-mono leading-none">
                        {apt.tokenNumber || apt.id.slice(-3)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {apt.patientName}
                        </h4>
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {apt.patientId}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDone 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                            : isInProgress 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 animate-pulse'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {apt.timeSlot}
                        </span>
                        <span>•</span>
                        <span>{apt.department}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {apt.patientPhone}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 pt-0.5 font-medium">
                        Reason: {apt.reason}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:self-center">
                    {!isDone ? (
                      <button
                        onClick={() => handleStartConsultation(apt)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-1.5"
                      >
                        <Stethoscope className="w-4 h-4" />
                        <span>{isInProgress ? 'Resume Consultation' : 'Start Consultation'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartConsultation(apt)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Review Consultation</span>
                      </button>
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
