import React from 'react';
import { X, Check } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const NotificationCenter = ({ isOpen, onClose }) => {
  const { notifications, markNotificationsRead } = useFamily();

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    markNotificationsRead();
  };

  const getRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle"></div>
        <div className="flex-between mb-4">
          <h2 className="text-section">Notificaciones</h2>
          <div className="flex-center gap-2">
            {notifications.some(n => !n.read) && (
              <button 
                onClick={handleMarkAllRead} 
                className="btn btn-sm btn-secondary flex-center gap-1"
                style={{ fontSize: '12px' }}
              >
                <Check size={14} /> Leídas
              </button>
            )}
            <button onClick={onClose} className="btn btn-icon btn-ghost">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="divider"></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '200px', maxHeight: '50dvh', overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-emoji">📭</div>
              <div className="empty-state-title">Todo al día</div>
              <div className="empty-state-text">No tienes notificaciones pendientes.</div>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className="card card-flat"
                style={{ 
                  position: 'relative', 
                  borderLeft: notif.read ? '1.5px solid var(--border-light)' : '4px solid var(--primary)',
                  background: notif.read ? 'var(--white)' : 'var(--primary-bg)',
                  padding: '12px 16px'
                }}
              >
                <div className="flex-between">
                  <div style={{ fontWeight: notif.read ? '600' : '800', fontSize: '15px' }}>{notif.title}</div>
                  <div className="text-label-sm">{getRelativeTime(notif.date)}</div>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {notif.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
