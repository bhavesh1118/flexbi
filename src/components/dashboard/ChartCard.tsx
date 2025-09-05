// src/components/dashboard/ChartCard.tsx

import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,Scatter,  ScatterChart,
} from 'recharts';
import { MoreHorizontal, Maximize2, Trash2, Edit } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { Chart } from '../../types';
import { processQuery } from '../../services/aiService';

interface ChartCardProps {
  chart: Chart;
  globalData?: any[];
}

const ChartCard: React.FC<ChartCardProps> = ({ chart, globalData }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [drillData, setDrillData] = useState<any[] | null>(null);
  const [drillCategory, setDrillCategory] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const { removeChart } = useDashboard();
  const COLORS = ['#0057B7', '#FF6F00', '#008744', '#D7263D', '#374151', '#FFD600', '#00B8D9', '#FF5630']; // High-contrast palette

  // Helper: get underlying transactions for a category/date/value
  const getTransactions = (categoryOrValue: string | number, keyType: 'category' | 'date' | 'value') => {
    // Prefer chart.transactions, else use globalData
    const dataRows = (chart.transactions && Array.isArray(chart.transactions)) ? chart.transactions : (globalData || []);
    if (!dataRows.length) return [];
    let key = chart.categoryKey || 'name';
    if (keyType === 'date') key = chart.dateKey || 'date';
    if (keyType === 'value') key = chart.valueKey || 'value';
    return dataRows.filter((row: any) => String(row[key]) === String(categoryOrValue));
  };

  const renderChart = () => {
    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart 
              data={chart.data}
              margin={{ top: 5, right: 20, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={0}
                textAnchor="middle"
                height={40}
                interval="preserveStartEnd"
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip
                cursor={{ stroke: '#8884d8', strokeWidth: 2 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const date = payload[0].payload.name;
                    return (
                      <div
                        style={{ background: 'white', border: '1px solid #ccc', padding: 8, cursor: 'pointer' }}
                        onClick={() => {
                          setDrillCategory(date);
                          setDrillData(getTransactions(date, 'date'));
                        }}
                      >
                        <div>Date: {date}</div>
                        {payload.map((p, i) => (
                          <div key={i}>{p.dataKey}: {p.value}</div>
                        ))}
                        <div style={{ color: '#007aff', marginTop: 4 }}>Click for details</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              {Object.keys(chart.data[0])
                .filter(key => key !== 'name')
                .map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[index % COLORS.length]}
                    activeDot={{ r: 8 }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart 
              data={chart.data}
              margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={0}
                textAnchor="middle"
                height={60}
                interval="preserveStartEnd"
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(chart.data[0])
                .filter(key => key !== 'name')
                .map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={COLORS[index % COLORS.length]}
                    onClick={(_, barIndex) => {
                      const category = chart.data[barIndex]?.name;
                      setDrillCategory(category);
                      setDrillData(getTransactions(category, 'category'));
                    }}
                    cursor="pointer"
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                onClick={(_, idx) => {
                  const category = chart.data[idx]?.name;
                  setDrillCategory(category);
                  setDrillData(getTransactions(category, 'category'));
                }}
                cursor="pointer"
              >
                {chart.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ScatterChart>
        <CartesianGrid />
        <XAxis dataKey="x" />
        <YAxis dataKey="y" />
        <Tooltip />
        <Scatter data={chart.data} fill="#82ca9d" />
      </ScatterChart>
    </ResponsiveContainer>
  );


      case 'area':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={chart.data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar
                name="Metric"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'geo':
        return (
          <div className="text-center text-gray-500 text-sm p-4">
            🌍 Geo chart visualization coming soon.
          </div>
        );
        

      case 'heatmap':
        return (
          <div className="text-center text-gray-500 text-sm p-4">
            🔥 Heatmap visualization placeholder. Integration required.
          </div>
        );

      default:
        return (
          <p className="text-sm text-red-500 p-4">
            Unsupported chart type: <strong>{chart.type}</strong>
          </p>
        );
    }
  };

  // Handler for explainability
  const handleExplain = async () => {
    setExplaining(true);
    setExplanation(null);
    // Compose a prompt describing the chart and metric
    let desc = `Explain the following chart in plain English.\n`;
    desc += `Chart type: ${chart.type}\n`;
    if (chart.title) desc += `Title: ${chart.title}\n`;
    if (chart.query) desc += `User query: ${chart.query}\n`;
    desc += `Data: ${JSON.stringify(chart.data.slice(0, 10))}`;
    try {
      const result = await processQuery(desc, globalData || chart.data, Object.keys(chart.data[0] || {}));
      setExplanation(result.message);
    } catch (err) {
      setExplanation('Failed to get explanation.');
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg" aria-label={chart.title || 'Chart'} tabIndex={0}>
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-medium text-gray-800">{chart.title}</h3>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white z-10 border border-gray-200">
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <Edit size={16} className="mr-2" />
                  Edit Chart
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <Maximize2 size={16} className="mr-2" />
                  Expand View
                </button>
                <button
                  onClick={() => removeChart(chart.id)}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Remove Chart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {renderChart()}
        <button
          className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs"
          onClick={handleExplain}
          disabled={explaining}
          aria-label="Explain this metric"
          tabIndex={0}
        >
          {explaining ? 'Explaining...' : 'Explain this metric'}
        </button>
        {explanation && (
          <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded text-xs text-gray-800 whitespace-pre-line" aria-live="polite">
            {explanation}
          </div>
        )}
      </div>

      {/* Drill-down modal */}
      {drillCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Drill-down details">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setDrillCategory(null)} aria-label="Close details" tabIndex={0}>&times;</button>
            <h2 className="text-lg font-bold mb-2">Details for: {drillCategory}</h2>
            {drillData && drillData.length > 0 ? (
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full text-xs border" aria-label="Drill-down data table">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1 bg-gray-100 font-semibold">S.No</th>
                      {Object.keys(drillData[0]).map(col => (
                        <th key={col} className="border px-2 py-1 bg-gray-100 font-semibold">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {drillData.map((row, i) => (
                      <tr key={i}>
                        <td className="border px-2 py-1 bg-gray-50 font-medium">{i + 1}</td>
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="border px-2 py-1">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500">No details available for this category.</div>
            )}
          </div>
        </div>
      )}

      <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
        <p>Query: "{chart.query}"</p>
      </div>
    </div>
  );
};

export default ChartCard;
