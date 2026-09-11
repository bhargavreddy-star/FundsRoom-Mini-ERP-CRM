import React, { useEffect, useState } from 'react';
import { StatsCard } from '../components/StatsCard';
import { Users, Package, AlertTriangle, FileText, PlusCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { customersApi, productsApi, challansApi } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ customers: 0, products: 0, challans: 0 });
  const [recentChallans, setRecentChallans] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      customersApi.list({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
      productsApi.list({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
      challansApi.list({ limit: 5 }).catch(() => ({ data: [], pagination: { total: 0 } }))
    ]).then(([c, p, ch]) => {
      setStats({ 
        customers: c.pagination?.total || 0, 
        products: p.pagination?.total || 0, 
        challans: ch.pagination?.total || 0 
      });
      setRecentChallans(ch.data || []);
    });
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Welcome back, {user?.name}</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            {user?.role === 'ADMIN' && 'System Administrator Portal — Full Operational Access'}
            {user?.role === 'SALES' && 'Sales & CRM Operations Workspace — Lead Pipeline & Order Dispatch'}
            {user?.role === 'WAREHOUSE' && 'Warehouse & Stock Operations Workspace — Inventory Tracking'}
            {user?.role === 'ACCOUNTS' && 'Accounts & Billing Operations Workspace — Sales Audit & Records'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
            <Link to="/challans/new" className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <PlusCircle size={18} /> New Challan
            </Link>
          )}
          {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && (
            <Link to="/products" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
              <Package size={18} /> Manage Stock
            </Link>
          )}
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {(user?.role === 'ADMIN' || user?.role === 'SALES' || user?.role === 'ACCOUNTS') && (
          <StatsCard title="Total Customers" value={stats.customers} icon={Users} />
        )}
        {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE' || user?.role === 'ACCOUNTS') && (
          <StatsCard title="Total Products" value={stats.products} icon={Package} />
        )}
        {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && (
          <StatsCard title="Stock Alert Items" value={2} icon={AlertTriangle} />
        )}
        <StatsCard title="Sales Delivery Challans" value={stats.challans} icon={FileText} />
      </div>

      {/* Role Focused Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>
              {user?.role === 'SALES' ? 'My Recent Sales Delivery Challans' : 
               user?.role === 'WAREHOUSE' ? 'Recent Dispatch Operations' : 
               user?.role === 'ACCOUNTS' ? 'Recent Account Transactions' : 'Recent System Challans'}
            </h3>
            <Link to="/challans" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th>Total Qty</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentChallans.map(ch => (
                  <tr key={ch.id}>
                    <td style={{ fontWeight: 600 }}>{ch.challanNumber}</td>
                    <td>{ch.customer?.name || 'Customer'}</td>
                    <td>{ch.totalQuantity} pcs</td>
                    <td><StatusBadge status={ch.status} /></td>
                    <td>{new Date(ch.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {recentChallans.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center' }}>No recent challans found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
