import React, { useState, useEffect } from 'react';
import { patientApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  User,
  Heart,
  Shield,
  Phone,
  FileCheck,
  AlertTriangle,
  Activity,
  Save,
  CheckCircle2
} from 'lucide-react';

export const HealthProfilePage = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const patientId = user?.patientId || 'ML-PAT-1001';

  const [patient, setPatient] = useState(null);
  const [profile, setProfile] = useState({
    height: 174,
    weight: 76,
    allergies: [],
    chronicConditions: [],
    familyHistory: '',
    insurance: { provider: '', policyNumber: '', coverageLimit: '' }
  });

  const [allergiesText, setAllergiesText] = useState('');
  const [chronicText, setChronicText] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await patientApi.getPatientById(patientId);
      setPatient(data);
      if (data.healthProfile) {
        setProfile(data.healthProfile);
        setAllergiesText(data.healthProfile.allergies?.join(', ') || '');
        setChronicText(data.healthProfile.chronicConditions?.join(', ') || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProfile();
    const unsub = subscribeToData(() => loadProfile());
    return unsub;
  }, [patientId]);

  const bmi = profile.height > 0 
    ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1) 
    : '22.0';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = {
        ...profile,
        height: Number(profile.height),
        weight: Number(profile.weight),
        bmi: Number(bmi),
        allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: chronicText.split(',').map(s => s.trim()).filter(Boolean)
      };

      await patientApi.updateHealthProfile(patientId, updated);
      addToast("Health profile updated & changes recorded in audit log!", "success");
      loadProfile();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            My Sovereign Health Profile
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Baseline clinical parameters, hereditary risks, emergency contacts, and active insurance
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Section 1: Physical Baseline & BMI */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>Anthropometric Measurements & BMI</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Height (cm)</label>
              <input
                type="number"
                value={profile.height || ''}
                onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Weight (kg)</label>
              <input
                type="number"
                value={profile.weight || ''}
                onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Calculated BMI</label>
              <div className="px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 font-mono font-black text-teal-700 dark:text-teal-300 text-sm">
                {bmi} kg/m²
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Blood Group</label>
              <div className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 font-bold text-rose-700 dark:text-rose-300 text-sm">
                {patient?.bloodGroup || 'B+'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Allergies & Chronic Conditions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Clinical Alerts: Allergies & Chronic Conditions</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Known Drug / Food Allergies (Comma separated)
              </label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa drugs, Peanuts"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Diagnosed Chronic Conditions (Comma separated)
              </label>
              <input
                type="text"
                value={chronicText}
                onChange={(e) => setChronicText(e.target.value)}
                placeholder="e.g. Type 2 Diabetes, Hypertension, Kidney Stones"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Family Medical History
            </label>
            <textarea
              rows="2"
              value={profile.familyHistory || ''}
              onChange={(e) => setProfile({ ...profile, familyHistory: e.target.value })}
              placeholder="e.g. Maternal history of diabetes; father had early cardiovascular disease at age 56"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Section 3: Insurance & Emergency */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Insurance & Emergency Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Insurance Provider</label>
              <input
                type="text"
                value={profile.insurance?.provider || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  insurance: { ...profile.insurance, provider: e.target.value }
                })}
                placeholder="e.g. Star Health Insurance"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Policy Number</label>
              <input
                type="text"
                value={profile.insurance?.policyNumber || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  insurance: { ...profile.insurance, policyNumber: e.target.value }
                })}
                placeholder="e.g. SH-BLR-2026-9921"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Coverage Limit</label>
              <input
                type="text"
                value={profile.insurance?.coverageLimit || '₹10,00,000'}
                onChange={(e) => setProfile({
                  ...profile,
                  insurance: { ...profile.insurance, coverageLimit: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
