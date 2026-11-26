import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
    <div className="text-center max-w-sm">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-9 h-9 text-slate-400" />
      </div>
      <h1 className="text-7xl font-extrabold text-slate-900 dark:text-white mb-2">404</h1>
      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Page Not Found</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={() => window.history.back()} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <Link to="/home" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition">
          <Home className="w-4 h-4" /> Home
        </Link>
      </div>
    </div>
  </div>
);
