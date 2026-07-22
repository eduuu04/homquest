import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Award, ShoppingBag, Flame, Star, Trophy, ShieldAlert, Check, Edit2, X } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const AVATAR_OPTIONS = [
  { id: 'av1', emoji: '🦸‍♂️', name: 'Superhéroe' },
  { id: 'av2', emoji: '🥷', name: 'Ninja' },
  { id: 'av3', emoji: '👩‍🚀', name: 'Astronauta' },
  { id: 'av4', emoji: '🧙‍♂️', name: 'Mago' },
  { id: 'av5', emoji: '🕵️‍♂️', name: 'Detective' },
  { id: 'av6', emoji: '👑', name: 'Rey' },
  { id: 'av7', emoji: '👸', name: 'Reina' },
  { id: 'av8', emoji: '🏴‍☠️', name: 'Pirata' },
  { id: 'av9', emoji: '🐱', name: 'Gato Pro' },
  { id: 'av10', emoji: '🐉', name: 'Dragón' },
  { id: 'av11', emoji: '🤖', name: 'Robot' },
  { id: 'av12', emoji: '🦁', name: 'León' },
  { id: 'av13', emoji: '🦄', name: 'Unicornio' },
  { id: 'av14', emoji: '👽', name: 'Alien' },
  { id: 'av15', emoji: '🦊', name: 'Zorro Astuto' },
  { id: 'av16', emoji: '🎮', name: 'Gamer' },
  { id: 'av17', emoji: '👨‍🍳', name: 'Chef Master' },
  { id: 'av18', emoji: '⚡', name: 'Rayo Épico' },
  { id: 'av19', emoji: '🚀', name: 'Cohete' },
  { id: 'av20', emoji: '🎨', name: 'Artista' }
];

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentUser, 
    achievements, 
    rewards, 
    claimReward, 
    claimedRewards = [],
    fulfillRewardClaim,
    members,
    levels,
    updateUserAvatar
  } = useFamily();

  // Tab switcher
  const [activeSubTab, setActiveSubTab] = useState('achievements'); // achievements, shop
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const userClaimedHistory = claimedRewards.filter(c =>
    currentUser.role === 'admin' ? true : c.claimedBy === currentUser.id
  );
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

  const handleSelectAvatar = (emoji) => {
    updateUserAvatar(emoji);
    setIsAvatarModalOpen(false);
  };

  // Filter achievements
  const unlockedCount = achievements.filter(ach => ach.unlockedBy?.includes(currentUser.id)).length;

  return (
    <div className="page" style={{ position: 'relative' }}>
      {/* Avatar Customization Modal Drawer (Netflix-style) */}
      {isAvatarModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAvatarModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <div className="flex-between mb-4">
              <h3 className="text-section" style={{ fontSize: '18px' }}>Elige tu Avatar del Hogar 🎬</h3>
              <button onClick={() => setIsAvatarModalOpen(false)} className="btn btn-icon btn-ghost">
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Selecciona tu personaje o icono favorito para identificarte en las tareas y clasificaciones:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', maxHeight: '50dvh', overflowY: 'auto', padding: '4px' }}>
              {AVATAR_OPTIONS.map(av => {
                const isSelected = currentUser.avatar === av.emoji;
                return (
                  <button
                    key={av.id}
                    onClick={() => handleSelectAvatar(av.emoji)}
                    className="card card-flat flex-center"
                    style={{
                      flexDirection: 'column',
                      padding: '12px 6px',
                      border: isSelected ? '2px solid var(--primary)' : '1.5px solid var(--border-light)',
                      background: isSelected ? 'var(--primary-bg)' : 'var(--white)',
                      cursor: 'pointer',
                      borderRadius: '16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>{av.emoji}</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px', textAlign: 'center', color: 'var(--text-primary)' }}>
                      {av.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '0' }}>
        <div style={{ position: 'relative' }}>
          <div
            className={`avatar avatar-xl ${currentUser.role === 'admin' ? 'avatar-admin' : ''}`}
            style={{ width: '88px', height: '88px', fontSize: '36px', marginBottom: '12px', cursor: 'pointer' }}
            onClick={() => setIsAvatarModalOpen(true)}
            title="Cambiar Avatar"
          >
            {currentUser.avatar}
          </div>
          <button
            onClick={() => setIsAvatarModalOpen(true)}
            className="btn btn-icon btn-primary"
            style={{ position: 'absolute', bottom: '12px', right: '-4px', width: '28px', height: '28px', borderRadius: '50%' }}
            title="Editar Avatar"
          >
            <Edit2 size={14} />
          </button>
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
                Tus monedas disponibles: 🪙 {currentUser.coins}
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

            {/* Claimed rewards history */}
            {userClaimedHistory.length > 0 && (
              <div className="mt-6">
                <div className="section-title mb-3" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  🎁 Solicitudes de Recompensas ({userClaimedHistory.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {userClaimedHistory.map(claim => {
                    const member = members.find(m => m.id === claim.claimedBy) || { name: 'Miembro' };
                    const isPending = claim.status === 'pending';

                    return (
                      <div
                        key={claim.id}
                        className="card card-flat"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          border: isPending ? '1.5px solid var(--reward)' : '1.5px solid var(--border-light)',
                          background: isPending ? 'rgba(245, 158, 11, 0.05)' : 'var(--white)'
                        }}
                      >
                        <div style={{ fontSize: '28px' }}>{claim.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{claim.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Solicitado por: <strong>{member.name}</strong> (-{claim.cost}🪙)
                          </div>
                          <div style={{ fontSize: '11px', color: isPending ? 'var(--reward)' : 'var(--success)', marginTop: '2px', fontWeight: '700' }}>
                            {isPending ? '⏳ Pendiente de entregar por Admin' : '✅ Entregado'}
                          </div>
                        </div>

                        {currentUser.role === 'admin' && isPending && (
                          <button
                            onClick={() => fulfillRewardClaim(claim.id)}
                            className="btn btn-sm btn-success flex-center gap-1"
                            style={{ fontSize: '12px' }}
                          >
                            <Check size={14} /> Entregar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
