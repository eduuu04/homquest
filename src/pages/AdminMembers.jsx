import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Trash2, ClipboardList, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const AdminMembers = () => {
  const navigate = useNavigate();
  const { members, setMembers, currentUser, families, familySettings, tasks, toggleTaskAssignment } = useFamily();
  const [copied, setCopied] = useState(false);
  const [managingTasksMemberId, setManagingTasksMemberId] = useState(null);

  if (!currentUser || currentUser.role !== 'admin') return null;

  const familyObj = families.find(f => f.id === currentUser.familyId);
  const inviteCode = familyObj?.code || familySettings?.familyCode || 'HOM-CODE';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleRole = (memberId) => {
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
    if (memberId === currentUser.id) return;
    
    if (window.confirm('¿Seguro que deseas eliminar a este miembro de la familia? Su historial se perderá.')) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };

  return (
    <div className="page" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div className="page-header" style={{ paddingLeft: '0' }}>
        <button onClick={() => navigate('/admin')} className="btn btn-icon btn-ghost">
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ flex: 1, marginLeft: '12px' }}>Gestión de Miembros</h1>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <div className="text-label" style={{ fontWeight: 'bold' }}>Integrantes de la casa ({members.length})</div>

        {members.map(member => {
          const assignedTasks = tasks.filter(t => t.assignedTo?.includes(member.id));
          const isManagingTasks = managingTasksMemberId === member.id;

          return (
            <div
              key={member.id}
              className="card"
              style={{
                padding: '16px',
                border: '1.5px solid var(--border-light)',
                transform: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={`avatar avatar-md ${member.role === 'admin' ? 'avatar-admin' : ''}`}>
                  {member.avatar}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '15px' }}>
                    {member.name} {member.id === currentUser.id && ' (Tú)'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {member.role === 'admin' ? '👑 Administrador/a' : '👤 Miembro del Hogar'} · Lvl {member.level}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold', marginTop: '2px' }}>
                    📋 {assignedTasks.length} tareas asignadas
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setManagingTasksMemberId(isManagingTasks ? null : member.id)}
                    className="btn btn-sm btn-secondary flex-center gap-1"
                    style={{ fontSize: '12px', fontWeight: 'bold' }}
                    title="Asignar o quitar tareas"
                  >
                    <ClipboardList size={14} /> Tareas {isManagingTasks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {member.id !== currentUser.id && (
                    <>
                      <button
                        onClick={() => handleToggleRole(member.id)}
                        className="btn btn-sm btn-ghost"
                        title="Cambiar Rol"
                        style={{ fontSize: '12px', padding: '6px' }}
                      >
                        {member.role === 'admin' ? '👤' : '👑'}
                      </button>

                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="btn btn-icon btn-ghost"
                        style={{ color: 'var(--error)' }}
                        title="Eliminar Miembro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Task Management Drawer per Member */}
              {isManagingTasks && (
                <div className="mt-4 pt-4 animate-in" style={{ borderTop: '1.5px dashed var(--border-light)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Asignar o Quitar Tareas a {member.name}:
                  </div>

                  {tasks.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      No hay tareas creadas en el hogar. Crea tareas desde el panel admin.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tasks.map(t => {
                        const isAssigned = t.assignedTo?.includes(member.id);
                        return (
                          <div
                            key={t.id}
                            className="flex-between card card-flat"
                            style={{
                              padding: '10px 14px',
                              border: isAssigned ? '1.5px solid var(--primary-light)' : '1px solid var(--border-light)',
                              background: isAssigned ? 'var(--primary-bg)' : 'var(--white)'
                            }}
                          >
                            <div className="flex-center gap-2">
                              <span style={{ fontSize: '20px' }}>{t.icon}</span>
                              <div>
                                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{t.title}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                  ★ {t.points} pts · {t.frequency === 'daily' ? 'Diaria' : 'Semanal'}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleTaskAssignment(t.id, member.id)}
                              className={`btn btn-sm ${isAssigned ? 'btn-danger' : 'btn-success'} flex-center gap-1`}
                              style={{ fontSize: '12px' }}
                            >
                              {isAssigned ? (
                                <>
                                  <Minus size={14} /> Quitar
                                </>
                              ) : (
                                <>
                                  <Plus size={14} /> Asignar
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminMembers;
