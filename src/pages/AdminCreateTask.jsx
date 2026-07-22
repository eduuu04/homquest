import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Sparkles, BookOpen, Trash2 } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { PREDEFINED_TASKS } from '../utils/constants';

const AdminCreateTask = () => {
  const navigate = useNavigate();
  const { addTask, deleteTask, tasks, members, currentUser } = useFamily();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🧹');
  const [difficulty, setDifficulty] = useState('medium');
  const [points, setPoints] = useState(40); // default for medium
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

  // Predefined catalog toggle
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const handleToggleCustomDay = (day) => {
    if (customDays.includes(day)) {
      setCustomDays(prev => prev.filter(d => d !== day));
    } else {
      setCustomDays(prev => [...prev, day]);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  // Auto points setting based on difficulty
  const handleDifficultyChange = (diff) => {
    setDifficulty(diff);
    // Suggest default points
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
    setIcon(predefined.icon);
    setDifficulty(predefined.difficulty);
    setPoints(predefined.points);
    setFrequency(predefined.frequency);
    setIsCatalogOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || assignedTo.length === 0) return;

    addTask({
      title,
      description,
      icon,
      difficulty,
      points,
      frequency,
      assignedTo,
      requiresPhoto,
      requireOtherAdmin,
      isRotative,
      customDays: frequency === 'custom' ? customDays : [],
      timeLimit,
      bonusPoints
    });

    navigate('/admin');
  };

  const emojis = ['🧹', '🛏️', '🍽️', '🧽', '🚿', '✨', '☕', '🍳', '🍲', '👕', '👔', '🧺', '📦', '🗑️', '🐕', '🌱', '🛒', '🔧', '🐱', '🚗', '📚'];

  return (
    <div className="page" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div className="page-header" style={{ paddingLeft: '0' }}>
        <button onClick={() => navigate('/admin')} className="btn btn-icon btn-ghost">
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ flex: 1, marginLeft: '12px' }}>Nueva Tarea</h1>
      </div>

      {/* Catalog Button */}
      <button 
        type="button"
        onClick={() => setIsCatalogOpen(!isCatalogOpen)}
        className="btn btn-secondary w-full mb-4 flex-center gap-2"
        style={{ border: '1.5px solid var(--border)', background: 'var(--white)', padding: '12px' }}
      >
        <BookOpen size={18} color="var(--primary)" />
        <span>Predefinidas / Catálogo</span>
        {isCatalogOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Catalog collapsible */}
      {isCatalogOpen && (
        <div className="card card-flat mb-4 animate-in" style={{ padding: '12px', maxHeight: '250px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PREDEFINED_TASKS.map(pt => (
              <div 
                key={pt.id}
                onClick={() => handleApplyPredefined(pt)}
                className="flex-between"
                style={{ 
                  padding: '8px 12px', 
                  background: 'var(--surface)', 
                  borderRadius: '10px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <div className="flex-center" style={{ gap: '8px' }}>
                  <span>{pt.icon}</span>
                  <span>{pt.title}</span>
                </div>
                <span className="badge badge-reward" style={{ fontSize: '11px' }}>★ {pt.points} 🪙</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ border: '1.5px solid var(--border-light)', transform: 'none' }}>
          {/* Quick Creation Fields */}
          <div className="input-group">
            <label className="input-label">Nombre de la tarea</label>
            <input 
              type="text"
              className="input-field"
              placeholder="Ej: Aspirar el salón..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Icono / Emoji</label>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
              {emojis.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className="flex-center"
                  style={{ 
                    fontSize: '24px', 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '8px',
                    border: icon === em ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: icon === em ? 'var(--primary-bg)' : 'transparent',
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
                  className={`btn btn-sm ${difficulty === diff ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '11px', padding: '10px 0px' }}
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
              <option value="custom">Días específicos</option>
            </select>
          </div>

          {frequency === 'custom' && (
            <div className="input-group animate-in">
              <label className="input-label">Selecciona los días</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => {
                  const isSelected = customDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleCustomDay(day)}
                      className="chip"
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '13px',
                        background: isSelected ? 'var(--primary)' : 'var(--white)',
                        color: isSelected ? 'var(--white)' : 'var(--text-secondary)',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)'
                      }}
                    >
                      {day.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Asignar a (Selecciona al menos uno)</label>
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
                      padding: '8px 12px', 
                      borderRadius: '12px', 
                      border: isSelected ? '2px solid var(--primary)' : '1.5px solid var(--border-light)',
                      background: isSelected ? 'var(--primary-bg)' : 'var(--white)'
                    }}
                  >
                    <div className="avatar avatar-sm">{member.avatar}</div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{member.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Section Divider */}
          <div className="divider"></div>

          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex-center gap-2"
            style={{ width: '100%', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: '14px' }}
          >
            <span>⚙️ Opciones avanzadas</span>
            {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isAdvancedOpen && (
            <div className="mt-4 animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Descripción</label>
                <textarea 
                  className="input-field"
                  placeholder="Detalles sobre cómo realizar la tarea..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Monedas específicas (Override)</label>
                <input 
                  type="number"
                  className="input-field"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                />
              </div>

              <div className="flex-between">
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>Requiere foto de verificación</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>El miembro debe subir prueba fotográfica</div>
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
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>Verificación cruzada (Otro Admin)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Impide que tú mismo te apruebes la tarea</div>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle" 
                  checked={requireOtherAdmin} 
                  onChange={(e) => setRequireOtherAdmin(e.target.checked)} 
                />
              </div>

              <div className="flex-between">
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>Asignación rotativa</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Rota el miembro asignado automáticamente</div>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle" 
                  checked={isRotative} 
                  onChange={(e) => setIsRotative(e.target.checked)} 
                />
              </div>

              <div className="divider"></div>

              <div className="input-group">
                <label className="input-label">Hora Límite (Opcional)</label>
                <input 
                  type="time" 
                  className="input-field"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                />
              </div>

              {timeLimit && (
                <div className="input-group animate-in">
                  <label className="input-label">Monedas de Bonus por puntualidad (Opcional)</label>
                  <input 
                    type="number" 
                    className="input-field"
                    placeholder="Ej: 10"
                    value={bonusPoints}
                    onChange={(e) => setBonusPoints(Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={!title.trim() || assignedTo.length === 0}
          className="btn btn-primary btn-lg mt-6"
        >
          Crear Tarea
        </button>
      </form>

      {/* Existing Tasks Management / Deletion List */}
      <div className="mt-8 mb-6">
        <div className="text-label mb-3" style={{ fontWeight: 'bold' }}>Tareas en el Hogar ({tasks.length})</div>

        {tasks.length === 0 ? (
          <div className="card text-center" style={{ padding: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No hay tareas creadas en el hogar.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.map(t => (
              <div
                key={t.id}
                className="flex-between card card-flat"
                style={{ padding: '12px 16px', border: '1.5px solid var(--border-light)' }}
              >
                <div className="flex-center gap-3">
                  <span style={{ fontSize: '24px' }}>{t.icon}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{t.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      ★ {t.points} pts · {t.frequency === 'daily' ? 'Diaria' : 'Semanal'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`¿Seguro que deseas eliminar la tarea "${t.title}"?`)) {
                      deleteTask(t.id);
                    }
                  }}
                  className="btn btn-icon btn-ghost"
                  style={{ color: 'var(--error)' }}
                  title="Borrar tarea"
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
