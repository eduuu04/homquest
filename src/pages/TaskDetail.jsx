import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check, ShieldAlert, Award, AlertTriangle, CheckCircle2, Clock, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks = [], currentUser, completeTask, members = [] } = useFamily();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const fileInputRef = useRef(null);

  const task = tasks.find(t => t.id === id);

  if (!task) {
    return (
      <div className="page text-center pb-tab flex-center" style={{ minHeight: '60dvh' }}>
        <div className="card" style={{ padding: 'var(--sp-8)' }}>
          <h2 className="text-section">Tarea no encontrada</h2>
          <p className="text-label mt-2">La tarea que buscas no existe o ha sido eliminada.</p>
          <button onClick={() => navigate('/tasks')} className="btn btn-primary mt-4">
            Volver a tareas
          </button>
        </div>
      </div>
    );
  }

  // Handle assigned members list
  let assignedMemberIds = [];
  if (Array.isArray(task.assignedTo)) {
    assignedMemberIds = task.assignedTo.map(a => typeof a === 'object' ? a.memberId : a);
  }
  const assignedMembers = members.filter(m => assignedMemberIds.includes(m.id));

  // Determine user status on this task
  let taskStatus = task.status || 'pending';
  let myAssignment = null;
  if (Array.isArray(task.assignedTo) && typeof task.assignedTo[0] === 'object') {
    myAssignment = task.assignedTo.find(a => a.memberId === currentUser?.id);
    if (myAssignment) taskStatus = myAssignment.status;
  }

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
      
      if (currentUser?.role === 'admin' && !task.requireOtherAdmin) {
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
          navigate('/tasks');
        }, 2500);
      } else {
        navigate('/tasks');
      }
    } catch (error) {
      console.error('No se pudo completar la tarea:', error);
      setSubmitError(error?.message || 'No se pudo enviar la tarea. Inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page pb-tab">
      
      {/* Celebration overlay */}
      {showCelebration && (
        <div 
          className="flex-center animate-in" 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'oklch(var(--primary-raw) / 0.95)', 
            backdropFilter: 'blur(8px)',
            zIndex: 999, 
            flexDirection: 'column', 
            color: 'oklch(0.99 0 0)',
            textAlign: 'center',
            padding: 'var(--sp-6)'
          }}
        >
          <div className="animate-pulse mb-3">
            <Sparkles size={72} color="var(--reward)" />
          </div>
          <h1 className="text-display" style={{ color: 'oklch(0.99 0 0)', fontSize: '2.2rem' }}>¡Tarea Aprobada!</h1>
          <p className="text-body-bold mt-2" style={{ fontSize: '1.2rem' }}>
            +{task.xp || task.points || 0} XP sumados
          </p>
          <div className="text-label-sm mt-4" style={{ color: 'oklch(0.92 0.02 285)' }}>
            Auto-aprobado como administrador
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate('/tasks')} className="btn btn-icon btn-ghost">
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-title" style={{ flex: 1 }}>Detalle de Tarea</h1>
      </div>

      <div className="card text-center stagger-item" style={{ padding: 'var(--sp-6)', position: 'relative' }}>
        <div className="task-icon animate-scale" style={{ width: '72px', height: '72px', margin: '0 auto 16px', borderRadius: 'var(--radius-xl)' }}>
          {task.emoji || task.icon ? (
            <span style={{ fontSize: '2.2rem' }}>{task.emoji || task.icon}</span>
          ) : (
            <Award size={36} />
          )}
        </div>

        <h2 className="text-section" style={{ fontSize: '1.4rem' }}>{task.title}</h2>
        
        <div className="flex-center gap-2 mt-2 mb-4">
          <span className="badge badge-reward">
            +{task.xp || task.points || 0} XP
          </span>
          {task.difficulty && (
            <span className={`badge badge-${task.difficulty}`}>
              {task.difficulty === 'easy' ? 'Fácil' : task.difficulty === 'medium' ? 'Media' : task.difficulty === 'hard' ? 'Difícil' : 'Épica'}
            </span>
          )}
        </div>
        
        <p className="text-body" style={{ color: 'var(--fg-secondary)', fontSize: '0.95rem' }}>
          {task.description || 'No hay descripción detallada especificada para esta tarea.'}
        </p>

        <div style={{ height: '1px', background: 'var(--border-light)', margin: 'var(--sp-4) 0' }}></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
          <div className="flex-between">
            <span className="text-label">Frecuencia:</span>
            <span className="text-body-bold" style={{ fontSize: '0.9rem' }}>
              {task.frequency === 'daily' ? 'Diaria' : task.frequency === 'weekly' ? 'Semanal' : 'Única'}
            </span>
          </div>
          
          <div className="flex-between">
            <span className="text-label">Evidencia de Foto:</span>
            <span className="text-body-bold" style={{ fontSize: '0.9rem', color: task.requiresPhoto ? 'var(--primary)' : 'var(--fg-secondary)' }}>
              {task.requiresPhoto ? 'Requerida 📸' : 'Opcional'}
            </span>
          </div>

          {task.requireOtherAdmin && (
            <div className="flex-center gap-2 mt-2" style={{ background: 'var(--error-light)', padding: '10px 14px', borderRadius: 'var(--radius-md)', color: 'var(--error-dark)' }}>
              <ShieldAlert size={18} />
              <span className="text-label-sm" style={{ fontWeight: 700 }}>Requiere aprobación de otro administrador</span>
            </div>
          )}

          {assignedMembers.length > 0 && (
            <div className="mt-2">
              <span className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Asignados:</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {assignedMembers.map(m => (
                  <div 
                    key={m.id} 
                    className="flex-center gap-2 card card-flat"
                    style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)' }}
                  >
                    <div className="avatar avatar-sm">{m.avatar || m.name?.[0]?.toUpperCase()}</div>
                    <span className="text-body-bold" style={{ fontSize: '0.85rem' }}>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Action Form */}
      {taskStatus === 'pending' || taskStatus === 'rejected' ? (
        <div className="mt-6 animate-in">
          {taskStatus === 'rejected' && (
            <div className="card mb-4" style={{ border: '1.5px solid var(--error)', background: 'var(--error-light)' }}>
              <div className="flex-center gap-2" style={{ color: 'var(--error-dark)', fontWeight: 700, justifyContent: 'flex-start' }}>
                <AlertTriangle size={18} />
                <span>Revisión Rechazada</span>
              </div>
              <div className="text-body mt-2" style={{ fontSize: '0.9rem' }}>
                <strong>Motivo:</strong> {task.rejectionReason || 'Por favor, toma una mejor foto y vuelve a enviarla.'}
              </div>
            </div>
          )}

          {task.requiresPhoto && (
            <div className="card text-center mb-4" style={{ border: photoPreview ? '1.5px solid var(--success)' : '1.5px dashed var(--border)' }}>
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
                  <div className="task-icon" style={{ margin: '0 auto 12px', background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                    <Camera size={26} />
                  </div>
                  <div className="text-body-bold">Foto de Verificación Requerida</div>
                  <p className="text-label-sm mt-1 mb-4">
                    Adjunta una fotografía clara como prueba del trabajo realizado.
                  </p>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm flex-center gap-1"
                    style={{ margin: '0 auto' }}
                  >
                    <Camera size={16} /> 
                    <span>Abrir Cámara / Galería</span>
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img
                    src={photoPreview}
                    alt="Verificación"
                    style={{ maxHeight: '220px', width: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                  />
                  <div 
                    className="avatar avatar-sm flex-center"
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--success)', color: 'white' }}
                  >
                    <Check size={16} />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="btn btn-ghost btn-sm mt-2"
                    style={{ color: 'var(--error)' }}
                  >
                    Cambiar foto
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Nota o comentario opcional</label>
            <textarea 
              className="input-field" 
              placeholder="Añade algún detalle relevante..."
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
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-pulse" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                <span>Completar Tarea</span>
              </>
            )}
          </button>

          {submitError && (
            <p role="alert" className="text-label-sm text-center mt-2" style={{ color: 'var(--error)' }}>
              {submitError}
            </p>
          )}
        </div>
      ) : (
        <div className="card text-center mt-6 animate-in" style={{ padding: 'var(--sp-6)' }}>
          <div className="task-icon" style={{ margin: '0 auto 12px', background: (taskStatus === 'approved' || taskStatus === 'completed') ? 'var(--success-light)' : 'var(--reward-light)', color: (taskStatus === 'approved' || taskStatus === 'completed') ? 'var(--success-dark)' : 'var(--reward-dark)' }}>
            {(taskStatus === 'approved' || taskStatus === 'completed') ? <CheckCircle2 size={28} /> : <Clock size={28} />}
          </div>

          <h3 className="text-body-bold" style={{ fontSize: '1.1rem' }}>
            {(taskStatus === 'approved' || taskStatus === 'completed') ? '¡Tarea Aprobada!' : 'En Revisión'}
          </h3>

          <p className="text-label-sm mt-2">
            {(taskStatus === 'approved' || taskStatus === 'completed')
              ? 'Esta tarea ya ha sido verificada con éxito y se te han otorgado los puntos.' 
              : 'Tu entrega ha sido enviada y se encuentra pendiente de verificación por el administrador.'}
          </p>
        </div>
      )}

    </div>
  );
};

export default TaskDetail;
