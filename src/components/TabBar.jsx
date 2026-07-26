import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Trophy, User, Shield } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const TabBar = () => {
  const { currentUser, tasks } = useFamily();
  const location = useLocation();

  if (!currentUser) return null;

  // Count pending verification tasks for admins
  const pendingCount = currentUser?.role === 'admin' 
    ? tasks?.filter(t => t.status === 'sent' || (t.assignedTo && t.assignedTo.some(a => a.status === 'pending_verification')))?.length || 0
    : 0;

  const isHomeActive = location.pathname === '/' || location.pathname === '/dashboard';

  return (
    <nav className="tab-bar">
      <NavLink 
        to="/dashboard" 
        className={() => `tab-item ${isHomeActive ? 'active' : ''}`}
      >
        <Home size={22} />
        <span>Inicio</span>
      </NavLink>

      <NavLink 
        to="/tasks" 
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <ClipboardList size={22} />
        <span>Tareas</span>
      </NavLink>

      <NavLink 
        to="/leaderboard" 
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <Trophy size={22} />
        <span>Ranking</span>
      </NavLink>

      <NavLink 
        to="/profile" 
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <User size={22} />
        <span>Perfil</span>
      </NavLink>

      {currentUser.role === 'admin' && (
        <NavLink 
          to="/admin" 
          className={({ isActive }) => `tab-item ${isActive || location.pathname.startsWith('/admin') ? 'active' : ''}`}
        >
          <Shield size={22} />
          <span>Admin</span>
          {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
        </NavLink>
      )}
    </nav>
  );
};

export default TabBar;
