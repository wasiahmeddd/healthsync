import React, { useState, useEffect } from 'react';
import { pharmacyApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  PackageCheck,
  User,
  Building2,
  ChevronRight,
  Filter,
  Check,
  Ban
} from 'lucide-react';

export const PharmacyQueue = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [queue, setQueue] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ACTIVE'); // 'ACTIVE', 'ALL', 'Dispensed'
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    try {
      const q = await pharmacyApi.getPrescriptionQueue(user?.hospitalId || null);
      setQueue(q);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const unsub = subscribeToData(() => loadQueue());
    return unsub;
  }, [user]);

  const handleUpdateStatus = async (prescriptionId, newStatus) => {
    try {
      const updated = await pharmacyApi.updatePrescriptionStatus({
        prescriptionId,
        newStatus,
        pharmacistId: user?.id || 'PHARM-01',
        pharmacistName: user?.name || 'Suresh Gupta, R.Ph.'
      });

      if (newStatus === 'Ready for Pickup') {
        addToast(`Prescription #${prescriptionId} marked Ready! Pickup Token #${updated.pickupToken} assigned & alert dispatched to patient! 💊`, 'success');
      } else {
        addToast(`Prescription #${prescriptionId} updated to ${newStatus}`, 'info');
      }
      loadQueue();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleStock = async (prescriptionId, itemId, currentStockOut) => {
    try {
      await pharmacyApi.toggleMedicineStock({
        prescriptionId,
        itemId,
        isOutOfStock: !currentStockOut
      });
      addToast(
        !currentStockOut 
          ? "Medicine flagged Out of Stock. Alert dispatched to Doctor & Patient!" 
          : "Medicine restocked to available",
        !currentStockOut ? "warning" : "success"
      );
      loadQueue();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const filteredQueue = queue.filter(rx => {
    if (filterStatus === 'ACTIVE') return rx.status !== 'Dispensed';
    if (filterStatus === 'Dispensed') return rx.status === 'Dispensed';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Pill className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Live Pharmacy Dispensary Queue
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                {user?.counter || "Counter 1"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Logged in as <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.name}</span> • {user?.hospitalName || "Apollo Main Pharmacy"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {['ACTIVE', 'ALL', 'Dispensed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterStatus === status
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {status === 'ACTIVE' ? 'Active Incoming' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Cards */}
      <div className="space-y-4">
        {filteredQueue.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No prescriptions currently matching filter.
          </div>
        ) : (
          filteredQueue.map(rx => {
            const isSent = rx.status === 'Sent';
            const isPreparing = rx.status === 'Preparing';
            const isReady = rx.status === 'Ready for Pickup';
            const isDispensed = rx.status === 'Dispensed';

            return (
              <div
                key={rx.id}
                className={`p-6 rounded-3xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-sm space-y-4 ${
                  isReady
                    ? 'border-emerald-300 dark:border-emerald-800/80'
                    : isPreparing
                    ? 'border-blue-300 dark:border-blue-800/80'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                      #{rx.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-base">
                          {rx.patientName}
                        </span>
                        <span className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400">
                          {rx.patientId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Prescribed by <strong className="text-slate-700 dark:text-slate-300">{rx.doctorName}</strong> ({rx.hospitalName}) • {rx.date}
                      </p>
                    </div>
                  </div>

                  {/* Token & Status */}
                  <div className="flex items-center gap-3">
                    {rx.pickupToken && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold">
                        <span>Token:</span>
                        <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">{rx.pickupToken}</span>
                      </div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isDispensed 
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : isReady
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                        : isPreparing
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {rx.status}
                    </span>
                  </div>
                </div>

                {/* Prescription Medication Items List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Prescribed Medicines ({rx.items.length} items)
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rx.items.map(item => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                          item.isOutOfStock
                            ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold">
                            {item.medicineName} <span className="text-teal-600 dark:text-teal-400">({item.dosage})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.frequency} • {item.duration}
                          </div>
                          {item.instructions && (
                            <div className="text-[10px] text-slate-400 italic">
                              {item.instructions}
                            </div>
                          )}
                        </div>

                        {/* Stock-out Toggle Action */}
                        <button
                          onClick={() => handleToggleStock(rx.id, item.id, item.isOutOfStock)}
                          title="Click to toggle Stock-Out status (sends alert to doctor/patient)"
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                            item.isOutOfStock
                              ? 'bg-rose-600 text-white'
                              : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-rose-500'
                          }`}
                        >
                          {item.isOutOfStock ? (
                            <>
                              <Ban className="w-3 h-3" />
                              <span>Out of Stock</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span>In Stock</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-slate-400 text-[11px]">
                    {rx.specialInstructions && (
                      <span>Note: {rx.specialInstructions}</span>
                    )}
                  </div>

                  {/* Progressive action buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isSent && (
                      <button
                        onClick={() => handleUpdateStatus(rx.id, 'Preparing')}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                      >
                        <span>Accept & Start Preparing</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleUpdateStatus(rx.id, 'Ready for Pickup')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mark Ready (Assign Token & Alert Patient)</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => handleUpdateStatus(rx.id, 'Dispensed')}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Dispense to Patient</span>
                      </button>
                    )}

                    {isDispensed && (
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Dispensed & Completed</span>
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
