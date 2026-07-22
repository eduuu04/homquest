import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check, ShieldAlert, Award, AlertTriangle } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, currentUser, completeTask, members } = useFamily();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const fileInputRef = React.useRef(null);

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

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await completeTask(task.id, photoFile || photoPreview, comment);
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
    } catch (error) {
      console.error('No se pudo completar la tarea:', error);
      setSubmitError('No se pudo enviar la tarea. Comprueba tu conexión e inténtalo de nuevo.');
      setIsSubmitting(false);
    }
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
            <div className="card text-center mb-4" style={{ border: photoPreview ? '2px solid var(--success)' : '1.5px dashed var(--border)' }}>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />

              {!photoPreview ? (
                <div>
                  <Camera size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>Foto de verificación requerida</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Toma una foto con tu cámara o selecciona una imagen de tu dispositivo
                  </div>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '6px' }}
                  >
                    <Camera size={16} /> Abrir Cámara / Galería 📸
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img
                    src={photoPreview}
                    alt="Foto de verificación"
                    style={{ maxHeight: '200px', width: '100%', objectFit: 'cover', borderRadius: '12px' }}
                  />
                  <div 
                    className="avatar avatar-sm flex-center"
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--success)', color: 'white' }}
                  >
                    <Check size={16} />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="btn btn-danger btn-sm mt-2"
                  >
                    Cambiar o tomar otra foto
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
            disabled={isSubmitting || (task.requiresPhoto && !photoPreview)}
            className="btn btn-success btn-lg mt-2"
          >
            {isSubmitting ? 'Enviando...' : 'Completar Tarea'}
          </button>
          {submitError && (
            <p role="alert" style={{ color: 'var(--error)', fontSize: '13px', marginTop: '10px', textAlign: 'center' }}>
              {submitError}
            </p>
          )}
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
