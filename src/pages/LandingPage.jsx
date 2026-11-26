import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Building2, Stethoscope, User, Pill,
  ShieldCheck, Bell, FileText, ArrowRight, CheckCircle2,
  Lock, Eye, Heart
} from 'lucide-react';

export const LandingPage = () => {
  const roles = [
    {
      icon: Building2, label: 'Hospital', color: 'blue',
      desc: 'Manage patients, staff, appointments, and registrations in one unified dashboard.',
      path: '/login?role=hospital&tab=login'
    },
    {
      icon: Stethoscope, label: 'Doctor', color: 'emerald',
      desc: 'Write consultations, prescriptions, scan uploaded Rx, and view full patient history.',
      path: '/login?role=doctor&tab=login'
    },
    {
      icon: User, label: 'Patient', color: 'teal',
      desc: 'Own your records, approve access requests, track health metrics, and get smart reminders.',
      path: '/login?role=patient&tab=login'
    },
    {
      icon: Pill, label: 'Pharmacist', color: 'amber',
      desc: 'Process live prescription queues, generate pickup tokens, and track medicine stock.',
      path: '/login?role=pharmacist&tab=login'
    },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: 'Consent-Based Sharing',
      desc: 'Patients control exactly who sees their records, for how long, and what scope. Zero unauthorized access.'
    },
    {
      icon: FileText,
      title: 'Complete Audit Logs',
      desc: 'Every view, edit, and access request is logged with timestamp, actor, and IP — full transparency.'
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      desc: 'Condition-aware reminders — diabetes, hypertension, kidney stones. Generated from active prescriptions.'
    },
    {
      icon: Lock,
      title: 'Role-Based Guards',
      desc: 'Each portal is strictly isolated. Hospital staff cannot access doctor notes without explicit consent.'
    },
    {
      icon: Heart,
      title: 'Dynamic Health Records',
      desc: 'Patients define custom metric categories and log entries over time, visualized as interactive charts.'
    },
    {
      icon: CheckCircle2,
      title: 'Live Pharmacy Queue',
      desc: 'Prescriptions flow automatically from doctor to pharmacist. Patients track status in real time.'
    },
  ];

  const colorMap = {
    blue:    'bg-blue-100    text-blue-600    dark:bg-blue-950    dark:text-blue-300',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300',
    teal:    'bg-teal-100    text-teal-600    dark:bg-teal-950    dark:text-teal-300',
    amber:   'bg-amber-100   text-amber-600   dark:bg-amber-950   dark:text-amber-300',
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl text-slate-900 dark:text-white">
            Health<span className="text-teal-600 dark:text-teal-400">Sync</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition"
          >
            Login
          </Link>
          <Link
            to="/login?role=patient&tab=signup"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-500/20 transition"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-24 pb-20 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-6">
          <Activity className="w-3.5 h-3.5" />
          Connected Sovereign Healthcare Platform — BMSCE FSD Project
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 max-w-3xl mx-auto leading-[1.1]">
          One Record.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">
            Four Portals.
          </span>
          <br />
          Zero Silos.
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
          HealthSync connects hospitals, doctors, patients, and pharmacists around a single
          consent-based patient record — with full audit trails and zero data fragmentation.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-500/20 transition flex items-center gap-2"
          >
            Login to Portal <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login?role=patient&tab=signup"
            className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500 dark:hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 font-bold text-sm transition"
          >
            Create Patient Account
          </Link>
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-2">
            Built for Every Healthcare Role
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-10">
            Four dedicated portals, each designed for real workflow needs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map(({ icon: Icon, label, desc, color, path }) => (
              <Link
                key={label}
                to={path}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {label} Portal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Login as {label} <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-2">
            Platform Features
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-12">
            Everything a modern connected healthcare platform needs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-6 bg-gradient-to-br from-teal-600 to-emerald-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold mb-3">Ready to try HealthSync?</h2>
          <p className="text-teal-100 text-sm mb-8">
            Use the demo personas on the login page to instantly explore all four portals.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-700 font-bold text-sm shadow-lg hover:shadow-xl transition"
          >
            Open Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-xs text-slate-400">
        <p>
          HealthSync © {new Date().getFullYear()} &nbsp;•&nbsp; BMSCE FSD Final Project &nbsp;•&nbsp; Consent-Based Healthcare Platform
        </p>
      </footer>
    </div>
  );
};
