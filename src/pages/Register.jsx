import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../context/FamilyContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useFamily();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member'); // default
  const [error, setError] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    const result = register(name.trim(), email.trim(), role);
    if (result && result.success) {
      navigate('/family-setup');
    } else {
      setError(result?.message || 'Error al crear la cuenta');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-logo">🏡</div>
        <h1 className="auth-title">Crear Cuenta</h1>
        <p className="auth-subtitle">Únete a la aventura de mantener el hogar limpio</p>
      </div>

      <div className="auth-form">
        <form onSubmit={handleRegister}>
          {error && (
            <div 
              style={{ 
                background: 'var(--error-light)', 
                color: 'var(--error)', 
                padding: '12px', 
                borderRadius: '8px', 
                fontSize: '14px', 
                fontWeight: '600',
                marginBottom: '16px',
                textAlign: 'center'
              }}
            >
              {error}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Tu Nombre</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="Ej: Carlos"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Tu Email</label>
            <input 
              type="email" 
              className="input-field"
              placeholder="carlos@homquest.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Rol en la casa</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                className={`btn ${role === 'member' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRole('member')}
                style={{ padding: '12px' }}
              >
                👤 Miembro
              </button>
              <button
                type="button"
                className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRole('admin')}
                style={{ padding: '12px' }}
              >
                👑 Administrador
              </button>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>
              {role === 'admin' 
                ? 'Los administradores pueden crear tareas y verificar el trabajo.' 
                : 'Los miembros completan las tareas asignadas para ganar recompensas.'}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg mt-4">
            Registrarse y Entrar
          </button>
        </form>
      </div>

      <div className="auth-footer mt-6">
        <span>¿Ya tienes cuenta? </span>
        <button onClick={() => navigate('/login')} className="auth-link">
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
};

export default Register;
