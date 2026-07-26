import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, Coins, Sparkles, Camera, ListChecks } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const TaskCard = ({ task }) => {
  const navigate = useNavigate();
  const { members, currentUser, getMemberName } = useFamily();

  // Normalize assignment and status handling
  const points = task.xp || task.points || 0;

  // Determine assigned members array
  let assignedMemberIds = [];
  if (Array.isArray(task.assignedTo)) {
    assignedMemberIds = task.assignedTo.map(a => typeof a === 'object' ? a.memberId : a);
  }

  const assignedMembers = members?.filter(m => assignedMemberIds.includes(m.id)) || [];

  // Determine current status
  let taskStatus = task.status || 'pending';
  if (task.assignedTo && Array.isArray(task.assignedTo) && typeof task.assignedTo[0] === 'object') {
    const myAssignment = task.assignedTo.find(a => a.memberId === currentUser?.id);
    if (myAssignment) {
      taskStatus = myAssignment.status;
    }
  }

  const handleCardClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  // Render task icon (fallback to ListChecks lucide icon if emoji string is not provided or emoji replacement)
  const renderTaskIcon = () => {
    if (task.emoji || task.icon) {
      return <span style={{ fontSize: '1.4rem' }}>{task.emoji || task.icon}</span>;
    }
    return <ListChecks size={22} />;
  };

  return (
    <div 
      className={`task-card status-${taskStatus} stagger-item`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="task-icon">
        {renderTaskIcon()}
      </div>

      <div className="task-info">
        <div className="task-title">{task.title}</div>
        
        <div className="task-meta mt-2">
          {task.difficulty && (
            <span className={`badge badge-${task.difficulty}`}>
              {task.difficulty === 'easy' ? 'Fácil' : task.difficulty === 'medium' ? 'Media' : task.difficulty === 'hard' ? 'Difícil' : 'Épica'}
            </span>
          )}

          {task.requiresPhoto && (
            <span className="flex-center gap-1 text-label-sm" style={{ color: 'var(--fg-secondary)' }}>
              <Camera size={13} /> Foto
            </span>
          )}

          {task.frequency && (
            <span className="text-label-sm">
              · {task.frequency === 'daily' ? 'Diaria' : task.frequency === 'weekly' ? 'Semanal' : 'Única'}
            </span>
          )}
        </div>
        
        {/* Assigned Avatars Row */}
        {assignedMembers.length > 0 && (
          <div className="flex-center mt-2" style={{ justifyContent: 'flex-start', gap: '4px' }}>
            {assignedMembers.map(m => (
              <div 
                key={m.id} 
                className={`avatar avatar-sm ${m.role === 'admin' ? 'avatar-admin' : ''}`}
                title={m.name || getMemberName?.(m.id)}
              >
                {m.avatar || m.name?.[0]?.toUpperCase() || '?'}
              </div>
            ))}
          </div>
        )}

        {/* Status Indicator */}
        {(taskStatus === 'sent' || taskStatus === 'pending_verification') && (
          <div className="flex-center gap-1 mt-2" style={{ justifyContent: 'flex-start', color: 'var(--reward-dark)', fontSize: '0.8rem', fontWeight: 600 }}>
            <Clock size={14} />
            <span>En revisión</span>
          </div>
        )}
        {(taskStatus === 'approved' || taskStatus === 'completed') && (
          <div className="flex-center gap-1 mt-2" style={{ justifyContent: 'flex-start', color: 'var(--success-dark)', fontSize: '0.8rem', fontWeight: 600 }}>
            <CheckCircle2 size={14} />
            <span>Completada</span>
          </div>
        )}
        {taskStatus === 'rejected' && (
          <div className="flex-center gap-1 mt-2" style={{ justifyContent: 'flex-start', color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600 }}>
            <XCircle size={14} />
            <span>Rechazada · Reintentar</span>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'right' }}>
        <div className="badge badge-reward flex-center gap-1">
          <Coins size={14} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>+{points} XP</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
