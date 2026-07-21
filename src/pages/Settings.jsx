import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const Settings = () => {
  const navigate = useNavigate();
  const { 
    familySettings, 
    setFamilySettings,
    levels, addLevel, deleteLevel,
    streaks, addStreak, deleteStreak,
    achievements, addAchievement, deleteAchievement,
    rewards, addReward, deleteReward,
    currentUser
  } = useFamily();

  // Settings states
  const [familyName, setFamilyName] = useState(familySettings.familyName);
  const [familyIcon, setFamilyIcon] = useState(familySettings.familyIcon);
  const [weeklyResetDay, setWeeklyResetDay] = useState(familySettings.weeklyResetDay);
  
  // Collapsible sections
  const [openSection, setOpenSection] = useState(null); // levels, streaks, achievements, rewards, null

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

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    setFamilySettings({
      ...familySettings,
      familyName,
      familyIcon,
      weeklyResetDay
    });
    alert('¡Configuración general guardada!');
  };

  const handleAddLevel = () => {
    if (!newLvlNo || !newLvlXP || !newLvlTitle) return;
    addLevel({
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
    addStreak({
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
    addReward({
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
    addAchievement({
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
    <div className="page" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div className="page-header" style={{ paddingLeft: '0' }}>
        <button onClick={() => navigate('/admin')} className="btn btn-icon btn-ghost">
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ flex: 1, marginLeft: '12px' }}>Ajustes Generales</h1>
      </div>

      {/* General Settings Card */}
      <div className="card mb-6" style={{ border: '1.5px solid var(--border-light)', transform: 'none' }}>
        <h3 className="text-body-bold" style={{ marginBottom: '16px' }}>Nombre e Icono de Familia</h3>
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
            <label className="input-label">Icono de la familia (Emoji)</label>
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

          <button type="submit" className="btn btn-primary w-full flex-center gap-2">
            <Save size={16} /> Guardar Ajustes
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="text-label" style={{ fontWeight: 'bold' }}>Personalizar Gamificación</div>

        {/* 1. LEVELS CUSTOMIZER */}
        <div className="card" style={{ padding: '16px', transform: 'none', border: '1.5px solid var(--border-light)' }}>
          <button 
            type="button"
            onClick={() => toggleSection('levels')}
            className="flex-between"
            style={{ width: '100%', fontWeight: '800', fontSize: '15px' }}
          >
            <span>📈 Gestionar Niveles ({levels.length})</span>
            {openSection === 'levels' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {openSection === 'levels' && (
            <div className="mt-4 animate-in">
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {levels.map(l => (
                  <div key={l.level} className="flex-between" style={{ background: 'var(--surface)', padding: '8px 12px', borderRadius: '10px', fontSize: '13px' }}>
                    <span>{l.icon} Lvl {l.level}: {l.title} ({l.xpNeeded} XP)</span>
                    <button 
                      type="button" 
                      onClick={() => deleteLevel(l.level)} 
                      style={{ color: 'var(--error)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="divider"></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                  <input type="number" placeholder="Lvl" className="input-field" style={{ padding: '6px' }} value={newLvlNo} onChange={(e) => setNewLvlNo(e.target.value)} />
                  <input type="text" placeholder="Título nivel" className="input-field" style={{ padding: '6px' }} value={newLvlTitle} onChange={(e) => setNewLvlTitle(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" placeholder="XP Necesaria" className="input-field" style={{ padding: '6px' }} value={newLvlXP} onChange={(e) => setNewLvlXP(e.target.value)} />
                  <input type="text" placeholder="Emoji" className="input-field" style={{ padding: '6px' }} value={newLvlIcon} onChange={(e) => setNewLvlIcon(e.target.value)} />
                </div>
                <button type="button" onClick={handleAddLevel} className="btn btn-secondary btn-sm flex-center gap-1">
                  <Plus size={14} /> Añadir Nivel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. STREAKS CUSTOMIZER */}
        <div className="card" style={{ padding: '16px', transform: 'none', border: '1.5px solid var(--border-light)' }}>
          <button 
            type="button"
            onClick={() => toggleSection('streaks')}
            className="flex-between"
            style={{ width: '100%', fontWeight: '800', fontSize: '15px' }}
          >
            <span>🔥 Gestionar Rachas ({streaks.length})</span>
            {openSection === 'streaks' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSection === 'streaks' && (
            <div className="mt-4 animate-in">
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {streaks.map(s => (
                  <div key={s.id} className="flex-between" style={{ background: 'var(--surface)', padding: '8px 12px', borderRadius: '10px', fontSize: '13px' }}>
                    <span>{s.icon} {s.name}: {s.threshold} días (+{s.bonusPercent}%)</span>
                    <button type="button" onClick={() => deleteStreak(s.id)} style={{ color: 'var(--error)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="divider"></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input type="text" placeholder="Nombre racha" className="input-field" style={{ padding: '6px' }} value={newStreakName} onChange={(e) => setNewStreakName(e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <input type="number" placeholder="Días" className="input-field" style={{ padding: '6px' }} value={newStreakDays} onChange={(e) => setNewStreakDays(e.target.value)} />
                  <input type="number" placeholder="Bonus %" className="input-field" style={{ padding: '6px' }} value={newStreakBonus} onChange={(e) => setNewStreakBonus(e.target.value)} />
                  <input type="text" placeholder="Emoji" className="input-field" style={{ padding: '6px' }} value={newStreakIcon} onChange={(e) => setNewStreakIcon(e.target.value)} />
                </div>
                <button type="button" onClick={handleAddStreak} className="btn btn-secondary btn-sm flex-center gap-1">
                  <Plus size={14} /> Añadir Racha
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. ACHIEVEMENTS CUSTOMIZER */}
        <div className="card" style={{ padding: '16px', transform: 'none', border: '1.5px solid var(--border-light)' }}>
          <button 
            type="button"
            onClick={() => toggleSection('achievements')}
            className="flex-between"
            style={{ width: '100%', fontWeight: '800', fontSize: '15px' }}
          >
            <span>🏅 Gestionar Logros ({achievements.length})</span>
            {openSection === 'achievements' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSection === 'achievements' && (
            <div className="mt-4 animate-in">
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {achievements.map(a => (
                  <div key={a.id} className="flex-between" style={{ background: 'var(--surface)', padding: '8px 12px', borderRadius: '10px', fontSize: '13px' }}>
                    <span>{a.icon} {a.title} ({a.countNeeded} tareas)</span>
                    <button type="button" onClick={() => deleteAchievement(a.id)} style={{ color: 'var(--error)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="divider"></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input type="text" placeholder="Título del logro" className="input-field" style={{ padding: '6px' }} value={newAchTitle} onChange={(e) => setNewAchTitle(e.target.value)} />
                <input type="text" placeholder="Descripción corta" className="input-field" style={{ padding: '6px' }} value={newAchDesc} onChange={(e) => setNewAchDesc(e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" placeholder="Tareas nec." className="input-field" style={{ padding: '6px' }} value={newAchCount} onChange={(e) => setNewAchCount(e.target.value)} />
                  <input type="text" placeholder="Emoji" className="input-field" style={{ padding: '6px' }} value={newAchIcon} onChange={(e) => setNewAchIcon(e.target.value)} />
                </div>
                <button type="button" onClick={handleAddAchievement} className="btn btn-secondary btn-sm flex-center gap-1">
                  <Plus size={14} /> Añadir Logro
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. REWARDS SHOP CUSTOMIZER */}
        <div className="card" style={{ padding: '16px', transform: 'none', border: '1.5px solid var(--border-light)', marginBottom: '32px' }}>
          <button 
            type="button"
            onClick={() => toggleSection('rewards')}
            className="flex-between"
            style={{ width: '100%', fontWeight: '800', fontSize: '15px' }}
          >
            <span>🛍️ Recompensas Tienda ({rewards.length})</span>
            {openSection === 'rewards' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSection === 'rewards' && (
            <div className="mt-4 animate-in">
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {rewards.map(r => (
                  <div key={r.id} className="flex-between" style={{ background: 'var(--surface)', padding: '8px 12px', borderRadius: '10px', fontSize: '13px' }}>
                    <span>{r.icon} {r.title} ({r.cost} 🪙)</span>
                    <button type="button" onClick={() => deleteReward(r.id)} style={{ color: 'var(--error)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="divider"></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input type="text" placeholder="Nombre recompensa" className="input-field" style={{ padding: '6px' }} value={newRewardTitle} onChange={(e) => setNewRewardTitle(e.target.value)} />
                <input type="text" placeholder="Descripción corta" className="input-field" style={{ padding: '6px' }} value={newRewardDesc} onChange={(e) => setNewRewardDesc(e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" placeholder="Coste en monedas" className="input-field" style={{ padding: '6px' }} value={newRewardCost} onChange={(e) => setNewRewardCost(e.target.value)} />
                  <input type="text" placeholder="Emoji" className="input-field" style={{ padding: '6px' }} value={newRewardIcon} onChange={(e) => setNewRewardIcon(e.target.value)} />
                </div>
                <button type="button" onClick={handleAddReward} className="btn btn-secondary btn-sm flex-center gap-1">
                  <Plus size={14} /> Añadir Recompensa
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
