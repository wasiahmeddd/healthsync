import React from 'react';
import { Bell, CheckCircle2, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const typeConfig = {
  info:    { icon: Info,          cls: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/40 border-l-blue-500' },
  success: { icon: CheckCircle2,  cls: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-l-emerald-500' },
  warning: { icon: AlertTriangle, cls: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/40 border-l-amber-500' },
  error:   { icon: AlertCircle,   cls: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-950/40 border-l-rose-500' },
};

export const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotification();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-600" /> Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-7 h-7 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-900 dark:text-white mb-1">All caught up!</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">No notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const cfg = typeConfig[notif.type] || typeConfig.info;
            const Icon = cfg.icon;
            return (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  notif.isRead
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : `${cfg.bg} border border-l-4 border-slate-200 dark:border-slate-800`
                } hover:shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.cls}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={`font-semibold text-sm ${notif.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[11px] text-slate-400 flex-shrink-0">{notif.time || 'Recent'}</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${notif.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
