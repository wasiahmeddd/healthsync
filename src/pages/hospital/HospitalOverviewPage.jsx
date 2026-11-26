import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hospitalApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { QRModal } from '../../components/common/QRModal';
import {
  Calendar, Users, Clock, Pill, UserPlus, Search,
  ArrowUpRight, Building2, ShieldCheck, X, ChevronRight
} from 'lucide-react';

const statusColors = {
  'Scheduled':   'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'Completed':   'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  'Cancelled':   'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

const BLANK_PATIENT = {
  name: '', email: '', phone: '', dob: '1995-04-10',
  gender: 'Male', bloodGroup: 'O+', address: 'Bangalore',
  height: 172, weight: 70, allergies: 'None', chronicConditions: 'None',
  emergencyContactName: '', emergencyContactPhone: '', insuranceProvider: 'Star Health'
};

export const HospitalOverviewPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [stats, setStats] = useState({
    todayTotalAppointments: 0, completedToday: 0, inProgressToday: 0,
    scheduledToday: 0, totalDoctors: 0, doctorsOnDuty: 0,
    totalPatients: 0, pendingPrescriptions: 0
  });
  const [recentAppts, setRecentAppts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Register modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [newPatient, setNewPatient] = useState(BLANK_PATIENT);
  const [regLoading, setRegLoading] = useState(false);
  const [qrPatient, setQrPatient] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, appts] = await Promise.all([
        hospitalApi.getDashboardStats(),
        hospitalApi.getAppointments({ status: 'ALL' })
      ]);
      setStats(s);
      setRecentAppts(appts.slice(0, 5));
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
  }, []);

  const handleSearch = async q => {
    setSearchQuery(q);
    if (q.length >= 2) setSearchResults(await hospitalApi.searchPatients(q));
    else setSearchResults([]);
  };

  const handleRegister = async () => {
    if (!newPatient.name || !newPatient.phone) { addToast('Name and phone are required', 'warning'); return; }
    setRegLoading(true);
    try {
      const created = await hospitalApi.registerPatient(newPatient);
      addToast(`Patient ${created.name} registered! ID: ${created.id}`, 'success');
      setShowRegModal(false);
      setNewPatient(BLANK_PATIENT);
      setQrPatient({ ...created, patientId: created.id });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setRegLoading(false);
    }
  };

  const statCards = [
    { label: "Today's Appointments", value: stats.todayTotalAppointments, Icon: Calendar, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Doctors on Duty', value: `${stats.doctorsOnDuty}/${stats.totalDoctors}`, Icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'In Progress Now', value: stats.inProgressToday, Icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Pending Prescriptions', value: stats.pendingPrescriptions, Icon: Pill, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40' },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600" /> Hospital Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.hospitalName || 'Apollo Multispeciality Hospital'} — Today's summary
          </p>
        </div>
        {/* Primary page action */}
        <button
          onClick={() => setShowRegModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-500/20 transition"
        >
          <UserPlus className="w-4 h-4" /> Register Patient
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{loading ? '…' : value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Patient Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-teal-600" /> Search Patients
        </h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Name, ID, or phone…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResults.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{p.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{p.id} • {p.phone}</p>
                </div>
                <button
                  onClick={() => setQrPatient({ ...p, patientId: p.id })}
                  className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                  title="View QR"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Appointments */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm">Recent Appointments</h2>
          <Link
            to="/hospital/appointments"
            className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
          >
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAppts.length === 0 ? (
          <div className="py-14 text-center">
            <Calendar className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No appointments yet</p>
            <Link to="/hospital/book-appointment" className="mt-2 inline-block text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline">
              Book the first appointment →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold">Doctor</th>
                  <th className="px-4 py-3 text-left font-semibold">Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentAppts.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{apt.patientName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{apt.department}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{apt.doctorName}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{apt.timeSlot}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[apt.status] || statusColors['Scheduled']}`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick links row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/hospital/appointments', label: 'All Appointments', Icon: Calendar },
          { to: '/hospital/book-appointment', label: 'Book Appointment', Icon: ChevronRight },
          { to: '/hospital/register-patient', label: 'Register Patient', Icon: UserPlus },
          { to: '/hospital/staff', label: 'Manage Staff', Icon: Users },
        ].map(({ to, label, Icon }) => (
          <Link key={to} to={to} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition shadow-sm">
            <Icon className="w-4 h-4 text-teal-500" /> {label}
          </Link>
        ))}
      </div>

      {/* Register Patient Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" /> Quick Register Patient
              </h3>
              <button onClick={() => setShowRegModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Full Name *', field: 'name', type: 'text', placeholder: 'Patient full name' },
                { label: 'Phone *', field: 'phone', type: 'tel', placeholder: '+91 9876543210' },
                { label: 'Email', field: 'email', type: 'email', placeholder: 'patient@email.com' },
                { label: 'Date of Birth', field: 'dob', type: 'date' },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{f.label}</label>
                  <input type={f.type} value={newPatient[f.field]} onChange={e => setNewPatient(p => ({ ...p, [f.field]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
                  <select value={newPatient.gender} onChange={e => setNewPatient(p => ({ ...p, gender: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Blood Group</label>
                  <select value={newPatient.bloodGroup} onChange={e => setNewPatient(p => ({ ...p, bloodGroup: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setShowRegModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                Cancel
              </button>
              <button onClick={handleRegister} disabled={regLoading}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-500/20 transition disabled:opacity-60 flex items-center gap-2">
                {regLoading ? 'Registering…' : 'Register Patient'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrPatient && <QRModal patient={qrPatient} onClose={() => setQrPatient(null)} />}
    </div>
  );
};
