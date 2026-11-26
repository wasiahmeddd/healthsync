import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationApi, subscribeToData } from '../api';
import { useAuth } from './AuthContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || user?.userId || 'USR-PAT-01';

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const loadNotifications = useCallback(async () => {
    try {
      const list = await notificationApi.getNotifications(currentUserId);
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadNotifications();
    const unsubscribe = subscribeToData(() => {
      loadNotifications();
    });
    return unsubscribe;
  }, [loadNotifications]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAsRead = async (id) => {
    await notificationApi.markAsRead(id);
    loadNotifications();
  };

  const markAllAsRead = async () => {
    await notificationApi.markAllAsRead(currentUserId);
    loadNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        markAsRead,
        markAllAsRead,
        refreshNotifications: loadNotifications
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => {
          let bg = 'bg-slate-900 text-white dark:bg-slate-800 dark:border dark:border-slate-700';
          let Icon = Info;
          if (toast.type === 'success') {
            bg = 'bg-teal-600 text-white';
            Icon = CheckCircle2;
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-600 text-white';
            Icon = AlertTriangle;
          } else if (toast.type === 'error') {
            bg = 'bg-rose-600 text-white';
            Icon = AlertCircle;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl transition-all duration-300 animate-slide-in ${bg}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
