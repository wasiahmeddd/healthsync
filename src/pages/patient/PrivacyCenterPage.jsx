import React, { useState, useEffect } from 'react';
import { consentApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Calendar,
  Building2,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';

export const PrivacyCenterPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const patientId = user?.patientId || 'ML-PAT-1001';
  const [requests, setRequests] = useState([]);
  const [grants, setGrants] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Approval Modal Configuration
  const [activeModalRequest, setActiveModalRequest] = useState(null);
  const [selectedScope, setSelectedScope] = useState('FULL');
  const [selectedDuration, setSelectedDuration] = useState('7 Days');

  const loadConsentData = async () => {
    try {
      const [reqs, grnts, logs] = await Promise.all([
        consentApi.getAccessRequests(patientId),
        consentApi.getActiveGrants(patientId),
        consentApi.getAuditLogs(patientId)
      ]);
      setRequests(reqs);
      setGrants(grnts);
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsentData();
    const unsub = subscribeToData(() => loadConsentData());
    return unsub;
  }, [patientId]);

  const handleOpenApproveModal = (req) => {
    setActiveModalRequest(req);
    setSelectedScope(req.requestedScope || 'FULL');
    setSelectedDuration(req.requestedDuration || '7 Days');
  };

  const handleConfirmApproval = async () => {
    if (!activeModalRequest) return;
    try {
      await consentApi.approveRequest({
        requestId: activeModalRequest.id,
        patientId,
        scope: selectedScope,
        duration: selectedDuration
      });
      addToast(`Access granted to ${activeModalRequest.doctorName} (${selectedScope} for ${selectedDuration})`, "success");
      setActiveModalRequest(null);
      loadConsentData();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleDenyRequest = async (requestId) => {
    if (!confirm("Are you sure you want to decline this doctor's access request?")) return;
    try {
      await consentApi.denyRequest({ requestId, patientId });
      addToast("Access request declined", "info");
      loadConsentData();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleRevokeGrant = async (grantId) => {
    if (!confirm("Immediately revoke this physician's access privileges?")) return;
    try {
      await consentApi.revokeGrant({ grantId, patientId });
      addToast("Doctor's access revoked immediately", "success");
      loadConsentData();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Sovereign Consent Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Patient Privacy Center & Access Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            You own your clinical data. External hospitals and physicians cannot view your records without your explicit approval. Revoke permissions anytime.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-xs text-slate-400 block font-semibold">Active Consents</span>
            <span className="text-2xl font-black text-teal-400">{grants.length}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-xs text-slate-400 block font-semibold">Pending Requests</span>
            <span className="text-2xl font-black text-amber-400">
              {requests.filter(r => r.status === 'Pending').length}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Incoming Access Requests */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Incoming Doctor Access Requests</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review and authorize doctors seeking to access your medical records
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {requests.filter(r => r.status === 'Pending').length === 0 ? (
            <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No pending access requests. Your records are completely secure.
            </div>
          ) : (
            requests.filter(r => r.status === 'Pending').map(req => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse-subtle"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {req.doctorName}
                    </span>
                    <span className="font-semibold text-teal-600 dark:text-teal-400">
                      ({req.department})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-bold">
                      Awaiting Your Consent
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {req.hospitalName}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 pt-1">
                    <strong>Stated Clinical Purpose:</strong> "{req.purpose}"
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>Requested Scope: <strong className="text-slate-700 dark:text-slate-300">{req.requestedScope}</strong></span>
                    <span>•</span>
                    <span>Requested Duration: {req.requestedDuration}</span>
                    <span>•</span>
                    <span>Received: {req.requestedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDenyRequest(req.id)}
                    className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 font-bold text-xs transition"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleOpenApproveModal(req)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Configure & Approve</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 2: Active Access Grants (Who currently has access) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Unlock className="w-4 h-4 text-emerald-500" />
              <span>Active Authorized Physicians ({grants.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Doctors who currently have granted permission to view your clinical records
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {grants.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No doctors currently have authorized access to your records.
            </div>
          ) : (
            grants.map(grant => (
              <div
                key={grant.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {grant.doctorName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Active Access
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {grant.hospitalName} • {grant.department}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Authorized Scope: <strong className="text-teal-600 dark:text-teal-400">{grant.scope}</strong></span>
                    <span>•</span>
                    <span>Expires: {grant.expiresAt}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRevokeGrant(grant.id)}
                  className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-600 hover:text-white font-bold text-xs transition self-start sm:self-auto"
                >
                  Revoke Access
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 3: Immutable Transparent Audit Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-teal-600" />
            <span>Immutable Privacy Access Log</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time transparent audit trail of every entity that viewed or updated your health record
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map((log) => {
                let badge = 'bg-slate-100 text-slate-700';
                if (log.action === 'VIEW') badge = 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
                if (log.action === 'CREATE') badge = 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300';
                if (log.action === 'CONSENT_GRANTED') badge = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
                if (log.action === 'CONSENT_REVOKED') badge = 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';

                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{log.actorName}</div>
                      <div className="text-[11px] text-slate-400">{log.actorRole}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${badge}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {log.resourceType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-sm">
                      {log.description}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400">
                      {log.ip || '192.168.1.1'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Scope & Duration Configuration */}
      {activeModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Grant Sovereign Access
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select permission scope & expiry duration
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1">
              <span className="text-slate-400 block">Requesting Physician:</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm block">
                {activeModalRequest.doctorName}
              </span>
              <span className="text-slate-500 dark:text-slate-400 block">
                {activeModalRequest.hospitalName} ({activeModalRequest.department})
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Access Scope
                </label>
                <select
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-semibold"
                >
                  <option value="FULL">Full Clinical History (Visits, Diagnoses, Scans, Rx)</option>
                  <option value="PRESCRIPTIONS_ONLY">Prescriptions Only (Medications history)</option>
                  <option value="LABS_ONLY">Diagnostic Reports & Scans Only</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Access Duration (Auto-Expires)
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-semibold"
                >
                  <option value="24 Hours">24 Hours (Single Consultation)</option>
                  <option value="7 Days">7 Days (Short-term review)</option>
                  <option value="30 Days">30 Days (Extended treatment)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setActiveModalRequest(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20"
              >
                Authorize & Grant Access
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
