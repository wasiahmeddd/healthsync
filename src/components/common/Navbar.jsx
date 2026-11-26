import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import {
  Activity,
  Building2,
  Stethoscope,
  User,
  Pill,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const Navbar = () => {
  const { role, loginWithPersona, demoPersonas, resetAllData } = useAuth();

  const portals = [
    {
      to: '/hospital',
      label: 'Hospital',
      icon: Building2,
      role: 'HOSPITAL',
      color: 'hover:text-blue-600 dark:hover:text-blue-400'
    },
    {
      to: '/doctor',
      label: 'Doctor',
      icon: Stethoscope,
      role: 'DOCTOR',
      color: 'hover:text-emerald-600 dark:hover:text-emerald-400'
    },
    {
      to: '/patient',
      label: 'Patient',
      icon: User,
      role: 'PATIENT',
      color: 'hover:text-teal-600 dark:hover:text-teal-400'
    },
    {
      to: '/pharmacist',
      label: 'Pharmacist',
      icon: Pill,
      role: 'PHARMACIST',
      color: 'hover:text-amber-600 dark:hover:text-amber-400'
    },
  ];

  const handlePortalSwitch = (portalRole) => {
    const persona = demoPersonas.find(p => p.role === portalRole);
    if (persona) {
      loginWithPersona(persona);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <Link to="/hospital" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              Health<span className="text-teal-600 dark:text-teal-400">Sync</span>
            </span>
            <span className="text-[10px] block -mt-1 font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
              Live Demo
            </span>
          </div>
        </Link>

        {/* 4 Portals Segmented Bar - 1-CLICK PRESENTATION SWITCHER */}
        <nav className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-xl flex-1 justify-center">
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <NavLink
                key={p.to}
                to={p.to}
                onClick={() => handlePortalSwitch(p.role)}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{p.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right utility buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data back to clean state?')) {
                resetAllData();
              }
            }}
            title="Reset demo data"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <ThemeToggle />
        </div>

      </div>
    </header>
  );
};
