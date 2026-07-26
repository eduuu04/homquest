import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../context/FamilyContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, joinFamily, getPendingInviteCode } = useFamily();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor, introduce tu email');
      return;
    }
    const result = await login(email.trim());
    if (result && result.success) {
      const pendingCode = getPendingInviteCode();
      if (pendingCode) {
        await joinFamily(pendingCode);
      }
      navigate('/dashboard');
    } else {
      setError(result?.message || 'Error al iniciar sesión');
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
