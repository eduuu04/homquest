import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Award, ShoppingBag, Flame, Star, Trophy, Check, Edit2, X, Coins, Gift, ShieldCheck, User } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const AVATAR_OPTIONS = [
  { id: 'av1', emoji: '🦸‍♂️', name: 'Superhéroe' },
  { id: 'av2', emoji: '🥷', name: 'Ninja' },
  { id: 'av3', emoji: '👩‍🚀', name: 'Astronauta' },
  { id: 'av4', emoji: '🧙‍♂️', name: 'Mago' },
  { id: 'av5', emoji: '👑', name: 'Rey' },
  { id: 'av6', emoji: '🐱', name: 'Gato Pro' },
  { id: 'av7', emoji: '🤖', name: 'Robot' },
  { id: 'av8', emoji: '🦁', name: 'León' },
  { id: 'av9', emoji: '🦊', name: 'Zorro Astuto' },
  { id: 'av10', emoji: '🎨', name: 'Artista' }
];

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentUser, 
    achievements = [], 
    rewards = [], 
    claimReward, 
    claimedRewards = [],
    fulfillRewardClaim,
    members = [],
    levels = [],
    updateUserAvatar
  } = useFamily();

  const [activeSubTab, setActiveSubTab] = useState('achievements'); // achievements, shop
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'shop') {
      setActiveSubTab('shop');
    }
  }, [location]);

  if (!currentUser) return null;

  const currentLevel = currentUser.level || 1;
  const currentLvlInfo = levels.find(l => l.level === currentLevel) || { title: 'Explorador' };

  const userClaimedHistory = claimedRewards.filter(c =>
    currentUser.role === 'admin' ? true : c.claimedBy === currentUser.id
  );

  const handleClaim = (rewardId) => {
    if (!claimReward) return;
    const res = claimReward(rewardId);
    if (res?.success) {
      setClaimMessage({ type: 'success', text: res.message || '¡Recompensa solicitada!' });
    } else {
      setClaimMessage({ type: 'error', text: res?.message || 'No tienes suficientes monedas.' });
    }
    setTimeout(() => setClaimMessage({ type: '', text: '' }), 3000);
  };

  const handleSelectAvatar = (emoji) => {
    if (updateUserAvatar) updateUserAvatar(emoji);
    setIsAvatarModalOpen(false);
  };

  const unlockedCount = achievements.filter(ach => ach.unlockedBy?.includes(currentUser.id)).length;

  return (
    <div className="page pb-tab">
      
      {/* Avatar Modal */}
      {isAvatarModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAvatarModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <div className="flex-between mb-4">
              <h3 className="text-section" style={{ fontSize: '1.15rem' }}>Elige tu Avatar</h3>
              <button onClick={() => setIsAvatarModalOpen(false)} className="btn btn-icon btn-ghost">
                <X size={20} />
              </button>
            </div>
            <p className="text-label-sm mb-4">
              Selecciona tu personaje o icono favorito para identificarte:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', maxHeight: '50dvh', overflowY: 'auto', padding: '4px' }}>
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
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      background: isSelected ? 'var(--primary-bg)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-lg)'
                    }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{av.emoji}</span>
                    <span className="text-label-sm mt-1" style={{ fontSize: '0.68rem', textAlign: 'center' }}>
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
            style={{ width: '84px', height: '84px', fontSize: '2.2rem', marginBottom: '12px', cursor: 'pointer' }}
            onClick={() => setIsAvatarModalOpen(true)}
            title="Cambiar Avatar"
          >
            {currentUser.avatar || currentUser.name?.[0]?.toUpperCase() || '?'}
          </div>
          <button
            onClick={() => setIsAvatarModalOpen(true)}
            className="btn btn-icon btn-primary"
            style={{ position: 'absolute', bottom: '10px', right: '-4px', width: '28px', height: '28px' }}
            title="Editar Avatar"
          >
            <Edit2 size={13} />
          </button>
        </div>

        <h2 className="text-section" style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{currentUser.name}</span>
          {currentUser.role === 'admin' && <ShieldCheck size={18} color="var(--reward-dark)" />}
        </h2>
        <div className="text-label" style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.88rem' }}>
          Nivel {currentLevel} · {currentLvlInfo.title}
        </div>
      </div>

      {/* Mini stats row */}
      <div className="stats-row mt-4">
        <div className="stat-card primary">
          <div className="stat-icon"><Coins size={20} /></div>
          <div>
            <span className="stat-value">{currentUser.coins || 0}</span>
            <span className="stat-label">Monedas</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon"><Flame size={20} color="var(--reward-dark)" /></div>
          <div>
            <span className="stat-value">{currentUser.currentStreak || currentUser.streak || 0}</span>
            <span className="stat-label">Racha Días</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon"><Award size={20} color="var(--success-dark)" /></div>
          <div>
            <span className="stat-value">{unlockedCount}</span>
            <span className="stat-label">Logros</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Toggle */}
      <div className="flex-center mt-6" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '4px', border: '1px solid var(--border-light)' }}>
        <button
          onClick={() => setActiveSubTab('achievements')}
          className="flex-center gap-2"
          style={{ 
            flex: 1, 
            padding: '10px', 
            borderRadius: 'var(--radius-lg)', 
            fontWeight: 700,
            fontSize: '0.9rem',
            background: activeSubTab === 'achievements' ? 'var(--primary)' : 'transparent',
            color: activeSubTab === 'achievements' ? 'oklch(0.99 0 0)' : 'var(--fg-secondary)',
            transition: 'all 0.2s ease'
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
            borderRadius: 'var(--radius-lg)', 
            fontWeight: 700,
            fontSize: '0.9rem',
            background: activeSubTab === 'shop' ? 'var(--primary)' : 'transparent',
            color: activeSubTab === 'shop' ? 'oklch(0.99 0 0)' : 'var(--fg-secondary)',
            transition: 'all 0.2s ease'
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
            color: claimMessage.type === 'success' ? 'var(--success-dark)' : 'var(--error-dark)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            fontWeight: 700,
            textAlign: 'center'
          }}
        >
          {claimMessage.text}
        </div>
      )}

      {/* Active Tab Content */}
      <div className="mt-4">
        {activeSubTab === 'achievements' ? (
          <div>
            <div className="flex-between mb-3">
              <span className="text-label" style={{ fontWeight: 600 }}>
                Progreso: {unlockedCount} de {achievements.length} logros
              </span>
            </div>

            <div className="achievement-grid">
              {achievements.map(ach => {
                const isUnlocked = ach.unlockedBy?.includes(currentUser.id);
                return (
                  <div 
                    key={ach.id}
                    className={`achievement-card stagger-item ${isUnlocked ? '' : 'achievement-locked'}`}
                    style={{ position: 'relative', border: isUnlocked ? '1px solid var(--primary-light)' : '1px solid var(--border-light)' }}
                    title={ach.description}
                  >
                    <div className="achievement-icon">{ach.icon || '🏅'}</div>
                    <div className="achievement-name" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ach.title}</div>
                    <div className="text-label-sm" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                      {ach.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex-between mb-3">
              <span className="text-label flex-center gap-1" style={{ fontWeight: 600 }}>
                <Coins size={14} color="var(--reward-dark)" />
                <span>Monedas disponibles: {currentUser.coins || 0}</span>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rewards.map(reward => {
                const canAfford = (currentUser.coins || 0) >= reward.cost;
                return (
                  <div key={reward.id} className="reward-card stagger-item">
                    <div className="reward-icon">{reward.icon || '🎁'}</div>
                    <div className="reward-info">
                      <div className="reward-title">{reward.title}</div>
                      <div className="text-label-sm mb-1">{reward.description}</div>
                      <div className="reward-cost flex-center gap-1" style={{ justifyContent: 'flex-start' }}>
                        <Coins size={13} />
                        <span>{reward.cost} monedas</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleClaim(reward.id)}
                      disabled={!canAfford}
                      className={`btn btn-sm ${canAfford ? 'btn-success' : 'btn-ghost'}`}
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
                <div className="section-title mb-3" style={{ fontSize: '1rem' }}>
                  <Gift size={18} color="var(--primary)" />
                  <span>Historial de Canjes ({userClaimedHistory.length})</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {userClaimedHistory.map(claim => {
                    const member = members.find(m => m.id === claim.claimedBy) || { name: 'Miembro' };
                    const isPending = claim.status === 'pending';

                    return (
                      <div
                        key={claim.id}
                        className="card card-flat stagger-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderColor: isPending ? 'var(--reward)' : 'var(--border-light)',
                          background: isPending ? 'var(--reward-light)' : 'var(--bg-card)'
                        }}
                      >
                        <div style={{ fontSize: '1.8rem' }}>{claim.icon || '🎁'}</div>
                        <div style={{ flex: 1 }}>
                          <div className="text-body-bold" style={{ fontSize: '0.9rem' }}>{claim.title}</div>
                          <div className="text-label-sm">
                            Por: {member.name} (-{claim.cost} XP)
                          </div>
                          <div className="text-label-sm mt-1" style={{ color: isPending ? 'var(--reward-dark)' : 'var(--success-dark)', fontWeight: 700 }}>
                            {isPending ? '⏳ En espera de entrega por Admin' : '✅ Entregado'}
                          </div>
                        </div>

                        {currentUser.role === 'admin' && isPending && (
                          <button
                            onClick={() => fulfillRewardClaim?.(claim.id)}
                            className="btn btn-sm btn-success flex-center gap-1"
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
