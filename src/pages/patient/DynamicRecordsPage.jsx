import React, { useState, useEffect } from 'react';
import { patientApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { DynamicMetricChart } from '../../components/charts/DynamicMetricChart';
import {
  Activity,
  Plus,
  FileText,
  Upload,
  Calendar,
  Layers,
  Heart,
  FlaskConical,
  X,
  CheckCircle2,
  TrendingUp,
  Download,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

export const DynamicRecordsPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const patientId = user?.patientId || 'ML-PAT-1001';
  const [recordTypes, setRecordTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);

  // New Type Form State
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCategory, setNewTypeCategory] = useState('Vitals');
  const [newTypeColor, setNewTypeColor] = useState('#0d9488');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [customFields, setCustomFields] = useState([
    { key: 'metric1', label: 'Primary Value', type: 'number', unit: 'mg/dL', required: true }
  ]);

  // New Entry Form State
  const [entryValues, setEntryValues] = useState({});

  // Document Upload Form State
  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'Lab Report',
    notes: '',
    reportDate: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    try {
      const [types, docs] = await Promise.all([
        patientApi.getCustomRecordTypes(patientId),
        patientApi.getDocuments(patientId)
      ]);
      setRecordTypes(types);
      setDocuments(docs);

      const activeId = selectedTypeId || (types[0]?.id || null);
      if (activeId) {
        setSelectedTypeId(activeId);
        const ent = await patientApi.getCustomRecordEntries(patientId, activeId);
        setEntries(ent);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToData(() => loadData());
    return unsub;
  }, [patientId, selectedTypeId]);

  const handleSelectRecordType = async (typeId) => {
    setSelectedTypeId(typeId);
    const ent = await patientApi.getCustomRecordEntries(patientId, typeId);
    setEntries(ent);
  };

  const handleAddFieldToCustomType = () => {
    const key = `field_${Date.now()}`;
    setCustomFields(prev => [...prev, { key, label: 'New Metric', type: 'number', unit: '', required: false }]);
  };

  const handleCreateCustomRecordType = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) {
      addToast("Please provide category name", "warning");
      return;
    }
    try {
      const created = await patientApi.createCustomRecordType(patientId, {
        name: newTypeName,
        category: newTypeCategory,
        color: newTypeColor,
        description: newTypeDescription,
        fields: [
          ...customFields,
          { key: 'logDate', label: 'Date', type: 'date', unit: '', required: true }
        ]
      });

      addToast(`Custom record "${created.name}" created!`, "success");
      setShowAddTypeModal(false);
      setSelectedTypeId(created.id);
      loadData();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleLogNewEntry = async (e) => {
    e.preventDefault();
    try {
      await patientApi.addCustomRecordEntry(patientId, selectedTypeId, {
        ...entryValues,
        logDate: entryValues.logDate || new Date().toISOString().split('T')[0]
      });
      addToast("New measurement entry recorded successfully!", "success");
      setShowAddEntryModal(false);
      setEntryValues({});
      loadData();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!newDoc.title) {
      addToast("Please provide a report title", "warning");
      return;
    }
    try {
      await patientApi.uploadDocument(patientId, {
        ...newDoc,
        fileName: `${newDoc.title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        fileSize: "1.8 MB"
      });
      addToast("Diagnostic report attached to medical record!", "success");
      setShowUploadDocModal(false);
      loadData();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const activeRecordType = recordTypes.find(t => t.id === selectedTypeId) || recordTypes[0];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Dynamic Medical Records & Custom Trackers
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold">
              User Defined
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create any custom health category (Blood Pressure, Sugar, Thyroid, Peak Flow, etc.) with automated trend charting
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadDocModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 font-bold text-xs transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => setShowAddTypeModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record Type</span>
          </button>
        </div>
      </div>

      {/* Record Category Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {recordTypes.map(t => {
          const isSelected = t.id === selectedTypeId;
          return (
            <button
              key={t.id}
              onClick={() => handleSelectRecordType(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-teal-500'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color || '#0d9488' }} />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Record Type View */}
      {activeRecordType && (
        <div className="space-y-6">
          
          {/* Chart View */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeRecordType.name} Trend & History
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeRecordType.description || "Interactive time-series visualizations"}
                </p>
              </div>

              <button
                onClick={() => {
                  setEntryValues({});
                  setShowAddEntryModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Log New Measurement</span>
              </button>
            </div>

            {/* Recharts Component */}
            <DynamicMetricChart
              recordType={activeRecordType}
              entries={entries}
            />
          </div>

          {/* Entries Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Logged Entries ({entries.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    {activeRecordType.fields.filter(f => f.key !== 'logDate').map(field => (
                      <th key={field.key} className="py-3 px-4">
                        {field.label} {field.unit && `(${field.unit})`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={activeRecordType.fields.length + 1} className="py-8 text-center text-slate-400">
                        No entries recorded yet for this metric.
                      </td>
                    </tr>
                  ) : (
                    entries.map(ent => (
                      <tr key={ent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {ent.date}
                        </td>
                        {activeRecordType.fields.filter(f => f.key !== 'logDate').map(field => (
                          <td key={field.key} className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                            {ent.values[field.key] !== undefined ? ent.values[field.key] : '-'}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Uploaded Documents & Scans Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Diagnostic Documents & Scans ({documents.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Uploaded blood reports, X-rays, and discharge summaries
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                    {doc.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {doc.reportDate}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                  {doc.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {doc.notes}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  {doc.fileName} ({doc.fileSize})
                </span>
                <button
                  onClick={() => window.open(doc.previewUrl, '_blank')}
                  className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Dynamic Record Type */}
      {showAddTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                Define New Custom Record Type
              </h3>
              <button onClick={() => setShowAddTypeModal(false)} className="text-slate-400 p-1"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateCustomRecordType} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Record Name *</label>
                <input
                  type="text"
                  required
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="e.g. Peak Expiratory Flow, Thyroid Panel"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={newTypeCategory}
                    onChange={(e) => setNewTypeCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="Vitals">Vitals</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Lab Diagnostics">Lab Diagnostics</option>
                    <option value="Respiratory">Respiratory</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Color Theme</label>
                  <select
                    value={newTypeColor}
                    onChange={(e) => setNewTypeColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="#0d9488">Teal</option>
                    <option value="#3b82f6">Blue</option>
                    <option value="#ef4444">Red</option>
                    <option value="#8b5cf6">Purple</option>
                    <option value="#f59e0b">Amber</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  value={newTypeDescription}
                  onChange={(e) => setNewTypeDescription(e.target.value)}
                  placeholder="e.g. Daily tracking for peak flow"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              {/* Dynamic Field Builder */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Custom Fields</span>
                  <button
                    type="button"
                    onClick={handleAddFieldToCustomType}
                    className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                  >
                    + Add Field
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {customFields.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={f.label}
                        onChange={(e) => {
                          const c = [...customFields];
                          c[i].label = e.target.value;
                          setCustomFields(c);
                        }}
                        placeholder="Field label"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                      />
                      <input
                        type="text"
                        value={f.unit}
                        onChange={(e) => {
                          const c = [...customFields];
                          c[i].unit = e.target.value;
                          setCustomFields(c);
                        }}
                        placeholder="Unit (e.g. mg/dL)"
                        className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddTypeModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl">Create Metric</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log New Entry */}
      {showAddEntryModal && activeRecordType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                Log Measurement: {activeRecordType.name}
              </h3>
              <button onClick={() => setShowAddEntryModal(false)} className="text-slate-400 p-1"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleLogNewEntry} className="space-y-3 text-xs">
              {activeRecordType.fields.map(field => (
                <div key={field.key}>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {field.label} {field.unit && `(${field.unit})`} {field.required && '*'}
                  </label>
                  <input
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    required={field.required}
                    value={entryValues[field.key] || ''}
                    onChange={(e) => setEntryValues({ ...entryValues, [field.key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              ))}

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddEntryModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl">Save Reading</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Document */}
      {showUploadDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                Upload Diagnostic Report / Scan
              </h3>
              <button onClick={() => setShowUploadDocModal(false)} className="text-slate-400 p-1"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Report Title *</label>
                <input
                  type="text"
                  required
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  placeholder="e.g. Thyroid Profile 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="X-Ray / Scan">X-Ray / Scan</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Report Date</label>
                  <input
                    type="date"
                    value={newDoc.reportDate}
                    onChange={(e) => setNewDoc({ ...newDoc, reportDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Diagnostic Notes</label>
                <textarea
                  rows="2"
                  value={newDoc.notes}
                  onChange={(e) => setNewDoc({ ...newDoc, notes: e.target.value })}
                  placeholder="e.g. Normal values, fasting sample"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowUploadDocModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl">Upload Scan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
