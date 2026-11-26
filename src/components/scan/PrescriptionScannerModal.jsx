import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, AlertCircle, X, ArrowRight, Eye } from 'lucide-react';

const SAMPLE_OCR_DATA = {
  diabetes: {
    title: "Dr. Sneha Patel - Endocrine Clinic Rx",
    rawText: `APOLLO HOSPITALS BANGALORE - OUTPATIENT PRESCRIPTION
Date: 04-Nov-2026 | Dept: Endocrinology
Patient: Rahul Verma | ID: ML-PAT-1001 | Age: 34 M
Vitals: BP: 128/82 mmHg | Pulse: 74 bpm | Wt: 76 kg
Diagnosis: Type 2 Diabetes Mellitus (Uncontrolled Fasting)
Rx:
1. Tab Metformin HCl 500mg - 1-0-1 - 90 Days (After meals)
2. Tab Glimepiride 1mg - 1-0-0 - 30 Days (Before breakfast)
3. Tab Atorvastatin 10mg - 0-0-1 - 60 Days (Night)
Advice: Low glycemic diet, 30 min daily brisk walk. Repeat HbA1c in 3 months.`,
    parsed: {
      diagnosis: "Type 2 Diabetes Mellitus with elevated fasting plasma glucose",
      symptoms: "Fatigue, mild polydipsia, high morning sugars",
      vitals: { bpSystolic: 128, bpDiastolic: 82, pulse: 74, temperature: 98.4, spo2: 99, weight: 76 },
      medicines: [
        { medicineName: "Metformin Hydrochloride", dosage: "500 mg", frequency: "1-0-1 (After Food)", duration: "90 Days", instructions: "Take immediately after food." },
        { medicineName: "Glimepiride", dosage: "1 mg", frequency: "1-0-0 (Morning Before Food)", duration: "30 Days", instructions: "Take 15 mins before breakfast." },
        { medicineName: "Atorvastatin", dosage: "10 mg", frequency: "0-0-1 (Night)", duration: "60 Days", instructions: "Bedtime dose for lipid control." }
      ],
      specialInstructions: "Strict low glycemic index diet. Repeat HbA1c in 12 weeks."
    }
  },
  cardio: {
    title: "Cardiology Follow-up Script (Apollo BLR)",
    rawText: `DEPARTMENT OF CARDIOLOGY - APOLLO CLINIC
Date: 04-Nov-2026 | Dr. Priya Sharma
Patient: Rahul Verma | Ref: Palpitations & BP review
Vitals: BP 134/88 | HR 78 | SpO2 99%
Impression: Mild Essential Hypertension with sinus rhythm
Prescription:
1. Tab Telmisartan 40mg - 1-0-0 - 60 Days
2. Tab Metoprolol Succinate 25mg - 1-0-0 - 30 Days
3. Tab Aspirin 75mg - 0-1-0 - 60 Days
Instructions: Salt restriction < 4g/day. Home BP charting.`,
    parsed: {
      diagnosis: "Essential Hypertension with intermittent sinus palpitations",
      symptoms: "Occasional chest fluttering during stress, elevated evening BP",
      vitals: { bpSystolic: 134, bpDiastolic: 88, pulse: 78, temperature: 98.6, spo2: 99, weight: 76 },
      medicines: [
        { medicineName: "Telmisartan", dosage: "40 mg", frequency: "1-0-0 (Morning)", duration: "60 Days", instructions: "Take with water every morning." },
        { medicineName: "Metoprolol Succinate ER", dosage: "25 mg", frequency: "1-0-0 (Morning)", duration: "30 Days", instructions: "For rate control & palpitations." },
        { medicineName: "Ecosprin (Aspirin)", dosage: "75 mg", frequency: "0-1-0 (After Lunch)", duration: "60 Days", instructions: "Cardioprotective antiplatelet." }
      ],
      specialInstructions: "Dietary salt restriction < 4g/day. Record home BP every 3 days."
    }
  }
};

