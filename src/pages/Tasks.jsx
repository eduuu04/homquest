import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import TaskCard from '../components/TaskCard';

const Tasks = () => {
  const { tasks, currentUser } = useFamily();
  const [filter, setFilter] = useState('all'); // all, today, week, pending, done

  if (!currentUser) return null;

  // Filter tasks logic
  const filteredTasks = tasks.filter(task => {
    // Basic filter: only show tasks assigned to this user
    const isAssigned = task.assignedTo.includes(currentUser.id);
    if (!isAssigned) return false;

    switch (filter) {
      case 'today':
        return task.frequency === 'daily' && task.status !== 'approved';
      case 'week':
        return task.status !== 'approved';
      case 'pending':
        return task.status === 'pending' || task.status === 'rejected';
      case 'done':
        return task.status === 'approved' || task.status === 'sent';
      case 'all':
      default:
        return true;
    }
  });

  return (
    <div className="page">
      <div className="page-header" style={{ paddingBottom: '0px' }}>
        <h1 className="page-title">Mis Tareas 📋</h1>
      </div>

      {/* Filter chips */}
      <div className="chip-group mt-4">
        <button 
          onClick={() => setFilter('all')} 
          className={`chip ${filter === 'all' ? 'active' : ''}`}
        >
          Todas
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
      <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '300px' }}>
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">🏖️</div>
            <div className="empty-state-title">Sin tareas</div>
            <div className="empty-state-text">No hay tareas que coincidan con este filtro.</div>
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
