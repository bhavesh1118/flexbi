import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Database,
  Zap
} from 'lucide-react';
import RealBusinessDataService from '../services/sampleRealDataService';

const RealDataDashboard: React.FC = () => {
  const [dataMode, setDataMode] = useState<'dummy' | 'real'>('dummy');
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Dummy data for comparison
  const dummyData = {
    sales: [
      { month: 'Jan', revenue: 10000, orders: 50 },
      { month: 'Feb', revenue: 12000, orders: 60 },
      { month: 'Mar', revenue: 8000, orders: 40 },
      { month: 'Apr', revenue: 15000, orders: 75 }
    ],
    products: [
      { name: 'Product A', value: 5000 },
      { name: 'Product B', value: 3000 },
      { name: 'Product C', value: 7000 }
    ],
    customers: [
      { segment: 'New', count: 100 },
      { segment: 'Returning', count: 200 },
      { segment: 'VIP', count: 50 }
    ],
    metrics: {
      revenue: 50000,
      orders: 250,
      customers: 350,
      growth: 5.2
    }
  };

  useEffect(() => {
    if (dataMode === 'dummy') {
      setSalesData(dummyData.sales);
      setProductData(dummyData.products);
      setCustomerData(dummyData.customers);
      setRealTimeMetrics(dummyData.metrics);
    } else {
      loadRealData();
    }
  }, [dataMode]);

  const loadRealData = async () => {
    setLoading(true);
    try {
      // Fetch real business data
      const [sales, products, customers, metrics] = await Promise.all([
        RealBusinessDataService.fetchSalesData(),
        RealBusinessDataService.fetchProductPerformance(),
        RealBusinessDataService.fetchCustomerAnalytics(),
        RealBusinessDataService.fetchRealTimeMetrics()
      ]);

      // Format data for charts
      setSalesData(RealBusinessDataService.formatForCharts(sales, 'sales'));
      setProductData(RealBusinessDataService.formatForCharts(products, 'products'));
      setCustomerData(RealBusinessDataService.formatForCharts(customers, 'customers'));
      setRealTimeMetrics(metrics);
      setLastUpdated(new Date());

      console.log('✅ Real business data loaded successfully!');
    } catch (error) {
      console.error('❌ Failed to load real data:', error);
    }
    setLoading(false);
  };

  const refreshRealData = () => {
    if (dataMode === 'real') {
      loadRealData();
    }
  };

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Data Mode Toggle */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {dataMode === 'dummy' ? '🎭 Dummy Data Dashboard' : '🌍 Real Business Data Dashboard'}
            </h1>
            <p className="text-gray-600">
              {dataMode === 'dummy' 
                ? 'Sample/simulated data for demonstration purposes' 
                : 'Actual business data from your real systems'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {dataMode === 'real' && (
              <button
                onClick={refreshRealData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            )}
            
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setDataMode('dummy')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  dataMode === 'dummy'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Dummy Data
                </div>
              </button>
              <button
                onClick={() => setDataMode('real')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  dataMode === 'real'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Real Data
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Data Status Banner */}
        <div className={`mt-4 p-4 rounded-lg border ${
          dataMode === 'dummy' 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <div className="flex items-center gap-2">
            {dataMode === 'dummy' ? (
              <>
                <AlertTriangle className="w-5 h-5" />
                <strong>Warning:</strong> You are viewing dummy/sample data. Switch to "Real Data" to see your actual business metrics.
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <strong>Success:</strong> Connected to real business data sources. 
                {lastUpdated && (
                  <span className="ml-2 text-sm">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-blue-600">
            <Database className="w-6 h-6 animate-pulse" />
            <span className="text-lg">Loading real business data...</span>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${realTimeMetrics.currentRevenue?.toLocaleString() || realTimeMetrics.revenue?.toLocaleString() || '0'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              {dataMode === 'real' && (
                <div className="flex items-center gap-1 mt-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600">Live Data</span>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {realTimeMetrics.todayOrders?.toLocaleString() || realTimeMetrics.orders?.toLocaleString() || '0'}
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
              {dataMode === 'real' && (
                <div className="flex items-center gap-1 mt-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-600">Live Data</span>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {realTimeMetrics.activeUsers?.toLocaleString() || realTimeMetrics.customers?.toLocaleString() || '0'}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              {dataMode === 'real' && (
                <div className="flex items-center gap-1 mt-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-purple-600">Live Data</span>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {realTimeMetrics.conversionRate?.toFixed(1) || realTimeMetrics.growth?.toFixed(1) || '0'}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
              {dataMode === 'real' && (
                <div className="flex items-center gap-1 mt-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-orange-600">Live Data</span>
                </div>
              )}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sales Revenue</h3>
                <div className={`px-2 py-1 rounded text-xs ${
                  dataMode === 'real' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {dataMode === 'real' ? 'Real Data' : 'Dummy Data'}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill={dataMode === 'real' ? '#10B981' : '#EF4444'} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Product Performance */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Product Performance</h3>
                <div className={`px-2 py-1 rounded text-xs ${
                  dataMode === 'real' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {dataMode === 'real' ? 'Real Data' : 'Dummy Data'}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                  >
                    {productData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Segments */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Customer Segments</h3>
                <div className={`px-2 py-1 rounded text-xs ${
                  dataMode === 'real' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {dataMode === 'real' ? 'Real Data' : 'Dummy Data'}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={dataMode === 'real' ? '#3B82F6' : '#EF4444'} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Data Comparison */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Data Source Comparison</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Dummy Data</span>
                  </div>
                  <div className="text-sm text-red-600">
                    Sample data for testing
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Real Data</span>
                  </div>
                  <div className="text-sm text-green-600">
                    Live business metrics
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🎯 Data Quality Difference</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Real data:</strong> Actual business insights and trends</li>
                    <li>• <strong>Dummy data:</strong> Static sample values for demonstration</li>
                    <li>• <strong>Real-time updates:</strong> Only available with real data connections</li>
                    <li>• <strong>Business decisions:</strong> Should only be based on real data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RealDataDashboard;
