import React, { useState } from 'react';

interface InsightsPanelProps {
  data: any[];
  columns: string[];
}

const getTopCategories = (data: any[], col: string) => {
  const counts: Record<string, number> = {};
  data.forEach(row => {
    const val = row[col];
    if (val !== null && val !== undefined && val !== '') {
      counts[val] = (counts[val] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1]);
};

const getNumericColumns = (data: any[], columns: string[]) => {
  return columns.filter(col => data.some(row => !isNaN(Number(row[col])) && row[col] !== null && row[col] !== ''));
};

const getDateColumns = (data: any[], columns: string[]) => {
  return columns.filter(col => data.some(row => !isNaN(Date.parse(row[col]))));
};

// const getOutliers = (data: any[], col: string) => {
//   const values = data.map(row => Number(row[col])).filter(v => !isNaN(v));
//   if (values.length === 0) return [];
//   const q1 = values[Math.floor(values.length * 0.25)];
//   const q3 = values[Math.floor(values.length * 0.75)];
//   const iqr = q3 - q1;
//   const lower = q1 - 1.5 * iqr;
//   const upper = q3 + 1.5 * iqr;
//   return values.filter(v => v < lower || v > upper);
// };

const getCorrelation = (data: any[], col1: string, col2: string) => {
  const x = data.map(row => Number(row[col1])).filter(v => !isNaN(v));
  const y = data.map(row => Number(row[col2])).filter(v => !isNaN(v));
  if (x.length !== y.length || x.length === 0) return null;
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  const num = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
  const den = Math.sqrt(x.reduce((sum, xi) => sum + (xi - meanX) ** 2, 0) * y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0));
  if (den === 0) return null;
  return (num / den).toFixed(2);
};

const InsightsPanel: React.FC<InsightsPanelProps> = ({ data, columns }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!data || !columns || columns.length === 0) return null;

  const numCols = getNumericColumns(data, columns);
  const dateCols = getDateColumns(data, columns);
  const catCols = columns.filter(col => !numCols.includes(col) && !dateCols.includes(col));

  return (
    <div className="my-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Key Insights</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {isExpanded && (
        <ul className="list-disc pl-6">
          {catCols.map((col, catIdx) => {
            const top = getTopCategories(data, col);
            return top.length > 0 ? (
              <li key={col || `catcol-${catIdx}`}>Top categories in <b>{col}</b>: {top.map(([v, c]) => `${v} (${c})`).join(', ')}</li>
            ) : null;
          })}
          {dateCols.map((col, dateIdx) => (
            <li key={col || `datecol-${dateIdx}`}>Trend detected in <b>{col}</b>: {`Check line chart for time-based trends.`}</li>
          ))}
          {/* Commented out outlier detection for now */}
          {/* {numCols.map((col, numIdx) => {
            const outliers = getOutliers(data, col);
            return outliers.length > 0 ? (
              <li key={col || `numcol-${numIdx}`}>Outliers detected in <b>{col}</b>: {outliers.join(', ')}</li>
            ) : null;
          })} */}
          {numCols.length > 1 && (
            <li>
              Correlations:
              <ul className="list-disc pl-6">
                {numCols.map((col1, i) => numCols.slice(i + 1).map((col2, j) => {
                  const corr = getCorrelation(data, col1, col2);
                  const corrKey = `${col1 || `numcol1-${i}`}-${col2 || `numcol2-${j}`}`;
                  return corr ? (
                    <li key={corrKey}><b>{col1}</b> & <b>{col2}</b>: {corr}</li>
                  ) : null;
                }))}
              </ul>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default InsightsPanel; 