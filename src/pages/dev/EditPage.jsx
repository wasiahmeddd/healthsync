import React, { useState } from 'react';
import { Settings, Database, RefreshCw, ToggleLeft, ToggleRight, AlertTriangle, ExternalLink } from 'lucide-react';
import { useMockData, setMockData } from '../../mock';
import { resetToSeedData } from '../../api';

export const EditPage = () => {
  const [isMock, setIsMock] = useState(useMockData());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggle = () => {
    const next = !isMock;
    setMockData(next);
    setIsMock(next);
    // Reload so all API calls and AuthContext reflect the new mode
    window.location.href = '/login';
  };

  const handleReset = () => {
    resetToSeedData();
    setShowResetConfirm(false);
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">Developer Settings</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Not linked in UI — only via /edit URL</p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2 text-amber-800 dark:text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>These are <strong>development/demo-only</strong> settings. Changes reload the app.</span>
        </div>

        {/* Mock Data Toggle */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Database className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white">Use Mock Seed Data</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isMock
                    ? 'ON — 2 hospitals, 4 doctors, 5 patients pre-loaded'
                    : 'OFF — empty state, data you create via forms is stored separately'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className={`flex-shrink-0 transition-colors ${isMock ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}
              title={isMock ? 'Turn off mock data' : 'Turn on mock data'}
            >
              {isMock
                ? <ToggleRight className="w-9 h-9" />
                : <ToggleLeft className="w-9 h-9" />
              }
            </button>
          </div>

          <div className={`p-3 rounded-xl text-xs font-medium ${isMock
            ? 'bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300'
            : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
          }`}>
            {isMock
              ? '✓ Demo Switcher is visible in Navbar. All portals show pre-seeded data.'
              : '○ Demo Switcher is hidden. All lists show empty states until you create data via forms.'}
          </div>
        </div>

        {/* Reset Button */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <RefreshCw className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">Reset Mock Data</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Wipe all changes and restore initial seed data</p>
            </div>
          </div>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              Reset to Seed Data
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <p className="text-xs text-rose-700 dark:text-rose-300 mb-3 font-semibold">
                This will delete all demo changes. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back to App */}
        <div className="text-center pt-2">
          <a href="/login" className="inline-flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold">
            <ExternalLink className="w-3.5 h-3.5" /> Go to Login
          </a>
          <p className="text-xs text-slate-400 mt-2">HealthSync Dev Panel • Not linked in navigation</p>
        </div>

      </div>
    </div>
  );
};
