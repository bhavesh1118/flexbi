import React, { useState, useEffect, useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Building2, Users, Settings, UserPlus, Activity, 
  BarChart3, Download, RefreshCw, Eye, Lock, Crown, Star, 
  TrendingUp, AlertCircle, CheckCircle, Clock, Zap
} from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  logo: string;
  category: string;
  subscription_tier: 'Basic' | 'Premium' | 'Enterprise';
  status: 'Active' | 'Inactive' | 'Pending';
  joined_date: string;
  total_users: number;
  monthly_revenue: number;
  data_points: number;
  api_calls: number;
  storage_used: number; // GB
  last_activity: string;
  permissions: {
    analytics: boolean;
    reports: boolean;
    api_access: boolean;
    data_export: boolean;
    user_management: boolean;
    advanced_features: boolean;
  };
  usage_stats: {
    dashboard_views: number;
    reports_generated: number;
    data_uploads: number;
    api_requests: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Analyst' | 'Viewer';
  brand_id: string;
  status: 'Active' | 'Inactive' | 'Pending';
  last_login: string;
  permissions: string[];
  created_date: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  user_id: string;
  brand_id: string;
  action: string;
  description: string;
  ip_address: string;
  status: 'Success' | 'Failed' | 'Warning';
}

interface SubscriptionMetric {
  date: string;
  new_subscriptions: number;
  revenue: number;
  churn_rate: number;
  active_users: number;
}

