import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../context/FamilyContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, members } = useFamily();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, introduce tu email');
      return;
    }
    const result = login(email);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleQuickLogin = (emailAddress) => {
    const result = login(emailAddress);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-logo">🏡</div>
        <h1 className="auth-title">HomQuest</h1>
        <p className="auth-subtitle">Accede a las tareas de tu hogar gamificado</p>
      </div>

      <div className="auth-form">
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Tu Email</label>
            <input 
              type="email" 
              className={`input-field ${error ? 'error' : ''}`}
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
            />
            {error && <div className="input-error">{error}</div>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg mt-2">
            Iniciar Sesión
          </button>
        </form>

        <div className="divider" style={{ margin: '24px 0' }}></div>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span className="text-label" style={{ fontSize: '13px' }}>
            ACCESO RÁPIDO (MODO DEMO/MOCK)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {members.map(member => (
            <button 
              key={member.id}
              onClick={() => handleQuickLogin(member.email)}
              className="card card-flat"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '10px 14px', 
                width: '100%',
                textAlign: 'left',
                border: '1.5px solid var(--border-light)',
                borderRadius: '12px'
              }}
            >
              <div className={`avatar avatar-md ${member.role === 'admin' ? 'avatar-admin' : ''}`}>
                {member.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{member.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {member.role === 'admin' ? '👑 Administrador' : '👤 Miembro'}
                </div>
              </div>
              <div className="badge badge-reward">
                Lvl {member.level}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="auth-footer mt-6">
        <span>¿Nuevo en HomQuest? </span>
        <button onClick={() => navigate('/register')} className="auth-link">
          Crear cuenta familiar
        </button>
      </div>
    </div>
  );
};

export default Login;
