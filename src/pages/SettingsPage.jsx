import React, { useState } from 'react';
import { Settings, Moon, Sun, Bell, Shield, User, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, role } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  const roleBadge = { HOSPITAL: 'Hospital Admin', DOCTOR: 'Doctor Portal', PATIENT: 'Patient Portal', PHARMACIST: 'Pharmacy Portal' };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal-600" /> Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences</p>
      </div>

      {/* Account */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm mb-4">
          <User className="w-4 h-4 text-teal-600" /> Account
        </h2>
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500/30"
          />
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{user?.name || 'Guest'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || '—'}</p>
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 inline-block mt-1">
              {roleBadge[role] || 'Guest'}
            </span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm mb-4">
          {theme === 'dark' ? <Moon className="w-4 h-4 text-teal-600" /> : <Sun className="w-4 h-4 text-teal-600" />}
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Dark Mode</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark theme</p>
          </div>
          <Toggle value={theme === 'dark'} onChange={toggleTheme} />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
          <Bell className="w-4 h-4 text-teal-600" /> Notifications
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Push Notifications</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Alerts for appointments and prescriptions</p>
          </div>
          <Toggle value={notificationsEnabled} onChange={setNotificationsEnabled} />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Email Alerts</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Summary emails for key events</p>
          </div>
          <Toggle value={emailAlerts} onChange={setEmailAlerts} />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm mb-4">
          <Shield className="w-4 h-4 text-teal-600" /> Security & Privacy
        </h2>
        <div className="space-y-3">
          {[
            { label: 'End-to-End Encryption', value: 'AES-256 Active', ok: true },
            { label: 'Audit Logging', value: 'Enabled', ok: true },
            { label: 'Consent Gate', value: 'All records patient-gated', ok: true },
            { label: 'Session', value: 'Mock JWT (Phase 2: Real JWT)', ok: true },
          ].map(({ label, value, ok }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <p className="text-sm text-slate-700 dark:text-slate-300">{label}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Developer */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Developer</h2>
        <a
          href="/edit"
          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Dev Settings</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mock data toggle, data reset</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </a>
      </div>
    </div>
  );
};
