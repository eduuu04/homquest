import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, Save, AlertTriangle, Settings as SettingsIcon, TrendingUp, Flame, Award, ShoppingBag, ShieldAlert } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const Settings = () => {
  const navigate = useNavigate();
  const { 
    familySettings = {}, 
    setFamilySettings,
    levels = [], addLevel, deleteLevel,
    streaks = [], addStreak, deleteStreak,
    achievements = [], addAchievement, deleteAchievement,
    rewards = [], addReward, deleteReward,
    currentUser,
    autoLoginEnabled, setAutoLoginEnabled,
    deleteFamily, families = []
  } = useFamily();

  // Settings states
  const [familyName, setFamilyName] = useState(familySettings.familyName || '');
  const [familyIcon, setFamilyIcon] = useState(familySettings.familyIcon || '🏠');
  const [weeklyResetDay, setWeeklyResetDay] = useState(familySettings.weeklyResetDay || 'Monday');
  
  // Danger Zone delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmCode, setDeleteConfirmCode] = useState('');
  const [openSection, setOpenSection] = useState(null);

  // Add Item Temp States
  const [newLvlNo, setNewLvlNo] = useState('');
  const [newLvlXP, setNewLvlXP] = useState('');
  const [newLvlTitle, setNewLvlTitle] = useState('');
  const [newLvlIcon, setNewLvlIcon] = useState('⭐');

  const [newStreakName, setNewStreakName] = useState('');
  const [newStreakDays, setNewStreakDays] = useState('');
  const [newStreakBonus, setNewStreakBonus] = useState('');
  const [newStreakIcon, setNewStreakIcon] = useState('🔥');

  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('');
  const [newRewardDesc, setNewRewardDesc] = useState('');
  const [newRewardIcon, setNewRewardIcon] = useState('🎁');

  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchDesc, setNewAchDesc] = useState('');
  const [newAchCount, setNewAchCount] = useState('');
  const [newAchIcon, setNewAchIcon] = useState('🏅');

  if (!currentUser || currentUser.role !== 'admin') return null;

  const activeFamilyObj = families ? families.find(f => f.id === currentUser?.familyId) : null;
  const currentFamilyCode = activeFamilyObj?.code || familySettings?.familyCode || 'HOM-RVS9';

  const handleDeleteFamily = async () => {
    if (deleteConfirmCode.trim().toUpperCase() !== currentFamilyCode.trim().toUpperCase()) {
      return;
    }
    const res = await deleteFamily?.(currentUser?.familyId);
    if (res && res.success) {
      navigate('/family-setup', { replace: true });
    }
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    if (setFamilySettings) {
      setFamilySettings({
        ...familySettings,
        familyName,
        familyIcon,
        weeklyResetDay
      });
      alert('¡Configuración general guardada!');
    }
  };

  const handleAddLevel = () => {
    if (!newLvlNo || !newLvlXP || !newLvlTitle) return;
    addLevel?.({
      level: Number(newLvlNo),
      xpNeeded: Number(newLvlXP),
      title: newLvlTitle,
      icon: newLvlIcon
    });
    setNewLvlNo('');
    setNewLvlXP('');
    setNewLvlTitle('');
  };

  const handleAddStreak = () => {
    if (!newStreakName || !newStreakDays || !newStreakBonus) return;
    addStreak?.({
      name: newStreakName,
      type: 'custom',
      threshold: Number(newStreakDays),
      bonusPercent: Number(newStreakBonus),
      icon: newStreakIcon,
      description: `Completa tareas durante ${newStreakDays} días`
    });
    setNewStreakName('');
    setNewStreakDays('');
    setNewStreakBonus('');
  };

  const handleAddReward = () => {
    if (!newRewardTitle || !newRewardCost) return;
    addReward?.({
      title: newRewardTitle,
      description: newRewardDesc,
      cost: Number(newRewardCost),
      icon: newRewardIcon
    });
    setNewRewardTitle('');
    setNewRewardCost('');
    setNewRewardDesc('');
  };

  const handleAddAchievement = () => {
    if (!newAchTitle || !newAchCount) return;
    addAchievement?.({
      title: newAchTitle,
      description: newAchDesc,
      icon: newAchIcon,
      category: 'Personalizado',
      countNeeded: Number(newAchCount),
      type: 'tasks'
    });
    setNewAchTitle('');
    setNewAchDesc('');
    setNewAchCount('');
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="page pb-tab">
      
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate('/admin')} className="btn btn-icon btn-ghost">
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-title" style={{ flex: 1 }}>Configuración Familiar</h1>
      </div>

      {/* General Settings Card */}
      <div className="card mb-6 animate-in" style={{ border: '1px solid var(--border-light)' }}>
        <h3 className="text-body-bold mb-4" style={{ fontSize: '1.05rem' }}>Ajustes del Hogar</h3>
        <form onSubmit={handleSaveGeneral}>
          
          <div className="input-group">
            <label className="input-label">Nombre de la familia</label>
            <input 
              type="text"
              className="input-field"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Icono emblema (Emoji)</label>
            <input 
              type="text"
              className="input-field"
              value={familyIcon}
              onChange={(e) => setFamilyIcon(e.target.value)}
              maxLength={2}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Día de reinicio semanal</label>
            <select 
              value={weeklyResetDay}
              onChange={(e) => setWeeklyResetDay(e.target.value)}
              className="input-field"
            >
              <option value="Monday">Lunes</option>
              <option value="Saturday">Sábado</option>
              <option value="Sunday">Domingo</option>
            </select>
          </div>

          <div className="input-group card card-flat mb-4" style={{ padding: '12px 14px', background: 'var(--primary-bg)' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', width: '100%' }}>
              <div>
                <div className="text-body-bold" style={{ fontSize: '0.9rem' }}>Inicio de Sesión Automático</div>
                <div className="text-label-sm">Mantiene la cuenta activa en este dispositivo</div>
              </div>
              <input 
                type="checkbox"
                checked={autoLoginEnabled}
                onChange={(e) => setAutoLoginEnabled?.(e.target.checked)}
                className="toggle"
              />
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-full flex-center gap-2">
            <Save size={18} />
            <span>Guardar Ajustes</span>
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="section-title" style={{ fontSize: '1rem' }}>
          <span>Personalizar Sistema de Gamificación</span>
        </div>

        {/* 1. LEVELS CUSTOMIZER */}
        <div className="card card-flat" style={{ padding: 'var(--sp-4)' }}>
          <button 
            type="button"
            onClick={() => toggleSection('levels')}
            className="flex-between w-full"
            style={{ fontWeight: 700, fontSize: '0.95rem' }}
          >
            <div className="flex-center gap-2">
              <TrendingUp size={18} color="var(--primary)" />
              <span>Niveles ({levels.length})</span>
            </div>
            {openSection === 'levels' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {openSection === 'levels' && (
            <div className="mt-4 animate-in">
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {levels.map(l => (
                  <div key={l.level} className="flex-between card card-flat" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                    <span>{l.icon || '⭐'} Lvl {l.level}: {l.title} ({l.xpNeeded} XP)</span>
                    <button 
                      type="button" 
                      onClick={() => deleteLevel?.(l.level)} 
                      style={{ color: 'var(--error)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div style={{ height: '1px', background: 'var(--border-light)', margin: '12px 0' }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                  <input type="number" placeholder="Lvl" className="input-field" value={newLvlNo} onChange={(e) => setNewLvlNo(e.target.value)} />
                  <input type="text" placeholder="Título nivel" className="input-field" value={newLvlTitle} onChange={(e) => setNewLvlTitle(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" placeholder="XP Necesaria" className="input-field" value={newLvlXP} onChange={(e) => setNewLvlXP(e.target.value)} />
                  <input type="text" placeholder="Icono Emoji" className="input-field" value={newLvlIcon} onChange={(e) => setNewLvlIcon(e.target.value)} />
                </div>
                <button type="button" onClick={handleAddLevel} className="btn btn-secondary btn-sm flex-center gap-1">
                  <Plus size={14} /> Añadir Nivel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. REWARDS CUSTOMIZER */}
        <div className="card card-flat" style={{ padding: 'var(--sp-4)' }}>
          <button 
            type="button"
            onClick={() => toggleSection('rewards')}
            className="flex-between w-full"
            style={{ fontWeight: 700, fontSize: '0.95rem' }}
          >
            <div className="flex-center gap-2">
              <ShoppingBag size={18} color="var(--reward-dark)" />
              <span>Tienda de Recompensas ({rewards.length})</span>
            </div>
            {openSection === 'rewards' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSection === 'rewards' && (
            <div className="mt-4 animate-in">
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {rewards.map(r => (
                  <div key={r.id} className="flex-between card card-flat" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                    <span>{r.icon || '🎁'} {r.title} ({r.cost} XP)</span>
                    <button type="button" onClick={() => deleteReward?.(r.id)} style={{ color: 'var(--error)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ height: '1px', background: 'var(--border-light)', margin: '12px 0' }}></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input type="text" placeholder="Nombre recompensa" className="input-field" value={newRewardTitle} onChange={(e) => setNewRewardTitle(e.target.value)} />
                <input type="text" placeholder="Descripción corta" className="input-field" value={newRewardDesc} onChange={(e) => setNewRewardDesc(e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" placeholder="Coste en monedas" className="input-field" value={newRewardCost} onChange={(e) => setNewRewardCost(e.target.value)} />
                  <input type="text" placeholder="Icono Emoji" className="input-field" value={newRewardIcon} onChange={(e) => setNewRewardIcon(e.target.value)} />
                </div>
                <button type="button" onClick={handleAddReward} className="btn btn-secondary btn-sm flex-center gap-1">
                  <Plus size={14} /> Añadir Recompensa
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. DANGER ZONE: DELETE FAMILY */}
        <div 
          className="card mt-6" 
          style={{ 
            padding: 'var(--sp-6)', 
            border: '1.5px solid var(--error)', 
            background: 'var(--error-light)'
          }}
        >
          <div className="flex-center gap-2 mb-2" style={{ justifyContent: 'flex-start', color: 'var(--error-dark)' }}>
            <AlertTriangle size={20} />
            <h3 className="text-body-bold" style={{ fontSize: '1rem', color: 'var(--error-dark)' }}>Zona de Peligro</h3>
          </div>
          
          <p className="text-label-sm mb-4" style={{ color: 'var(--fg-secondary)' }}>
            Eliminar permanentemente la familia <strong>"{familyName}"</strong> ({currentFamilyCode}) y todos sus miembros y datos. Esta acción no se puede deshacer.
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              className="btn btn-danger w-full flex-center gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={18} />
              <span>Borrar Familia por Completo</span>
            </button>
          ) : (
            <div className="card card-flat animate-in" style={{ padding: 'var(--sp-4)', background: 'var(--bg-card)' }}>
              <label className="input-label" style={{ color: 'var(--error-dark)' }}>
                Escribe el código de tu familia (<strong>{currentFamilyCode}</strong>) para confirmar:
              </label>
              <input
                type="text"
                className="input-field text-center mt-2"
                placeholder={currentFamilyCode}
                value={deleteConfirmCode}
                onChange={(e) => setDeleteConfirmCode(e.target.value)}
                style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '14px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmCode('');
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  disabled={deleteConfirmCode.trim().toUpperCase() !== currentFamilyCode.trim().toUpperCase()}
                  onClick={handleDeleteFamily}
                >
                  Sí, Borrar Todo
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Settings;
