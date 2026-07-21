import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';

const Leaderboard = () => {
  const { members, currentUser } = useFamily();
  const [period, setPeriod] = useState('weekly'); // weekly, monthly, allTime

  if (!currentUser) return null;

  // Sorting logic based on selected period
  const getSortedMembers = () => {
    return [...members].sort((a, b) => {
      if (period === 'weekly') return b.weeklyPoints - a.weeklyPoints;
      if (period === 'monthly') return b.monthlyPoints - a.monthlyPoints;
      return b.totalXP - a.totalXP; // allTime based on XP
    });
  };

  const sortedList = getSortedMembers();
  
  // Podium positions: 1st, 2nd, 3rd
  const first = sortedList[0];
  const second = sortedList[1];
  const third = sortedList[2];
  
  // List for remaining members (4th and below)
  const remainder = sortedList.slice(3);

  const getPointsLabel = (member) => {
    if (period === 'weekly') return `${member.weeklyPoints} 🪙`;
    if (period === 'monthly') return `${member.monthlyPoints} 🪙`;
    return `${member.totalXP} XP`;
  };

  return (
    <div className="page">
      <div className="page-header" style={{ paddingBottom: '0px' }}>
        <h1 className="page-title">Clasificación 🏆</h1>
      </div>

      {/* Tabs */}
      <div className="chip-group mt-4" style={{ justifyContent: 'center' }}>
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

      {/* Podium View */}
      <div className="podium mt-6">
        {/* 2nd Place */}
        {second && (
          <div className="podium-item podium-2nd">
            <div className="avatar avatar-md">{second.avatar}</div>
            <div className="podium-name">{second.name}</div>
            <div className="podium-points">{getPointsLabel(second)}</div>
            <div className="podium-bar">
              <span style={{ fontSize: '24px', fontWeight: '900', color: 'rgba(255,255,255,0.7)' }}>2</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {first && (
          <div className="podium-item podium-1st" style={{ transform: 'translateY(-16px)' }}>
            <div style={{ position: 'relative' }}>
              <div className="avatar avatar-lg avatar-admin">{first.avatar}</div>
              <span style={{ position: 'absolute', top: '-18px', left: '20px', fontSize: '22px' }}>👑</span>
            </div>
            <div className="podium-name" style={{ fontWeight: '800' }}>{first.name}</div>
            <div className="podium-points" style={{ fontWeight: '700', color: 'var(--reward-dark)' }}>{getPointsLabel(first)}</div>
            <div className="podium-bar">
              <span style={{ fontSize: '32px', fontWeight: '900', color: 'rgba(255,255,255,0.8)' }}>1</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="podium-item podium-3rd">
            <div className="avatar avatar-md">{third.avatar}</div>
            <div className="podium-name">{third.name}</div>
            <div className="podium-points">{getPointsLabel(third)}</div>
            <div className="podium-bar">
              <span style={{ fontSize: '20px', fontWeight: '900', color: 'rgba(255,255,255,0.6)' }}>3</span>
            </div>
          </div>
        )}
      </div>

      {/* Remaining List */}
      <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
        {remainder.map((m, idx) => (
          <div 
            key={m.id}
            className="flex-between card"
            style={{ 
              padding: '12px 16px',
              border: '1.5px solid var(--border-light)',
              background: m.id === currentUser.id ? 'var(--primary-bg)' : 'var(--white)',
              transform: 'none'
            }}
          >
            <div className="flex-center" style={{ gap: '12px' }}>
              <span style={{ fontWeight: '800', color: 'var(--text-secondary)', width: '20px' }}>
                {idx + 4}
              </span>
              <div className="avatar avatar-sm">{m.avatar}</div>
              <span style={{ fontWeight: '700' }}>{m.name}</span>
            </div>
            <span style={{ fontWeight: '800', color: 'var(--primary)' }}>
              {getPointsLabel(m)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
