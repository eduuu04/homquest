import React, { useState } from 'react';
import { Bell, X, Check, Inbox, CheckCircle2, Star, AlertTriangle, Clock } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const NotificationCenter = ({ isOpen: controlledIsOpen, onClose: controlledOnClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { notifications, markNotificationRead, markNotificationsRead, clearAllNotifications } = useFamily();

  const isControlled = typeof controlledIsOpen !== 'undefined';
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const handleClose = isControlled ? controlledOnClose : () => setInternalIsOpen(false);

  const unreadCount = notifications?.filter(n => !n.read)?.length || 0;

  const handleMarkAllRead = () => {
    if (markNotificationsRead) {
      markNotificationsRead();
    } else if (notifications) {
      notifications.forEach(n => markNotificationRead?.(n.id));
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'task_completed': return <CheckCircle2 size={18} color="var(--success-dark)" />;
      case 'task_verified': return <Star size={18} color="var(--reward-dark)" />;
      case 'task_rejected': return <AlertTriangle size={18} color="var(--error)" />;
      case 'task_assigned': return <Clock size={18} color="var(--primary)" />;
      default: return <Bell size={18} color="var(--primary)" />;
    }
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'Reciente';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div style={{ position: 'relative' }}>
      {!isControlled && (
        <button 
          className="btn btn-icon btn-ghost" 
          onClick={() => setInternalIsOpen(!internalIsOpen)}
          style={{ position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
          aria-label="Notificaciones"
        >
          <Bell size={20} color="var(--primary)" />
          {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
        </button>
      )}

      {isOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle"></div>
            
            <div className="flex-between mb-4">
              <div className="flex-center gap-2">
                <Bell size={20} color="var(--primary)" />
                <h2 className="text-section">Notificaciones</h2>
              </div>
              <div className="flex-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead} 
                    className="btn btn-sm btn-secondary flex-center gap-1"
                  >
                    <Check size={14} /> Marcar leídas
                  </button>
                )}
                <button onClick={handleClose} className="btn btn-icon btn-ghost">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '180px', maxHeight: '55dvh', overflowY: 'auto' }}>
              {!notifications || notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Inbox size={28} />
                  </div>
                  <div className="empty-state-title">Todo al día</div>
                  <div className="empty-state-text">No tienes notificaciones por ahora.</div>
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <div 
                    key={notif.id || idx} 
                    className={`card card-flat stagger-item ${!notif.read ? 'unread' : ''}`}
                    onClick={() => markNotificationRead?.(notif.id)}
                    style={{ 
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      padding: '12px 14px',
                      background: notif.read ? 'var(--bg-card)' : 'var(--primary-bg)',
                      borderColor: notif.read ? 'var(--border-light)' : 'oklch(var(--primary-raw) / 0.2)',
                      cursor: markNotificationRead ? 'pointer' : 'default'
                    }}
                  >
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex-between gap-2">
                        <div className="text-body-bold" style={{ fontSize: '0.9rem', color: notif.read ? 'var(--fg-primary)' : 'var(--primary-dark)' }}>
                          {notif.title || (notif.message?.slice(0, 30) + '...')}
                        </div>
                        <div className="text-label-sm" style={{ fontSize: '0.75rem', flexShrink: 0 }}>
                          {getRelativeTime(notif.date || notif.createdAt)}
                        </div>
                      </div>
                      <div className="text-body" style={{ fontSize: '0.85rem', color: 'var(--fg-secondary)', marginTop: '2px' }}>
                        {notif.message || notif.details}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
