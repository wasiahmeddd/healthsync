import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage = () => {
  const { role } = useAuth();
  const homeMap = {
    HOSPITAL:   '/hospital/overview',
    DOCTOR:     '/doctor/queue',
    PATIENT:    '/patient/dashboard',
    PHARMACIST: '/pharmacist/queue',
  };
  const home = homeMap[role] || '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-9 h-9 text-rose-500" />
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-2">403</h1>
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Unauthorized Access</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          You don't have permission to access this page. Each portal is role-restricted — 
          patient data is consent-gated and never accessible by ID alone.
        </p>
        <Link
          to={home}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Portal
        </Link>
      </div>
    </div>
  );
};
