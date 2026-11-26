import React, { useState, useEffect } from 'react';
import { pharmacyApi, subscribeToData } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  PackageCheck,
  AlertTriangle,
  Pill,
  Archive,
  CheckCircle2,
  Building2,
  Calendar,
  RotateCcw
} from 'lucide-react';

export const PharmacyStockPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const q = await pharmacyApi.getPrescriptionQueue(null);
      setQueue(q);
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
  }, []);

  // Collect all out of stock items
  const outOfStockItems = [];
  queue.forEach(rx => {
    rx.items.forEach(itm => {
      if (itm.isOutOfStock) {
        outOfStockItems.push({
          prescriptionId: rx.id,
          patientName: rx.patientName,
          doctorName: rx.doctorName,
          hospitalName: rx.hospitalName,
          date: rx.date,
          item: itm
        });
      }
    });
  });

  const dispensedList = queue.filter(rx => rx.status === 'Dispensed');

  const handleRestock = async (prescriptionId, itemId) => {
    try {
      await pharmacyApi.toggleMedicineStock({
        prescriptionId,
        itemId,
        isOutOfStock: false
      });
      addToast("Medicine marked back in stock!", "success");
      loadData();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Pharmacy Inventory & Out-of-Stock Registry
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor medication stockouts, active alerts, and completed dispense audits
        </p>
      </div>

      {/* Out of Stock Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Active Out-of-Stock Medication Alerts ({outOfStockItems.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Medicines currently unavailable in dispensary; doctor and patient have been notified
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {outOfStockItems.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs text-slate-400">
              ✓ All prescribed medicines are currently in stock.
            </div>
          ) : (
            outOfStockItems.map((entry, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {entry.item.medicineName} <span className="text-rose-600 dark:text-rose-400">({entry.item.dosage})</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    For patient: <strong className="text-slate-800 dark:text-slate-200">{entry.patientName}</strong> • Prescribed by {entry.doctorName}
                  </p>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Rx #{entry.prescriptionId} • {entry.hospitalName}
                  </span>
                </div>

                <button
                  onClick={() => handleRestock(entry.prescriptionId, entry.item.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mark Restocked</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dispensed History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Archive className="w-4 h-4 text-teal-600" />
            <span>Dispensed Prescriptions History ({dispensedList.length})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Completed transactions with verified pickup tokens
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Rx ID</th>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Items Dispensed</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dispensedList.map(rx => (
                <tr key={rx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                    #{rx.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                    {rx.pickupToken || 'TK-101'}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {rx.patientName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {rx.doctorName}
                  </td>
                  <td className="py-3.5 px-4">
                    {rx.items.length} medicines
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                    {rx.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
