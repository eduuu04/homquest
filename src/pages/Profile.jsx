import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Award, ShoppingBag, Flame, Star, Trophy, ShieldAlert, Check } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentUser, 
    achievements, 
    rewards, 
    claimReward, 
    levels 
  } = useFamily();

  // Tab switcher
  const [activeSubTab, setActiveSubTab] = useState('achievements'); // achievements, shop
  const [claimMessage, setClaimMessage] = useState({ type: '', text: '' });

  // Read URL search params to switch to shop
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'shop') {
      setActiveSubTab('shop');
    }
  }, [location]);

  if (!currentUser) return null;

  const currentLvlInfo = levels.find(l => l.level === currentUser.level) || levels[0];

  const handleClaim = (rewardId) => {
    const res = claimReward(rewardId);
    if (res.success) {
      setClaimMessage({ type: 'success', text: res.message });
    } else {
      setClaimMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setClaimMessage({ type: '', text: '' }), 3000);
  };

  // Filter achievements
  const unlockedCount = achievements.filter(ach => ach.unlockedBy?.includes(currentUser.id)).length;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '0' }}>
        <div 
          className={`avatar avatar-xl ${currentUser.role === 'admin' ? 'avatar-admin' : ''}`}
          style={{ width: '88px', height: '88px', fontSize: '32px', marginBottom: '12px' }}
        >
          {currentUser.avatar}
        </div>
        <h2 className="text-section" style={{ fontSize: '20px', marginBottom: '4px' }}>
          {currentUser.name} {currentUser.role === 'admin' && '👑'}
        </h2>
        <div className="text-label" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
          Nivel {currentUser.level} · {currentLvlInfo.title}
        </div>
      </div>

      {/* Mini stats row */}
      <div className="stats-row mt-4">
        <div className="stat-card">
          <div className="stat-value">🪙 {currentUser.coins}</div>
          <div className="stat-label">Monedas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🔥 {currentUser.currentStreak}</div>
          <div className="stat-label">Racha Días</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🏅 {unlockedCount}</div>
          <div className="stat-label">Logros</div>
        </div>
      </div>

      {/* Sub Tabs Toggle */}
      <div className="flex-center mt-6" style={{ background: 'var(--white)', borderRadius: '16px', padding: '4px', border: '1.5px solid var(--border-light)' }}>
        <button
          onClick={() => setActiveSubTab('achievements')}
          className="flex-center gap-2"
          style={{ 
            flex: 1, 
            padding: '10px', 
            borderRadius: '12px', 
            fontWeight: '700',
            background: activeSubTab === 'achievements' ? 'var(--primary)' : 'transparent',
            color: activeSubTab === 'achievements' ? 'var(--white)' : 'var(--text-secondary)'
          }}
        >
          <Award size={18} />
          <span>Logros</span>
        </button>
        <button
          onClick={() => setActiveSubTab('shop')}
          className="flex-center gap-2"
          style={{ 
            flex: 1, 
            padding: '10px', 
            borderRadius: '12px', 
            fontWeight: '700',
            background: activeSubTab === 'shop' ? 'var(--primary)' : 'transparent',
            color: activeSubTab === 'shop' ? 'var(--white)' : 'var(--text-secondary)'
          }}
        >
          <ShoppingBag size={18} />
          <span>Tienda</span>
        </button>
      </div>

      {/* Feedback banner */}
      {claimMessage.text && (
        <div 
          className="animate-in mt-4" 
          style={{ 
            background: claimMessage.type === 'success' ? 'var(--success-light)' : 'var(--error-light)',
            color: claimMessage.type === 'success' ? '#047857' : 'var(--error)',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          {claimMessage.text}
        </div>
      )}

      {/* Active Tab Content */}
      <div className="mt-4" style={{ marginBottom: '32px' }}>
        {activeSubTab === 'achievements' ? (
          <div>
            <div className="flex-between mb-4">
              <span className="text-label" style={{ fontWeight: '700' }}>
                Progreso: {unlockedCount} de {achievements.length} logros
              </span>
            </div>

            <div className="achievement-grid">
              {achievements.map(ach => {
                const isUnlocked = ach.unlockedBy?.includes(currentUser.id);
                return (
                  <div 
                    key={ach.id}
                    className={`achievement-card ${isUnlocked ? '' : 'achievement-locked'}`}
                    style={{ position: 'relative', border: isUnlocked ? '1.5px solid var(--primary-light)' : '1.5px solid var(--border-light)' }}
                    title={ach.description}
                  >
                    <div className="achievement-icon">{ach.icon}</div>
                    <div className="achievement-name" style={{ fontWeight: 'bold' }}>{ach.title}</div>
                    
                    {/* Tooltip / detail below on hover/click */}
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {ach.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex-between mb-4">
              <span className="text-label" style={{ fontWeight: '700' }}>
                Tus monedas: 🪙 {currentUser.coins}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rewards.map(reward => {
                const canAfford = currentUser.coins >= reward.cost;
                return (
                  <div key={reward.id} className="reward-card">
                    <div className="reward-icon">{reward.icon}</div>
                    <div className="reward-info">
                      <div className="reward-title">{reward.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {reward.description}
                      </div>
                      <div className="reward-cost">🪙 {reward.cost} monedas</div>
                    </div>
                    
                    <button
                      onClick={() => handleClaim(reward.id)}
                      disabled={!canAfford}
                      className={`btn btn-sm ${canAfford ? 'btn-success' : 'btn-secondary'}`}
                      style={{ padding: '8px 12px' }}
                    >
                      {canAfford ? 'Canjear' : 'Faltan 🪙'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
