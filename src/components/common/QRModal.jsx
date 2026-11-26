import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, ShieldCheck, Copy, Check } from 'lucide-react';

export const QRModal = ({ isOpen, onClose, patient }) => {
  const [dataUrl, setDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (patient && isOpen) {
      const qrPayload = JSON.stringify({
        patientId: patient.id,
        name: patient.name,
        bloodGroup: patient.bloodGroup,
        emergencyPhone: patient.emergencyContact?.phone || patient.phone,
        issuedBy: "HealthSync Sovereign Health Network"
      });

      QRCode.toDataURL(qrPayload, {
        width: 280,
        margin: 2,
        color: {
          dark: '#0f766e',
          light: '#ffffff'
        }
      }).then(url => setDataUrl(url)).catch(err => console.error(err));
    }
  }, [patient, isOpen]);

  if (!isOpen || !patient) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(patient.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `HealthSync_QR_${patient.id}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden">
        
        {/* Background gradient splash */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Digital Health Passport</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            {patient.name}
          </h3>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-sm font-mono bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
              {patient.id}
            </span>
            <button
              onClick={handleCopyId}
              title="Copy Patient ID"
              className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Scan at hospital reception or doctor clinic for instant record sync
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800 inline-block">
            {dataUrl ? (
              <img src={dataUrl} alt="Patient QR Code" className="w-56 h-56 rounded-lg" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-sm">
                Generating QR...
              </div>
            )}
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl mb-6 text-center text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Blood Group</span>
            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm text-rose-600 dark:text-rose-400">
              {patient.bloodGroup || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Gender / Age</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {patient.gender}, {patient.age} yrs
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Emergency</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {patient.emergencyContact?.relation || 'Contact'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownloadQR}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition shadow-lg shadow-teal-500/20"
          >
            <Download className="w-4 h-4" />
            Download QR Card
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
