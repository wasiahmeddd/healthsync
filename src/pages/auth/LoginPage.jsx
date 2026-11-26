import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useMockData } from '../../mock';
import {
  Activity, Building2, Stethoscope, User, Pill,
  ArrowRight, Eye, EyeOff, Lock, Mail, Phone,
  Calendar, Hash, Sparkles, Clock, RefreshCw
} from 'lucide-react';

// ── Role + tab definitions ──────────────────────────────────────────────────
const ROLES = [
  { id: 'PATIENT',    label: 'Patient',      Icon: User },
  { id: 'DOCTOR',     label: 'Doctor',       Icon: Stethoscope },
  { id: 'HOSPITAL',   label: 'Hospital',     Icon: Building2 },
  { id: 'PHARMACIST', label: 'Pharmacist',   Icon: Pill },
];
const TABS = [
  { id: 'login',  label: 'Login' },
  { id: 'signup', label: 'Sign Up' },
];

// ── Animated segmented control ──────────────────────────────────────────────
const SegmentedControl = ({ options, value, onChange, size = 'lg' }) => {
  const containerRef = useRef(null);
  const [pillStyle, setPillStyle] = useState({ left: 2, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const idx = options.findIndex(o => o.id === value);
    const items = containerRef.current.querySelectorAll('[data-seg]');
    if (items[idx]) {
      setPillStyle({ left: items[idx].offsetLeft, width: items[idx].offsetWidth });
    }
  }, [value, options]);

  return (
    <div ref={containerRef} className="relative flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
      {/* sliding pill */}
      <div
        className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-slate-700 shadow-sm transition-all duration-250 ease-out pointer-events-none"
        style={{ left: pillStyle.left, width: pillStyle.width }}
      />
      {options.map(opt => {
        const Icon = opt.Icon;
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            data-seg
            onClick={() => onChange(opt.id)}
            className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors duration-200
              ${size === 'lg' ? 'py-2.5 px-2 text-xs' : 'py-1.5 px-4 text-xs'}
              ${active ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            {Icon && <Icon className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ── Generic field ───────────────────────────────────────────────────────────
const Field = ({ label, type = 'text', value, onChange, placeholder, icon: Icon, required }) => {
  const [showPw, setShowPw] = useState(false);
  const isPw = type === 'password';
  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />}
        <input
          type={isPw && showPw ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500
            ${Icon ? 'pl-10' : 'pl-4'} ${isPw ? 'pr-10' : 'pr-4'}`}
        />
        {isPw && (
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            tabIndex={-1}
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Pending approval screen ─────────────────────────────────────────────────
const PendingApproval = ({ role, email, onBack }) => (
  <div className="text-center py-8 space-y-4">
    <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center mx-auto">
      <Clock className="w-8 h-8 text-amber-500" />
    </div>
    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Account Pending Approval</h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
      Your <strong>{role.toLowerCase()}</strong> account request has been submitted. The hospital admin will review and approve it.
    </p>
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-sm font-semibold border border-amber-200 dark:border-amber-800">
      <Clock className="w-4 h-4" /> Awaiting Hospital Approval
    </div>
    <p className="text-xs text-slate-400">Approval notification will be sent to <span className="text-teal-600 dark:text-teal-400">{email}</span></p>
    <button onClick={onBack} className="text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 font-semibold underline">
      Back to login
    </button>
  </div>
);

// ── Main Page ───────────────────────────────────────────────────────────────
export const LoginPage = () => {
  const { demoPersonas, loginWithPersona, login, resetAllData } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMock = useMockData();

  // Derive role + tab from URL params
  const rawRole = searchParams.get('role')?.toUpperCase() || 'PATIENT';
  const rawTab  = searchParams.get('tab') || 'login';
  const [selectedRole, setSelectedRole] = useState(ROLES.find(r => r.id === rawRole) ? rawRole : 'PATIENT');
  const [activeTab,    setActiveTab]    = useState(TABS.find(t => t.id === rawTab)   ? rawTab  : 'login');
  const [loading,      setLoading]      = useState(false);
  const [pendingApproval, setPendingApproval] = useState(null); // { role, email }

  const [form, setForm] = useState({
    name: '', email: '', phone: '', dob: '',
    password: '', confirmPassword: '',
    licenseNumber: '', hospitalName: '', registrationNumber: ''
  });
  const upd = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  const syncURL = (role, tab) => setSearchParams({ role: role.toLowerCase(), tab });

  const handleRoleChange = role => { setSelectedRole(role); setPendingApproval(null); syncURL(role, activeTab); };
  const handleTabChange  = tab  => { setActiveTab(tab);    setPendingApproval(null); syncURL(selectedRole, tab); };

  const handlePersonaSelect = persona => {
    loginWithPersona(persona);
    addToast(`Signed in as ${persona.name}`, 'success');
    navigate(persona.portalPath);
  };

  const handleLogin = async e => {
    e.preventDefault();
    if (!form.email) { addToast('Enter your email address', 'warning'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password || 'password123');
      addToast(`Welcome back, ${user.name}!`, 'success');
      const paths = { HOSPITAL: '/hospital/overview', DOCTOR: '/doctor/queue', PATIENT: '/patient/dashboard', PHARMACIST: '/pharmacist/queue' };
      navigate(paths[user.role] || '/');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { addToast('Please fill all required fields', 'warning'); return; }
    if (form.password !== form.confirmPassword) { addToast('Passwords do not match', 'error'); return; }
    if (form.password.length < 6) { addToast('Password must be at least 6 characters', 'warning'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // simulated network
    setLoading(false);
    if (selectedRole === 'PATIENT') {
      addToast('Account created! You can now log in.', 'success');
      handleTabChange('login');
    } else {
      setPendingApproval({ role: selectedRole, email: form.email });
    }
  };

  const roleLabel = ROLES.find(r => r.id === selectedRole)?.label || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-center py-12 px-4">

      {/* Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          College FSD Project • Connected Healthcare Platform
        </div>
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-teal-500/20">
            <Activity className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Health<span className="text-teal-600 dark:text-teal-400">Sync</span>
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
          One unified patient record connecting hospitals, doctors, patients, and pharmacists.
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT: Auth Card ── */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">

          {!pendingApproval ? (
            <>
              {/* Role Selector */}
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  {activeTab === 'login' ? 'Login as' : 'Sign up as'}
                </p>
                <SegmentedControl options={ROLES} value={selectedRole} onChange={handleRoleChange} size="lg" />
              </div>

              {/* Login / Sign Up Toggle */}
              <div className="mb-6">
                <SegmentedControl options={TABS} value={activeTab} onChange={handleTabChange} size="sm" />
              </div>

              {/* Login Form */}
              {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <Field label="Email Address" type="email" value={form.email} onChange={upd('email')} placeholder="your@email.com" icon={Mail} required />
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                      <button type="button" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">Forgot password?</button>
                    </div>
                    <Field type="password" value={form.password} onChange={upd('password')} placeholder="••••••••" icon={Lock} />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition disabled:opacity-60"
                  >
                    {loading ? 'Authenticating…' : `Login as ${roleLabel}`}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-center text-slate-400">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => handleTabChange('signup')} className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                      Sign up
                    </button>
                  </p>
                </form>
              ) : (
                /* Sign Up Form */
                <form onSubmit={handleSignup} className="space-y-4">
                  <Field label="Full Name" value={form.name} onChange={upd('name')} placeholder="Your full name" icon={User} required />
                  <Field label="Email Address" type="email" value={form.email} onChange={upd('email')} placeholder="your@email.com" icon={Mail} required />
                  {selectedRole === 'PATIENT' && (
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Phone" value={form.phone} onChange={upd('phone')} placeholder="+91 9876543210" icon={Phone} />
                      <Field label="Date of Birth" type="date" value={form.dob} onChange={upd('dob')} icon={Calendar} />
                    </div>
                  )}
                  {(selectedRole === 'DOCTOR' || selectedRole === 'PHARMACIST') && (
                    <>
                      <Field label="License / Registration Number" value={form.licenseNumber} onChange={upd('licenseNumber')} placeholder="e.g. KMC-48291" icon={Hash} required />
                      <Field label="Hospital Name" value={form.hospitalName} onChange={upd('hospitalName')} placeholder="Your hospital" icon={Building2} required />
                    </>
                  )}
                  {selectedRole === 'HOSPITAL' && (
                    <Field label="Hospital Registration Number" value={form.registrationNumber} onChange={upd('registrationNumber')} placeholder="e.g. KAR-HOSP-2024" icon={Hash} required />
                  )}
                  <Field label="Password" type="password" value={form.password} onChange={upd('password')} placeholder="Min. 6 characters" icon={Lock} required />
                  <Field label="Confirm Password" type="password" value={form.confirmPassword} onChange={upd('confirmPassword')} placeholder="••••••••" icon={Lock} required />

                  {selectedRole !== 'PATIENT' && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                      ⚠ {roleLabel} accounts require approval from a hospital admin before you can log in.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition disabled:opacity-60"
                  >
                    {loading ? 'Creating account…' : `Create ${roleLabel} Account`}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-center text-slate-400">
                    Already have an account?{' '}
                    <button type="button" onClick={() => handleTabChange('login')} className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                      Log in
                    </button>
                  </p>
                </form>
              )}
            </>
          ) : (
            <PendingApproval
              role={pendingApproval.role}
              email={pendingApproval.email}
              onBack={() => { setPendingApproval(null); handleTabChange('login'); }}
            />
          )}
        </div>

        {/* ── RIGHT: Demo Switcher (only when mock ON) or Info ── */}
        <div className="lg:col-span-5">
          {isMock ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-500" /> Demo Personas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Click to log in instantly</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Reset all data to initial seed state?')) {
                      resetAllData();
                      addToast('Data reset to initial seed', 'info');
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="space-y-2 flex-1">
                {demoPersonas.map((persona, i) => (
                  <button
                    key={i}
                    onClick={() => handlePersonaSelect(persona)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-teal-500 hover:bg-white dark:hover:bg-slate-800 flex items-center gap-3 text-left transition group"
                  >
                    <img
                      src={persona.avatar}
                      alt={persona.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {persona.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold">
                          {persona.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{persona.title}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500 flex-shrink-0" />
                  </button>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Presentation Flow:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Hospital books appointment', 'Doctor writes Rx', 'Pharmacist generates token', 'Patient reviews & consents'].map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-5 h-full min-h-[300px]">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center">
                <Activity className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">HealthSync</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                  Sign up to create your patient, doctor, hospital, or pharmacist account.
                  All records are consent-based with granular access controls.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-700 dark:text-teal-300 text-left w-full space-y-1">
                <p>✓ Consent-based sharing</p>
                <p>✓ Full audit trail</p>
                <p>✓ Smart health reminders</p>
                <p>✓ Live pharmacy queue tracking</p>
              </div>
            </div>
          )}
        </div>

      </div>

      <p className="text-center text-xs text-slate-400 mt-8">
        HealthSync Security v1.0 • AES-256 Mock Encryption • BMSCE FSD 2026
      </p>
    </div>
  );
};
