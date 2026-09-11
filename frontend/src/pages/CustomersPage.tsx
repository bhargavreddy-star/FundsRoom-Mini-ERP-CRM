import React, { useState, useEffect } from 'react';
import { customersApi } from '../api/client';
import { Customer } from '../types';
import { SearchInput } from '../components/SearchInput';
import { Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export const CustomersPage = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', businessName: '', mobile: '', email: '', customerType: 'RETAIL', status: 'LEAD', address: '' });

  const loadData = async () => {
    try {
      const res = await customersApi.list({ page, limit: 10, search });
      setCustomers(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      showToast('Error loading customers', 'error');
    }
  };

  useEffect(() => { loadData(); }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customersApi.create(formData);
      showToast('Customer created successfully');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Failed to create customer', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Customers (CRM)</h2>
        {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Customer</button>
        )}
      </div>

      <div className="card fade-in">
        <div style={{ marginBottom: '1rem', width: '300px' }}>
          <SearchInput value={search} onChange={val => { setSearch(val); setPage(1); }} placeholder="Search customers..." />
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Business</th>
                <th>Type</th>
                <th>Status</th>
                <th>Mobile</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} onClick={() => navigate(`/customers/${c.id}`)} style={{ cursor: 'pointer' }}>
                  <td>{c.name}</td>
                  <td>{c.businessName}</td>
                  <td>{c.customerType}</td>
                  <td><StatusBadge status={c.status as any} /></td>
                  <td>{c.mobile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Customer">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input className="input" placeholder="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input className="input" placeholder="Business Name" required value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
          <input className="input" placeholder="Mobile" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
          <input className="input" placeholder="Email" required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <select className="select" value={formData.customerType} onChange={e => setFormData({...formData, customerType: e.target.value})}>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </Modal>
    </div>
  );
};
