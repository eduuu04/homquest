import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Sparkles, BookOpen, Trash2, PlusCircle, Check, Coins } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { PREDEFINED_TASKS } from '../utils/constants';

const AdminCreateTask = () => {
  const navigate = useNavigate();
  const { addTask, createTask, deleteTask, tasks = [], members = [], currentUser } = useFamily();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🧹');
  const [difficulty, setDifficulty] = useState('medium');
  const [points, setPoints] = useState(40);
  const [frequency, setFrequency] = useState('daily');
  const [assignedTo, setAssignedTo] = useState([]);
  
  // Custom days, time limits, and bonuses
  const [customDays, setCustomDays] = useState([]);
  const [timeLimit, setTimeLimit] = useState('');
  const [bonusPoints, setBonusPoints] = useState(0);
  
  // Advanced features toggles
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [requiresPhoto, setRequiresPhoto] = useState(false);
  const [requireOtherAdmin, setRequireOtherAdmin] = useState(false);
  const [isRotative, setIsRotative] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  if (!currentUser || currentUser.role !== 'admin') return null;

  const handleDifficultyChange = (diff) => {
    setDifficulty(diff);
    if (diff === 'easy') setPoints(10);
    else if (diff === 'medium') setPoints(40);
    else if (diff === 'hard') setPoints(70);
    else if (diff === 'epic') setPoints(150);
  };

  const handleToggleAssignee = (memberId) => {
    if (assignedTo.includes(memberId)) {
      setAssignedTo(prev => prev.filter(id => id !== memberId));
    } else {
      setAssignedTo(prev => [...prev, memberId]);
    }
  };

  const handleApplyPredefined = (predefined) => {
    setTitle(predefined.title);
    if (predefined.icon || predefined.emoji) setIcon(predefined.icon || predefined.emoji);
    if (predefined.difficulty) handleDifficultyChange(predefined.difficulty);
    if (predefined.points || predefined.xp) setPoints(predefined.points || predefined.xp);
    if (predefined.frequency) setFrequency(predefined.frequency);
    setIsCatalogOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || assignedTo.length === 0) return;

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      icon,
      emoji: icon,
      difficulty,
      points: Number(points),
      xp: Number(points),
      frequency,
      assignedTo,
      requiresPhoto,
      requireOtherAdmin,
      isRotative,
      customDays: frequency === 'custom' ? customDays : [],
      timeLimit,
      bonusPoints: Number(bonusPoints)
    };

    if (addTask) {
      addTask(taskPayload);
    } else if (createTask) {
      createTask(taskPayload);
    }

    navigate('/admin');
  };

  const emojis = ['🧹', '🛏️', '🍽️', '🧽', '🚿', '✨', '🍳', '👕', '🧺', '🗑️', '🐕', '🌱', '🛒', '📚'];

  return (
    <div className="page pb-tab">
      
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate('/admin')} className="btn btn-icon btn-ghost">
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-title" style={{ flex: 1 }}>Nueva Tarea</h1>
      </div>

      {/* Catalog Button */}
      {PREDEFINED_TASKS && PREDEFINED_TASKS.length > 0 && (
        <button 
          type="button"
          onClick={() => setIsCatalogOpen(!isCatalogOpen)}
          className="btn btn-secondary w-full mb-4 flex-between"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex-center gap-2">
            <BookOpen size={18} color="var(--primary)" />
            <span>Plantillas de tareas predefinidas</span>
          </div>
          {isCatalogOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}

      {/* Catalog collapsible */}
      {isCatalogOpen && (
        <div className="card card-flat mb-4 animate-in" style={{ padding: 'var(--sp-3)', maxHeight: '240px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PREDEFINED_TASKS.map(pt => (
              <div 
                key={pt.id}
                onClick={() => handleApplyPredefined(pt)}
                className="flex-between stagger-item"
                style={{ 
                  padding: '10px 12px', 
                  background: 'var(--primary-bg)', 
                  borderRadius: 'var(--radius-md)', 
                  cursor: 'pointer'
                }}
              >
                <div className="flex-center gap-2">
                  <span style={{ fontSize: '1.2rem' }}>{pt.icon || pt.emoji || '📋'}</span>
                  <span className="text-body-bold" style={{ fontSize: '0.9rem' }}>{pt.title}</span>
                </div>
                <span className="badge badge-reward">+{pt.points || pt.xp || 10} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="animate-in">
        <div className="card" style={{ border: '1px solid var(--border-light)' }}>
          
          <div className="input-group">
            <label className="input-label">Nombre de la tarea</label>
            <input 
              type="text"
              className="input-field"
              placeholder="Ej: Pasar la aspiradora por el salón..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">Icono</label>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
              {emojis.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className="flex-center"
                  style={{ 
                    fontSize: '1.4rem', 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: 'var(--radius-md)',
                    border: icon === em ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    background: icon === em ? 'var(--primary-bg)' : 'var(--bg-card)',
                    flexShrink: 0
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Dificultad</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {['easy', 'medium', 'hard', 'epic'].map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => handleDifficultyChange(diff)}
                  className={`btn btn-sm ${difficulty === diff ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.8rem', padding: '8px 0' }}
                >
                  {diff === 'easy' ? 'Fácil' : diff === 'medium' ? 'Media' : diff === 'hard' ? 'Difícil' : 'Épica'}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Frecuencia</label>
            <select 
              value={frequency} 
              onChange={(e) => setFrequency(e.target.value)}
              className="input-field"
            >
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
              <option value="once">Única</option>
            </select>
          </div>

          <div className="input-group mt-2">
            <label className="input-label">Asignar a (Miembros del hogar)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {members.map(member => {
                const isSelected = assignedTo.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleToggleAssignee(member.id)}
                    className="flex-center gap-2 card card-flat"
                    style={{ 
                      padding: '8px 14px', 
                      borderRadius: 'var(--radius-lg)', 
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      background: isSelected ? 'var(--primary-bg)' : 'var(--bg-card)'
                    }}
                  >
                    <div className="avatar avatar-sm">{member.avatar || member.name?.[0]?.toUpperCase()}</div>
                    <span className="text-body-bold" style={{ fontSize: '0.88rem' }}>{member.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Options Accordion */}
          <div style={{ height: '1px', background: 'var(--border-light)', margin: 'var(--sp-4) 0' }}></div>

          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex-between w-full"
            style={{ fontWeight: 600, color: 'var(--fg-secondary)', fontSize: '0.9rem' }}
          >
            <span>Opciones avanzadas (Puntos, Foto, Reglas)</span>
            {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isAdvancedOpen && (
            <div className="mt-4 animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div className="input-group">
                <label className="input-label">Puntos / Monedas (XP)</label>
                <input 
                  type="number"
                  className="input-field"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Descripción</label>
                <textarea 
                  className="input-field"
                  placeholder="Detalles útiles sobre cómo realizarla..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="flex-between">
                <div>
                  <div className="text-body-bold" style={{ fontSize: '0.9rem' }}>Requiere foto de prueba</div>
                  <div className="text-label-sm">El miembro debe adjuntar foto antes de enviar</div>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle" 
                  checked={requiresPhoto} 
                  onChange={(e) => setRequiresPhoto(e.target.checked)} 
                />
              </div>

              <div className="flex-between">
                <div>
                  <div className="text-body-bold" style={{ fontSize: '0.9rem' }}>Verificación cruzada (Otro Admin)</div>
                  <div className="text-label-sm">No permite auto-aprobarse como admin</div>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle" 
                  checked={requireOtherAdmin} 
                  onChange={(e) => setRequireOtherAdmin(e.target.checked)} 
                />
              </div>
            </div>
          )}

        </div>

        <button 
          type="submit" 
          disabled={!title.trim() || assignedTo.length === 0}
          className="btn btn-primary btn-lg mt-6 flex-center gap-2"
        >
          <PlusCircle size={20} />
          <span>Crear Tarea</span>
        </button>
      </form>

      {/* List of Existing Tasks to Manage/Delete */}
      <div className="mt-8">
        <div className="section-title mb-3" style={{ fontSize: '1rem' }}>
          <span>Tareas Configuradas ({tasks.length})</span>
        </div>

        {tasks.length === 0 ? (
          <div className="card text-center p-4">
            <div className="text-label-sm">Aún no hay tareas registradas en la familia.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.map(t => (
              <div
                key={t.id}
                className="flex-between card card-flat stagger-item"
                style={{ padding: '12px 14px' }}
              >
                <div className="flex-center gap-3">
                  <span style={{ fontSize: '1.4rem' }}>{t.emoji || t.icon || '📋'}</span>
                  <div>
                    <div className="text-body-bold" style={{ fontSize: '0.9rem' }}>{t.title}</div>
                    <div className="text-label-sm">
                      +{t.xp || t.points || 0} XP · {t.frequency === 'daily' ? 'Diaria' : 'Semanal'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`¿Seguro que deseas eliminar la tarea "${t.title}"?`)) {
                      deleteTask?.(t.id);
                    }
                  }}
                  className="btn btn-icon btn-ghost"
                  style={{ color: 'var(--error)' }}
                  title="Eliminar tarea"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminCreateTask;
