import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productsApi } from '../api/client';
import { Product, StockMovement } from '../types';
import { useToast } from '../components/Toast';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ type: 'IN', quantity: 0, reason: '' });

  const loadData = () => {
    if (id) {
      productsApi.getById(id).then(setProduct).catch(() => showToast('Error loading product', 'error'));
      productsApi.getStockMovements(id).then(setMovements).catch(() => showToast('Error loading movements', 'error'));
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || formData.quantity <= 0) return;
    try {
      await productsApi.addStockMovement(id, formData);
      setFormData({ type: 'IN', quantity: 0, reason: '' });
      showToast('Stock movement added');
      loadData();
    } catch (err) {
      showToast('Error adding stock movement', 'error');
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div className="card fade-in">
        <h2>{product.name}</h2>
        <p style={{ color: 'var(--text-muted)' }}>SKU: {product.sku} | Category: {product.category}</p>
        <div style={{ marginTop: '1.5rem' }}>
          <div><strong>Price:</strong> ${product.unitPrice}</div>
          <div><strong>Stock:</strong> <span style={{ color: product.currentStock <= product.minStockAlert ? 'var(--danger)' : 'var(--success)' }}>{product.currentStock}</span></div>
          <div><strong>Warehouse:</strong> {product.warehouse}</div>
        </div>
        <div style={{ marginTop: '1rem', background: 'var(--bg-glass)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min((product.currentStock / 100) * 100, 100)}%`, background: product.currentStock <= product.minStockAlert ? 'var(--danger)' : 'var(--success)' }} />
        </div>
      </div>
      
      <div className="card fade-in">
        <h3>Stock Movements</h3>
        <form onSubmit={handleAddMovement} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <select className="select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100px' }}>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>
          <input className="input" type="number" placeholder="Qty" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} style={{ width: '80px' }} />
          <input className="input" placeholder="Reason" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
          <button type="submit" className="btn btn-primary">Add</button>
        </form>
        <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Qty</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.id}>
                  <td style={{ color: m.type === 'IN' ? 'var(--success)' : 'var(--danger)' }}>{m.type}</td>
                  <td>{m.quantity}</td>
                  <td>{m.reason}</td>
                  <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
