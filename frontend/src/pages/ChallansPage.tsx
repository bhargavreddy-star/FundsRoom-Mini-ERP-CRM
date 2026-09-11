import React, { useState, useEffect } from 'react';
import { challansApi } from '../api/client';
import { Challan } from '../types';
import { SearchInput } from '../components/SearchInput';
import { Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

export const ChallansPage = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const res = await challansApi.list({ page, limit: 10, search });
      setChallans(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      showToast('Error loading challans', 'error');
    }
  };

  useEffect(() => { loadData(); }, [page, search]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Challans</h2>
        <button className="btn btn-primary" onClick={() => navigate('/challans/new')}>Create Challan</button>
      </div>

      <div className="card fade-in">
        <div style={{ marginBottom: '1rem', width: '300px' }}>
          <SearchInput value={search} onChange={val => { setSearch(val); setPage(1); }} placeholder="Search challans..." />
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
              {challans.map(c => (
                <tr key={c.id} onClick={() => navigate(`/challans/${c.id}`)} style={{ cursor: 'pointer' }}>
                  <td>{c.challanNumber}</td>
                  <td>{c.customer?.name}</td>
                  <td>{c.totalQuantity}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </div>
  );
};
