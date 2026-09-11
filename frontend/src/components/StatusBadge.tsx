import React from 'react';

type StatusType = 'LEAD' | 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export const StatusBadge: React.FC<{ status: StatusType }> = ({ status }) => {
  let badgeClass = 'badge-info';
  if (status === 'ACTIVE' || status === 'CONFIRMED') badgeClass = 'badge-success';
  if (status === 'INACTIVE' || status === 'CANCELLED') badgeClass = 'badge-danger';
  if (status === 'DRAFT') badgeClass = 'badge-warning';

  return (
    <span className={`badge ${badgeClass}`}>
      {status}
    </span>
  );
};
