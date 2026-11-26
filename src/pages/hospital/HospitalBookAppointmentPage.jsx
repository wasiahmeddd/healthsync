import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hospitalApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { CalendarPlus, ChevronLeft, Search, CheckCircle2 } from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'
];
const DEPARTMENTS = [
  'Cardiology','General Medicine','Endocrinology','Neurology',
  'Orthopedics','Pulmonology','Surgery','Dermatology','Pediatrics'
];

export const HospitalBookAppointmentPage = () => {
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form, setForm] = useState({
    patientId: '', doctorId: '',
    department: 'Cardiology',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    reason: 'Routine consultation'
  });

  useEffect(() => {
    hospitalApi.getDoctorsByHospital().then(docs => setDoctors(docs || []));
  }, []);

  const handlePatientSearch = async q => {
    setPatientSearch(q);
    if (q.length >= 2) setPatientResults(await hospitalApi.searchPatients(q));
    else setPatientResults([]);
  };

  const selectPatient = p => {
    setSelectedPatient(p);
    setForm(prev => ({ ...prev, patientId: p.id }));
    setPatientResults([]);
    setPatientSearch(p.name);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.patientId) { addToast('Please search and select a patient', 'warning'); return; }
    if (!form.doctorId) { addToast('Please select a doctor', 'warning'); return; }
    setLoading(true);
    try {
      await hospitalApi.bookAppointment(form);
      addToast('Appointment booked successfully!', 'success');
      navigate('/hospital/appointments');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const upd = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link to="/hospital/appointments" className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-2 w-fit">
          <ChevronLeft className="w-3.5 h-3.5" /> Appointments
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarPlus className="w-6 h-6 text-teal-600" /> Book Appointment
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Schedule a new appointment for a registered patient</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 p-6">

        {/* Patient Search */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Patient <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={patientSearch}
              onChange={e => handlePatientSearch(e.target.value)}
              placeholder="Type name, ID, or phone…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          {patientResults.length > 0 && (
            <div className="mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden shadow-lg z-10 relative">
              {patientResults.map(p => (
                <button key={p.id} type="button" onClick={() => selectPatient(p)}
                  className="w-full px-4 py-2.5 text-left hover:bg-teal-50 dark:hover:bg-teal-950/30 transition">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{p.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{p.id} • {p.phone}</p>
                </button>
              ))}
            </div>
          )}
          {selectedPatient && (
            <div className="mt-2 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-700 dark:text-teal-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {selectedPatient.name} ({selectedPatient.id})
            </div>
          )}
        </div>

        {/* Doctor */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Doctor <span className="text-rose-500">*</span>
          </label>
          <select value={form.doctorId} onChange={upd('doctorId')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select doctor…</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
          </select>
        </div>

        {/* Department + Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
            <select value={form.department} onChange={upd('department')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={upd('date')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        {/* Time Slot */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Time Slot</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {TIME_SLOTS.map(ts => (
              <button key={ts} type="button" onClick={() => setForm(p => ({ ...p, timeSlot: ts }))}
                className={`py-2 rounded-xl text-xs font-semibold border transition ${
                  form.timeSlot === ts
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                }`}>
                {ts}
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Reason for Visit</label>
          <textarea value={form.reason} onChange={upd('reason')} rows={2}
            placeholder="Brief reason for the appointment"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        </div>

        {/* Form Actions: Cancel LEFT, Submit RIGHT */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link to="/hospital/appointments"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-500/20 transition disabled:opacity-60 flex items-center gap-2">
            {loading ? 'Booking…' : 'Book Appointment'}
            <CalendarPlus className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
