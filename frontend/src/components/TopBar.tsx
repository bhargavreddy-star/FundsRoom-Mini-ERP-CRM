import React from 'react';
import { Menu, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TopBar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { logout, user } = useAuth();
  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--bg-card)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={toggleSidebar} className="btn btn-ghost" style={{ padding: '0.5rem' }}><Menu size={20}/></button>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search..." style={{ paddingLeft: '2.5rem', width: '300px' }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span className="badge badge-success">{user?.role}</span>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          {user?.name?.[0]}
        </div>
        <button onClick={logout} className="btn btn-ghost" style={{ padding: '0.5rem' }}><LogOut size={20}/></button>
      </div>
    </header>
  );
};
