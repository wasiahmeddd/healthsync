import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, UserPlus, CalendarPlus, Calendar,
  Users, Stethoscope, ClipboardList, ShieldCheck, Clock,
  User, Activity, BellRing, Pill, Archive, AlertCircle,
  FileText, ScanLine
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  // Derive active portal from URL pathname
  let currentPortal = 'HOSPITAL';
  if (path.startsWith('/doctor')) currentPortal = 'DOCTOR';
  else if (path.startsWith('/patient')) currentPortal = 'PATIENT';
  else if (path.startsWith('/pharmacist') || path.startsWith('/pharmacy')) currentPortal = 'PHARMACIST';

  const getLinks = () => {
    switch (currentPortal) {
      case 'HOSPITAL':
        return [
          { to: '/hospital/overview',          label: 'Overview',           icon: LayoutDashboard },
          { to: '/hospital/appointments',       label: 'Appointments',       icon: Calendar },
          { to: '/hospital/book-appointment',   label: 'Book Appointment',   icon: CalendarPlus },
          { to: '/hospital/register-patient',   label: 'Register Patient',   icon: UserPlus },
          { to: '/hospital/staff',              label: 'Doctors & Staff',    icon: Users },
        ];
      case 'DOCTOR':
        return [
          { to: '/doctor/queue',                label: "Today's Queue",      icon: ClipboardList },
          { to: '/doctor/scan-prescription',    label: 'Scan Prescription',  icon: ScanLine },
          { to: '/doctor/second-opinion',       label: 'Second Opinion',     icon: ShieldCheck },
        ];
      case 'PATIENT':
        return [
          { to: '/patient/dashboard',           label: 'Dashboard',          icon: LayoutDashboard },
          { to: '/patient/timeline',            label: 'Visit Timeline',     icon: Clock },
          { to: '/patient/health-profile',      label: 'Health Profile',     icon: User },
          { to: '/patient/prescriptions',       label: 'Prescriptions',      icon: Pill },
          { to: '/patient/records',             label: 'Dynamic Records',    icon: Activity },
          { to: '/patient/documents',           label: 'Documents',          icon: FileText },
          { to: '/patient/privacy',             label: 'Privacy Center',     icon: ShieldCheck, highlight: true },
          { to: '/patient/reminders',           label: 'Smart Reminders',    icon: BellRing },
        ];
      case 'PHARMACIST':
        return [
          { to: '/pharmacist/queue',            label: 'Live Rx Queue',      icon: Pill },
          { to: '/pharmacist/history',          label: 'Dispensed History',  icon: Archive },
          { to: '/pharmacist/stock',            label: 'Stock & Out-of-Stock', icon: AlertCircle },
        ];
      default:
        return [];
    }
  };

  const portalInfo = {
    HOSPITAL:   { name: 'Anita Desai', roleTitle: 'Hospital Admin', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
    DOCTOR:     { name: 'Dr. Priya Sharma', roleTitle: 'Chief Cardiologist', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80' },
    PATIENT:    { name: 'Rahul Verma', roleTitle: 'Patient (ML-PAT-1001)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    PHARMACIST: { name: 'Suresh Gupta, R.Ph.', roleTitle: 'Lead Pharmacist', avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80' },
  }[currentPortal];

  const links = getLinks();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-5">

        {/* Portal Active Persona Badge */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <img
            src={portalInfo.avatar}
            alt={portalInfo.name}
            className="w-10 h-10 rounded-xl object-cover border border-teal-500/30 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{portalInfo.name}</h4>
            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold truncate">
              {portalInfo.roleTitle}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2 block">
            {currentPortal} Menu
          </span>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  } ${link.highlight ? 'border border-teal-500/30' : ''}`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
                {link.highlight && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer consent blurb */}
      <div className="p-3 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-2xl border border-teal-500/20 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-teal-700 dark:text-teal-300 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Consent Sovereign</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          All clinical records are patient-encrypted with granular duration & scope permissions.
        </p>
      </div>
    </aside>
  );
};
