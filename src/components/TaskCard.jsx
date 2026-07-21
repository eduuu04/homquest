import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const TaskCard = ({ task }) => {
  const navigate = useNavigate();
  const { members } = useFamily();

  const getDifficultyBadgeClass = (diff) => {
    switch (diff) {
      case 'easy': return 'badge-easy';
      case 'medium': return 'badge-medium';
      case 'hard': return 'badge-hard';
      case 'epic': return 'badge-epic';
      default: return 'badge-medium';
    }
  };

  const getDifficultyLabel = (diff) => {
    switch (diff) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Media';
      case 'hard': return 'Difícil';
      case 'epic': return 'Épica';
      default: return 'Media';
    }
  };

  // Find assigned members
  const assignedMembers = members.filter(m => task.assignedTo.includes(m.id));

  const handleCardClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <div 
      className={`task-card status-${task.status}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="task-icon">{task.icon}</div>
      <div className="task-info">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          <span className={`badge ${getDifficultyBadgeClass(task.difficulty)}`}>
            {getDifficultyLabel(task.difficulty)}
          </span>
          {task.frequency && (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              · {task.frequency === 'daily' ? 'Diaria' : task.frequency === 'weekly' ? 'Semanal' : 'Única'}
            </span>
          )}
        </div>
        
        {/* Assigned Avatars Row */}
        <div className="flex-center mt-2" style={{ justifyContent: 'flex-start', gap: '4px' }}>
          {assignedMembers.map(m => (
            <div 
              key={m.id} 
              className={`avatar avatar-sm ${m.role === 'admin' ? 'avatar-admin' : ''}`}
              title={m.name}
            >
              {m.avatar}
            </div>
          ))}
        </div>

        {/* Status Indicator */}
        {task.status === 'sent' && (
          <div className="flex-center gap-1 mt-2" style={{ justifyContent: 'flex-start', color: 'var(--reward-dark)', fontSize: '13px', fontWeight: 600 }}>
            <Clock size={14} />
            <span>Pendiente de validación ⏳</span>
          </div>
        )}
        {task.status === 'approved' && (
          <div className="flex-center gap-1 mt-2" style={{ justifyContent: 'flex-start', color: '#059669', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle2 size={14} />
            <span>Aprobada y sumada ✅</span>
          </div>
        )}
        {task.status === 'rejected' && (
          <div className="flex-center gap-1 mt-2" style={{ justifyContent: 'flex-start', color: 'var(--error)', fontSize: '13px', fontWeight: 600 }}>
            <XCircle size={14} />
            <span>Rechazada · Reintentar ❌</span>
          </div>
        )}
      </div>

      <div className="task-points-container" style={{ textAlign: 'right' }}>
        <div className="badge badge-reward">
          ★ {task.points} monedas
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
