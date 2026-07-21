import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FamilyProvider, useFamily } from './context/FamilyContext';
import TabBar from './components/TabBar';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import FamilySetup from './pages/FamilySetup';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import AdminVerify from './pages/AdminVerify';
import AdminCreateTask from './pages/AdminCreateTask';
import AdminMembers from './pages/AdminMembers';
import Settings from './pages/Settings';

const RequireAuth = ({ children }) => {
  const { currentUser } = useFamily();
  return currentUser ? children : <Navigate to="/login" replace />;
};

const RequireFamily = ({ children }) => {
  const { currentUser } = useFamily();
  if (!currentUser) return <Navigate to="/login" replace />;
  return currentUser.familyId ? children : <Navigate to="/family-setup" replace />;
};

const AppContent = () => {
  const location = useLocation();
  const { currentUser } = useFamily();

  // Hide TabBar on auth and family-setup pages
  const hideTabBarPaths = ['/login', '/register', '/family-setup'];
  const showTabBar = !hideTabBarPaths.includes(location.pathname) && currentUser && currentUser.familyId;

  return (
    <div style={{ minHeight: '100dvh', position: 'relative' }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated, but no family yet */}
        <Route 
          path="/family-setup" 
          element={
            <RequireAuth>
              <FamilySetup />
            </RequireAuth>
          } 
        />

        {/* Authenticated and in family */}
        <Route 
          path="/" 
          element={
            <RequireFamily>
              <Dashboard />
            </RequireFamily>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <RequireFamily>
              <Dashboard />
            </RequireFamily>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <RequireFamily>
              <Tasks />
            </RequireFamily>
          } 
        />
        <Route 
          path="/tasks/:id" 
          element={
            <RequireFamily>
              <TaskDetail />
            </RequireFamily>
          } 
        />
        <Route 
          path="/leaderboard" 
          element={
            <RequireFamily>
              <Leaderboard />
            </RequireFamily>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <RequireFamily>
              <Profile />
            </RequireFamily>
          } 
        />
        
        {/* Admin only routes */}
        <Route 
          path="/admin" 
          element={
            <RequireFamily>
              <AdminPanel />
            </RequireFamily>
          } 
        />
        <Route 
          path="/admin/verify" 
          element={
            <RequireFamily>
              <AdminVerify />
            </RequireFamily>
          } 
        />
        <Route 
          path="/admin/create-task" 
          element={
            <RequireFamily>
              <AdminCreateTask />
            </RequireFamily>
          } 
        />
        <Route 
          path="/admin/members" 
          element={
            <RequireFamily>
              <AdminMembers />
            </RequireFamily>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <RequireFamily>
              <Settings />
            </RequireFamily>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {showTabBar && <TabBar />}
    </div>
  );
};

const App = () => {
  return (
    <FamilyProvider>
      <Router>
        <AppContent />
      </Router>
    </FamilyProvider>
  );
};

export default App;
