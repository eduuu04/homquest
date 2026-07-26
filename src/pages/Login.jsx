import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Sparkles, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, joinFamily, getPendingInviteCode } = useFamily();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor, introduce tu email para continuar.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const result = await login(email.trim());
      if (result && result.success) {
        const pendingCode = getPendingInviteCode?.();
        if (pendingCode) {
          await joinFamily(pendingCode);
        }
        navigate('/dashboard');
      } else {
        setError(result?.message || 'No encontramos ninguna cuenta vinculada a este email.');
      }
    } catch (err) {
      setError(err?.message || 'Ocurrió un inconveniente al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page pb-tab flex-center" style={{ minHeight: '100dvh', padding: 'var(--sp-6) var(--sp-4)' }}>
      <div className="card animate-in" style={{ width: '100%', maxWidth: '440px', padding: 'var(--sp-8) var(--sp-6)' }}>
        
        {/* Brand & Header */}
        <div className="text-center mb-6">
          <div className="flex-center mb-3">
            <div className="task-icon animate-pulse" style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-xl)' }}>
              <Home size={32} color="var(--primary)" />
            </div>
          </div>
          <h1 className="text-display" style={{ fontSize: '1.85rem' }}>HomQuest</h1>
          <p className="text-label mt-2" style={{ fontSize: '0.95rem' }}>
            Tu hogar te espera. Gamifica la convivencia diaria.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          {error && (
            <div className="input-error mb-4 card-flat" style={{ padding: '12px 14px', background: 'var(--error-light)', borderRadius: 'var(--radius-md)' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className={`input-field ${error ? 'error' : ''}`}
                placeholder="ejemplo@homquest.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                disabled={loading}
                autoFocus
                required
                style={{ paddingLeft: '2.6rem' }}
              />
              <Mail size={18} color="var(--fg-tertiary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-pulse" />
                <span>Entrando...</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 text-label" style={{ fontSize: '0.9rem' }}>
          <span>¿Es tu primera vez en HomQuest? </span>
          <button 
            type="button"
            onClick={() => navigate('/register')} 
            className="section-link" 
            style={{ fontWeight: 700, borderBottom: '1.5px solid var(--primary-light)' }}
          >
            Crear cuenta familiar
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
