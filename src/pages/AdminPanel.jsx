import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Users, Settings, PlusCircle, LayoutGrid, Calendar, ChevronRight } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { tasks, currentUser, members, claimedRewards = [] } = useFamily();

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="page text-center">
        <h2>Acceso Denegado 🔒</h2>
        <p>Solo los administradores de la familia pueden ver esta sección.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary mt-4">
          Ir al Inicio
        </button>
      </div>
    );
  }

  // Count verification requests and reward claims
  const pendingRequests = tasks.filter(t => t.status === 'sent').length;
  const pendingRewards = claimedRewards.filter(c => c.status === 'pending').length;

  const menuItems = [
    {
      title: 'Verificar Completadas',
      subtitle: `${pendingRequests} pendientes de validar`,
      icon: '✅',
      badge: pendingRequests,
      onClick: () => navigate('/admin/verify')
    },
    {
      title: 'Entregar Recompensas',
      subtitle: `${pendingRewards} solicitudes de canje`,
      icon: '🎁',
      badge: pendingRewards,
      onClick: () => navigate('/profile?tab=shop')
    },
    {
      title: 'Crear / Editar Tareas',
      subtitle: `${tasks.length} tareas configuradas`,
      icon: '📋',
      onClick: () => navigate('/admin/create-task')
    },
    {
      title: 'Gestionar Miembros',
      subtitle: `${members.length} miembros unidos`,
      icon: '👥',
      onClick: () => navigate('/admin/members')
    },
    {
      title: 'Configuración Familiar',
      subtitle: 'Ajustes del hogar y gamificación',
      icon: '⚙️',
      onClick: () => navigate('/admin/settings')
    }
  ];

  return (
    <div className="page">
      <div className="page-header" style={{ paddingBottom: '0px' }}>
        <h1 className="page-title">Panel de Control 👑</h1>
      </div>

      <div className="mt-6" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {menuItems.map((item, idx) => (
          <button 
            key={idx}
            onClick={item.onClick}
            className="menu-item"
            style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
          >
            <div className="menu-icon">{item.icon}</div>
            <div className="menu-info">
              <div className="menu-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.title}
                {item.badge > 0 && (
                  <span className="tab-badge" style={{ position: 'static', transform: 'none' }}>
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="menu-subtitle">{item.subtitle}</div>
            </div>
            <ChevronRight size={18} className="menu-arrow" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
