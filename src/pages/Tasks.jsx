import React, { useState } from 'react';
import { ClipboardList, CheckCircle2, Filter, Inbox } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import TaskCard from '../components/TaskCard';

const Tasks = () => {
  const { tasks = [], currentUser } = useFamily();
  const [filter, setFilter] = useState('all'); // all, today, week, pending, done

  if (!currentUser) return null;

  // Filter tasks logic
  const filteredTasks = tasks.filter(task => {
    // Check assignment across both data models
    let isAssigned = false;
    if (Array.isArray(task.assignedTo)) {
      isAssigned = task.assignedTo.some(a => (typeof a === 'object' ? a.memberId === currentUser.id : a === currentUser.id));
    } else {
      isAssigned = true;
    }

    if (!isAssigned) return false;

    // Normalize task status
    let status = task.status || 'pending';
    if (Array.isArray(task.assignedTo) && typeof task.assignedTo[0] === 'object') {
      const myAssign = task.assignedTo.find(a => a.memberId === currentUser.id);
      if (myAssign) status = myAssign.status;
    }

    switch (filter) {
      case 'today':
        return task.frequency === 'daily' && status !== 'approved' && status !== 'completed';
      case 'week':
        return status !== 'approved' && status !== 'completed';
      case 'pending':
        return status === 'pending' || status === 'rejected';
      case 'done':
        return status === 'approved' || status === 'completed' || status === 'sent' || status === 'pending_verification';
      case 'all':
      default:
        return true;
    }
  });

  return (
    <div className="page pb-tab">
      
      <div className="page-header">
        <h1 className="page-title">
          <ClipboardList size={26} color="var(--primary)" />
          <span>Mis Tareas</span>
        </h1>
      </div>

      {/* Filter chips */}
      <div className="chip-group mt-2">
        <button 
          onClick={() => setFilter('all')} 
          className={`chip ${filter === 'all' ? 'active' : ''}`}
        >
          Todas ({tasks.length})
        </button>
        <button 
          onClick={() => setFilter('today')} 
          className={`chip ${filter === 'today' ? 'active' : ''}`}
        >
          Hoy
        </button>
        <button 
          onClick={() => setFilter('week')} 
          className={`chip ${filter === 'week' ? 'active' : ''}`}
        >
          Esta semana
        </button>
        <button 
          onClick={() => setFilter('pending')} 
          className={`chip ${filter === 'pending' ? 'active' : ''}`}
        >
          Pendientes
        </button>
        <button 
          onClick={() => setFilter('done')} 
          className={`chip ${filter === 'done' ? 'active' : ''}`}
        >
          Completadas
        </button>
      </div>

      {/* Tasks list */}
      <div className="mt-4" style={{ minHeight: '300px' }}>
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Inbox size={32} />
            </div>
            <div className="empty-state-title">Sin tareas aquí</div>
            <div className="empty-state-text">No hay tareas asociadas al filtro seleccionado.</div>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>

    </div>
  );
};

export default Tasks;
