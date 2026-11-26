import React, { useState, useEffect } from 'react';
import { hospitalApi, doctorApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { QRModal } from '../../components/common/QRModal';
import {
  Calendar,
  Users,
  Clock,
  Pill,
  UserPlus,
  CalendarPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Building2,
  ChevronRight,
  Phone,
  Mail,
  ShieldCheck,
  X
} from 'lucide-react';

export const HospitalDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [stats, setStats] = useState({
    todayTotalAppointments: 0,
    completedToday: 0,
    inProgressToday: 0,
    scheduledToday: 0,
    totalDoctors: 0,
    doctorsOnDuty: 0,
    totalPatients: 0,
    pendingPrescriptions: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedPatientForQR, setSelectedPatientForQR] = useState(null);

  // Form states for Register Patient
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '1995-04-10',
    gender: 'Male',
    bloodGroup: 'O+',
    address: 'Indiranagar, Bangalore',
    height: 172,
    weight: 70,
    allergies: 'None',
    chronicConditions: 'None',
    emergencyContactName: '',
    emergencyContactPhone: '',
    insuranceProvider: 'Star Health'
  });

  // Form states for Book Appointment
  const [doctorsList, setDoctorsList] = useState([]);
  const [bookingData, setBookingData] = useState({
    patientId: '',
    doctorId: '',
    department: 'Cardiology',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:00 AM',
    reason: 'Routine consultation follow-up'
  });

  const loadData = async () => {
    try {
      const hospitalId = user?.hospitalId || 'HOSP-01';
      const [s, apts, docs, patients] = await Promise.all([
        hospitalApi.getHospitalStats(hospitalId),
        hospitalApi.getAppointments({ hospitalId: null }), // show all or hospital
        doctorApi.getDoctors(),
        hospitalApi.searchPatients(searchQuery)
      ]);
      setStats(s);
      setAppointments(apts);
      setDoctorsList(docs);
      setSearchResults(patients);
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
  }, [user, searchQuery]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    const res = await hospitalApi.searchPatients(q);
    setSearchResults(res);
  };

  const handleStatusChange = async (aptId, newStatus) => {
    try {
      await hospitalApi.updateAppointmentStatus(aptId, newStatus);
      addToast(`Appointment #${aptId} marked as ${newStatus}`, 'success');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.phone) {
      addToast("Please fill in patient name and phone", "warning");
      return;
    }
    try {
      const reg = await hospitalApi.registerPatient(newPatient);
      addToast(`Patient ${reg.name} registered successfully! Assigned ID: ${reg.id}`, 'success');
      setShowRegisterModal(false);
      // Auto open QR modal so staff can print/show QR card!
      setSelectedPatientForQR(reg);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingData.patientId || !bookingData.doctorId) {
      addToast("Please select a patient and a doctor", "warning");
      return;
    }
    try {
      const apt = await hospitalApi.bookAppointment(bookingData);
      addToast(`Appointment booked successfully! Token #${apt.tokenNumber}`, 'success');
      setShowBookModal(false);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Hospital Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {user?.hospitalName || "Apollo Multispeciality Hospital"}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                Reception Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Logged in as <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.name}</span> • Central OPD & Registration Desk
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
          <button
            onClick={() => {
              if (searchResults.length > 0) {
                setBookingData(prev => ({
                  ...prev,
                  patientId: searchResults[0].id,
                  doctorId: doctorsList[0]?.id || ''
                }));
              }
              setShowBookModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 font-bold text-xs transition"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Today's Bookings
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.todayTotalAppointments}
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {stats.inProgressToday} in progress
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Doctors on Duty
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.doctorsOnDuty}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                of {stats.totalDoctors} available
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Patients
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.totalPatients}
              </span>
              <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                Digital Passports
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Pending Pharmacy
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.pendingPrescriptions}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                in live queue
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Instant Patient Search & Digital Passports Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Patient Lookup & Digital Passports
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search by Patient ID, Name, or Phone to view clinical overview or print QR access card
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search ID, name, or phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
            />
          </div>
        </div>

        {/* Patients Horizontal Carousel / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {searchResults.slice(0, 3).map((pat) => (
            <div
              key={pat.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition flex items-start justify-between"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800 dark:text-white truncate">
                    {pat.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    {pat.bloodGroup}
                  </span>
                </div>
                <p className="text-xs font-mono text-teal-600 dark:text-teal-400 font-semibold">
                  {pat.id}
                </p>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>{pat.gender}, {pat.age} yrs</span>
                  <span>•</span>
                  <span>{pat.phone}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setSelectedPatientForQR(pat)}
                  title="View Digital QR Passport"
                  className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 hover:bg-teal-600 hover:text-white transition"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setBookingData(prev => ({ ...prev, patientId: pat.id }));
                    setShowBookModal(true);
                  }}
                  title="Book Appointment"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-teal-600 hover:text-white transition"
                >
                  <CalendarPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hospital Appointments Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live consultation roster with token status controls
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === status
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Token / ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor & Dept</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No appointments matching current filter
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  let badge = 'bg-slate-100 text-slate-700';
                  if (apt.status === 'In Progress') badge = 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
                  if (apt.status === 'Completed') badge = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
                  if (apt.status === 'Cancelled') badge = 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
                  if (apt.status === 'Scheduled') badge = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-white">
                        <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {apt.tokenNumber || apt.id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{apt.patientName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{apt.patientId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{apt.doctorName}</div>
                        <div className="text-[11px] text-slate-400">{apt.department}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700 dark:text-slate-300">{apt.date}</div>
                        <div className="text-[11px] text-slate-400">{apt.timeSlot}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {apt.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${badge}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={apt.status}
                          onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Patient */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">
                    Register New Patient
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Auto-generates sovereign HealthSync ID and Digital QR Passport
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="+91 98450 12345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    placeholder="ramesh@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newPatient.dob}
                    onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Blood Group</label>
                  <select
                    value={newPatient.bloodGroup}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={newPatient.height}
                    onChange={(e) => setNewPatient({ ...newPatient, height: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={newPatient.weight}
                    onChange={(e) => setNewPatient({ ...newPatient, weight: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Known Allergies</label>
                  <input
                    type="text"
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                    placeholder="e.g. Penicillin, Peanuts (comma separated)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Chronic Conditions</label>
                  <input
                    type="text"
                    value={newPatient.chronicConditions}
                    onChange={(e) => setNewPatient({ ...newPatient, chronicConditions: e.target.value })}
                    placeholder="e.g. Hypertension, Type 2 Diabetes"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  placeholder="Street, City, Postal Code"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-md shadow-teal-500/20"
                >
                  Generate ID & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Book Appointment */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">
                    Book Consultation Appointment
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Assign doctor, department, and generate token
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="py-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Patient *</label>
                <select
                  value={bookingData.patientId}
                  onChange={(e) => setBookingData({ ...bookingData, patientId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {searchResults.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id}) - {p.phone}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
                  <select
                    value={bookingData.department}
                    onChange={(e) => setBookingData({ ...bookingData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Surgery">Surgery</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Doctor *</label>
                  <select
                    value={bookingData.doctorId}
                    onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                    required
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctorsList.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Time Slot</label>
                  <select
                    value={bookingData.timeSlot}
                    onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM'].map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reason for Visit</label>
                <textarea
                  rows="2"
                  value={bookingData.reason}
                  onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                  placeholder="e.g. Chest pain follow-up, routine check..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-md shadow-teal-500/20"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Digital Passport Modal */}
      <QRModal
        isOpen={!!selectedPatientForQR}
        onClose={() => setSelectedPatientForQR(null)}
        patient={selectedPatientForQR}
      />

    </div>
  );
};
