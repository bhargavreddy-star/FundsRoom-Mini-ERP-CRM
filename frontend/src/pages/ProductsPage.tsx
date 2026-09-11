import React, { useState, useEffect } from 'react';
import { productsApi } from '../api/client';
import { Product } from '../types';
import { SearchInput } from '../components/SearchInput';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', sku: '', category: '', unitPrice: 0, minStockAlert: 10, warehouse: 'Main' });

  const loadData = async () => {
    try {
      const res = await productsApi.list({ page, limit: 10, search });
      setProducts(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      showToast('Error loading products', 'error');
    }
  };

  useEffect(() => { loadData(); }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productsApi.create({...formData, unitPrice: Number(formData.unitPrice), minStockAlert: Number(formData.minStockAlert)});
      showToast('Product created successfully');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Failed to create product', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Products & Stock</h2>
        {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Product</button>
        )}
      </div>

      <div className="card fade-in">
        <div style={{ marginBottom: '1rem', width: '300px' }}>
          <SearchInput value={search} onChange={val => { setSearch(val); setPage(1); }} placeholder="Search products..." />
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} onClick={() => navigate(`/products/${p.id}`)} style={{ cursor: 'pointer' }}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{p.category}</td>
                  <td>${p.unitPrice}</td>
                  <td style={{ color: p.currentStock <= p.minStockAlert ? 'var(--danger)' : 'var(--success)' }}>
                    {p.currentStock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Product">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input className="input" placeholder="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input className="input" placeholder="SKU" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
          <input className="input" placeholder="Category" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
          <input className="input" type="number" placeholder="Unit Price" required value={formData.unitPrice || ''} onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})} />
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </Modal>
    </div>
  );
};
