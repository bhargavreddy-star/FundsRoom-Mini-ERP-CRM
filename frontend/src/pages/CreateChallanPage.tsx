import React, { useState, useEffect } from 'react';
import { customersApi, productsApi, challansApi } from '../api/client';
import { Customer, Product } from '../types';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

export const CreateChallanPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState<{ productId: string, quantity: number, product?: Product }[]>([]);
  const [curProduct, setCurProduct] = useState('');
  const [curQty, setCurQty] = useState(1);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    customersApi.list({ limit: 100 }).then(res => setCustomers(res.data));
    productsApi.list({ limit: 100 }).then(res => setProducts(res.data));
  }, []);

  const handleAddItem = () => {
    if (!curProduct || curQty <= 0) return;
    const prod = products.find(p => p.id === curProduct);
    if (!prod) return;
    if (prod.currentStock < curQty) {
      showToast('Not enough stock', 'warning');
      return;
    }
    setItems([...items, { productId: curProduct, quantity: curQty, product: prod }]);
    setCurProduct('');
    setCurQty(1);
  };

  const handleSave = async (status: 'DRAFT' | 'CONFIRMED') => {
    if (!selectedCustomer || items.length === 0) {
      showToast('Please select customer and add items', 'warning');
      return;
    }
    try {
      const payload = {
        customerId: selectedCustomer,
        status,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      };
      const res = await challansApi.create(payload);
      showToast(`Challan ${status.toLowerCase()} successfully`);
      navigate(`/challans/${res.id}`);
    } catch (err) {
      showToast('Error creating challan', 'error');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Create Challan</h2>
      <div className="card fade-in" style={{ marginBottom: '1.5rem' }}>
        <h3>Step 1: Select Customer</h3>
        <select className="select" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} style={{ marginTop: '1rem', maxWidth: '400px' }}>
          <option value="">-- Select Customer --</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.businessName})</option>)}
        </select>
      </div>

      <div className="card fade-in" style={{ marginBottom: '1.5rem' }}>
        <h3>Step 2: Add Items</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
          <select className="select" value={curProduct} onChange={e => setCurProduct(e.target.value)} style={{ flex: 1 }}>
            <option value="">-- Select Product --</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>)}
          </select>
          <input type="number" className="input" style={{ width: '100px' }} value={curQty} onChange={e => setCurQty(Number(e.target.value))} min={1} />
          <button className="btn btn-secondary" onClick={handleAddItem}>Add</button>
        </div>
        
        {items.length > 0 && (
          <div className="table-container" style={{ marginTop: '1.5rem' }}>
            <table className="table">
              <thead><tr><th>Product</th><th>SKU</th><th>Price</th><th>Qty</th><th>Total</th><th>Action</th></tr></thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.product?.name}</td>
                    <td>{it.product?.sku}</td>
                    <td>${it.product?.unitPrice}</td>
                    <td>{it.quantity}</td>
                    <td>${(it.product?.unitPrice || 0) * it.quantity}</td>
                    <td><button className="btn btn-danger" onClick={() => setItems(items.filter((_, i) => i !== idx))}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card fade-in" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={() => handleSave('DRAFT')}>Save as Draft</button>
        <button className="btn btn-primary" onClick={() => handleSave('CONFIRMED')}>Confirm Challan</button>
      </div>
    </div>
  );
};
