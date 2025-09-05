import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, ComposedChart,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFE', '#FF6699'];

const chartTypeOptions = [
  { type: 'bar', label: 'Bar Chart' },
  { type: 'pie', label: 'Pie Chart' },
  { type: 'line', label: 'Line Chart' },
  { type: 'scatter', label: 'Scatter Plot' },
  { type: 'area', label: 'Area Chart' },
  { type: 'radar', label: 'Radar Chart' },
  { type: 'histogram', label: 'Histogram' },
  { type: 'box', label: 'Box Plot' },
  { type: 'composed', label: 'Multi-Dimensional Chart' },
];

function groupByAndSum(data: any[], groupCol: string, valueCol: string, topN?: number): any[] {
  const grouped: Record<string, number> = {};
  
  // Check if groupCol is an identifier - if so, don't sum, just use individual values
  const identifierPatterns = /(id|roll|student|serial|number|no\.?|num)/i;
  const isIdentifier = identifierPatterns.test(groupCol);
  
  if (isIdentifier) {
    // For identifiers, show individual records without aggregation
    let result = data
      .filter((row: any) => {
        const key = row[groupCol];
        const val = Number(row[valueCol]);
        return key !== null && key !== undefined && key !== '' && !isNaN(val);
      })
      .map((row: any) => ({
        [groupCol]: row[groupCol],
        [valueCol]: Number(row[valueCol])
      }))
      .sort((a, b) => {
        // Sort by groupCol if it's numeric, otherwise by valueCol
        const aKey = isNaN(Number(a[groupCol])) ? a[groupCol] : Number(a[groupCol]);
        const bKey = isNaN(Number(b[groupCol])) ? b[groupCol] : Number(b[groupCol]);
        
        if (typeof aKey === 'number' && typeof bKey === 'number') {
          return aKey - bKey; // Sort identifiers numerically if possible
        }
        return String(aKey).localeCompare(String(bKey)); // Sort alphabetically otherwise
      });
    
    // Apply topN limit if specified
    if (topN && topN > 0) {
      result = result.slice(0, topN);
    }
    
    return result;
  } else {
    // For non-identifiers, use traditional aggregation
    data.forEach((row: any) => {
      const key = row[groupCol];
      const val = Number(row[valueCol]);
      if (!key || isNaN(val)) return;
      grouped[key] = (grouped[key] || 0) + val;
    });
    
    let result = Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({ [groupCol]: k, [valueCol]: v }));
    
    // Apply topN limit if specified
    if (topN && topN > 0) {
      result = result.slice(0, topN);
    }
    
    return result;
  }
}

interface AutoDashboardProps {
  data: any[];
  columns: string[];
}

