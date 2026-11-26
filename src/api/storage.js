// ==============================================================================
// HealthSync Reactive Storage Engine — Mock-Aware
// Simulates a persistent backend with localStorage, reactive listeners, Promises.
// When mock data is ON  → reads/writes medilink_app_data_v1 (seeded)
// When mock data is OFF → reads/writes medilink_real_data_v1 (starts empty)
// ==============================================================================

import { INITIAL_DATA } from './mockData';
import { useMockData } from '../mock';

const STORAGE_KEY = 'medilink_app_data_v1';
const REAL_STORAGE_KEY = 'medilink_real_data_v1';
const LISTENERS = new Set();

const EMPTY_STORE = {
  hospitals: [],
  doctors: [],
  patients: [],
  receptionists: [],
  pharmacists: [],
  appointments: [],
  consultations: [],
  prescriptions: [],
  pharmacyOrders: [],
  notifications: [],
  reminders: [],
  auditLogs: [],
  accessRequests: [],
  accessGrants: [],
  customRecordTypes: [],
  customRecordEntries: [],
  documents: []
};

// Helper to simulate realistic network delay
export const delay = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));

export const getStoredData = () => {
  try {
    if (useMockData()) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
        return INITIAL_DATA;
      }
      return JSON.parse(raw);
    } else {
      // Real mode: separate store, starts empty
      const raw = localStorage.getItem(REAL_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(REAL_STORAGE_KEY, JSON.stringify(EMPTY_STORE));
        return EMPTY_STORE;
      }
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Storage read error, falling back to INITIAL_DATA:', err);
    return INITIAL_DATA;
  }
};

export const setStoredData = (newData) => {
  try {
    const key = useMockData() ? STORAGE_KEY : REAL_STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(newData));
    // Notify all active React listeners
    LISTENERS.forEach(cb => {
      try { cb(newData); } catch (e) { console.error('Storage listener error:', e); }
    });
  } catch (err) {
    console.error('Storage write error:', err);
  }
};

export const subscribeToData = (callback) => {
  LISTENERS.add(callback);
  return () => LISTENERS.delete(callback);
};

export const resetToSeedData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  LISTENERS.forEach(cb => cb(INITIAL_DATA));
  return INITIAL_DATA;
};
