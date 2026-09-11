import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

export const StatsCard: React.FC<{ title: string; value: string | number; icon: any; trend?: string }> = ({ title, value, icon: Icon, trend }) => {
  return (
    <div className="card fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
        <Icon size={24} color="var(--accent-primary)" />
      </div>
      <div>
        <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>{title}</h4>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
        {trend && <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem' }}>{trend}</div>}
      </div>
    </div>
  );
};