const AutoDashboard: React.FC<AutoDashboardProps> = ({ data, columns }) => {
  const [chartType, setChartType] = useState<string>('bar');
  const [xCol, setXCol] = useState<string>('');
  const [yCol, setYCol] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Enhanced column detection with better logic for identifiers
  const identifierPatterns = /(id|roll|student|serial|number|no\.?|num)/i;
  const locationPatterns = /(city|taluk|district|region|area|location|market|state|town|village)/i;
  const valuePatterns = /(marks?|score|grade|assignment|test|exam|points|percentage|result)/i;
  
  const numericCols = useMemo(() => {
    return columns.filter(col => {
      // Check if it's an identifier column (should be treated as categorical)
      if (identifierPatterns.test(col)) {
        return false; // Identifiers should not be treated as numeric for Y-axis
      }
      
      // Check if most values are actually numeric and suitable for aggregation
      const numericCount = data.filter(row => {
        const val = row[col];
        return val !== null && val !== undefined && val !== '' && !isNaN(Number(val));
      }).length;
      
      return numericCount > data.length * 0.7; // At least 70% numeric
    });
  }, [columns, data]);
  
  const categoricalCols = useMemo(() => {
    return columns.filter(col => {
      // Always treat identifier columns as categorical
      if (identifierPatterns.test(col)) {
        return true;
      }
      
      // Check for location patterns
      if (locationPatterns.test(col)) {
        return true;
      }
      
      // Check if it's mostly string data or should be treated as categories
      const stringCount = data.filter(row => {
        const val = row[col];
        return val !== null && val !== undefined && val !== '';
      }).length;
      
      return stringCount > data.length * 0.3; // At least 30% non-empty
    });
  }, [columns, data]);
  
  // Auto-select best columns with improved logic
  const autoSelectColumns = useMemo(() => {
    // Look for identifier columns (Roll No, Student ID, etc.)
    const identifierCols = categoricalCols.filter(col => identifierPatterns.test(col));
    
    // Look for location columns
    const locationCols = categoricalCols.filter(col => locationPatterns.test(col));
    
    // Look for value/score columns (assignment marks, test scores, etc.)
    const scoreCols = numericCols.filter(col => valuePatterns.test(col));
    
    // Auto-select best candidates with priority
    let bestX = identifierCols[0] || locationCols[0] || categoricalCols[0] || columns[0] || '';
    let bestY = scoreCols[0] || numericCols[0] || columns[1] || '';
    
    // Ensure we don't put identifiers on Y-axis
    if (identifierPatterns.test(bestY) && numericCols.length > 0) {
      bestY = numericCols.find(col => !identifierPatterns.test(col)) || numericCols[0];
    }
    
    return { x: bestX, y: bestY };
  }, [categoricalCols, numericCols, columns]);
  
  // Set initial values if not already set
  React.useEffect(() => {
    if (!xCol && autoSelectColumns.x) {
      setXCol(autoSelectColumns.x);
    }
    if (!yCol && autoSelectColumns.y) {
      setYCol(autoSelectColumns.y);
    }
  }, [autoSelectColumns, xCol, yCol]);

  // Determine valid columns for X and Y based on chart type with better logic
  let validXCols: string[] = [];
  let validYCols: string[] = [];
  if (chartType === 'bar' || chartType === 'pie' || chartType === 'line' || chartType === 'area') {
    // Allow both categorical and numeric columns for flexibility
    validXCols = [...categoricalCols, ...numericCols]; // Allow all columns for X-axis
    validYCols = [...numericCols, ...categoricalCols]; // Allow all columns for Y-axis (with preference for numeric)
  } else if (chartType === 'scatter' || chartType === 'histogram' || chartType === 'box') {
    validXCols = numericCols;
    validYCols = numericCols;
  } else if (chartType === 'radar') {
    validXCols = [...categoricalCols, ...numericCols];
    validYCols = [...numericCols, ...categoricalCols];
  } else if (chartType === 'composed') {
    validXCols = [...categoricalCols, ...numericCols];
    validYCols = [...numericCols, ...categoricalCols];
  }

  // Chart data aggregation
  const chartData = useMemo(() => {
    setLoading(true);
    let result: any[] = [];
    if (chartType === 'bar' || chartType === 'pie') {
      if (xCol && yCol) {
        result = groupByAndSum(data, xCol, yCol);
      }
    } else if (chartType === 'line' || chartType === 'area') {
      if (xCol && yCol) {
        result = groupByAndSum(data, xCol, yCol);
      }
    } else if (chartType === 'radar') {
      if (xCol && yCol) {
        result = groupByAndSum(data, xCol, yCol).slice(0, 8); // Limit to 8 items for radar
      }
    } else if (chartType === 'composed') {
      if (xCol && yCol) {
        result = groupByAndSum(data, xCol, yCol);
      }
    } else if (chartType === 'scatter') {
      if (xCol && yCol) {
        result = data
          .filter((row: any) => !isNaN(Number(row[xCol])) && !isNaN(Number(row[yCol])))
          .map((row: any) => ({ x: Number(row[xCol]), y: Number(row[yCol]) }));
      }
    } else if (chartType === 'histogram') {
      if (xCol) {
        const values = data.map((row: any) => Number(row[xCol])).filter((v: number) => !isNaN(v));
        if (values.length > 0) {
          const min = Math.min(...values);
          const max = Math.max(...values);
          const bins = 10;
          const binSize = (max - min) / bins;
          const hist = Array.from({ length: bins }, (_, i) => ({
            bin: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
            count: 0,
          }));
          values.forEach((v: number) => {
            const idx = Math.min(Math.floor((v - min) / binSize), bins - 1);
            if (hist[idx]) hist[idx].count++;
          });
          result = hist.filter((h: any) => h && typeof h.count === 'number');
        }
      }
    } else if (chartType === 'box') {
      if (xCol) {
        const values = data.map((row: any) => Number(row[xCol])).filter((v: number) => !isNaN(v)).sort((a: number, b: number) => a - b);
        if (values.length > 0) {
          const q1 = values[Math.floor(values.length * 0.25)];
          const q2 = values[Math.floor(values.length * 0.5)];
          const q3 = values[Math.floor(values.length * 0.75)];
          const min = values[0];
          const max = values[values.length - 1];
          result = [{ min, q1, q2, q3, max }];
        }
      }
    }
    setLoading(false);
    return result;
  }, [data, chartType, xCol, yCol]);

  // Count of rows matching current selection
  const rowCount = useMemo(() => {
    if (chartType === 'scatter') {
      return chartData.length;
    } else if (chartType === 'histogram') {
      return chartData.reduce((sum: number, d: any) => sum + (d && typeof d.count === 'number' ? d.count : 0), 0);
    } else {
      return chartData.length;
    }
  }, [chartData, chartType]);

  // Chart rendering
  let chart = null;
  if (loading) {
    chart = <div className="flex justify-center items-center h-64"><span className="animate-spin text-2xl">⏳</span></div>;
  } else if (chartType === 'bar' && chartData.length > 0) {
    chart = (
      <BarChart width={800} height={350} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xCol} 
          angle={0}
          textAnchor="middle"
          height={60}
          interval="preserveStartEnd"
          tick={{ fontSize: 10 }}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={yCol} fill="#8884d8" />
      </BarChart>
    );
  } else if (chartType === 'pie' && chartData.length > 0) {
    chart = (
      <PieChart width={400} height={300}>
        <Pie
          data={chartData}
          dataKey={yCol}
          nameKey={xCol}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {chartData.map((_, idx) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    );
  } else if (chartType === 'line' && chartData.length > 0) {
    chart = (
      <LineChart width={800} height={350} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xCol} 
          angle={0}
          textAnchor="middle"
          height={60}
          interval="preserveStartEnd"
          tick={{ fontSize: 10 }}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={yCol} stroke="#8884d8" />
      </LineChart>
    );
  } else if (chartType === 'scatter' && chartData.length > 0) {
    chart = (
      <ScatterChart width={800} height={400}>
        <CartesianGrid />
        <XAxis dataKey="x" name={xCol} />
        <YAxis dataKey="y" name={yCol} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter data={chartData} fill="#8884d8" />
      </ScatterChart>
    );
  } else if (chartType === 'histogram' && chartData.length > 0 && chartData.every((d: any) => d && typeof d.count === 'number')) {
    chart = (
      <BarChart width={800} height={350} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="bin" 
          angle={0}
          textAnchor="middle"
          height={60}
          interval="preserveStartEnd"
          tick={{ fontSize: 10 }}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    );
  } else if (chartType === 'box' && chartData.length > 0) {
    const stats = chartData[0];
    chart = stats ? (
      <div className="p-4 border rounded bg-gray-50">
        <div>Min: {stats.min}</div>
        <div>Q1: {stats.q1}</div>
        <div>Median: {stats.q2}</div>
        <div>Q3: {stats.q3}</div>
        <div>Max: {stats.max}</div>
        <div style={{ marginTop: 10 }}>
          <svg width="400" height="60">
            <line x1="50" y1="30" x2="350" y2="30" stroke="#8884d8" strokeWidth="2" />
            <rect x="120" y="15" width="160" height="30" fill="#c3bfff" stroke="#8884d8" />
            <line x1="200" y1="15" x2="200" y2="45" stroke="#8884d8" strokeWidth="2" />
            <line x1="120" y1="15" x2="120" y2="45" stroke="#8884d8" />
            <line x1="280" y1="15" x2="280" y2="45" stroke="#8884d8" />
            <circle cx="50" cy="30" r="4" fill="#8884d8" />
            <circle cx="350" cy="30" r="4" fill="#8884d8" />
          </svg>
        </div>
      </div>
    ) : <div>No numeric data for box plot.</div>;
  } else if (chartType === 'area' && chartData.length > 0) {
    chart = (
      <AreaChart width={800} height={350} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xCol} 
          angle={0}
          textAnchor="middle"
          height={60}
          interval="preserveStartEnd"
          tick={{ fontSize: 10 }}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey={yCol} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
      </AreaChart>
    );
  } else if (chartType === 'radar' && chartData.length > 0) {
    chart = (
      <RadarChart width={800} height={500} data={chartData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
        <PolarGrid />
        <PolarAngleAxis dataKey={xCol} tick={{ fontSize: 10 }} />
        <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} tick={{ fontSize: 8 }} />
        <Radar
          name={yCol}
          dataKey={yCol}
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Tooltip />
        <Legend />
      </RadarChart>
    );
  } else if (chartType === 'composed' && chartData.length > 0) {
    chart = (
      <ComposedChart width={800} height={350} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xCol} 
          angle={0}
          textAnchor="middle"
          height={60}
          interval="preserveStartEnd"
          tick={{ fontSize: 10 }}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={yCol} fill="#8884d8" />
        <Line type="monotone" dataKey={yCol} stroke="#ff7300" strokeWidth={3} dot={false} />
        <Area type="monotone" dataKey={yCol} fill="#82ca9d" fillOpacity={0.3} />
      </ComposedChart>
    );
  } else {
    chart = <div className="text-gray-500 text-sm p-4">No data available for this chart.</div>;
  }

  // Only enable export if chart is visible
  const canExport = chartData.length > 0 && !loading;

  return (
    <div className="my-4">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="text-sm font-medium text-blue-900 mb-2">📊 Chart Configuration</div>
        <div className="text-xs text-blue-700">
          <div><strong>X-Axis (Categories):</strong> {xCol || 'Not selected'} {identifierPatterns.test(xCol) && '🆔 Identifier'} {locationPatterns.test(xCol) && '📍 Location'}</div>
          <div><strong>Y-Axis (Values):</strong> {yCol || 'Not selected'} {valuePatterns.test(yCol) && '📈 Score/Value'}</div>
          <div><strong>Data Points:</strong> {rowCount} records</div>
          <div className="text-blue-600 mt-1"><strong>💡 Tip:</strong> Use the "⇅ Swap Axes" button to easily switch X and Y columns for better visualization</div>
        </div>
        {autoSelectColumns.x && autoSelectColumns.y && (xCol !== autoSelectColumns.x || yCol !== autoSelectColumns.y) && (
          <button 
            onClick={() => { setXCol(autoSelectColumns.x); setYCol(autoSelectColumns.y); }}
            className="mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            🎯 Auto-configure optimal axes
          </button>
        )}
        {identifierPatterns.test(yCol) && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
            ⚠️ <strong>Axis Issue Detected:</strong> "{yCol}" appears to be an identifier and should be on the X-axis, not Y-axis. Identifiers like Roll No., Student ID should be categories (X-axis), while scores/marks should be values (Y-axis).
          </div>
        )}
        {!identifierPatterns.test(xCol) && !locationPatterns.test(xCol) && categoricalCols.some(col => identifierPatterns.test(col)) && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            💡 <strong>Suggestion:</strong> Consider using "{categoricalCols.find(col => identifierPatterns.test(col))}" for X-axis to show data by individual records (like students, items, etc.).
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mb-2">
        <select value={chartType} onChange={e => setChartType(e.target.value)} className="border px-2 py-1">
          {chartTypeOptions.map(opt => <option key={opt.type} value={opt.type}>{opt.label}</option>)}
        </select>
        <select value={xCol} onChange={e => setXCol(e.target.value)} className="border px-2 py-1" disabled={validXCols.length === 0}>
          <option value="">Select X-axis column</option>
          {validXCols.map((col, index) => {
            let label = col;
            if (identifierPatterns.test(col)) label += ' (ID)';
            else if (locationPatterns.test(col)) label += ' (Location)';
            else if (valuePatterns.test(col)) label += ' (Value)';
            else if (numericCols.includes(col)) label += ' (Numeric)';
            else label += ' (Text)';
            return <option key={`x-${col}-${index}`} value={col}>{label}</option>;
          })}
        </select>
        {(chartType !== 'histogram' && chartType !== 'box' && chartType !== 'pie') && (
          <select value={yCol} onChange={e => setYCol(e.target.value)} className="border px-2 py-1" disabled={validYCols.length === 0}>
            <option value="">Select Y-axis column</option>
            {validYCols.map((col, index) => {
              let label = col;
              if (identifierPatterns.test(col)) label += ' (ID)';
              else if (locationPatterns.test(col)) label += ' (Location)';
              else if (valuePatterns.test(col)) label += ' (Value)';
              else if (numericCols.includes(col)) label += ' (Numeric)';
              else label += ' (Text)';
              return <option key={`y-${col}-${index}`} value={col}>{label}</option>;
            })}
          </select>
        )}
        {(chartType !== 'histogram' && chartType !== 'box' && chartType !== 'pie') && xCol && yCol && (
          <button 
            onClick={() => {
              const tempX = xCol;
              setXCol(yCol);
              setYCol(tempX);
            }}
            className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
            title="Swap X and Y axes"
          >
            ⇅ Swap Axes
          </button>
        )}
      </div>
      
      <div>{chart}</div>
      <div className="flex gap-2 mt-2">
        <button className="px-3 py-1 bg-blue-500 text-white rounded" disabled={!canExport}>Download PNG</button>
        <button className="px-3 py-1 bg-green-500 text-white rounded" disabled={!canExport}>Download PDF</button>
      </div>
    </div>
  );
};

export default AutoDashboard; 