import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  data: any[];
  columns: string[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#8884d8'];

const AdvancedAnalyticsPanel: React.FC<Props> = ({ data, columns }) => {
  const [open, setOpen] = useState(true);
  const [advForecast, setAdvForecast] = useState<any[] | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [forecastPeriods, setForecastPeriods] = useState(7);
  const [forecastChartType, setForecastChartType] = useState<'line' | 'bar'>('line');

  // Helper: detect date columns
  const dateColumns = useMemo(() => columns.filter(col => data.some(row => !isNaN(Date.parse(row[col])))), [columns, data]);
  // Helper: detect numeric columns
  const numericColumns = useMemo(() => columns.filter(col => data.every(row => !isNaN(Number(row[col])))), [columns, data]);
  // Helper: detect categorical columns
  const categoricalColumns = useMemo(() => columns.filter(col => !numericColumns.includes(col) && !dateColumns.includes(col)), [columns, numericColumns, dateColumns]);

  // Trends/Time Series (first date col + first numeric col)
  const trendData = useMemo(() => {
    if (!dateColumns.length || !numericColumns.length) return [];
    const dateCol = dateColumns[0];
    const numCol = numericColumns[0];
    return data
      .map(row => ({ date: row[dateCol], value: Number(row[numCol]) }))
      .filter(d => d.date && !isNaN(d.value))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, dateColumns, numericColumns]);

  // Top-N Rankings (first categorical col + first numeric col)
  const topNData = useMemo(() => {
    if (!categoricalColumns.length || !numericColumns.length) return [];
    const catCol = categoricalColumns[0];
    const numCol = numericColumns[0];
    const grouped: Record<string, number> = {};
    data.forEach(row => {
      const key = row[catCol];
      const val = Number(row[numCol]);
      if (!key || isNaN(val)) return;
      grouped[key] = (grouped[key] || 0) + val;
    });
    return Object.entries(grouped)
      .map(([k, v]) => ({ name: k, value: v }))
      .sort((a, b) => b.value - a.value);
  }, [data, categoricalColumns, numericColumns]);

  // Correlation Matrix (numeric cols)
  const correlationMatrix = useMemo(() => {
    if (numericColumns.length < 2) return [];
    const matrix: { col1: string; col2: string; corr: number }[] = [];
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        const vals1 = data.map(row => Number(row[col1]));
        const vals2 = data.map(row => Number(row[col2]));
        const mean1 = vals1.reduce((a, b) => a + b, 0) / vals1.length;
        const mean2 = vals2.reduce((a, b) => a + b, 0) / vals2.length;
        const numerator = vals1.reduce((sum, v, idx) => sum + (v - mean1) * (vals2[idx] - mean2), 0);
        const denominator = Math.sqrt(vals1.reduce((sum, v) => sum + (v - mean1) ** 2, 0)) * Math.sqrt(vals2.reduce((sum, v) => sum + (v - mean2) ** 2, 0));
        const corr = denominator ? numerator / denominator : 0;
        matrix.push({ col1, col2, corr: Math.round(corr * 100) / 100 });
      }
    }
    return matrix;
  }, [data, numericColumns]);

  // Outlier Detection (first numeric col) - Commented out for now
  // const outliers = useMemo(() => {
  //   if (!numericColumns.length) return [];
  //   const col = numericColumns[0];
  //   const vals = data.map(row => Number(row[col])).filter(v => !isNaN(v));
  //   if (!vals.length) return [];
  //   const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  //   const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
  //   return data.filter(row => Math.abs(Number(row[col]) - mean) > 2 * std);
  // }, [data, numericColumns]);

  // Segmentation (first categorical col + first numeric col)
  const segmentationData = useMemo(() => {
    if (!categoricalColumns.length || !numericColumns.length) return [];
    const catCol = categoricalColumns[0];
    const numCol = numericColumns[0];
    const grouped: Record<string, number> = {};
    data.forEach(row => {
      const key = row[catCol];
      const val = Number(row[numCol]);
      if (!key || isNaN(val)) return;
      grouped[key] = (grouped[key] || 0) + val;
    });
    return Object.entries(grouped).map(([k, v]) => ({ name: k, value: v }));
  }, [data, categoricalColumns, numericColumns]);

  // Simple Forecasting (linear projection, first date + numeric col)
  const forecastData = useMemo(() => {
    if (trendData.length < 2) return [];
    // Simple linear regression
    const xs = trendData.map((_, i) => i);
    const ys = trendData.map(d => d.value);
    const n = xs.length;
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((a, b, i) => a + b * ys[i], 0);
    const sumXX = xs.reduce((a, b) => a + b * b, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const nextX = n;
    const nextY = slope * nextX + intercept;
    return [...trendData, { date: 'Forecast', value: nextY }];
  }, [trendData]);

  // Handler for advanced forecast
  const handleAdvancedForecast = async () => {
    setLoadingForecast(true);
    setForecastError(null);
    setAdvForecast(null);
    try {
      const response = await fetch('http://localhost:3001/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: trendData, periods: forecastPeriods })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Forecast failed');
      }
      const result = await response.json();
      setAdvForecast(result.forecast);
    } catch (err: any) {
      setForecastError(err.message || 'Forecast failed');
    } finally {
      setLoadingForecast(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 my-4 bg-white shadow">
      <button className="mb-2 font-bold" onClick={() => setOpen(o => !o)}>
        {open ? '▼' : '►'} Advanced Analytics
      </button>
      {open && (
        <div>
          {/* Trends/Time Series */}
          {trendData.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Trends / Time Series</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2">
                <label className="text-sm">Forecast Periods:
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={forecastPeriods}
                    onChange={e => setForecastPeriods(Number(e.target.value))}
                    className="ml-2 w-16 border rounded px-1 py-0.5 text-sm"
                  />
                </label>
                <label className="text-sm">Chart Type:
                  <select
                    value={forecastChartType}
                    onChange={e => setForecastChartType(e.target.value as 'line' | 'bar')}
                    className="ml-2 border rounded px-1 py-0.5 text-sm"
                  >
                    <option value="line">Line</option>
                    <option value="bar">Bar</option>
                  </select>
                </label>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleAdvancedForecast}
                  disabled={loadingForecast || trendData.length < 2}
                >
                  {loadingForecast ? 'Forecasting...' : 'Run Advanced Forecast (Prophet/ARIMA)'}
                </button>
              </div>
              {forecastError && <div className="text-red-500 mt-2">{forecastError}</div>}
            </div>
          )}
          {/* Top-N Rankings */}
          {topNData.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Top-N Rankings</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topNData}>
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Correlation Matrix */}
          {correlationMatrix.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Correlation Matrix</h3>
              <table className="table-auto text-xs">
                <thead>
                  <tr>
                    <th>Col 1</th>
                    <th>Col 2</th>
                    <th>Correlation</th>
                  </tr>
                </thead>
                <tbody>
                  {correlationMatrix.map((row, i) => (
                    <tr key={i}>
                      <td>{row.col1}</td>
                      <td>{row.col2}</td>
                      <td>{row.corr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Outlier Detection - Commented out for now */}
          {/* {outliers.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Outliers (first numeric column)</h3>
              <ul className="list-disc ml-6">
                {outliers.map((row, i) => (
                  <li key={i}>{JSON.stringify(row)}</li>
                ))}
              </ul>
            </div>
          )} */}
          {/* Segmentation */}
          {segmentationData.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Segmentation</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={segmentationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {segmentationData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Forecasting */}
          {forecastData.length > trendData.length && (
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Simple Forecast (linear projection)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={forecastData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#ff8042" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Advanced Forecast Result */}
          {advForecast && advForecast.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Advanced Forecast (Prophet/ARIMA)</h3>
              <ResponsiveContainer width="100%" height={200}>
                {forecastChartType === 'line' ? (
                  <LineChart data={advForecast}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#00b894" />
                  </LineChart>
                ) : (
                  <BarChart data={advForecast}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#00b894" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
          {/* Export Buttons */}
          <div className="flex gap-2 mt-2">
            <button className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={() => alert('Export PDF coming soon!')}>Export PDF</button>
            <button className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={() => alert('Export Excel coming soon!')}>Export Excel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalyticsPanel; 