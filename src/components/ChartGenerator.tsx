import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';

interface ChartGeneratorProps {
  data: any[];
  columns: string[];
}

const chartTypes = [
  'Bar', 'Line', 'Pie', 'Scatter', 'Histogram', 'Box'
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFE', '#FF6699'];

const ChartGenerator: React.FC<ChartGeneratorProps> = ({ data, columns }) => {
  const [chartType, setChartType] = useState('Bar');
  const [xCol, setXCol] = useState(columns[0] || '');
  const [yCol, setYCol] = useState(columns[1] || '');

  if (!data || !columns || columns.length < 2) return null;

  // Helper for histogram
  const getHistogramData = (col: string) => {
    const values = data.map(row => Number(row[col])).filter(v => !isNaN(v));
    if (values.length === 0) return [];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const bins = 10;
    const binSize = (max - min) / bins;
    const hist = Array.from({ length: bins }, (_, i) => ({
      bin: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
      count: 0,
    }));
    values.forEach(v => {
      const idx = Math.min(Math.floor((v - min) / binSize), bins - 1);
      hist[idx].count++;
    });
    return hist;
  };

  // Helper for box plot
  const getBoxPlotStats = (col: string) => {
    const values = data.map(row => Number(row[col])).filter(v => !isNaN(v)).sort((a, b) => a - b);
    if (values.length === 0) return null;
    const q1 = values[Math.floor(values.length * 0.25)];
    const q2 = values[Math.floor(values.length * 0.5)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const min = values[0];
    const max = values[values.length - 1];
    return { min, q1, q2, q3, max };
  };

  // Chart rendering
  let chart = null;
  if (chartType === 'Bar') {
    chart = (
      <BarChart width={800} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xCol} 
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={yCol} fill="#8884d8" />
      </BarChart>
    );
  } else if (chartType === 'Line') {
    chart = (
      <LineChart width={800} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xCol} 
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={yCol} stroke="#8884d8" />
      </LineChart>
    );
  } else if (chartType === 'Pie') {
    chart = (
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          dataKey={yCol}
          nameKey={xCol}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    );
  } else if (chartType === 'Scatter') {
    chart = (
      <ScatterChart width={800} height={400}>
        <CartesianGrid />
        <XAxis dataKey={xCol} name={xCol} />
        <YAxis dataKey={yCol} name={yCol} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter data={data} fill="#8884d8" />
      </ScatterChart>
    );
  } else if (chartType === 'Histogram') {
    const histData = getHistogramData(xCol);
    chart = (
      <BarChart width={800} height={400} data={histData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="bin" 
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    );
  } else if (chartType === 'Box') {
    const stats = getBoxPlotStats(xCol);
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
  }

  return (
    <div className="my-4">
      <h2 className="text-lg font-semibold mb-2">Chart Generator</h2>
      <div className="flex gap-2 mb-2">
        <select value={chartType} onChange={e => setChartType(e.target.value)} className="border px-2 py-1">
          {chartTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <select value={xCol} onChange={e => setXCol(e.target.value)} className="border px-2 py-1">
          {columns.map(col => <option key={col} value={col}>{col}</option>)}
        </select>
        {(chartType !== 'Histogram' && chartType !== 'Box' && chartType !== 'Pie') && (
          <select value={yCol} onChange={e => setYCol(e.target.value)} className="border px-2 py-1">
            {columns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
        )}
      </div>
      <div>{chart}</div>
    </div>
  );
};

export default ChartGenerator; 