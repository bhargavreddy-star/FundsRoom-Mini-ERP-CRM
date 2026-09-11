import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export const SearchInput: React.FC<{ value: string; onChange: (val: string) => void; placeholder?: string }> = ({ value, onChange, placeholder = "Search..." }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => onChange(localValue), 500);
    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  return (
    <div style={{ position: 'relative' }}>
      <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      <input 
        className="input" 
        value={localValue} 
        onChange={e => setLocalValue(e.target.value)} 
        placeholder={placeholder} 
        style={{ paddingLeft: '2.5rem' }} 
      />
    </div>
  );
};