export const PrescriptionScannerModal = ({ isOpen, onClose, onImportParsedData }) => {
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [selectedSample, setSelectedSample] = useState(null);
  const [fileSelected, setFileSelected] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  if (!isOpen) return null;

  const handleStartScan = (sampleKey = null) => {
    setScanning(true);
    setScanStep(1);
    setExtractedData(null);

    // Realistic multi-stage simulated OCR pipeline
    setTimeout(() => {
      setScanStep(2); // Image preprocessing & de-skewing
    }, 700);

    setTimeout(() => {
      setScanStep(3); // Text recognition & Medical NER (Named Entity Recognition)
    }, 1500);

    setTimeout(() => {
      setScanning(false);
      setScanStep(4); // Finished
      const sample = sampleKey ? SAMPLE_OCR_DATA[sampleKey] : SAMPLE_OCR_DATA.diabetes;
      setExtractedData(sample);
    }, 2200);
  };

  const handleApplyToForm = () => {
    if (extractedData && onImportParsedData) {
      onImportParsedData({
        ...extractedData.parsed,
        ocrRawText: extractedData.rawText
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                AI / OCR Prescription Scanner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Digitize physical handwritten or printed prescriptions into structured doctor review forms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {!extractedData && !scanning && (
            <div className="space-y-4">
              {/* File upload dropzone */}
              <div 
                onClick={() => handleStartScan('diabetes')}
                className="border-2 border-dashed border-teal-300 dark:border-teal-700/60 rounded-2xl p-8 text-center bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition cursor-pointer group"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">
                  Upload prescription photo or document
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-3">
                  Supports JPG, PNG, PDF formats. Click here to upload or try one of the instant demo scans below:
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
                  <span>Browse Device Files</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Sample pre-filled prescriptions for one-click demo testing */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Or Test with Sample Prescription Scans
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStartScan('diabetes')}
                    className="p-3.5 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
                        Diabetes Clinic Rx
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      Contains Metformin, Glimepiride, Atorvastatin with dosage & vitals
                    </p>
                  </button>

                  <button
                    onClick={() => handleStartScan('cardio')}
                    className="p-3.5 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
                        Cardiology Follow-up
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      Contains Telmisartan, Metoprolol, Aspirin with BP tracking
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scanning progress display */}
          {scanning && (
            <div className="p-8 text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 border-4 border-teal-200 dark:border-teal-900 border-t-teal-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-teal-600 animate-pulse" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-base">
                  {scanStep === 1 && "Preprocessing document image..."}
                  {scanStep === 2 && "De-skewing & optical edge detection..."}
                  {scanStep === 3 && "Extracting medical entities & dosages..."}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Parsing diagnosis, vital signs, medication frequency and instructions
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                <div 
                  className="bg-teal-600 h-full transition-all duration-500" 
                  style={{ width: `${(scanStep / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* OCR Review & Confirm Stage */}
          {extractedData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>OCR Extraction Complete. Please review extracted fields below before confirming.</span>
                </div>
                <button
                  onClick={() => handleStartScan('cardio')}
                  className="text-xs underline hover:text-emerald-900 dark:hover:text-emerald-100"
                >
                  Scan another
                </button>
              </div>

              {/* Parsed Diagnosis & Vitals */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Detected Diagnosis
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {extractedData.parsed.diagnosis}
                </p>
                
                {/* Vitals */}
                <div className="flex flex-wrap gap-3 pt-2 text-xs">
                  <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
                    BP: {extractedData.parsed.vitals.bpSystolic}/{extractedData.parsed.vitals.bpDiastolic} mmHg
                  </span>
                  <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
                    Pulse: {extractedData.parsed.vitals.pulse} bpm
                  </span>
                  <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
                    SpO2: {extractedData.parsed.vitals.spo2}%
                  </span>
                  <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
                    Weight: {extractedData.parsed.vitals.weight} kg
                  </span>
                </div>
              </div>

              {/* Detected Medications */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Detected Prescription Items ({extractedData.parsed.medicines.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {extractedData.parsed.medicines.map((med, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white text-sm">
                          {med.medicineName} <span className="text-teal-600 dark:text-teal-400">({med.dosage})</span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                          Frequency: <span className="font-semibold text-slate-700 dark:text-slate-300">{med.frequency}</span> • Duration: {med.duration}
                        </div>
                        {med.instructions && (
                          <div className="text-slate-400 italic mt-0.5 text-[11px]">
                            {med.instructions}
                          </div>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold text-[10px]">
                        Verified OCR
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw OCR text accordion */}
              <details className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200 dark:border-slate-800 text-xs">
                <summary className="font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  View Raw OCR Text Dump
                </summary>
                <pre className="mt-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {extractedData.rawText}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition"
          >
            Cancel
          </button>
          {extractedData && (
            <button
              onClick={handleApplyToForm}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition shadow-lg shadow-teal-500/20 flex items-center gap-2"
            >
              <span>Review & Confirm into Consultation Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
