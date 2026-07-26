import React, { useState } from 'react';
import { Trophy, Crown, Medal, Coins, Star } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const Leaderboard = () => {
  const { members = [], currentUser } = useFamily();
  const [period, setPeriod] = useState('weekly'); // weekly, monthly, allTime

  if (!currentUser) return null;

  const getSortedMembers = () => {
    return [...members].sort((a, b) => {
      if (period === 'weekly') return (b.weeklyPoints || b.xp || 0) - (a.weeklyPoints || a.xp || 0);
      if (period === 'monthly') return (b.monthlyPoints || b.xp || 0) - (a.monthlyPoints || a.xp || 0);
      return (b.totalXP || b.xp || 0) - (a.totalXP || a.xp || 0);
    });
  };

  const sortedList = getSortedMembers();
  
  const first = sortedList[0];
  const second = sortedList[1];
  const third = sortedList[2];
  const remainder = sortedList.slice(3);

  const getPointsLabel = (member) => {
    if (period === 'weekly') return `${member.weeklyPoints || member.xp || 0} XP`;
    if (period === 'monthly') return `${member.monthlyPoints || member.xp || 0} XP`;
    return `${member.totalXP || member.xp || 0} XP`;
  };

  return (
    <div className="page pb-tab">
      
      <div className="page-header">
        <h1 className="page-title">
          <Trophy size={26} color="var(--reward-dark)" />
          <span>Ranking Familiar</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="chip-group mt-2">
        <button 
          onClick={() => setPeriod('weekly')} 
          className={`chip ${period === 'weekly' ? 'active' : ''}`}
        >
          Semanal
        </button>
        <button 
          onClick={() => setPeriod('monthly')} 
          className={`chip ${period === 'monthly' ? 'active' : ''}`}
        >
          Mensual
        </button>
        <button 
          onClick={() => setPeriod('allTime')} 
          className={`chip ${period === 'allTime' ? 'active' : ''}`}
        >
          Histórico Total
        </button>
      </div>

      {/* Visual Podium View */}
      {sortedList.length > 0 && (
        <div className="podium mt-6 animate-in">
          {/* 2nd Place */}
          {second && (
            <div className="podium-item podium-2nd">
              <div className="avatar avatar-md">{second.avatar || second.name?.[0]?.toUpperCase()}</div>
              <div className="podium-name">{second.name}</div>
              <div className="podium-points">{getPointsLabel(second)}</div>
              <div className="podium-bar">
                <span className="podium-rank">2</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {first && (
            <div className="podium-item podium-1st" style={{ transform: 'translateY(-12px)' }}>
              <div style={{ position: 'relative' }}>
                <div className="avatar avatar-lg avatar-admin">{first.avatar || first.name?.[0]?.toUpperCase()}</div>
                <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)' }}>
                  <Crown size={22} color="var(--reward-dark)" fill="var(--reward)" />
                </div>
              </div>
              <div className="podium-name" style={{ fontWeight: 700 }}>{first.name}</div>
              <div className="podium-points" style={{ fontWeight: 800, color: 'var(--reward-dark)' }}>{getPointsLabel(first)}</div>
              <div className="podium-bar">
                <span className="podium-rank">1</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="podium-item podium-3rd">
              <div className="avatar avatar-md">{third.avatar || third.name?.[0]?.toUpperCase()}</div>
              <div className="podium-name">{third.name}</div>
              <div className="podium-points">{getPointsLabel(third)}</div>
              <div className="podium-bar">
                <span className="podium-rank">3</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Remaining Members List */}
      <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {remainder.map((m, idx) => (
          <div 
            key={m.id}
            className="flex-between card card-flat stagger-item"
            style={{ 
              padding: '12px 16px',
              background: m.id === currentUser.id ? 'var(--primary-bg)' : 'var(--bg-card)',
              borderColor: m.id === currentUser.id ? 'var(--primary-light)' : 'var(--border-light)'
            }}
          >
            <div className="flex-center gap-3">
              <span className="text-number" style={{ fontSize: '0.95rem', color: 'var(--fg-tertiary)', width: '22px', textAlign: 'center' }}>
                #{idx + 4}
              </span>
              <div className="avatar avatar-sm">{m.avatar || m.name?.[0]?.toUpperCase()}</div>
              <div className="text-body-bold" style={{ fontSize: '0.9rem' }}>
                {m.name} {m.id === currentUser.id && '(Tú)'}
              </div>
            </div>
            
            <div className="badge badge-reward flex-center gap-1">
              <Coins size={12} />
              <span>{getPointsLabel(m)}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Leaderboard;
