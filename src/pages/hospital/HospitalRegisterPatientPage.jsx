import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hospitalApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { QRModal } from '../../components/common/QRModal';
import { UserPlus, ChevronLeft } from 'lucide-react';

const BLANK = {
  name: '', email: '', phone: '', dob: '1995-04-10',
  gender: 'Male', bloodGroup: 'O+', address: 'Bangalore',
  height: 172, weight: 70, allergies: 'None', chronicConditions: 'None',
  emergencyContactName: '', emergencyContactPhone: '', insuranceProvider: 'Star Health'
};

export const HospitalRegisterPatientPage = () => {
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [createdPatient, setCreatedPatient] = useState(null);
  const [form, setForm] = useState(BLANK);

  const upd = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.phone) { addToast('Name and phone are required', 'warning'); return; }
    setLoading(true);
    try {
      const created = await hospitalApi.registerPatient(form);
      addToast(`Patient ${created.name} registered! ID: ${created.id}`, 'success');
      setCreatedPatient({ ...created, patientId: created.id });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const textFields = [
    { label: 'Full Name', field: 'name', type: 'text', required: true, placeholder: 'Patient full name' },
    { label: 'Phone', field: 'phone', type: 'tel', required: true, placeholder: '+91 9876543210' },
    { label: 'Email', field: 'email', type: 'email', placeholder: 'patient@email.com' },
    { label: 'Date of Birth', field: 'dob', type: 'date' },
    { label: 'Address', field: 'address', type: 'text', placeholder: 'Full address' },
    { label: 'Emergency Contact Name', field: 'emergencyContactName', type: 'text', placeholder: 'Guardian name' },
    { label: 'Emergency Contact Phone', field: 'emergencyContactPhone', type: 'tel', placeholder: '+91 9876543210' },
    { label: 'Insurance Provider', field: 'insuranceProvider', type: 'text', placeholder: 'e.g. Star Health' },
    { label: 'Known Allergies', field: 'allergies', type: 'text', placeholder: 'e.g. Penicillin, Peanuts or None' },
    { label: 'Chronic Conditions', field: 'chronicConditions', type: 'text', placeholder: 'e.g. Type 2 Diabetes or None' },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link to="/hospital/overview" className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-2 w-fit">
          <ChevronLeft className="w-3.5 h-3.5" /> Hospital Overview
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-teal-600" /> Register New Patient
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Creates a unique HealthSync Patient ID and QR code</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">

        {/* Text Fields */}
        {textFields.map(f => (
          <div key={f.field}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {f.label} {f.required && <span className="text-rose-500">*</span>}
            </label>
            <input
              type={f.type}
              value={form[f.field]}
              onChange={upd(f.field)}
              placeholder={f.placeholder}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        ))}

        {/* Selects row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
            <select value={form.gender} onChange={upd('gender')}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
              {['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Blood Group</label>
            <select value={form.bloodGroup} onChange={upd('bloodGroup')}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Height (cm)</label>
            <input type="number" value={form.height} onChange={upd('height')}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Weight (kg)</label>
            <input type="number" value={form.weight} onChange={upd('weight')}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        {/* Form Actions: Cancel LEFT, Submit RIGHT */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link to="/hospital/overview"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-500/20 transition disabled:opacity-60 flex items-center gap-2">
            {loading ? 'Registering…' : 'Register Patient'}
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {createdPatient && (
        <QRModal
          patient={createdPatient}
          onClose={() => { setCreatedPatient(null); navigate('/hospital/overview'); }}
        />
      )}
    </div>
  );
};
