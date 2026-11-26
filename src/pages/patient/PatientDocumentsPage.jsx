import React, { useState, useEffect } from 'react';
import { patientApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { FileText, Upload, X, Calendar } from 'lucide-react';

const CATEGORIES = ['Lab Report','X-Ray','MRI / CT Scan','Prescription','Discharge Summary','Insurance','Other'];

const CAT_COLORS = {
  'Lab Report':        'bg-blue-100    text-blue-700    dark:bg-blue-950    dark:text-blue-300',
  'X-Ray':             'bg-purple-100  text-purple-700  dark:bg-purple-950  dark:text-purple-300',
  'MRI / CT Scan':     'bg-indigo-100  text-indigo-700  dark:bg-indigo-950  dark:text-indigo-300',
  'Prescription':      'bg-teal-100    text-teal-700    dark:bg-teal-950    dark:text-teal-300',
  'Discharge Summary': 'bg-amber-100   text-amber-700   dark:bg-amber-950   dark:text-amber-300',
  'Insurance':         'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'Other':             'bg-slate-100   text-slate-600   dark:bg-slate-800   dark:text-slate-400',
};

export const PatientDocumentsPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({
    title: '', category: 'Lab Report',
    fileName: '', reportDate: new Date().toISOString().split('T')[0], notes: ''
  });
  const [uploading, setUploading] = useState(false);
  const upd = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const loadData = async () => {
    if (!user?.patientId) return;
    setLoading(true);
    try {
      const data = await patientApi.getDocuments(user.patientId);
      setDocuments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToData(() => loadData());
    return unsub;
  }, [user?.patientId]);

  const handleUpload = async () => {
    if (!form.title) { addToast('Document name is required', 'warning'); return; }
    setUploading(true);
    try {
      await patientApi.uploadDocument(user.patientId, {
        title: form.title,
        category: form.category,
        fileName: form.fileName || `${form.title}.pdf`,
        fileSize: '1.2 MB',
        reportDate: form.reportDate,
        notes: form.notes
      });
      addToast('Document uploaded!', 'success');
      setShowUpload(false);
      setForm({ title: '', category: 'Lab Report', fileName: '', reportDate: new Date().toISOString().split('T')[0], notes: '' });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" /> My Documents
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload and manage your health documents</p>
        </div>
        {/* Primary page action */}
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-500/20 transition"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : documents.length === 0 ? (
        <div className="py-20 text-center">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="font-semibold text-slate-900 dark:text-white mb-1">No documents yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Upload lab reports, X-rays, MRIs, discharge summaries, and more.
          </p>
          <button onClick={() => setShowUpload(true)}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-500/20 transition">
            Upload your first document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:border-teal-400 dark:hover:border-teal-600 transition group">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/40 transition">
                  <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-teal-500 transition" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{doc.title || doc.fileName}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CAT_COLORS[doc.category] || CAT_COLORS['Other']}`}>
                      {doc.category}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />
                      {doc.reportDate || doc.uploadDate}
                    </span>
                  </div>
                  {doc.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{doc.notes}</p>}
                  {doc.fileSize && <p className="text-[10px] text-slate-400 mt-0.5">{doc.fileSize} &bull; {doc.fileName}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" /> Upload Document
              </h3>
              <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Document Name <span className="text-rose-500">*</span></label>
                <input type="text" value={form.title} onChange={upd('title')} placeholder="e.g. Blood Test Report Jan 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                <select value={form.category} onChange={upd('category')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Report / Test Date</label>
                <input type="date" value={form.reportDate} onChange={upd('reportDate')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Notes (optional)</label>
                <textarea value={form.notes} onChange={upd('notes')} rows={2} placeholder="Any additional notes about this document"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
              {/* Simulated file picker */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:border-teal-500 dark:hover:border-teal-500 transition justify-center">
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Click to select file (simulation — no actual upload)</span>
              </div>
            </div>

            {/* Form Actions: Cancel LEFT, Upload RIGHT */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setShowUpload(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                Cancel
              </button>
              <button onClick={handleUpload} disabled={uploading}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-500/20 transition disabled:opacity-60 flex items-center gap-2">
                {uploading ? 'Uploading…' : 'Upload'}
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
