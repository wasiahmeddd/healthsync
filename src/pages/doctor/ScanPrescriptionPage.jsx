import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ScanLine, CheckCircle2 } from 'lucide-react';
import { PrescriptionScannerModal } from '../../components/scan/PrescriptionScannerModal';

export const ScanPrescriptionPage = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const handleScanComplete = data => {
    setScannedData(data);
    setShowScanner(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link to="/doctor/queue" className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-2 w-fit">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Queue
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-teal-600" /> Scan / Upload Prescription
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload an image or PDF — simulated OCR pre-fills the prescription builder for review
        </p>
      </div>

      {!scannedData ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center mx-auto mb-5">
            <ScanLine className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Prescription Scanner</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
            Upload a handwritten or printed prescription image. The OCR engine extracts medicine
            names, dosages, and instructions for you to review and confirm.
          </p>
          {/* Primary page action */}
          <button
            onClick={() => setShowScanner(true)}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-500/20 transition flex items-center gap-2 mx-auto"
          >
            <ScanLine className="w-4 h-4" /> Launch Scanner
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" /> Prescription scanned successfully
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please review the extracted medicines below before saving to patient record.
          </p>
          <div className="space-y-2">
            {(scannedData.medicines || scannedData.items || []).map((med, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{med.name || med.medicineName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {med.dosage} &bull; {med.frequency} &bull; {med.duration}
                </p>
                {med.instructions && <p className="text-xs text-teal-700 dark:text-teal-300 mt-0.5 italic">{med.instructions}</p>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => setScannedData(null)}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-semibold transition">
              Scan another →
            </button>
          </div>
        </div>
      )}

      {showScanner && (
        <PrescriptionScannerModal
          onClose={() => setShowScanner(false)}
          onScanComplete={handleScanComplete}
        />
      )}
    </div>
  );
};
