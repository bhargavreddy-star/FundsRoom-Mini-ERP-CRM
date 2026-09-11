import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challansApi } from '../api/client';
import { Challan } from '../types';
import { useToast } from '../components/Toast';
import { StatusBadge } from '../components/StatusBadge';

import { useAuth } from '../context/AuthContext';

export const ChallanDetailPage = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<Challan | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadData = () => {
    if (id) {
      challansApi.getById(id).then(setChallan).catch(() => showToast('Error loading challan', 'error'));
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleAction = async (action: 'confirm' | 'cancel') => {
    if (!id || !window.confirm(`Are you sure you want to ${action} this challan?`)) return;
    try {
      if (action === 'confirm') await challansApi.confirm(id);
      if (action === 'cancel') await challansApi.cancel(id);
      showToast(`Challan ${action}ed`);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || `Error trying to ${action} challan`, 'error');
    }
  };

  if (!challan) return <div>Loading...</div>;

  return (
    <div>
      <div className="card fade-in" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>Challan #{challan.challanNumber}</h2>
          <div style={{ color: 'var(--text-muted)' }}>Date: {new Date(challan.createdAt).toLocaleDateString()}</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <StatusBadge status={challan.status} />
          {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE' || user?.role === 'SALES') && challan.status === 'DRAFT' && (
            <button className="btn btn-primary" onClick={() => handleAction('confirm')}>Confirm Dispatch</button>
          )}
          {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE' || user?.role === 'SALES') && challan.status !== 'CANCELLED' && (
            <button className="btn btn-danger" onClick={() => handleAction('cancel')}>Cancel Challan</button>
          )}
        </div>
      </div>

      <div className="card fade-in" style={{ marginBottom: '1.5rem' }}>
        <h3>Customer Details</h3>
        <p><strong>Name:</strong> {challan.customer?.name}</p>
        <p><strong>Business:</strong> {challan.customer?.businessName}</p>
        <p><strong>Mobile:</strong> {challan.customer?.mobile}</p>
      </div>

      <div className="card fade-in">
        <h3>Items</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items?.map(it => (
                <tr key={it.id}>
                  <td>{it.productName}</td>
                  <td>{it.productSku}</td>
                  <td>${it.productUnitPrice}</td>
                  <td>{it.quantity}</td>
                  <td>${it.productUnitPrice * it.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold', padding: '1rem' }}>Total Quantity:</td>
                <td style={{ fontWeight: 'bold', padding: '1rem' }}>{challan.totalQuantity}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
