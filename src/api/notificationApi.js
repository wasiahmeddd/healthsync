// ==============================================================================
// Notification API Layer
// ==============================================================================

import { getStoredData, setStoredData, delay } from './storage';

export const notificationApi = {
  getNotifications: async (userId) => {
    await delay(80);
    const data = getStoredData();
    if (!userId) return data.notifications;
    return data.notifications.filter(n => n.userId === userId || n.userId === 'ALL');
  },

  markAsRead: async (notifId) => {
    await delay(50);
    const data = getStoredData();
    const notif = data.notifications.find(n => n.id === notifId);
    if (notif) notif.isRead = true;
    setStoredData(data);
    return notif;
  },

  markAllAsRead: async (userId) => {
    await delay(80);
    const data = getStoredData();
    data.notifications.forEach(n => {
      if (!userId || n.userId === userId) {
        n.isRead = true;
      }
    });
    setStoredData(data);
    return true;
  }
};
