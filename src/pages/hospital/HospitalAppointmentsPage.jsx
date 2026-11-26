import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hospitalApi, subscribeToData } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Search, ChevronLeft, AlertCircle, CalendarPlus } from 'lucide-react';

const statusColors = {
  'Scheduled':   'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'Completed':   'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  'Cancelled':   'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

export const HospitalAppointmentsPage = () => {
  const { addToast } = useNotification();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelConfirm, setCancelConfirm] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await hospitalApi.getAppointments({ status: 'ALL' });
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToData(() => loadData());
    return unsub;
  }, []);

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await hospitalApi.updateAppointmentStatus(apptId, newStatus);
      addToast(`Marked as ${newStatus}`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCancel = async apptId => {
    try {
      await hospitalApi.updateAppointmentStatus(apptId, 'Cancelled');
      addToast('Appointment cancelled', 'info');
      setCancelConfirm(null);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const filtered = appointments.filter(apt => {
    const matchStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || apt.patientName?.toLowerCase().includes(q) || apt.doctorName?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <Link to="/hospital/overview" className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-2 w-fit">
          <ChevronLeft className="w-3.5 h-3.5" /> Hospital Overview
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-teal-600" /> Appointments
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{filtered.length} appointment{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          {/* Primary page action */}
          <Link
            to="/hospital/book-appointment"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-500/20 transition"
          >
            <CalendarPlus className="w-4 h-4" /> Book Appointment
          </Link>
        </div>
      </div>

      {/* Search + Status Filters — above the table */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search patient or doctor…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                statusFilter === s
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-900 dark:text-white mb-1">No appointments found</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Try a different filter or book a new appointment.</p>
            <Link to="/hospital/book-appointment" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition">
              <CalendarPlus className="w-4 h-4" /> Book Appointment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold">Doctor</th>
                  <th className="px-4 py-3 text-left font-semibold">Department</th>
                  <th className="px-4 py-3 text-left font-semibold">Date & Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{apt.patientName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{apt.patientId}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{apt.doctorName}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{apt.department}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {apt.date}<br />{apt.timeSlot}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[apt.status] || statusColors['Scheduled']}`}>
                        {apt.status}
                      </span>
                    </td>
                    {/* Contextual single action per status — no duplicate */}
                    <td className="px-4 py-3">
                      {apt.status === 'Scheduled' && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleUpdateStatus(apt.id, 'In Progress')}
                            className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition">
                            Check In
                          </button>
                          <button onClick={() => setCancelConfirm(apt.id)}
                            className="text-xs text-rose-500 hover:text-rose-700 font-semibold transition">
                            Cancel
                          </button>
                        </div>
                      )}
                      {apt.status === 'In Progress' && (
                        <button onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition">
                          Mark Completed
                        </button>
                      )}
                      {(apt.status === 'Completed' || apt.status === 'Cancelled') && (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Cancel Dialog */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-800 p-6 max-w-sm w-full shadow-2xl">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-center mb-2">Cancel Appointment?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-5">
              This cannot be undone. The patient and doctor will be notified.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                Keep It
              </button>
              <button onClick={() => handleCancel(cancelConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
