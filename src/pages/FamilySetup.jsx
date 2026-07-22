import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../context/FamilyContext';
import { Home, Link as LinkIcon, Sparkles } from 'lucide-react';

const FamilySetup = () => {
  const navigate = useNavigate();
  const { createFamily, joinFamily, currentUser } = useFamily();
  const [mode, setMode] = useState('choice'); // choice, create, join
  
  // Create states
  const [familyName, setFamilyName] = useState('');
  const [familyIcon, setFamilyIcon] = useState('🏠');
  
  // Join states
  const [familyCode, setFamilyCode] = useState('');
  const [error, setError] = useState('');

  if (!currentUser) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    const res = createFamily(familyName.trim(), familyIcon);
    if (res && res.success) {
      navigate('/dashboard');
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!familyCode.trim()) return;

    const res = joinFamily(familyCode.trim());
    if (res && res.success) {
      navigate('/dashboard');
    } else {
      setError(res?.message || 'Error al unirse a la familia');
    }
  };

  const icons = ['🏠', '🏰', '🚀', '⛺', '🛸', '⛵', '🦁', '🍕', '🎉', '🍀'];

  return (
    <div className="auth-page" style={{ justifyContent: 'center' }}>
      <div className="auth-header" style={{ padding: '0 0 var(--sp-6)' }}>
        <h1 className="auth-title" style={{ fontSize: '26px' }}>Configuración Familiar</h1>
        <p className="auth-subtitle">
          ¡Hola {currentUser.name}! Crea una familia nueva o únete a una existente para comenzar.
        </p>
      </div>

      {mode === 'choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={() => setMode('create')}
            className="card"
            style={{ 
              width: '100%', 
              textAlign: 'center', 
              padding: '24px 16px',
              border: '2px solid var(--border-light)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏰</div>
            <h3 className="text-body-bold" style={{ fontSize: '18px', color: 'var(--primary)' }}>
              Crear una nueva familia
            </h3>
            <p className="text-label" style={{ fontSize: '13px', marginTop: '6px' }}>
              Registra tu hogar, genera un código de invitación y gestiona las tareas.
            </p>
          </button>

          <button
            onClick={() => setMode('join')}
            className="card"
            style={{ 
              width: '100%', 
              textAlign: 'center', 
              padding: '24px 16px',
              border: '2px solid var(--border-light)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔗</div>
            <h3 className="text-body-bold" style={{ fontSize: '18px', color: 'var(--primary)' }}>
              Unirse a una familia
            </h3>
            <p className="text-label" style={{ fontSize: '13px', marginTop: '6px' }}>
              Pega el código de invitación compartido por tu administrador de la casa.
            </p>
          </button>
        </div>
      )}

      {mode === 'create' && (
        <form onSubmit={handleCreate} className="animate-in">
          <div className="card" style={{ border: '1.5px solid var(--border-light)', transform: 'none' }}>
            <div className="input-group">
              <label className="input-label">Nombre de tu Familia</label>
              <input 
                type="text"
                placeholder="Ej: Los García, Piso Compartido..."
                className="input-field"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Icono de la Familia</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {icons.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setFamilyIcon(ic)}
                    className="flex-center"
                    style={{ 
                      fontSize: '24px', 
                      height: '44px', 
                      borderRadius: '12px',
                      border: familyIcon === ic ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      background: familyIcon === ic ? 'var(--primary-bg)' : 'transparent'
                    }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginTop: '16px' }}>
              <button 
                type="button" 
                onClick={() => setMode('choice')} 
                className="btn btn-secondary"
              >
                Atrás
              </button>
              <button 
                type="submit" 
                disabled={!familyName.trim()}
                className="btn btn-primary"
              >
                Crear Familia
              </button>
            </div>
          </div>
        </form>
      )}

      {mode === 'join' && (
        <form onSubmit={handleJoin} className="animate-in">
          <div className="card" style={{ border: '1.5px solid var(--border-light)', transform: 'none' }}>
            {error && (
              <div 
                style={{ 
                  background: 'var(--error-light)', 
                  color: 'var(--error)', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  fontSize: '13px', 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '12px'
                }}
              >
                {error}
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Introduce el Código</label>
              <input 
                type="text"
                placeholder="Ej: HOM-X4K9"
                className="input-field"
                value={familyCode}
                onChange={(e) => {
                  setFamilyCode(e.target.value.toUpperCase());
                  setError('');
                }}
                maxLength={8}
                required
                style={{ fontFamily: 'monospace', letterSpacing: '1px', textAlign: 'center', fontSize: '18px' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', textAlign: 'center' }}>
                Pide el código de 8 caracteres al administrador de tu hogar para vincular tu dispositivo.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginTop: '16px' }}>
              <button 
                type="button" 
                onClick={() => {
                  setMode('choice');
                  setError('');
                }} 
                className="btn btn-secondary"
              >
                Atrás
              </button>
              <button 
                type="submit" 
                disabled={!familyCode.trim()}
                className="btn btn-primary"
              >
                Unirme
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default FamilySetup;
