import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, UserPlus, Check, Trash2, ShieldAlert } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const AdminMembers = () => {
  const navigate = useNavigate();
  const { members, setMembers, currentUser } = useFamily();
  const [copied, setCopied] = useState(false);
  const [inviteCode] = useState('HOM-X4K9');

  if (!currentUser || currentUser.role !== 'admin') return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleRole = (memberId) => {
    // Cannot change your own role
    if (memberId === currentUser.id) return;
    
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          role: m.role === 'admin' ? 'member' : 'admin'
        };
      }
      return m;
    }));
  };

  const handleDeleteMember = (memberId) => {
    // Cannot delete yourself
    if (memberId === currentUser.id) return;
    
    if (window.confirm('¿Seguro que deseas eliminar a este miembro de la familia? Su historial se perderá.')) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header" style={{ paddingLeft: '0' }}>
        <button onClick={() => navigate('/admin')} className="btn btn-icon btn-ghost">
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ flex: 1, marginLeft: '12px' }}>Miembros</h1>
      </div>

      {/* Invite Code card */}
      <div className="card text-center mb-6" style={{ background: 'var(--primary-bg)', border: '1.5px solid var(--primary-light)', transform: 'none' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)' }}>CÓDIGO DE INVITACIÓN FAMILIAR</div>
        <div 
          className="text-display" 
          style={{ fontSize: '28px', color: 'var(--primary)', margin: '8px 0', letterSpacing: '2px', fontFamily: 'monospace' }}
        >
          {inviteCode}
        </div>
        <button 
          onClick={handleCopyCode}
          className="btn btn-primary btn-sm flex-center gap-1"
          style={{ margin: '0 auto' }}
        >
          {copied ? (
            <>
              <Check size={14} /> ¡Copiado!
            </>
          ) : (
            <>
              <Copy size={14} /> Copiar Código
            </>
          )}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        <div className="text-label" style={{ fontWeight: 'bold' }}>Integrantes de la casa</div>

        {members.map(member => (
          <div 
            key={member.id}
            className="card"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px 16px',
              border: '1.5px solid var(--border-light)',
              transform: 'none'
            }}
          >
            <div className={`avatar avatar-md ${member.role === 'admin' ? 'avatar-admin' : ''}`}>
              {member.avatar}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '800', fontSize: '15px' }}>
                {member.name} {member.id === currentUser.id && ' (Tú)'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {member.role === 'admin' ? '👑 Administrador' : '👤 Miembro'} · Lvl {member.level}
              </div>
            </div>

            {/* Actions for other members */}
            {member.id !== currentUser.id && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleToggleRole(member.id)}
                  className="btn btn-sm btn-secondary"
                  title="Cambiar Rol"
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                >
                  {member.role === 'admin' ? 'Hacer Miembro' : 'Hacer Admin'}
                </button>
                
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="btn btn-icon btn-ghost"
                  style={{ color: 'var(--error)' }}
                  title="Eliminar Miembro"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMembers;
