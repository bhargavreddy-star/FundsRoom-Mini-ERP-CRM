import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination: React.FC<{ page: number; totalPages: number; setPage: (p: number) => void }> = ({ page, totalPages, setPage }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
      <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16}/> Prev</button>
      <span>Page {page} of {totalPages || 1}</span>
      <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next <ChevronRight size={16}/></button>
    </div>
  );
};