const BrandPortalIntegration: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [subscriptionMetrics, setSubscriptionMetrics] = useState<SubscriptionMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'brands' | 'users' | 'activity'>('overview');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Generate brands data
  const generateBrands = (): Brand[] => {
    const brandNames = [
      'TechCorp Solutions', 'Fashion Forward', 'Eco Products', 'Digital Dynamics', 
      'Health Plus', 'Smart Retail', 'Global Logistics', 'Creative Agency'
    ];
    
    const categories = ['Technology', 'Fashion', 'Health', 'Retail', 'Logistics', 'Marketing'];
    const tiers: Array<'Basic' | 'Premium' | 'Enterprise'> = ['Basic', 'Premium', 'Enterprise'];
    
    return brandNames.map((name, index) => ({
      id: `brand-${index + 1}`,
      name,
      logo: `https://via.placeholder.com/40/00${index + 1}${index + 1}FF/FFFFFF?text=${name.charAt(0)}`,
      category: categories[index % categories.length],
      subscription_tier: tiers[index % tiers.length],
      status: Math.random() > 0.1 ? 'Active' : (Math.random() > 0.5 ? 'Inactive' : 'Pending'),
      joined_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      total_users: Math.floor(5 + Math.random() * 50),
      monthly_revenue: Math.floor(10000 + Math.random() * 100000),
      data_points: Math.floor(1000 + Math.random() * 50000),
      api_calls: Math.floor(5000 + Math.random() * 100000),
      storage_used: Math.round((Math.random() * 50) * 10) / 10,
      last_activity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: {
        analytics: true,
        reports: true,
        api_access: index % 3 === 0,
        data_export: index % 2 === 0,
        user_management: true,
        advanced_features: tiers[index % tiers.length] !== 'Basic'
      },
      usage_stats: {
        dashboard_views: Math.floor(100 + Math.random() * 1000),
        reports_generated: Math.floor(10 + Math.random() * 100),
        data_uploads: Math.floor(5 + Math.random() * 50),
        api_requests: Math.floor(1000 + Math.random() * 10000)
      }
    }));
  };

  // Generate users data
  const generateUsers = (brands: Brand[]): User[] => {
    const firstNames = ['John', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'Chris', 'Anna'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
    const roles: Array<'Admin' | 'Manager' | 'Analyst' | 'Viewer'> = ['Admin', 'Manager', 'Analyst', 'Viewer'];
    
    const users: User[] = [];
    brands.forEach(brand => {
      const userCount = Math.floor(3 + Math.random() * 8);
      for (let i = 0; i < userCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        users.push({
          id: `user-${brand.id}-${i + 1}`,
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${brand.name.toLowerCase().replace(/\s+/g, '')}.com`,
          role: roles[Math.floor(Math.random() * roles.length)],
          brand_id: brand.id,
          status: Math.random() > 0.1 ? 'Active' : 'Inactive',
          last_login: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: ['dashboard_view', 'report_generate', 'data_export'].filter(() => Math.random() > 0.3),
          created_date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });
    return users;
  };

  // Generate activity logs
  const generateActivityLogs = (users: User[]): ActivityLog[] => {
    const actions = [
      'User Login', 'Report Generated', 'Data Export', 'Dashboard View', 
      'API Request', 'Settings Updated', 'User Added', 'Data Upload'
    ];
    
    const logs: ActivityLog[] = [];
    const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90;
    
    for (let i = 0; i < days * 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * days));
      
      logs.push({
        id: `log-${i + 1}`,
        timestamp: date.toISOString(),
        user_id: user.id,
        brand_id: user.brand_id,
        action: actions[Math.floor(Math.random() * actions.length)],
        description: `${user.name} performed action`,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        status: Math.random() > 0.1 ? 'Success' : (Math.random() > 0.5 ? 'Failed' : 'Warning')
      });
    }
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Generate subscription metrics
  const generateSubscriptionMetrics = (): SubscriptionMetric[] => {
    const data: SubscriptionMetric[] = [];
    const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - days + i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        new_subscriptions: Math.floor(1 + Math.random() * 5),
        revenue: Math.floor(50000 + Math.random() * 100000),
        churn_rate: Math.round((0.05 + Math.random() * 0.1) * 100) / 100,
        active_users: Math.floor(500 + Math.random() * 200)
      });
    }
    
    return data;
  };

  // Update data
  const updateData = () => {
    setLoading(true);
    setTimeout(() => {
      const newBrands = generateBrands();
      const newUsers = generateUsers(newBrands);
      setBrands(newBrands);
      setUsers(newUsers);
      setActivityLogs(generateActivityLogs(newUsers));
      setSubscriptionMetrics(generateSubscriptionMetrics());
      setLastUpdate(new Date());
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    updateData();
  }, [selectedTimeframe]);

  // Filtered data based on selections
  const filteredBrands = useMemo(() => {
    return selectedBrand === 'all' ? brands : brands.filter(brand => brand.id === selectedBrand);
  }, [brands, selectedBrand]);

  const filteredUsers = useMemo(() => {
    return selectedBrand === 'all' ? users : users.filter(user => user.brand_id === selectedBrand);
  }, [users, selectedBrand]);

  const filteredActivityLogs = useMemo(() => {
    return selectedBrand === 'all' ? activityLogs : activityLogs.filter(log => log.brand_id === selectedBrand);
  }, [activityLogs, selectedBrand]);

  const subscriptionStats = useMemo(() => {
    const tierCounts = brands.reduce((acc, brand) => {
      acc[brand.subscription_tier] = (acc[brand.subscription_tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tierCounts).map(([tier, count]) => ({
      name: tier,
      value: count,
      revenue: brands.filter(b => b.subscription_tier === tier).reduce((sum, b) => sum + b.monthly_revenue, 0)
    }));
  }, [brands]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Basic': return <Star className="h-4 w-4 text-gray-500" />;
      case 'Premium': return <Crown className="h-4 w-4 text-blue-500" />;
      case 'Enterprise': return <Zap className="h-4 w-4 text-purple-500" />;
      default: return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Inactive': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
              <span className="text-lg text-gray-600">Loading brand portal...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                Brand Portal Integration
              </h1>
              <p className="text-gray-600 mt-1">Multi-user access management for partner brands with advanced analytics</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={updateData}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'brands', label: 'Brands', icon: Building2 },
              { key: 'users', label: 'Users', icon: Users },
              { key: 'activity', label: 'Activity', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  selectedTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex space-x-2">
              <label className="text-sm font-medium text-gray-700">Brand:</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Brands</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-2">
              <label className="text-sm font-medium text-gray-700">Timeframe:</label>
              {[
                { key: '7d', label: '7 Days' },
                { key: '30d', label: '30 Days' },
                { key: '90d', label: '90 Days' }
              ].map((timeframe) => (
                <button
                  key={timeframe.key}
                  onClick={() => setSelectedTimeframe(timeframe.key as any)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    selectedTimeframe === timeframe.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>

          {/* Integration Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                Portal Integration Active: {brands.length} partner brands • {users.length} total users
              </span>
              <span className="text-green-600">•</span>
              <span className="text-sm text-green-700">
                99.9% uptime
              </span>
            </div>
          </div>
        </div>

        {/* Content based on selected tab */}
        {selectedTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Brands</p>
                    <p className="text-2xl font-bold text-gray-900">{brands.length}</p>
                    <p className="text-sm text-green-600">+{Math.floor(brands.length * 0.1)} this month</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'Active').length}</p>
                    <p className="text-sm text-green-600">+{Math.floor(users.length * 0.05)} this week</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(brands.reduce((sum, b) => sum + b.monthly_revenue, 0))}
                    </p>
                    <p className="text-sm text-green-600">+12% from last month</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">API Calls</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {brands.reduce((sum, b) => sum + b.api_calls, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">+8% this week</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Subscription Tiers Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  Subscription Tiers
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subscriptionStats}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {subscriptionStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Trends */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Revenue Trends
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={subscriptionMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'brands' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Partner Brands
              </h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Add Brand</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Brand</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subscription</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Users</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Activity</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBrands.map((brand) => (
                    <tr key={brand.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img src={brand.logo} alt={brand.name} className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="font-medium text-gray-900">{brand.name}</div>
                            <div className="text-sm text-gray-500">ID: {brand.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{brand.category}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getTierIcon(brand.subscription_tier)}
                          <span className="text-gray-900">{brand.subscription_tier}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(brand.status)}
                          <span className={`text-sm ${
                            brand.status === 'Active' ? 'text-green-600' : 
                            brand.status === 'Inactive' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {brand.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{brand.total_users}</td>
                      <td className="py-3 px-4 text-gray-900">{formatCurrency(brand.monthly_revenue)}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {new Date(brand.last_activity).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800">
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'users' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                User Management
              </h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Brand</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Login</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.slice(0, 20).map((user) => {
                    const brand = brands.find(b => b.id === user.brand_id);
                    return (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{brand?.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'Analyst' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(user.status)}
                            <span className={`text-sm ${
                              user.status === 'Active' ? 'text-green-600' : 
                              user.status === 'Inactive' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {user.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {new Date(user.last_login).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {new Date(user.created_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <Settings className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Lock className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'activity' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Activity Logs
            </h3>
            
            <div className="space-y-4">
              {filteredActivityLogs.slice(0, 20).map((log) => {
                const user = users.find(u => u.id === log.user_id);
                const brand = brands.find(b => b.id === log.brand_id);
                return (
                  <div key={log.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        log.status === 'Success' ? 'bg-green-500' :
                        log.status === 'Failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900">{log.action}</div>
                        <div className="text-sm text-gray-600">
                          {user?.name} • {brand?.name} • {log.ip_address}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandPortalIntegration;
