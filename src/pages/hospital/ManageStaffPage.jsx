import React, { useState, useEffect } from 'react';
import { doctorApi, hospitalApi, subscribeToData, getStoredData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Users,
  UserPlus,
  Stethoscope,
  Pill,
  CheckCircle2,
  XCircle,
  Building2,
  Phone,
  Mail,
  Shield,
  X
} from 'lucide-react';

export const ManageStaffPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [doctors, setDoctors] = useState([]);
  const [pharmacists, setPharmacists] = useState([]);
  const [activeTab, setActiveTab] = useState('DOCTORS'); // 'DOCTORS' or 'PHARMACISTS'
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showAddPharmModal, setShowAddPharmModal] = useState(false);

  // New Doctor Form
  const [newDoc, setNewDoc] = useState({
    name: '',
    email: '',
    department: 'General Medicine',
    specialization: 'Consultant Physician',
    qualification: 'MBBS, MD',
    licenseNumber: 'KMC-99211',
    consultationFee: 600,
    gender: 'Male'
  });

  // New Pharmacist Form
  const [newPharm, setNewPharm] = useState({
    name: '',
    email: '',
    counter: 'Counter 3 - OPD',
    licenseNumber: 'PH-KAR-5501'
  });

  const loadStaff = async () => {
    try {
      const data = getStoredData();
      setDoctors(data.doctors || []);
      setPharmacists(data.pharmacists || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStaff();
    const unsub = subscribeToData(() => loadStaff());
    return unsub;
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!newDoc.name || !newDoc.email) {
      addToast("Please fill in required fields", "warning");
      return;
    }
    try {
      await hospitalApi.addDoctor({
        ...newDoc,
        hospitalId: user?.hospitalId || 'HOSP-01',
        hospitalName: user?.hospitalName || 'Apollo Multispeciality Hospital'
      });
      addToast(`Doctor ${newDoc.name} registered on roster!`, "success");
      setShowAddDocModal(false);
      loadStaff();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleAddPharmacist = async (e) => {
    e.preventDefault();
    if (!newPharm.name || !newPharm.email) {
      addToast("Please fill in required fields", "warning");
      return;
    }
    try {
      await hospitalApi.addPharmacist({
        ...newPharm,
        hospitalId: user?.hospitalId || 'HOSP-01',
        hospitalName: user?.hospitalName || 'Apollo Main Pharmacy'
      });
      addToast(`Pharmacist ${newPharm.name} registered!`, "success");
      setShowAddPharmModal(false);
      loadStaff();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Hospital Staff & Duty Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage practicing consultants, on-duty duty roster, and registered dispensary staff
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'DOCTORS' ? (
            <button
              onClick={() => setShowAddDocModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Doctor</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddPharmModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Pharmacist</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('DOCTORS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'DOCTORS'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctors & Specialists ({doctors.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('PHARMACISTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'PHARMACISTS'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Registered Pharmacists ({pharmacists.length})</span>
        </button>
      </div>

      {/* Doctor Cards Grid */}
      {activeTab === 'DOCTORS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map(doc => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {doc.name}
                    </h3>
                  </div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold truncate">
                    {doc.specialization}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {doc.department} • {doc.qualification}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Hospital:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{doc.hospitalName}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>License:</span>
                  <span className="font-mono font-medium">{doc.licenseNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Fee:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">₹{doc.consultationFee}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 items-center">
                  <span>Duty Status:</span>
                  <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                    doc.isOnDuty 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {doc.isOnDuty ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {doc.isOnDuty ? 'On Duty' : 'Off Duty'}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400">
                <span>Available Slots: {doc.availableSlots?.join(', ') || '10:00 AM - 04:00 PM'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pharmacists List */}
      {activeTab === 'PHARMACISTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pharmacists.map(ph => (
            <div
              key={ph.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {ph.name}
                  </h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    {ph.counter}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    License: <span className="font-mono">{ph.licenseNumber}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Assigned Dispensary:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{ph.hospitalName}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Email:</span>
                  <span className="font-mono text-slate-500">{ph.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Add Doctor to Staff</h3>
              <button onClick={() => setShowAddDocModal(false)} className="text-slate-400 p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddDoctor} className="py-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  placeholder="Dr. Anirudh Sen"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newDoc.email}
                    onChange={(e) => setNewDoc({ ...newDoc, email: e.target.value })}
                    placeholder="anirudh@healthsync.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
                  <select
                    value={newDoc.department}
                    onChange={(e) => setNewDoc({ ...newDoc, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Surgery">Surgery</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Specialization</label>
                  <input
                    type="text"
                    value={newDoc.specialization}
                    onChange={(e) => setNewDoc({ ...newDoc, specialization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">License No.</label>
                  <input
                    type="text"
                    value={newDoc.licenseNumber}
                    onChange={(e) => setNewDoc({ ...newDoc, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddDocModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white rounded-xl font-bold">Add to Roster</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Pharmacist Modal */}
      {showAddPharmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Add Registered Pharmacist</h3>
              <button onClick={() => setShowAddPharmModal(false)} className="text-slate-400 p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddPharmacist} className="py-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newPharm.name}
                  onChange={(e) => setNewPharm({ ...newPharm, name: e.target.value })}
                  placeholder="Kavitha Nair, B.Pharm"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newPharm.email}
                  onChange={(e) => setNewPharm({ ...newPharm, email: e.target.value })}
                  placeholder="kavitha.pharm@healthsync.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Counter</label>
                  <input
                    type="text"
                    value={newPharm.counter}
                    onChange={(e) => setNewPharm({ ...newPharm, counter: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">License No.</label>
                  <input
                    type="text"
                    value={newPharm.licenseNumber}
                    onChange={(e) => setNewPharm({ ...newPharm, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddPharmModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white rounded-xl font-bold">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
