import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, AlertCircle } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const AdminVerify = () => {
  const navigate = useNavigate();
  const { tasks, members, approveTask, rejectTask, currentUser } = useFamily();
  
  // Rejection modal state
  const [rejectingTaskId, setRejectingTaskId] = useState(null);
  const [reason, setReason] = useState('');
  
  // Photo modal expand state
  const [expandedPhoto, setExpandedPhoto] = useState(null);

  if (!currentUser || currentUser.role !== 'admin') return null;

  const sentTasks = tasks.filter(t => t.status === 'sent');

  const getMemberName = (userId) => {
    const found = members.find(m => m.id === userId);
    return found ? found.name : 'Desconocido';
  };

  const getMemberAvatar = (userId) => {
    const found = members.find(m => m.id === userId);
    return found ? found.avatar : '?';
  };

  const handleApprove = (taskId) => {
    approveTask(taskId, currentUser.id);
  };

  const handleOpenReject = (taskId) => {
    setRejectingTaskId(taskId);
    setReason('');
  };

  const handleConfirmReject = () => {
    if (!reason.trim()) return;
    rejectTask(rejectingTaskId, currentUser.id, reason);
    setRejectingTaskId(null);
    setReason('');
  };

  const getFormattedTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
  };

  return (
    <div className="page" style={{ position: 'relative' }}>
      {/* Expanded Photo Overlay */}
      {expandedPhoto && (
        <div 
          className="modal-overlay" 
          onClick={() => setExpandedPhoto(null)}
          style={{ justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.85)' }}
        >
          <div style={{ maxWidth: '90%', position: 'relative' }}>
            <img 
              src={expandedPhoto} 
              alt="Ampliada" 
              style={{ maxHeight: '80dvh', width: '100%', objectFit: 'contain', borderRadius: '16px' }}
            />
            <button 
              onClick={() => setExpandedPhoto(null)} 
              className="btn btn-icon btn-danger"
              style={{ position: 'absolute', top: '12px', right: '12px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Rejection Modal Drawer */}
      {rejectingTaskId && (
        <div className="modal-overlay" onClick={() => setRejectingTaskId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <h3 className="text-section" style={{ fontSize: '18px', marginBottom: '8px' }}>Rechazar Tarea</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Especifica el motivo del rechazo para que el miembro sepa qué corregir.
            </p>

            <div className="input-group">
              <label className="input-label">Motivo del rechazo</label>
              <textarea 
                className="input-field"
                placeholder="Ej: Aún queda polvo sobre la mesa..."
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              <button 
                onClick={() => setRejectingTaskId(null)} 
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmReject} 
                disabled={!reason.trim()}
                className="btn btn-danger"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ paddingLeft: '0' }}>
        <button onClick={() => navigate('/admin')} className="btn btn-icon btn-ghost">
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ flex: 1, marginLeft: '12px' }}>Verificar Tareas</h1>
      </div>

      <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="text-label" style={{ fontWeight: 'bold' }}>
          {sentTasks.length === 0 ? 'Sin tareas pendientes de revisión' : `${sentTasks.length} tareas pendientes`}
        </div>

        {sentTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">👏</div>
            <div className="empty-state-title">¡Buen trabajo!</div>
            <div className="empty-state-text">No hay tareas pendientes de revisión de ningún miembro de la familia.</div>
          </div>
        ) : (
          sentTasks.map(task => (
            <div key={task.id} className="card" style={{ border: '1.5px solid var(--border-light)', transform: 'none' }}>
              <div className="flex-between">
                <div className="flex-center" style={{ gap: '12px' }}>
                  <div style={{ fontSize: '32px' }}>{task.icon}</div>
                  <div>
                    <h3 style={{ fontWeight: '800', fontSize: '16px' }}>{task.title}</h3>
                    <div className="flex-center" style={{ gap: '6px', justifyContent: 'flex-start', marginTop: '2px' }}>
                      <div className="avatar avatar-sm" style={{ width: '20px', height: '20px', fontSize: '9px' }}>
                        {getMemberAvatar(task.completedBy)}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        por {getMemberName(task.completedBy)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="badge badge-reward">★ {task.points} monedas</span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                Enviada: {getFormattedTime(task.completedAt)}
              </div>

              {/* Task Proof Photo */}
              {task.photoUrl && (
                <div className="mt-3">
                  <div className="text-label" style={{ marginBottom: '6px' }}>Foto de prueba (Pulsa para ampliar):</div>
                  <img 
                    src={task.photoUrl} 
                    alt="Prueba de tarea" 
                    onClick={() => setExpandedPhoto(task.photoUrl)}
                    style={{ 
                      height: '120px', 
                      width: '100%', 
                      objectFit: 'cover', 
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: '1.5px solid var(--border-light)'
                    }}
                  />
                </div>
              )}

              {/* Verify Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                <button 
                  onClick={() => handleOpenReject(task.id)}
                  className="btn btn-secondary flex-center gap-1"
                  style={{ color: 'var(--error)', background: 'var(--error-light)', padding: '10px' }}
                >
                  <X size={16} /> Rechazar
                </button>
                <button 
                  onClick={() => handleApprove(task.id)}
                  className="btn btn-success flex-center gap-1"
                  style={{ padding: '10px' }}
                >
                  <Check size={16} /> Aprobar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminVerify;
