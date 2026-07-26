import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, Mail, UserPlus, ArrowRight, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, joinFamily, getPendingInviteCode } = useFamily();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Por favor, completa tu nombre y correo electrónico.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await register(name.trim(), email.trim(), role);
      if (result && result.success) {
        const pendingCode = getPendingInviteCode?.();
        if (pendingCode) {
          const joinRes = await joinFamily(pendingCode, role);
          if (joinRes && joinRes.success) {
            navigate('/dashboard');
            return;
          }
          navigate(`/family-setup?code=${encodeURIComponent(pendingCode)}`);
          return;
        }
        navigate('/family-setup');
      } else {
        setError(result?.message || 'Ocurrió un inconveniente al crear la cuenta.');
      }
    } catch (err) {
      setError(err?.message || 'Error en el servidor. Inténtalo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page pb-tab flex-center" style={{ minHeight: '100dvh', padding: 'var(--sp-6) var(--sp-4)' }}>
      <div className="card animate-in" style={{ width: '100%', maxWidth: '480px', padding: 'var(--sp-8) var(--sp-6)' }}>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex-center mb-3">
            <div className="task-icon animate-pulse" style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-xl)' }}>
              <UserPlus size={30} color="var(--primary)" />
            </div>
          </div>
          <h1 className="text-display" style={{ fontSize: '1.85rem' }}>Crear Cuenta</h1>
          <p className="text-label mt-2" style={{ fontSize: '0.95rem' }}>
            Comienza a coordinar las tareas del hogar de forma ágil y entretenida.
          </p>
        </div>

        <form onSubmit={handleRegister}>
          {error && (
            <div className="input-error mb-4 card-flat" style={{ padding: '12px 14px', background: 'var(--error-light)', borderRadius: 'var(--radius-md)' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Tu Nombre</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="input-field"
                placeholder="Ej: Carlos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ paddingLeft: '2.6rem' }}
              />
              <User size={18} color="var(--fg-tertiary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="input-field"
                placeholder="carlos@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '2.6rem' }}
              />
              <Mail size={18} color="var(--fg-tertiary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Role selector */}
          <div className="input-group mt-2">
            <label className="input-label">Rol en el Hogar</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                className={`card card-flat card-interactive text-center ${role === 'member' ? 'active' : ''}`}
                onClick={() => setRole('member')}
                style={{
                  padding: '14px 12px',
                  background: role === 'member' ? 'var(--primary-bg)' : 'var(--bg-card)',
                  borderColor: role === 'member' ? 'var(--primary)' : 'var(--border-light)'
                }}
              >
                <User size={24} color={role === 'member' ? 'var(--primary)' : 'var(--fg-secondary)'} style={{ margin: '0 auto 6px' }} />
                <div className="text-body-bold" style={{ fontSize: '0.9rem', color: role === 'member' ? 'var(--primary-dark)' : 'var(--fg-primary)' }}>
                  Miembro
                </div>
              </div>

              <div
                className={`card card-flat card-interactive text-center ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
                style={{
                  padding: '14px 12px',
                  background: role === 'admin' ? 'var(--primary-bg)' : 'var(--bg-card)',
                  borderColor: role === 'admin' ? 'var(--primary)' : 'var(--border-light)'
                }}
              >
                <ShieldCheck size={24} color={role === 'admin' ? 'var(--primary)' : 'var(--fg-secondary)'} style={{ margin: '0 auto 6px' }} />
                <div className="text-body-bold" style={{ fontSize: '0.9rem', color: role === 'admin' ? 'var(--primary-dark)' : 'var(--fg-primary)' }}>
                  Administrador
                </div>
              </div>
            </div>

            <p className="text-label-sm text-center mt-2" style={{ color: 'var(--fg-tertiary)' }}>
              {role === 'admin' 
                ? 'Podrás crear tareas, revisar entregas y administrar miembros.' 
                : 'Podrás realizar tareas asignadas y sumar puntos XP.'}
            </p>
          </div>

          <button type="submit" className="btn btn-primary btn-lg mt-4" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="animate-pulse" />
                <span>Creando cuenta...</span>
              </>
            ) : (
              <>
                <span>Registrarse y Entrar</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-label" style={{ fontSize: '0.9rem' }}>
          <span>¿Ya tienes cuenta? </span>
          <button 
            type="button"
            onClick={() => navigate('/login')} 
            className="section-link"
            style={{ fontWeight: 700, borderBottom: '1.5px solid var(--primary-light)' }}
          >
            Iniciar Sesión
          </button>
        </div>

      </div>
    </div>
  );
};

export default Register;
