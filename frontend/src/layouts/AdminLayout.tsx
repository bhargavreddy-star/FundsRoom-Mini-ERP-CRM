import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
      <div style={{ 
        flex: 1, 
        marginLeft: sidebarOpen ? 'var(--sidebar-width)' : 0,
        transition: 'var(--transition)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
