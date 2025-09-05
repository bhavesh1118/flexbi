import React, { useState } from 'react';

interface DataFiltersProps {
  data: any[];
  columns: string[];
  onFilter: (filtered: any[]) => void;
}

const getCategoricalColumns = (data: any[], columns: string[]) => {
  return columns.filter(col => data.some(row => typeof row[col] === 'string' && row[col] !== ''));
};

const DataFilters: React.FC<DataFiltersProps> = ({ data, columns, onFilter }) => {
  const catCols = getCategoricalColumns(data, columns);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleChange = (col: string, value: string) => {
    const newFilters = { ...filters, [col]: value };
    setFilters(newFilters);
    let filtered = data;
    Object.entries(newFilters).forEach(([c, v]) => {
      if (v !== '') filtered = filtered.filter(row => row[c] === v);
    });
    onFilter(filtered);
  };

  if (catCols.length === 0) return null;

  return (
    <div className="flex gap-4 my-2">
      {catCols.map((col, colIdx) => {
        const unique = Array.from(new Set(data.map(row => row[col]).filter(Boolean)));
        return (
          <div key={col || `catcol-${colIdx}`}>
            <label className="block text-xs font-semibold mb-1">{col}</label>
            <select
              className="border px-2 py-1"
              value={filters[col] || ''}
              onChange={e => handleChange(col, e.target.value)}
            >
              <option value="">All</option>
              {unique.map((v, vIdx) => (
                <option key={v || `opt-${colIdx}-${vIdx}`} value={v}>{v}</option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
};

export default DataFilters; 