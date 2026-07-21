import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check, ShieldAlert, Award, AlertTriangle } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, currentUser, completeTask, members } = useFamily();
  const [photoSelected, setPhotoSelected] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const task = tasks.find(t => t.id === id);

  if (!task) {
    return (
      <div className="page text-center">
        <h2>Tarea no encontrada</h2>
        <button onClick={() => navigate('/tasks')} className="btn btn-primary mt-4">
          Volver a tareas
        </button>
      </div>
    );
  }

  const assignedMembers = members.filter(m => task.assignedTo.includes(m.id));

  const handleSimulatePhoto = () => {
    setPhotoSelected(true);
  };

  const handleComplete = () => {
    setIsSubmitting(true);
    // Simulate stock cleaning photo if required
    const mockPhotoUrl = task.requiresPhoto 
      ? 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400'
      : null;

    completeTask(task.id, mockPhotoUrl);

    setTimeout(() => {
      setIsSubmitting(false);
      
      // If user is Admin and the task is auto-approvable (doesn't require other admin)
      if (currentUser.role === 'admin' && !task.requireOtherAdmin) {
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
          navigate('/tasks');
        }, 3000);
      } else {
        // Just navigate back with a simple message
        navigate('/tasks');
      }
    }, 1200);
  };

  const getDifficultyLabel = (diff) => {
    switch (diff) {
      case 'easy': return '🟢 Fácil';
      case 'medium': return '🟡 Media';
      case 'hard': return '🟠 Difícil';
      case 'epic': return '🔴 Épica';
      default: return '🟡 Media';
    }
  };

  return (
    <div className="page" style={{ position: 'relative' }}>
      {/* Celebration overlay */}
      {showCelebration && (
        <div 
          className="flex-center" 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(124, 58, 237, 0.95)', 
            zIndex: 999, 
            flexDirection: 'column', 
            color: 'var(--white)',
            textAlign: 'center',
            padding: '24px'
          }}
        >
          <div style={{ fontSize: '72px', animation: 'pulse 1s infinite' }}>🎉</div>
          <h1 className="text-display" style={{ color: 'var(--white)', marginTop: '20px' }}>¡Tarea Aprobada!</h1>
          <p className="mt-2" style={{ fontSize: '18px', fontWeight: 'bold' }}>Has ganado +{task.points} 🪙 y XP</p>
          <div className="mt-4" style={{ fontSize: '14px', opacity: 0.8 }}>Auto-aprobado como administrador</div>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ paddingLeft: '0' }}>
        <button onClick={() => navigate('/tasks')} className="btn btn-icon btn-ghost">
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ flex: 1, marginLeft: '12px' }}>Detalle de Tarea</h1>
      </div>

      <div className="card text-center" style={{ padding: '24px', position: 'relative' }}>
        <div 
          style={{ 
            width: '80px', 
            height: '80px', 
            background: 'var(--surface)', 
            borderRadius: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '44px',
            margin: '0 auto 16px'
          }}
        >
          {task.icon}
        </div>
        <h2 className="text-section" style={{ marginBottom: '8px' }}>{task.title}</h2>
        <div className="flex-center gap-2 mb-4">
          <span className="badge badge-reward">★ {task.points} monedas</span>
          <span className="badge badge-medium">{getDifficultyLabel(task.difficulty)}</span>
        </div>
        
        <p className="text-body" style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          {task.description || 'No hay descripción disponible para esta tarea.'}
        </p>

        <div className="divider"></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
          <div className="flex-between">
            <span className="text-label">Frecuencia:</span>
            <span style={{ fontWeight: '700' }}>
              {task.frequency === 'daily' ? 'Diaria' : task.frequency === 'weekly' ? 'Semanal' : 'Única'}
            </span>
          </div>
          
          <div className="flex-between">
            <span className="text-label">Requiere foto:</span>
            <span style={{ fontWeight: '700', color: task.requiresPhoto ? 'var(--primary)' : 'var(--text-secondary)' }}>
              {task.requiresPhoto ? 'Sí 📸' : 'No'}
            </span>
          </div>

          {task.requireOtherAdmin && (
            <div className="flex-center gap-2 mt-2" style={{ background: 'var(--error-light)', padding: '10px 14px', borderRadius: '12px', color: 'var(--error)' }}>
              <ShieldAlert size={18} />
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Requiere verificación de otro administrador</span>
            </div>
          )}

          <div>
            <span className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Asignado a:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {assignedMembers.map(m => (
                <div 
                  key={m.id} 
                  className="flex-center gap-2 card card-flat"
                  style={{ padding: '6px 12px', borderRadius: '12px' }}
                >
                  <div className="avatar avatar-sm">{m.avatar}</div>
                  <span style={{ fontSize: '14px', fontWeight: '700' }}>{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Action Form */}
      {task.status === 'pending' || task.status === 'rejected' ? (
        <div className="mt-6">
          {task.status === 'rejected' && (
            <div className="card mb-4" style={{ border: '2px solid var(--error)', background: 'var(--error-light)' }}>
              <div className="flex-center gap-2" style={{ color: 'var(--error)', fontWeight: 'bold', justifyContent: 'flex-start' }}>
                <AlertTriangle size={18} />
                <span>Tarea Rechazada por Admin</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '6px' }}>
                <strong>Motivo:</strong> {task.rejectionReason}
              </div>
            </div>
          )}

          {task.requiresPhoto && (
            <div className="card text-center mb-4" style={{ border: photoSelected ? '2px solid var(--success)' : '1.5px dashed var(--border)' }}>
              {!photoSelected ? (
                <div>
                  <Camera size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>Sube una foto de verificación</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Esta tarea requiere foto para ser aprobada por el admin
                  </div>
                  <button 
                    type="button" 
                    onClick={handleSimulatePhoto}
                    className="btn btn-secondary btn-sm"
                  >
                    Simular Cámara 📸
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400" 
                    alt="Mock" 
                    style={{ height: '140px', width: '100%', objectFit: 'cover', borderRadius: '12px' }}
                  />
                  <div 
                    className="avatar avatar-sm flex-center"
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--success)' }}
                  >
                    <Check size={16} />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setPhotoSelected(false)}
                    className="btn btn-danger btn-sm mt-2"
                  >
                    Cambiar foto
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Comentario opcional</label>
            <textarea 
              className="input-field" 
              placeholder="Ej: He limpiado debajo del sofá también..."
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <button 
            onClick={handleComplete}
            disabled={isSubmitting || (task.requiresPhoto && !photoSelected)}
            className="btn btn-success btn-lg mt-2"
          >
            {isSubmitting ? 'Enviando...' : 'Completar Tarea'}
          </button>
        </div>
      ) : (
        <div className="card text-center mt-6" style={{ padding: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>
            {task.status === 'approved' ? '✅' : '⏳'}
          </div>
          <div style={{ fontWeight: '700', fontSize: '16px' }}>
            {task.status === 'approved' ? '¡Tarea Aprobada!' : 'Esperando verificación'}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {task.status === 'approved' 
              ? 'Esta tarea ya ha sido validada y se han otorgado los puntos.' 
              : 'La tarea ha sido completada y está en cola de revisión para el administrador.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
