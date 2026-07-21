import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Flame, Trophy, Award, History, ArrowRight } from 'lucide-react';
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
    levels, 
    activityLog, 
    notifications,
    familySettings 
  } = useFamily();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  if (!currentUser) return null;

  // Unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Level progress calculations
  const currentLvlInfo = levels.find(l => l.level === currentUser.level) || levels[0];
  const nextLvlInfo = levels.find(l => l.level === currentUser.level + 1);
  
  const minXp = currentLvlInfo ? currentLvlInfo.xpNeeded : 0;
  const maxXp = nextLvlInfo ? nextLvlInfo.xpNeeded : 1000;
  const currentXpInLevel = currentUser.totalXP - minXp;
  const xpNeededInLevel = maxXp - minXp;
  const progressPercent = Math.min(100, Math.max(0, (currentXpInLevel / xpNeededInLevel) * 100));

  // Chores for today (assigned to this user, max 3)
  const todayTasks = tasks
    .filter(t => t.assignedTo.includes(currentUser.id) && t.status !== 'approved')
    .slice(0, 3);

  // Weekly Leaderboard sorting
  const topMembers = [...members]
    .sort((a, b) => b.weeklyPoints - a.weeklyPoints)
    .slice(0, 3);

  // Relative time helper
  const getRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 3600000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString();
  };

  // Find member profile details by ID
  const getMemberDetails = (id) => {
    return members.find(m => m.id === id) || { name: 'Desconocido', avatar: '?' };
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page" style={{ background: 'var(--surface)' }}>
      {/* Header */}
      <div className="page-header" style={{ paddingBottom: '0px' }}>
        <div>
          <div className="text-label" style={{ fontSize: '13px' }}>👋 ¡Hola, {currentUser.name}!</div>
          <div className="text-section" style={{ fontSize: '22px' }}>
            {familySettings.familyIcon} {familySettings.familyName}
          </div>
        </div>
        <div className="flex-center" style={{ gap: '10px' }}>
          <button 
            onClick={() => setIsNotifOpen(true)} 
            className="btn btn-icon btn-secondary" 
            style={{ position: 'relative', background: 'var(--white)', border: '1.5px solid var(--border-light)' }}
          >
            <Bell size={20} color="var(--primary)" />
            {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
          </button>
          <button 
            onClick={handleLogout} 
            className="btn btn-icon btn-secondary"
            style={{ background: 'var(--white)', border: '1.5px solid var(--border-light)' }}
            title="Cerrar sesión"
          >
            <LogOut size={20} color="var(--error)" />
          </button>
        </div>
      </div>

      {/* Profile Card / Gamification Stats */}
      <div className="section" style={{ marginTop: '16px' }}>
        <div className="card" style={{ background: 'var(--gradient-primary)', color: 'var(--white)', padding: '20px' }}>
          <div className="flex-between">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                className="avatar avatar-lg"
                style={{ 
                  background: 'var(--white)', 
                  color: 'var(--primary)', 
                  border: '3px solid var(--reward)', 
                  fontWeight: 900 
                }}
              >
                {currentUser.avatar}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>Lvl {currentUser.level}</div>
                <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '600' }}>
                  {currentLvlInfo.title}
                </div>
              </div>
            </div>
            
            <div className="flex-center" style={{ gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '100px' }}>
              <Flame size={18} color="var(--reward)" fill="var(--reward)" />
              <span style={{ fontWeight: '800', fontSize: '15px' }}>{currentUser.currentStreak} días</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex-between mb-2" style={{ fontSize: '13px', fontWeight: '700' }}>
              <span>PROGRESO NIVEL</span>
              <span>{currentUser.totalXP} / {maxXp} XP</span>
            </div>
            <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.25)', height: '10px' }}>
              <div className="progress-fill" style={{ width: `${progressPercent}%`, background: 'var(--white)' }}></div>
            </div>
          </div>

          <div className="flex-between mt-4" style={{ background: 'rgba(0,0,0,0.15)', margin: '12px -20px -20px', padding: '12px 20px', borderRadius: '0 0 20px 20px' }}>
            <div className="flex-center" style={{ gap: '6px' }}>
              <span style={{ fontSize: '20px' }}>🪙</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '900' }}>{currentUser.coins}</div>
                <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: '700' }}>MONEDAS DISPONIBLES</div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/profile?tab=shop')} 
              className="btn btn-sm btn-secondary"
              style={{ background: 'var(--white)', color: 'var(--primary)', fontWeight: '800' }}
            >
              Tienda 🛍️
            </button>
          </div>
        </div>
      </div>

      {/* Today Chores */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">
            <Award size={18} color="var(--primary)" />
            <span>Tus tareas pendientes</span>
          </div>
          <button onClick={() => navigate('/tasks')} className="section-link flex-center gap-1">
            Ver todas <ArrowRight size={14} />
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="card text-center" style={{ padding: '24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
            <div style={{ fontWeight: '700', fontSize: '15px' }}>¡Todo limpio por hoy!</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              No tienes tareas asignadas pendientes. ¡Disfruta del día!
            </div>
          </div>
        ) : (
          todayTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>

      {/* Mini-Leaderboard */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">
            <Trophy size={18} color="var(--reward)" />
            <span>Ranking Semanal (Top 3)</span>
          </div>
          <button onClick={() => navigate('/leaderboard')} className="section-link flex-center gap-1">
            Ver podio <ArrowRight size={14} />
          </button>
        </div>

        <div className="card" style={{ padding: '12px' }}>
          {topMembers.map((m, idx) => (
            <div 
              key={m.id} 
              className="flex-between"
              style={{ 
                padding: '10px 12px', 
                borderBottom: idx < topMembers.length - 1 ? '1px solid var(--border-light)' : 'none',
                background: m.id === currentUser.id ? 'var(--primary-bg)' : 'transparent',
                borderRadius: '8px'
              }}
            >
              <div className="flex-center" style={{ gap: '12px' }}>
                <span style={{ fontWeight: '800', fontSize: '15px', width: '20px', color: 'var(--text-secondary)' }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </span>
                <div className={`avatar avatar-sm ${m.role === 'admin' ? 'avatar-admin' : ''}`}>
                  {m.avatar}
                </div>
                <span style={{ fontWeight: '700', fontSize: '14px' }}>{m.name}</span>
              </div>
              <span className="badge badge-reward">
                ★ {m.weeklyPoints} monedas
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="section" style={{ marginBottom: '32px' }}>
        <div className="section-header">
          <div className="section-title">
            <History size={18} color="var(--text-secondary)" />
            <span>Actividad reciente</span>
          </div>
        </div>

        <div className="card card-flat" style={{ padding: '8px 16px', maxHeight: '200px', overflowY: 'auto' }}>
          {activityLog.slice(0, 4).map(log => {
            const member = getMemberDetails(log.memberId);
            return (
              <div 
                key={log.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px', 
                  padding: '10px 0', 
                  borderBottom: '1px solid var(--border-light)'
                }}
              >
                <div className="avatar avatar-sm" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                  {member.avatar}
                </div>
                <div style={{ flex: 1, fontSize: '13px' }}>
                  <span style={{ fontWeight: '700' }}>{member.name} </span>
                  {log.type === 'task_completed' && (
                    <span>ha completado <span style={{ fontWeight: '600' }}>"{log.details}"</span> (+{log.pointsEarned}🪙)</span>
                  )}
                  {log.type === 'level_up' && (
                    <span>ha subido a <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{log.details}</span> 🎉</span>
                  )}
                  {log.type === 'achievement_unlocked' && (
                    <span>ha desbloqueado <span style={{ fontWeight: '600', color: 'var(--reward-dark)' }}>"{log.details}"</span> 🏅</span>
                  )}
                  {log.type === 'reward_claimed' && (
                    <span>ha canjeado <span style={{ fontWeight: '600', color: 'var(--reward-dark)' }}>"{log.details}"</span> (-{Math.abs(log.pointsEarned)}🪙)</span>
                  )}
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    {getRelativeTime(log.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notification Center Modal */}
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};

export default Dashboard;
