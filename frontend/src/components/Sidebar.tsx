import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) => {
  const { user } = useAuth();
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: isOpen ? 0 : '-100%',
      top: 0,
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      transition: 'var(--transition)',
      zIndex: 40,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>FundsRoom ERP</h2>
      </div>
      <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <NavLink to="/" end className={({ isActive }) => `btn btn-ghost ${isActive ? 'active' : ''}`} style={{ justifyContent: 'flex-start' }}><LayoutDashboard size={20}/> Dashboard</NavLink>
        
        {(user?.role === 'ADMIN' || user?.role === 'SALES' || user?.role === 'ACCOUNTS') && (
          <NavLink to="/customers" className={({ isActive }) => `btn btn-ghost ${isActive ? 'active' : ''}`} style={{ justifyContent: 'flex-start' }}><Users size={20}/> Customers (CRM)</NavLink>
        )}

        {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE' || user?.role === 'ACCOUNTS') && (
          <NavLink to="/products" className={({ isActive }) => `btn btn-ghost ${isActive ? 'active' : ''}`} style={{ justifyContent: 'flex-start' }}><Package size={20}/> Products & Stock</NavLink>
        )}

        <NavLink to="/challans" className={({ isActive }) => `btn btn-ghost ${isActive ? 'active' : ''}`} style={{ justifyContent: 'flex-start' }}><FileText size={20}/> Sales Challans</NavLink>

        {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
          <NavLink to="/challans/new" className={({ isActive }) => `btn btn-ghost ${isActive ? 'active' : ''}`} style={{ justifyContent: 'flex-start', color: 'var(--accent-primary)', fontWeight: 600 }}>+ Create Challan</NavLink>
        )}
      </nav>
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</p>
        <span className={`badge ${user?.role === 'ADMIN' ? 'badge-danger' : user?.role === 'SALES' ? 'badge-info' : user?.role === 'WAREHOUSE' ? 'badge-warning' : 'badge-success'}`}>
          {user?.role} ROLE
        </span>
      </div>
    </aside>
  );
};
