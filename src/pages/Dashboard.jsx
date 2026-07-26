import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Flame, Trophy, Award, History, ArrowRight, Coins, Sparkles, Medal, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import NotificationCenter from '../components/NotificationCenter';
import TaskCard from '../components/TaskCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    logout, 
    tasks, 
    members, 
    levels = [], 
    activityLog = [], 
    notifications = [],
    familySettings = {} 
  } = useFamily();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  });

  if (!currentUser) return null;

  const unreadCount = notifications?.filter(n => !n.read)?.length || 0;

  // Level progress calculations
  const currentLevel = currentUser.level || 1;
  const currentLvlInfo = levels.find(l => l.level === currentLevel) || { level: currentLevel, title: 'Explorador', xpNeeded: 0 };
  const nextLvlInfo = levels.find(l => l.level === currentLevel + 1) || { xpNeeded: (currentLevel * 1000) };
  
  const minXp = currentLvlInfo.xpNeeded || 0;
  const maxXp = nextLvlInfo.xpNeeded || 1000;
  const currentXp = currentUser.totalXP || currentUser.xp || 0;
  const currentXpInLevel = Math.max(0, currentXp - minXp);
  const xpNeededInLevel = Math.max(100, maxXp - minXp);
  const progressPercent = Math.min(100, Math.max(0, (currentXpInLevel / xpNeededInLevel) * 100));

  // User's pending tasks (max 3)
  const todayTasks = tasks
    ?.filter(t => {
      if (Array.isArray(t.assignedTo)) {
        return t.assignedTo.some(a => (typeof a === 'object' ? a.memberId === currentUser.id : a === currentUser.id)) && t.status !== 'approved' && t.status !== 'completed';
      }
      return false;
    })
    .slice(0, 3) || [];

  // Weekly Leaderboard sorting
  const topMembers = [...(members || [])]
    .sort((a, b) => (b.weeklyPoints || b.xp || 0) - (a.weeklyPoints || a.xp || 0))
    .slice(0, 3);

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'Reciente';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const getMemberDetails = (id) => {
    return members?.find(m => m.id === id) || { name: 'Miembro', avatar: '?' };
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page pb-tab">
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="text-label" style={{ fontSize: '0.85rem' }}>
            {greeting}, {currentUser.name?.split(' ')[0]} 👋
          </div>
          <div className="page-title mt-1">
            <span>{familySettings.familyIcon || '🏠'}</span>
            <span>{familySettings.familyName || 'Mi Familia'}</span>
          </div>
        </div>

        <div className="flex-center gap-2">
          <button 
            onClick={() => setIsNotifOpen(true)} 
            className="btn btn-icon btn-ghost" 
            style={{ position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
            aria-label="Notificaciones"
          >
            <Bell size={20} color="var(--primary)" />
            {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
          </button>
          <button 
            onClick={handleLogout} 
            className="btn btn-icon btn-ghost"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
            title="Cerrar sesión"
          >
            <LogOut size={20} color="var(--error)" />
          </button>
        </div>
      </div>

      {/* Hero Level & Profile Card */}
      <div className="section">
        <div className="card" style={{ background: 'var(--gradient-primary)', color: 'oklch(0.99 0 0)', padding: 'var(--sp-6)' }}>
          
          <div className="flex-between">
            <div className="flex-center gap-3">
              <div 
                className="avatar avatar-lg"
                style={{ 
                  background: 'oklch(0.99 0 0)', 
                  color: 'var(--primary)', 
                  border: '3px solid var(--reward)', 
                  fontWeight: 800 
                }}
              >
                {currentUser.avatar || currentUser.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="text-display" style={{ fontSize: '1.25rem', color: 'oklch(0.99 0 0)' }}>
                  Nivel {currentLevel}
                </div>
                <div className="text-label" style={{ color: 'oklch(0.95 0.02 285)', fontSize: '0.85rem' }}>
                  {currentLvlInfo.title}
                </div>
              </div>
            </div>
            
            <div className="flex-center gap-1" style={{ background: 'oklch(1 0 0 / 0.18)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)' }}>
              <Flame size={18} color="var(--reward)" fill="var(--reward)" />
              <span className="text-body-bold" style={{ fontSize: '0.9rem', color: 'oklch(0.99 0 0)' }}>
                {currentUser.currentStreak || currentUser.streak || 0} días
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex-between mb-2" style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.9 }}>
              <span>PROGRESO DE NIVEL</span>
              <span>{currentXp} / {maxXp} XP</span>
            </div>
            <div className="progress-bar" style={{ background: 'oklch(1 0 0 / 0.25)', height: '10px' }}>
              <div className="progress-fill" style={{ width: `${progressPercent}%`, background: 'oklch(0.99 0 0)' }}></div>
            </div>
          </div>

          <div className="flex-between mt-4" style={{ background: 'oklch(0 0 0 / 0.12)', margin: 'var(--sp-4) calc(var(--sp-6) * -1) calc(var(--sp-6) * -1)', padding: '0.75rem var(--sp-6)', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
            <div className="flex-center gap-2">
              <Coins size={20} color="var(--reward)" />
              <div>
                <div className="text-number" style={{ fontSize: '1rem', color: 'oklch(0.99 0 0)' }}>
                  {currentUser.coins || 0}
                </div>
                <div className="text-label-sm" style={{ fontSize: '0.7rem', color: 'oklch(0.92 0.02 285)' }}>
                  MONEDAS ACUMULADAS
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/profile')} 
              className="btn btn-sm btn-secondary flex-center gap-1"
              style={{ background: 'oklch(0.99 0 0)', color: 'var(--primary-dark)', fontWeight: 700 }}
            >
              <ShoppingBag size={14} />
              <span>Tienda</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Dashboard Layout (Grid on wide screens) */}
      <div className="dashboard-grid">
        
        {/* Left Column: Today Tasks */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">
              <Award size={20} color="var(--primary)" />
              <span>Tus tareas pendientes</span>
            </div>
            <button onClick={() => navigate('/tasks')} className="section-link">
              <span>Ver todas</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <CheckCircle2 size={28} color="var(--success)" />
              </div>
              <div className="empty-state-title">¡Todo limpio por hoy!</div>
              <div className="empty-state-text">No tienes tareas pendientes asignadas. ¡Buen trabajo!</div>
            </div>
          ) : (
            todayTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </div>

        {/* Right Column: Leaderboard & Activity */}
        <div>
          {/* Mini Leaderboard */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">
                <Trophy size={20} color="var(--reward-dark)" />
                <span>Ranking Semanal</span>
              </div>
              <button onClick={() => navigate('/leaderboard')} className="section-link">
                <span>Ver ranking completo</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="card" style={{ padding: 'var(--sp-3)' }}>
              {topMembers.map((m, idx) => (
                <div 
                  key={m.id} 
                  className="flex-between stagger-item"
                  style={{ 
                    padding: '10px 12px', 
                    borderBottom: idx < topMembers.length - 1 ? '1px solid var(--border-light)' : 'none',
                    background: m.id === currentUser.id ? 'var(--primary-bg)' : 'transparent',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div className="flex-center gap-3">
                    <div className="flex-center" style={{ width: '22px' }}>
                      {idx === 0 ? <Medal size={18} color="var(--reward-dark)" /> : 
                       idx === 1 ? <Medal size={18} color="oklch(0.6 0.02 285)" /> : 
                       <Medal size={18} color="oklch(0.65 0.1 50)" />}
                    </div>

                    <div className={`avatar avatar-sm ${m.role === 'admin' ? 'avatar-admin' : ''}`}>
                      {m.avatar || m.name?.[0]?.toUpperCase() || '?'}
                    </div>

                    <div className="text-body-bold" style={{ fontSize: '0.9rem' }}>
                      {m.name} {m.id === currentUser.id && '(Tú)'}
                    </div>
                  </div>

                  <div className="badge badge-reward flex-center gap-1">
                    <Coins size={12} />
                    <span>{m.weeklyPoints || m.xp || 0} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">
                <History size={20} color="var(--fg-secondary)" />
                <span>Actividad reciente</span>
              </div>
            </div>

            <div className="card card-flat" style={{ padding: 'var(--sp-3) var(--sp-4)', maxHeight: '240px', overflowY: 'auto' }}>
              {activityLog.length === 0 ? (
                <div className="text-center text-label p-4" style={{ color: 'var(--fg-tertiary)' }}>
                  Aún no hay registros recientes.
                </div>
              ) : (
                activityLog.slice(0, 4).map((log, idx) => {
                  const member = getMemberDetails(log.memberId);
                  return (
                    <div 
                      key={log.id || idx}
                      className="stagger-item"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '12px', 
                        padding: '10px 0', 
                        borderBottom: idx < 3 ? '1px solid var(--border-light)' : 'none'
                      }}
                    >
                      <div className="avatar avatar-sm" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                        {member.avatar || member.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1, fontSize: '0.85rem' }}>
                        <span className="text-body-bold">{member.name} </span>
                        {log.type === 'task_completed' && (
                          <span>completó <span className="text-body-bold">"{log.details}"</span></span>
                        )}
                        {log.type === 'level_up' && (
                          <span>alcanzó el nivel <span className="text-body-bold" style={{ color: 'var(--primary)' }}>{log.details}</span></span>
                        )}
                        {log.type === 'achievement_unlocked' && (
                          <span>desbloqueó un logro: <span className="text-body-bold">{log.details}</span></span>
                        )}
                        {log.type === 'reward_claimed' && (
                          <span>canjeó una recompensa: <span className="text-body-bold">{log.details}</span></span>
                        )}
                        <div className="text-label-sm mt-1" style={{ fontSize: '0.72rem' }}>
                          {getRelativeTime(log.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Notification Center Modal */}
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};

export default Dashboard;
