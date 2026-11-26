import React, { useState, useEffect } from 'react';
import { reminderApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  BellRing,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  Heart,
  Droplet,
  Activity,
  CheckCircle2,
  AlertCircle,
  X,
  Sliders
} from 'lucide-react';

export const SmartRemindersPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const patientId = user?.patientId || 'ML-PAT-1001';
  const [reminders, setReminders] = useState([]);
  const [matchedRules, setMatchedRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Custom Reminder
  const [newRem, setNewRem] = useState({
    title: '',
    description: '',
    timeSchedule: '08:00 AM Daily',
    category: 'LIFESTYLE'
  });

  const loadReminders = async () => {
    try {
      const [rems, rules] = await Promise.all([
        reminderApi.getReminders(patientId),
        reminderApi.evaluateRulesEngine(patientId)
      ]);
      setReminders(rems);
      setMatchedRules(rules);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
    const unsub = subscribeToData(() => loadReminders());
    return unsub;
  }, [patientId]);

  const handleToggle = async (id, currentState) => {
    try {
      await reminderApi.toggleReminder(id, !currentState);
      addToast(`Reminder ${!currentState ? 'activated' : 'muted'}`, 'info');
      loadReminders();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await reminderApi.deleteReminder(id);
      addToast("Reminder removed", "info");
      loadReminders();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!newRem.title) {
      addToast("Please provide reminder title", "warning");
      return;
    }
    try {
      await reminderApi.createReminder(patientId, newRem);
      addToast("Custom smart reminder created!", "success");
      setShowAddModal(false);
      setNewRem({ title: '', description: '', timeSchedule: '08:00 AM Daily', category: 'LIFESTYLE' });
      loadReminders();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'HYDRATION': return Droplet;
      case 'MEASUREMENT': return Activity;
      case 'MEDICATION': return Heart;
      case 'APPOINTMENT': return Clock;
      default: return BellRing;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Smart Reminders & Condition Rules Engine
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold">
              Automated
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Rules engine dynamically triggers custom alerts based on diagnosed chronic conditions & active prescriptions
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Reminder</span>
        </button>
      </div>

      {/* Rules Engine Active Triggers Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 p-5 rounded-3xl border border-teal-200 dark:border-teal-800 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
            Rules Engine Triggers ({matchedRules.length} matched for your profile)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {matchedRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-teal-100 dark:border-teal-800/60 text-xs space-y-1 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-white">
                  {rule.conditionKeyword}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded font-bold bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  {rule.category}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                {rule.reminderMessage}
              </p>
              <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-semibold block pt-1">
                ⏱ {rule.defaultSchedule}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Reminders List */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Active Health & Medication Reminders ({reminders.length})
          </h3>
          <span className="text-xs text-slate-400">
            Toggle switches to customize schedule
          </span>
        </div>

        <div className="space-y-3">
          {reminders.map((rem) => {
            const Icon = getCategoryIcon(rem.category);
            return (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  rem.isEnabled
                    ? 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    : 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3.5 text-xs">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                    rem.isEnabled
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {rem.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {rem.source}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      {rem.description}
                    </p>
                    <span className="inline-block mt-1 font-mono font-bold text-teal-600 dark:text-teal-400 text-[11px]">
                      ⏰ Schedule: {rem.timeSchedule}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rem.isEnabled}
                      onChange={() => handleToggle(rem.id, rem.isEnabled)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>

                  <button
                    onClick={() => handleDelete(rem.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add Custom Reminder */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Create Custom Reminder</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reminder Title *</label>
                <input
                  type="text"
                  required
                  value={newRem.title}
                  onChange={(e) => setNewRem({ ...newRem, title: e.target.value })}
                  placeholder="e.g. Post-lunch 10 min walk, Eye drops"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Schedule / Frequency *</label>
                <input
                  type="text"
                  required
                  value={newRem.timeSchedule}
                  onChange={(e) => setNewRem({ ...newRem, timeSchedule: e.target.value })}
                  placeholder="e.g. 02:00 PM Daily, Every 3 hours"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                <select
                  value={newRem.category}
                  onChange={(e) => setNewRem({ ...newRem, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="LIFESTYLE">Lifestyle</option>
                  <option value="MEDICATION">Medication</option>
                  <option value="MEASUREMENT">Measurement / Test</option>
                  <option value="HYDRATION">Hydration</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={newRem.description}
                  onChange={(e) => setNewRem({ ...newRem, description: e.target.value })}
                  placeholder="Extra instructions or targets"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl">Save Reminder</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
