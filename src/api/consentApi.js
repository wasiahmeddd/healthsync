// ==============================================================================
// Consent & Privacy Center API Layer
// Sovereign access grants, scopes, revocations, and immutable audit logs
// ==============================================================================

import { getStoredData, setStoredData, delay } from './storage';

export const consentApi = {
  // Get pending & historical access requests for a patient
  getAccessRequests: async (patientId) => {
    await delay(120);
    const data = getStoredData();
    return data.accessRequests
      .filter(r => r.patientId === patientId)
      .sort((a, b) => (a.status === 'Pending' ? -1 : 1));
  },

  // Approve an access request with specific scope and duration
  approveRequest: async ({ requestId, patientId, scope = "FULL", duration = "7 Days" }) => {
    await delay(250);
    const data = getStoredData();

    const reqIndex = data.accessRequests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) throw new Error("Request not found");

    const req = data.accessRequests[reqIndex];
    req.status = "Approved";
    req.requestedScope = scope;
    req.requestedDuration = duration;
    req.resolvedAt = new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Calculate expiry
    const now = new Date();
    const daysToAdd = duration === "24 Hours" ? 1 : duration === "7 Days" ? 7 : 30;
    const expiresAt = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' });
    req.expiresAt = expiresAt;

    // Create active grant
    const newGrant = {
      id: `GRANT-${Date.now()}`,
      requestId: req.id,
      patientId,
      doctorId: req.doctorId,
      doctorName: req.doctorName,
      hospitalName: req.hospitalName,
      department: req.department,
      scope,
      grantedAt: req.resolvedAt,
      expiresAt,
      isActive: true
    };
    data.accessGrants.unshift(newGrant);

    // Audit Log
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      patientId,
      actorId: patientId,
      actorName: req.patientName,
      actorRole: "Patient",
      action: "CONSENT_GRANTED",
      resourceType: "PRIVACY_ACCESS",
      description: `Granted ${scope} medical records access to ${req.doctorName} for ${duration} (Expires: ${expiresAt})`,
      timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ip: "106.51.72.19"
    });

    // Notify requesting doctor
    const doctor = data.doctors.find(d => d.id === req.doctorId);
    if (doctor) {
      data.notifications.unshift({
        id: `NOTIF-${Date.now()}-grant`,
        userId: doctor.userId,
        title: "Access Request Approved! ✅",
        message: `${req.patientName} has approved your access request for: ${req.purpose} (Scope: ${scope}).`,
        type: "CONSENT",
        link: `/doctor/patient/${patientId}`,
        time: "Just now",
        isRead: false
      });
    }

    setStoredData(data);
    return { request: req, grant: newGrant };
  },

  // Deny access request
  denyRequest: async ({ requestId, patientId, reason = "Patient declined access" }) => {
    await delay(200);
    const data = getStoredData();

    const reqIndex = data.accessRequests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) throw new Error("Request not found");

    const req = data.accessRequests[reqIndex];
    req.status = "Denied";
    req.resolvedAt = new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Audit Log
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      patientId,
      actorId: patientId,
      actorName: req.patientName,
      actorRole: "Patient",
      action: "CONSENT_DENIED",
      resourceType: "PRIVACY_ACCESS",
      description: `Denied access request #${req.id} from ${req.doctorName}. Reason: ${reason}`,
      timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ip: "106.51.72.19"
    });

    // Notify doctor
    const doctor = data.doctors.find(d => d.id === req.doctorId);
    if (doctor) {
      data.notifications.unshift({
        id: `NOTIF-${Date.now()}-deny`,
        userId: doctor.userId,
        title: "Access Request Denied",
        message: `${req.patientName} declined the access request for "${req.purpose}".`,
        type: "CONSENT",
        link: "/doctor/second-opinion",
        time: "Just now",
        isRead: false
      });
    }

    setStoredData(data);
    return req;
  },

  // Get active access grants
  getActiveGrants: async (patientId) => {
    await delay(100);
    const data = getStoredData();
    return data.accessGrants.filter(g => g.patientId === patientId && g.isActive);
  },

  // Revoke active grant immediately
  revokeGrant: async ({ grantId, patientId }) => {
    await delay(200);
    const data = getStoredData();

    const grantIndex = data.accessGrants.findIndex(g => g.id === grantId && g.patientId === patientId);
    if (grantIndex === -1) throw new Error("Grant not found");

    const grant = data.accessGrants[grantIndex];
    grant.isActive = false;
    grant.revokedAt = new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Also update parent request if present
    const req = data.accessRequests.find(r => r.id === grant.requestId);
    if (req) req.status = "Revoked";

    // Audit Log
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      patientId,
      actorId: patientId,
      actorName: "Patient",
      actorRole: "Patient",
      action: "CONSENT_REVOKED",
      resourceType: "PRIVACY_ACCESS",
      description: `Revoked clinical data access privileges from ${grant.doctorName}`,
      timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ip: "106.51.72.19"
    });

    setStoredData(data);
    return grant;
  },

  // Immutable Audit Logs for patient record
  getAuditLogs: async (patientId) => {
    await delay(120);
    const data = getStoredData();
    return data.auditLogs.filter(log => log.patientId === patientId);
  }
};
