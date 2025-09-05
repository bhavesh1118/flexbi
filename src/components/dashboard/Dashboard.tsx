import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import ChartCard from './ChartCard';
import DraggableGrid from './DraggableGrid';
import EmptyState from './EmptyState';
import DataUpload from '../DataUpload';
import DataAnalysis from '../DataAnalysis';
import DataTable from '../DataTable';
import DataFilters from '../DataFilters';
import AutoDashboard from '../AutoDashboard';
import InsightsPanel from '../InsightsPanel';
import { BackendConnection } from '../../utils/BackendConnection';
import ChartDownload from '../ChartDownload';
import NaturalLanguageQuery from '../NaturalLanguageQuery';
import { useAutoReport } from '../../context/AutoReportContext';
import { Bell, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface Alert {
  metric: string;
  threshold: number;
  direction: 'above' | 'below';
  period: 'weekly' | 'daily' | 'monthly';
}

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const { charts, setCharts } = useDashboard();
  const { autoGenerateEnabled, setAutoGenerateEnabled, setShowAutoReport } = useAutoReport();
  
  // Sidebar toggle state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data tool state
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean>(true);

  // Alert settings
  const [alerts, setAlerts] = useState<Alert[]>([
    // Example default alert
    // { metric: 'returns', threshold: 20, direction: 'above', period: 'weekly' }
  ]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alertNotifs, setAlertNotifs] = useState<any[]>([]);
  const [showReportNotification, setShowReportNotification] = useState(false);

  // Load alerts from backend on mount
  useEffect(() => {
    BackendConnection.get('/api/alerts')
      .then(json => {
        setAlerts(json.alerts || []);
        setBackendAvailable(true);
        console.log('✅ Backend connected successfully');
      })
      .catch(() => {
        // Backend not running; degrade gracefully
        setBackendAvailable(false);
        setAlerts([]);
        console.log('💡 Backend not available - using offline mode');
      });
  }, []);

  const handleDataParsed = (parsed: any[], cols: string[]) => {
    setData(parsed);
    setColumns(cols);
    setFilteredData(parsed);
    
    // Show notification for auto-report generation
    if (autoGenerateEnabled && parsed.length > 0) {
      setShowReportNotification(true);
      setTimeout(() => setShowReportNotification(false), 5000); // Hide after 5 seconds
    }
  };

  const handleFilter = (filtered: any[]) => {
    setFilteredData(filtered);
  };

  // Check for alert breaches
  useEffect(() => {
    if (!filteredData || !alerts.length) return;
    const notifs: any[] = [];
    alerts.forEach(alert => {
      // Example: check if any weekly returns exceed threshold
      if (alert.metric && alert.period === 'weekly') {
        // Group by week (assume 'date' column exists)
        const byWeek: Record<string, number[]> = {};
        filteredData.forEach(row => {
          if (!row.date || typeof row[alert.metric] !== 'number') return;
          const week = row.date.slice(0, 7) + '-W' + Math.ceil(Number(row.date.slice(8, 10)) / 7);
          byWeek[week] = byWeek[week] || [];
          byWeek[week].push(row[alert.metric]);
        });
        Object.entries(byWeek).forEach(([week, vals]) => {
          const sum = vals.reduce((a, b) => a + b, 0);
          const breach = alert.direction === 'above' ? sum > alert.threshold : sum < alert.threshold;
          if (breach) {
            notifs.push({
              message: `Alert: ${alert.metric} for ${week} is ${sum} (${alert.direction} ${alert.threshold})`,
              time: new Date().toLocaleTimeString(),
            });
          }
        });
      }
    });
    setAlertNotifs(notifs);
  }, [filteredData, alerts]);

  // Add alert handler (now saves to backend)
  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const metric = (form.metric as any).value;
    const threshold = Number((form.threshold as any).value);
    const direction = (form.direction as any).value;
    const period = (form.period as any).value;
    if (!metric || isNaN(threshold)) return;
    const newAlert = { metric, threshold, direction, period };
    setAlerts(prev => [...prev, newAlert]);
    form.reset();
    // Save to backend (best-effort)
    try {
      await fetch('http://localhost:3001/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert),
      });
      setBackendAvailable(true);
    } catch {
      setBackendAvailable(false);
    }
  };

  // Save dashboard view
  const handleSaveDashboard = async () => {
    setSaveMsg(null);
    try {
      const view = {
        charts,
        data,
        columns,
        filteredData,
        // Add more state as needed (filters, layout, etc.)
      };
      const res = await fetch('http://localhost:3001/api/save-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(view),
      });
      if (res.ok) setSaveMsg('Dashboard saved!');
      else setSaveMsg('Failed to save dashboard.');
    } catch {
      setSaveMsg('Failed to save dashboard.');
    }
    setTimeout(() => setSaveMsg(null), 2000);
  };

  // Load dashboard view
  const handleLoadDashboard = async () => {
    setSaveMsg(null);
    try {
      const res = await fetch('http://localhost:3001/api/load-dashboard');
      const json = await res.json();
      if (json.view) {
        setCharts(json.view.charts || []);
        setData(json.view.data || []);
        setColumns(json.view.columns || []);
        setFilteredData(json.view.filteredData || []);
        setSaveMsg('Dashboard loaded!');
      } else {
        setSaveMsg('No saved dashboard found.');
      }
    } catch {
      setSaveMsg('Failed to load dashboard.');
    }
    setTimeout(() => setSaveMsg(null), 2000);
  };

  // Removed unused variables: showReportModal, setShowReportModal
  const [recentInsights, setRecentInsights] = useState<string[]>([]);
  const [showFAQ, setShowFAQ] = useState(() => !localStorage.getItem('quickStartSeen'));

  // Generate recent insights (simple trends/anomalies)
  useEffect(() => {
    if (!filteredData || !columns || filteredData.length === 0) return;
    const insights: string[] = [];
    columns.forEach(col => {
      const values = filteredData.map(row => row[col]);
      const nums = values.map(Number).filter(v => !isNaN(v));
      if (nums.length > 0) {
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const max = Math.max(...nums);
        const min = Math.min(...nums);
        if (max > mean * 1.5) insights.push(`High value detected in ${col}: ${max}`);
        if (min < mean * 0.5) insights.push(`Low value detected in ${col}: ${min}`);
      }
    });
    setRecentInsights(insights.slice(0, 5));
  }, [filteredData, columns]);

  return (
    <div className={`h-screen flex bg-gray-50 ${className}`}>
      {/* Left Sidebar - AI Assistant */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'
      }`}>
        {!sidebarCollapsed && (
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🤖</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">AI Assistant</h2>
                  <p className="text-xs text-gray-500">Ask me about your data</p>
                </div>
              </div>
            </div>
            
            {/* AI Assistant Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <NaturalLanguageQuery className="shadow-none border-0 bg-transparent p-0" />
            </div>
            
            {/* Recent Insights */}
            <div className="border-t border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">📊 Recent Insights</h3>
              {recentInsights.length === 0 ? (
                <div className="text-xs text-gray-500">No recent trends or anomalies detected.</div>
              ) : (
                <ul className="text-xs space-y-2">
                  {recentInsights.slice(0, 3).map((ins, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="text-gray-700 leading-relaxed">{ins}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Quick Start Guide */}
            {showFAQ && (
              <div className="border-t border-gray-200 p-4 bg-blue-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-blue-900 text-sm">🚀 Quick Start</h4>
                  <button 
                    className="text-blue-600 hover:text-blue-800 text-xs" 
                    onClick={() => { setShowFAQ(false); localStorage.setItem('quickStartSeen', 'true'); }}
                  >
                    ✕
                  </button>
                </div>
                <ul className="text-xs space-y-1 text-blue-700">
                  <li>• Upload data using the Data Tool</li>
                  <li>• Ask questions in the AI Assistant</li>
                  <li>• Click charts to drill down</li>
                  <li>• Set alerts for metrics</li>
                  <li>• Save and load layouts</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`fixed top-1/2 transform -translate-y-1/2 z-50 bg-white border border-gray-300 rounded-r-md p-2 shadow-md hover:bg-gray-50 transition-all duration-200 ${
          sidebarCollapsed ? 'left-0' : 'left-80'
        }`}
        style={{ marginLeft: sidebarCollapsed ? '0px' : '-1px' }}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>
      {/* Main Dashboard Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Auto-Report Notification Banner */}
        {showReportNotification && (
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5" />
              <div>
                <p className="font-semibold">🚀 Advanced AI Report Generated!</p>
                <p className="text-sm opacity-90">Comprehensive analysis with predictions and insights is ready</p>
              </div>
            </div>
            <button
              onClick={() => setShowAutoReport(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              View Report
            </button>
          </div>
        )}
        
        {/* Top Header Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Financial Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Q2 2025 Overview</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Alerts */}
              <div className="relative">
                <button 
                  className="p-2 rounded-lg hover:bg-gray-100 relative" 
                  onClick={() => setShowAlerts(a => !a)}
                >
                  <Bell size={18} className="text-gray-600" />
                  {alertNotifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 min-w-[18px] text-center">
                      {alertNotifs.length}
                    </span>
                  )}
                </button>
                {showAlerts && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                    <h4 className="font-semibold mb-2 text-gray-900">Alerts</h4>
                    {alertNotifs.length === 0 ? (
                      <div className="text-sm text-gray-500">No alerts triggered.</div>
                    ) : (
                      <ul className="text-sm max-h-40 overflow-y-auto space-y-2">
                        {alertNotifs.map((n, i) => (
                          <li key={i} className="p-2 bg-red-50 rounded border-l-4 border-red-400">
                            <div className="text-red-800">{n.message}</div>
                            <div className="text-red-600 text-xs mt-1">{n.time}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              
              {/* Save/Load Buttons */}
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium" 
                onClick={handleSaveDashboard}
              >
                Save Dashboard
              </button>
              <button 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium" 
                onClick={handleLoadDashboard}
              >
                Load Dashboard
              </button>
            </div>
          </div>
          
          {/* Alert Form */}
          <form className="mt-4 flex items-center gap-3 text-sm" onSubmit={handleAddAlert}>
            <span className="text-gray-700 font-medium">Add Alert:</span>
            <input 
              name="metric" 
              className="border border-gray-300 rounded-lg px-3 py-1.5 w-24" 
              placeholder="metric" 
              required 
            />
            <input 
              name="threshold" 
              type="number" 
              className="border border-gray-300 rounded-lg px-3 py-1.5 w-20" 
              placeholder="100"
              required 
            />
            <select name="direction" className="border border-gray-300 rounded-lg px-3 py-1.5">
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            <select name="period" className="border border-gray-300 rounded-lg px-3 py-1.5">
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
            <button 
              type="submit" 
              className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Add Alert
            </button>
          </form>
          
          {saveMsg && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              {saveMsg}
            </div>
          )}
          {!backendAvailable && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded text-sm">
              Backend not running (http://localhost:3001). Features like Alerts, Save/Load and Forecast will work in offline mode without persistence.
            </div>
          )}
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Dashboard Content */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Your Dashboard</h2>
            <p className="text-sm text-gray-500">
              {charts.length 
                ? `Showing ${charts.length} visualizations based on your queries` 
                : 'Use the AI assistant to generate visualizations'}
            </p>
          </div>
          
          {charts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <EmptyState />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <DraggableGrid>
                {charts.map(chart => (
                  <ChartCard 
                    key={chart.id} 
                    chart={chart}
                    globalData={data}
                  />
                ))}
              </DraggableGrid>
            </div>
          )}

          {/* Data Tool Section */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">📁 Data Management</h2>
              <p className="text-gray-600">Upload and analyze your datasets to unlock powerful insights</p>
            </div>
            <DataUpload onDataParsed={handleDataParsed} />
            
            {/* Auto-Report Settings */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">AI-Powered Auto Reports</h3>
                    <p className="text-sm text-gray-600">Automatically generate comprehensive reports when data is uploaded</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setAutoGenerateEnabled(!autoGenerateEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoGenerateEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoGenerateEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ${autoGenerateEnabled ? 'text-blue-600' : 'text-gray-500'}`}>
                    {autoGenerateEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              {/* Manual trigger button */}
              {data.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <button
                    onClick={() => setShowAutoReport(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Generate Advanced Report Now</span>
                  </button>
                </div>
              )}
            </div>
            {data.length > 0 && (
              <div className="mt-6 space-y-6">
                <DataAnalysis data={data} columns={columns} />
                <DataTable data={data} columns={columns} title="Raw Data with Serial Numbers" />
                <DataFilters data={data} columns={columns} onFilter={handleFilter} />
                <div ref={chartRef}>
                  <AutoDashboard data={filteredData} columns={columns} />
                </div>
                <ChartDownload chartRef={chartRef} />
                <InsightsPanel data={filteredData} columns={columns} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;