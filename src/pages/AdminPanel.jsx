import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Users, Settings, PlusCircle, Gift, ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { tasks = [], currentUser, members = [], claimedRewards = [] } = useFamily();

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="page text-center pb-tab flex-center" style={{ minHeight: '60dvh' }}>
        <div className="card" style={{ padding: 'var(--sp-8)' }}>
          <AlertCircle size={40} color="var(--error)" style={{ margin: '0 auto 12px' }} />
          <h2 className="text-section">Acceso Administrador</h2>
          <p className="text-label mt-2">Se requieren permisos de administrador de familia para esta sección.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-4">
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  // Count verification requests (handling both status conventions)
  const pendingRequests = tasks.filter(t => {
    if (t.status === 'sent' || t.status === 'pending_verification') return true;
    if (Array.isArray(t.assignedTo)) {
      return t.assignedTo.some(a => (typeof a === 'object' ? a.status === 'pending_verification' : false));
    }
    return false;
  }).length;

  const pendingRewards = claimedRewards.filter(c => c.status === 'pending').length;

  const menuItems = [
    {
      title: 'Verificar Tareas',
      subtitle: pendingRequests > 0 ? `${pendingRequests} entregas pendientes` : 'Todo verificado por ahora',
      icon: <CheckSquare size={24} color="var(--primary)" />,
      badge: pendingRequests,
      onClick: () => navigate('/admin/verify')
    },
    {
      title: 'Entregar Recompensas',
      subtitle: pendingRewards > 0 ? `${pendingRewards} canjes solicitados` : 'Sin canjes pendientes',
      icon: <Gift size={24} color="var(--reward-dark)" />,
      badge: pendingRewards,
      onClick: () => navigate('/profile?tab=shop')
    },
    {
      title: 'Crear Nueva Tarea',
      subtitle: `${tasks.length} tareas activas`,
      icon: <PlusCircle size={24} color="var(--success-dark)" />,
      onClick: () => navigate('/admin/create-task')
    },
    {
      title: 'Gestionar Miembros',
      subtitle: `${members.length} miembros registrados`,
      icon: <Users size={24} color="var(--info)" />,
      onClick: () => navigate('/admin/members')
    },
    {
      title: 'Configuración Familiar',
      subtitle: 'Ajustes del grupo y de la app',
      icon: <Settings size={24} color="var(--fg-secondary)" />,
      onClick: () => navigate('/admin/settings')
    }
  ];

  return (
    <div className="page pb-tab">
      
      <div className="page-header">
        <h1 className="page-title">
          <ShieldCheck size={26} color="var(--primary)" />
          <span>Panel Administrador</span>
        </h1>
      </div>

      <div className="admin-grid mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {menuItems.map((item, idx) => (
          <button 
            key={idx}
            onClick={item.onClick}
            className="menu-item card card-interactive stagger-item"
            style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px' }}
          >
            <div className="menu-icon" style={{ background: 'var(--primary-bg)', width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', flexShrink: 0 }}>
              {item.icon}
            </div>
            
            <div className="menu-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="menu-title flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                <span className="text-body-bold" style={{ fontSize: '1rem' }}>{item.title}</span>
                {item.badge > 0 && (
                  <span className="tab-badge" style={{ position: 'static', transform: 'none' }}>
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="menu-subtitle text-label-sm" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                {item.subtitle}
              </div>
            </div>

            <ChevronRight size={20} className="menu-arrow" />
          </button>
        ))}
      </div>

    </div>
  );
};

export default AdminPanel;
