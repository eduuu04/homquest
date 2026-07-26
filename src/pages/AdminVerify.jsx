import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, AlertCircle, CheckCircle2, XCircle, Clock, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const AdminVerify = () => {
  const navigate = useNavigate();
  const { tasks = [], members = [], approveTask, verifyTask, rejectTask, currentUser, getMemberName } = useFamily();
  
  const [rejectingTarget, setRejectingTarget] = useState(null); // { taskId, memberId }
  const [reason, setReason] = useState('');
  const [expandedPhoto, setExpandedPhoto] = useState(null);

  if (!currentUser || currentUser.role !== 'admin') return null;

  // Extract all pending verification items across both data schemas
  const pendingItems = [];

  tasks.forEach(t => {
    if (t.status === 'sent' || t.status === 'pending_verification') {
      pendingItems.push({
        task: t,
        memberId: t.completedBy || (t.assignedTo && t.assignedTo[0]?.memberId) || (t.assignedTo && t.assignedTo[0]),
        photoUrl: t.photoUrl || t.proofPhotoUrl || (t.assignedTo && t.assignedTo[0]?.photoUrl),
        completedAt: t.completedAt || t.submittedAt
      });
    } else if (Array.isArray(t.assignedTo) && typeof t.assignedTo[0] === 'object') {
      t.assignedTo.forEach(a => {
        if (a.status === 'pending_verification') {
          pendingItems.push({
            task: t,
            memberId: a.memberId,
            photoUrl: a.photoUrl,
            completedAt: a.completedAt
          });
        }
      });
    }
  });

  const getMemberInfo = (userId) => {
    const found = members.find(m => m.id === userId);
    return found || { name: getMemberName?.(userId) || 'Miembro', avatar: '?' };
  };

  const handleApprove = (item) => {
    if (verifyTask) {
      verifyTask(item.task.id, item.memberId);
    } else if (approveTask) {
      approveTask(item.task.id, currentUser.id);
    }
  };

  const handleOpenReject = (item) => {
    setRejectingTarget(item);
    setReason('');
  };

  const handleConfirmReject = () => {
    if (!reason.trim() || !rejectingTarget) return;
    
    if (rejectTask.length >= 3) {
      rejectTask(rejectingTarget.task.id, rejectingTarget.memberId, reason);
    } else {
      rejectTask(rejectingTarget.task.id, currentUser.id, reason);
    }
    
    setRejectingTarget(null);
    setReason('');
  };

  const getFormattedTime = (dateStr) => {
    if (!dateStr) return 'Reciente';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page pb-tab">
      
      {/* Expanded Photo Overlay */}
      {expandedPhoto && (
        <div 
          className="modal-overlay" 
          onClick={() => setExpandedPhoto(null)}
          style={{ justifyContent: 'center', alignItems: 'center', padding: 'var(--sp-4)' }}
        >
          <div style={{ maxWidth: '90%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={expandedPhoto} 
              alt="Prueba ampliada" 
              style={{ maxHeight: '80dvh', width: '100%', objectFit: 'contain', borderRadius: 'var(--radius-xl)' }}
            />
            <button 
              onClick={() => setExpandedPhoto(null)} 
              className="btn btn-icon btn-danger"
              style={{ position: 'absolute', top: '10px', right: '10px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Rejection Modal Drawer */}
      {rejectingTarget && (
        <div className="modal-overlay" onClick={() => setRejectingTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <h3 className="text-section" style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Rechazar Entrega</h3>
            <p className="text-label-sm mb-4">
              Indica el motivo del rechazo para que el miembro sepa qué corregir.
            </p>

            <div className="input-group">
              <label className="input-label">Motivo de rechazo</label>
              <textarea 
                className="input-field"
                placeholder="Ej: Aún quedan manchas en la encimera..."
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ resize: 'none' }}
                autoFocus
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              <button 
                onClick={() => setRejectingTarget(null)} 
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
      <div className="page-header">
        <button onClick={() => navigate('/admin')} className="btn btn-icon btn-ghost">
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-title" style={{ flex: 1 }}>Verificar Tareas</h1>
      </div>

      <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {pendingItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <CheckCircle2 size={32} color="var(--success)" />
            </div>
            <div className="empty-state-title">¡Todo al día!</div>
            <div className="empty-state-text">No hay entregas de tareas pendientes de revisión en este momento.</div>
          </div>
        ) : (
          pendingItems.map((item, idx) => {
            const member = getMemberInfo(item.memberId);
            return (
              <div key={idx} className="card card-flat stagger-item" style={{ padding: 'var(--sp-5)' }}>
                <div className="flex-between">
                  <div className="flex-center gap-3">
                    <div className="task-icon">
                      {item.task.emoji || item.task.icon || '📋'}
                    </div>
                    <div>
                      <h3 className="text-body-bold" style={{ fontSize: '1rem' }}>{item.task.title}</h3>
                      <div className="flex-center gap-2 mt-1" style={{ justifyContent: 'flex-start' }}>
                        <div className="avatar avatar-sm" style={{ width: '22px', height: '22px', fontSize: '10px' }}>
                          {member.avatar || member.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-label-sm">
                          Por: <strong>{member.name}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-reward">
                    +{item.task.xp || item.task.points || 0} XP
                  </span>
                </div>

                <div className="text-label-sm mt-2" style={{ color: 'var(--fg-tertiary)' }}>
                  Enviado: {getFormattedTime(item.completedAt)}
                </div>

                {/* Proof Photo */}
                {item.photoUrl && (
                  <div className="mt-3">
                    <div className="text-label-sm mb-1 flex-center gap-1" style={{ justifyContent: 'flex-start' }}>
                      <ImageIcon size={14} />
                      <span>Foto de prueba (Toca para ampliar):</span>
                    </div>
                    <img 
                      src={item.photoUrl} 
                      alt="Prueba de tarea" 
                      onClick={() => setExpandedPhoto(item.photoUrl)}
                      style={{ 
                        height: '140px', 
                        width: '100%', 
                        objectFit: 'cover', 
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        border: '1px solid var(--border-light)'
                      }}
                    />
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                  <button 
                    onClick={() => handleOpenReject(item)}
                    className="btn btn-secondary flex-center gap-1"
                    style={{ color: 'var(--error-dark)', background: 'var(--error-light)' }}
                  >
                    <X size={16} /> Rechazar
                  </button>
                  
                  <button 
                    onClick={() => handleApprove(item)}
                    className="btn btn-success flex-center gap-1"
                  >
                    <Check size={16} /> Aprobar
                  </button>
                </div>
              </div>
            );
          })
        )}

      </div>
    </div>
  );
};

export default AdminVerify;
