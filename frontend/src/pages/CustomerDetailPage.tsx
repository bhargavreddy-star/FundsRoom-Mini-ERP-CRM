import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { customersApi } from '../api/client';
import { Customer, FollowUp } from '../types';
import { useToast } from '../components/Toast';
import { StatusBadge } from '../components/StatusBadge';

export const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [note, setNote] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (id) {
      customersApi.getById(id).then(setCustomer).catch(() => showToast('Error loading customer', 'error'));
      customersApi.getFollowUps(id).then(setFollowUps).catch(() => showToast('Error loading follow-ups', 'error'));
    }
  }, [id]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !note) return;
    try {
      const res = await customersApi.addFollowUp(id, { note });
      setFollowUps([res, ...followUps]);
      setNote('');
      showToast('Follow-up added');
    } catch (err) {
      showToast('Error adding follow-up', 'error');
    }
  };

  if (!customer) return <div>Loading...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div className="card fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>{customer.name}</h2>
          <StatusBadge status={customer.status as any} />
        </div>
        <p style={{ color: 'var(--text-muted)' }}>{customer.businessName} - {customer.customerType}</p>
        <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.5rem' }}>
          <div><strong>Email:</strong> {customer.email}</div>
          <div><strong>Mobile:</strong> {customer.mobile}</div>
          <div><strong>Address:</strong> {customer.address}</div>
        </div>
      </div>
      
      <div className="card fade-in">
        <h3>Follow-ups</h3>
        <form onSubmit={handleAddFollowUp} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input className="input" placeholder="Add a note..." value={note} onChange={e => setNote(e.target.value)} />
          <button type="submit" className="btn btn-primary">Add</button>
        </form>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
          {followUps.map(f => (
            <div key={f.id} style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>{f.note}</p>
              <small style={{ color: 'var(--text-muted)' }}>{new Date(f.createdAt).toLocaleString()} by {f.createdBy}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
