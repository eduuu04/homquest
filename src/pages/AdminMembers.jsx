import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Trash2, ClipboardList, Plus, Minus, ChevronDown, ChevronUp, Link as LinkIcon, Share2, ShieldCheck, User } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const AdminMembers = () => {
  const navigate = useNavigate();
  const { members = [], setMembers, removeMember, updateMemberRole, currentUser, families = [], tasks = [], toggleTaskAssignment } = useFamily();
  const [managingTasksMemberId, setManagingTasksMemberId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!currentUser || currentUser.role !== 'admin') return null;

  const familyObj = families ? families.find(f => f.id === currentUser.familyId) : null;
  const inviteCode = familyObj?.code || currentUser?.familyCode || '...';
  const inviteUrl = `${window.location.origin}${window.location.pathname}#/family-setup?code=${encodeURIComponent(inviteCode)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`¡Únete a nuestra familia en HomQuest!\n\n🔑 Código: ${inviteCode}\n👉 Enlace directo: ${inviteUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleToggleRole = (memberId, currentRole) => {
    if (memberId === currentUser.id) return;
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    if (updateMemberRole) {
      updateMemberRole(memberId, newRole);
    } else if (setMembers) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    }
  };

  const handleDeleteMember = (memberId, memberName) => {
    if (memberId === currentUser.id) return;
    if (window.confirm(`¿Seguro que deseas eliminar a ${memberName} de la familia?`)) {
      if (removeMember) {
        removeMember(memberId);
      } else if (setMembers) {
        setMembers(prev => prev.filter(m => m.id !== memberId));
      }
    }
  };

  return (
    <div className="page pb-tab">
      
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate('/admin')} className="btn btn-icon btn-ghost">
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-title" style={{ flex: 1 }}>Gestión de Miembros</h1>
      </div>

      {/* Invite Code & Link Card */}
      <div className="card text-center mb-6 animate-in" style={{ background: 'var(--primary-bg)', border: '1px solid oklch(var(--primary-raw) / 0.2)' }}>
        <div className="text-label-sm" style={{ fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
          CÓDIGO DE INVITACIÓN FAMILIAR
        </div>
        
        <div 
          className="text-number mt-2 mb-2" 
          style={{ fontSize: '1.75rem', color: 'var(--primary-dark)', letterSpacing: '3px', fontFamily: 'monospace' }}
        >
          {inviteCode}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '14px' }}>
          <button 
            onClick={handleCopyCode}
            className="btn btn-primary btn-sm flex-center gap-1"
          >
            {copiedCode ? <><Check size={14} /> ¡Copiado!</> : <><Copy size={14} /> Copiar Código</>}
          </button>

          <button 
            onClick={handleCopyLink}
            className="btn btn-secondary btn-sm flex-center gap-1"
          >
            {copiedLink ? <><Check size={14} /> ¡Copiado!</> : <><LinkIcon size={14} /> Copiar Enlace</>}
          </button>

          <button 
            onClick={handleShareWhatsApp}
            className="btn btn-success btn-sm flex-center gap-1"
          >
            <Share2 size={14} /> WhatsApp
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-title mb-3" style={{ fontSize: '1rem' }}>
          <span>Integrantes de la casa ({members.length})</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {members.map(member => {
            let assignedTasks = [];
            if (Array.isArray(tasks)) {
              assignedTasks = tasks.filter(t => {
                if (Array.isArray(t.assignedTo)) {
                  return t.assignedTo.some(a => (typeof a === 'object' ? a.memberId === member.id : a === member.id));
                }
                return false;
              });
            }

            const isManagingTasks = managingTasksMemberId === member.id;

            return (
              <div key={member.id} className="card card-flat stagger-item" style={{ padding: 'var(--sp-4)' }}>
                <div className="flex-between">
                  <div className="flex-center gap-3">
                    <div className={`avatar avatar-md ${member.role === 'admin' ? 'avatar-admin' : ''}`}>
                      {member.avatar || member.name?.[0]?.toUpperCase() || '?'}
                    </div>

                    <div>
                      <div className="text-body-bold" style={{ fontSize: '0.95rem' }}>
                        {member.name} {member.id === currentUser.id && ' (Tú)'}
                      </div>
                      
                      <div className="text-label-sm flex-center gap-1 mt-1" style={{ justifyContent: 'flex-start' }}>
                        {member.role === 'admin' ? (
                          <span style={{ color: 'var(--reward-dark)', fontWeight: 700 }} className="flex-center gap-1">
                            <ShieldCheck size={13} /> Admin
                          </span>
                        ) : (
                          <span className="flex-center gap-1">
                            <User size={13} /> Miembro
                          </span>
                        )}
                        <span>· Lvl {member.level || 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-center gap-1">
                    <button
                      onClick={() => setManagingTasksMemberId(isManagingTasks ? null : member.id)}
                      className="btn btn-sm btn-secondary flex-center gap-1"
                    >
                      <ClipboardList size={14} /> 
                      <span>Tareas</span> 
                      {isManagingTasks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {member.id !== currentUser.id && (
                      <>
                        <button
                          onClick={() => handleToggleRole(member.id, member.role)}
                          className="btn btn-sm btn-ghost"
                          title="Cambiar Rol"
                        >
                          {member.role === 'admin' ? <User size={16} /> : <ShieldCheck size={16} color="var(--reward-dark)" />}
                        </button>

                        <button
                          onClick={() => handleDeleteMember(member.id, member.name)}
                          className="btn btn-icon btn-ghost"
                          style={{ color: 'var(--error)', width: '32px', height: '32px' }}
                          title="Eliminar Miembro"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Task Assignment Drawer */}
                {isManagingTasks && (
                  <div className="mt-4 pt-3 animate-in" style={{ borderTop: '1px dashed var(--border-light)' }}>
                    <div className="text-label-sm mb-2" style={{ fontWeight: 700, color: 'var(--fg-primary)' }}>
                      Asignar o Quitar Tareas a {member.name}:
                    </div>

                    {tasks.length === 0 ? (
                      <div className="text-label-sm">No hay tareas creadas. Crea alguna en el panel admin.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {tasks.map(t => {
                          const isAssigned = Array.isArray(t.assignedTo) && t.assignedTo.some(a => (typeof a === 'object' ? a.memberId === member.id : a === member.id));
                          
                          return (
                            <div
                              key={t.id}
                              className="flex-between card card-flat"
                              style={{
                                padding: '8px 12px',
                                border: isAssigned ? '1px solid var(--primary-light)' : '1px solid var(--border-light)',
                                background: isAssigned ? 'var(--primary-bg)' : 'var(--bg-card)'
                              }}
                            >
                              <div className="flex-center gap-2">
                                <span style={{ fontSize: '1.2rem' }}>{t.emoji || t.icon || '📋'}</span>
                                <div>
                                  <div className="text-body-bold" style={{ fontSize: '0.85rem' }}>{t.title}</div>
                                  <div className="text-label-sm" style={{ fontSize: '0.72rem' }}>
                                    +{t.xp || t.points || 0} XP
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => toggleTaskAssignment?.(t.id, member.id)}
                                className={`btn btn-sm ${isAssigned ? 'btn-ghost' : 'btn-primary'} flex-center gap-1`}
                                style={{ color: isAssigned ? 'var(--error)' : undefined }}
                              >
                                {isAssigned ? (
                                  <>
                                    <Minus size={13} /> Quitar
                                  </>
                                ) : (
                                  <>
                                    <Plus size={13} /> Asignar
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

    </div>
  );
};

export default AdminMembers;
