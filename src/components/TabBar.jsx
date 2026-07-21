import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Trophy, User, Shield } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const TabBar = () => {
  const { currentUser, tasks } = useFamily();

  if (!currentUser) return null;

  // Count pending verification tasks for admins
  const pendingCount = currentUser.role === 'admin' 
    ? tasks.filter(t => t.status === 'sent').length 
    : 0;

  return (
    <nav className="tab-bar">
      <NavLink 
        to="/" 
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
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
          className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
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
