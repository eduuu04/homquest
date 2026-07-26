import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Link as LinkIcon, Sparkles, ArrowLeft, ArrowRight, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const FamilySetup = () => {
  const navigate = useNavigate();
  const { createFamily, joinFamily, currentUser, families } = useFamily();
  const [mode, setMode] = useState('choice'); // choice, create, join
  
  // Create states
  const [familyName, setFamilyName] = useState('');
  const [familyIcon, setFamilyIcon] = useState('🏠');
  
  // Join states
  const [familyCode, setFamilyCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Detect ?code=XYZ or ?join=XYZ in URL search or hash
    const rawSearch = window.location.search || (window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
    const searchParams = new URLSearchParams(rawSearch);
    const codeParam = searchParams.get('code') || searchParams.get('join');
    if (codeParam) {
      const cleanCode = codeParam.trim();
      
      if (currentUser && currentUser.familyId) {
        const activeFamily = families?.find(f => f.id === currentUser.familyId);
        if (activeFamily && activeFamily.code?.trim().toLowerCase() === cleanCode.toLowerCase()) {
          navigate('/dashboard', { replace: true });
          return;
        }
      }

      setFamilyCode(cleanCode);
      setMode('join');
    }
  }, [currentUser, families, navigate]);

  if (!currentUser) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    const res = await createFamily(familyName.trim(), familyIcon);
    if (res && res.success) {
      navigate('/dashboard');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!familyCode.trim()) return;

    setError('');
    const res = await joinFamily(familyCode.trim());
    if (res && res.success) {
      navigate('/dashboard');
    } else {
      setError(res?.message || 'No pudimos verificar ese código de invitación.');
    }
  };

  const icons = ['🏠', '🏰', '🚀', '⛺', '🛸', '⛵', '🦁', '🍕', '🎉', '🍀'];

  return (
    <div className="page pb-tab flex-center" style={{ minHeight: '100dvh', padding: 'var(--sp-6) var(--sp-4)' }}>
      <div className="card animate-in" style={{ width: '100%', maxWidth: '520px', padding: 'var(--sp-8) var(--sp-6)' }}>
        
        <div className="text-center mb-6">
          <div className="flex-center mb-3">
            <div className="task-icon animate-pulse" style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-xl)' }}>
              <Home size={30} color="var(--primary)" />
            </div>
          </div>
          <h1 className="text-display" style={{ fontSize: '1.75rem' }}>Espacio Familiar</h1>
          <p className="text-label mt-2" style={{ fontSize: '0.95rem' }}>
            ¡Hola, {currentUser.name}! Crea un espacio nuevo o vincúlate a un hogar ya existente.
          </p>
        </div>

        {mode === 'choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              onClick={() => setMode('create')}
              className="card card-interactive text-center"
              style={{ 
                padding: 'var(--sp-6)',
                border: '1.5px solid var(--border-light)',
                background: 'var(--bg-card)'
              }}
            >
              <div className="task-icon" style={{ width: '52px', height: '52px', margin: '0 auto 12px' }}>
                <Home size={26} />
              </div>
              <h3 className="text-body-bold" style={{ fontSize: '1.1rem', color: 'var(--primary-dark)' }}>
                Crear una nueva familia
              </h3>
              <p className="text-label mt-2" style={{ fontSize: '0.85rem' }}>
                Registra tu casa, comparte un código seguro y administra las tareas.
              </p>
            </div>

            <div
              onClick={() => setMode('join')}
              className="card card-interactive text-center"
              style={{ 
                padding: 'var(--sp-6)',
                border: '1.5px solid var(--border-light)',
                background: 'var(--bg-card)'
              }}
            >
              <div className="task-icon" style={{ width: '52px', height: '52px', margin: '0 auto 12px', background: 'var(--reward-light)', color: 'var(--reward-dark)' }}>
                <KeyRound size={26} />
              </div>
              <h3 className="text-body-bold" style={{ fontSize: '1.1rem', color: 'var(--fg-primary)' }}>
                Unirse con un código
              </h3>
              <p className="text-label mt-2" style={{ fontSize: '0.85rem' }}>
                Si alguien ya creó tu espacio familiar, introduce su código de acceso.
              </p>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="animate-in">
            <div className="input-group">
              <label className="input-label">Nombre de tu Familia o Casa</label>
              <input 
                type="text"
                placeholder="Ej: Los García, Piso Compartido..."
                className="input-field"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="input-group mt-4">
              <label className="input-label">Emblema de la Casa</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {icons.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setFamilyIcon(ic)}
                    className="flex-center"
                    style={{ 
                      fontSize: '1.5rem', 
                      height: '46px', 
                      borderRadius: 'var(--radius-md)',
                      border: familyIcon === ic ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      background: familyIcon === ic ? 'var(--primary-bg)' : 'var(--bg-card)'
                    }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginTop: '24px' }}>
              <button 
                type="button" 
                onClick={() => setMode('choice')} 
                className="btn btn-secondary"
              >
                <ArrowLeft size={16} />
                <span>Atrás</span>
              </button>
              <button 
                type="submit" 
                disabled={!familyName.trim()}
                className="btn btn-primary"
              >
                <span>Crear Familia</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="animate-in">
            {error && (
              <div className="input-error mb-4 card-flat" style={{ padding: '12px 14px', background: 'var(--error-light)', borderRadius: 'var(--radius-md)' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Código de Invitación</label>
              <input 
                type="text"
                placeholder="HOM-XXXX"
                className="input-field text-center"
                value={familyCode}
                onChange={(e) => {
                  setFamilyCode(e.target.value.toUpperCase());
                  setError('');
                }}
                required
                autoFocus
                style={{ fontFamily: 'monospace', letterSpacing: '2px', fontSize: '1.15rem', fontWeight: 700 }}
              />
              <p className="text-label-sm text-center mt-2" style={{ color: 'var(--fg-tertiary)' }}>
                Ingresa el código de 8 caracteres generado por el administrador del grupo.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginTop: '24px' }}>
              <button 
                type="button" 
                onClick={() => {
                  setMode('choice');
                  setError('');
                }} 
                className="btn btn-secondary"
              >
                <ArrowLeft size={16} />
                <span>Atrás</span>
              </button>
              <button 
                type="submit" 
                disabled={!familyCode.trim()}
                className="btn btn-primary"
              >
                <span>Unirme</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default FamilySetup;
