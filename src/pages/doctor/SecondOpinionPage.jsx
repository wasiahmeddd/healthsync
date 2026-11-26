import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  ShieldCheck,
  Send,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const SecondOpinionPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [patientId, setPatientId] = useState('ML-PAT-1001');
  const [purpose, setPurpose] = useState('Second Opinion Consultation: Evaluating cardiac risk before surgery');
  const [scope, setScope] = useState('FULL');
  const [duration, setDuration] = useState('7 Days');
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = async () => {
    try {
      const docId = user?.doctorId || 'DOC-04';
      const reqs = await doctorApi.getDoctorAccessRequests(docId);
      setRequests(reqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    const unsub = subscribeToData(() => loadRequests());
    return unsub;
  }, [user]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!patientId.trim()) {
      addToast("Please provide a valid Patient ID", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const docId = user?.doctorId || 'DOC-04';
      await doctorApi.requestSecondOpinionAccess({
        doctorId: docId,
        patientId: patientId.trim(),
        purpose,
        requestedScope: scope,
        requestedDuration: duration
      });
      addToast(`Access request dispatched to Patient ${patientId}! Check Patient Portal Privacy Center to approve.`, "success");
      loadRequests();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Second Opinion & Inter-Hospital Consent
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              HealthSync sovereign consent protocol: Patients hold sovereign encryption keys. Access requires explicit approval.
            </p>
          </div>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 self-start sm:self-auto">
          Logged in as: {user?.name} ({user?.doctorId})
        </div>
      </div>

      {/* Grid: Form on Left, Sent Requests on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Request Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span>Request Patient Medical Access</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Send an authorized access request to a patient by their unique HealthSync ID. The patient can approve or deny in their Privacy Center.
          </p>

          <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Target Patient ID *
              </label>
              <input
                type="text"
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="e.g. ML-PAT-1001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Tip: Try Rahul Verma (`ML-PAT-1001`) or Ananya Rao (`ML-PAT-1002`)
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Clinical Purpose *
              </label>
              <textarea
                rows="2"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Cross-evaluation of cardiac vitals before elective surgery"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Requested Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white font-semibold"
                >
                  <option value="FULL">Full Clinical History</option>
                  <option value="PRESCRIPTIONS_ONLY">Prescriptions Only</option>
                  <option value="LABS_ONLY">Labs & Scans Only</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Requested Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white font-semibold"
                >
                  <option value="24 Hours">24 Hours</option>
                  <option value="7 Days">7 Days</option>
                  <option value="30 Days">30 Days</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-2 mt-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Dispatching..." : "Send Consent Access Request"}</span>
            </button>
          </form>
        </div>

        {/* Requests Status List */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Access Requests & Authorization Status</span>
            </h3>
            <span className="text-xs text-slate-400">
              {requests.length} Requests Sent
            </span>
          </div>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                You have not initiated any second opinion access requests yet.
              </div>
            ) : (
              requests.map((req) => {
                const isApproved = req.status === 'Approved';
                const isPending = req.status === 'Pending';
                const isDenied = req.status === 'Denied';

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isApproved
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                        : isPending
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {req.patientName}
                          </span>
                          <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                            {req.patientId}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                          Purpose: <span className="font-medium text-slate-800 dark:text-slate-200">{req.purpose}</span>
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span>Scope: <strong className="text-slate-700 dark:text-slate-300">{req.requestedScope}</strong></span>
                          <span>•</span>
                          <span>Duration: {req.requestedDuration}</span>
                          <span>•</span>
                          <span>Sent: {req.requestedAt}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 flex-shrink-0 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {isApproved ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {req.status}
                      </span>
                    </div>

                    {/* Action button if approved */}
                    {isApproved ? (
                      <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          ✓ Patient consented (Expires: {req.expiresAt || '30 days'})
                        </span>
                        <button
                          onClick={() => navigate(`/doctor/consultation?aptId=APT-SECOND-OPINION&patientId=${req.patientId}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                        >
                          <span>Open Sovereign Record</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : isPending ? (
                      <div className="mt-3 pt-2 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting patient authorization in the Patient Portal Privacy Center.</span>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
