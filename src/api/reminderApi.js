// ==============================================================================
// Smart Reminders & Condition Rules Engine API Layer
// ==============================================================================

import { getStoredData, setStoredData, delay } from './storage';

export const reminderApi = {
  getReminders: async (patientId) => {
    await delay(100);
    const data = getStoredData();
    return data.reminders.filter(r => r.patientId === patientId);
  },

  toggleReminder: async (reminderId, isEnabled) => {
    await delay(100);
    const data = getStoredData();
    const rem = data.reminders.find(r => r.id === reminderId);
    if (!rem) throw new Error("Reminder not found");
    rem.isEnabled = isEnabled;
    setStoredData(data);
    return rem;
  },

  createReminder: async (patientId, reminderData) => {
    await delay(200);
    const data = getStoredData();
    const newRem = {
      id: `REM-${Date.now()}`,
      patientId,
      source: reminderData.source || "CUSTOM",
      title: reminderData.title,
      description: reminderData.description || "",
      timeSchedule: reminderData.timeSchedule,
      category: reminderData.category || "LIFESTYLE",
      isEnabled: true
    };
    data.reminders.unshift(newRem);
    setStoredData(data);
    return newRem;
  },

  deleteReminder: async (reminderId) => {
    await delay(150);
    const data = getStoredData();
    data.reminders = data.reminders.filter(r => r.id !== reminderId);
    setStoredData(data);
    return true;
  },

  // Rules Engine: inspects patient's chronic conditions and suggests / provisions reminders
  evaluateRulesEngine: async (patientId) => {
    await delay(200);
    const data = getStoredData();
    const patient = data.patients.find(p => p.id === patientId);
    if (!patient) return [];

    const patientConditions = patient.healthProfile?.chronicConditions || [];
    const matchedRules = [];

    // Match rules against chronic conditions
    data.reminderRules.forEach(rule => {
      const match = patientConditions.some(cond => 
        cond.toLowerCase().includes(rule.conditionKeyword.toLowerCase())
      );
      if (match) {
        matchedRules.push(rule);
      }
    });

    return matchedRules;
  }
};
