import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  CreditCard, TrendingUp, Users, Bell, Settings, Download, RefreshCw, 
  Crown, Star, Zap, DollarSign, Calendar, Target, AlertTriangle,
  CheckCircle, Clock, Filter, BarChart3, Mail, Smartphone
} from 'lucide-react';

interface Subscription {
  id: string;
  brand_name: string;
  brand_id: string;
  plan: 'Basic' | 'Premium' | 'Enterprise';
  status: 'Active' | 'Cancelled' | 'Expired' | 'Trial';
  start_date: string;
  end_date: string;
  monthly_cost: number;
  annual_cost: number;
  billing_cycle: 'Monthly' | 'Annual';
  features: string[];
  usage_stats: {
    api_calls: number;
    storage_gb: number;
    users: number;
    reports_generated: number;
    data_exports: number;
  };
  limits: {
    api_calls_limit: number;
    storage_limit_gb: number;
    users_limit: number;
    reports_limit: number;
  };
  roi_metrics: {
    revenue_tracked: number;
    cost_savings: number;
    efficiency_gain: number;
    customer_insights: number;
  };
  auto_renewal: boolean;
  payment_method: string;
  next_billing_date: string;
}

interface Alert {
  id: string;
  subscription_id: string;
  type: 'usage_limit' | 'payment_due' | 'renewal_reminder' | 'performance_milestone' | 'roi_update';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  action_required: boolean;
}

interface ROIReport {
  subscription_id: string;
  period: string;
  metrics: {
    revenue_increase: number;
    cost_reduction: number;
    time_saved_hours: number;
    accuracy_improvement: number;
    customer_satisfaction: number;
    market_share_growth: number;
  };
  insights: string[];
}

interface UsageSummary {
  subscription_id: string;
  period: string;
  summary: {
    total_api_calls: number;
    avg_response_time: number;
    data_processed_gb: number;
    reports_generated: number;
    unique_users: number;
    peak_usage_day: string;
  };
  trends: {
    usage_growth: number;
    user_adoption: number;
    feature_utilization: number;
  };
}

const SubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [roiReports, setROIReports] = useState<ROIReport[]>([]);
  const [usageSummaries, setUsageSummaries] = useState<UsageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '90d' | '1y'>('30d');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'subscriptions' | 'roi' | 'alerts' | 'usage'>('overview');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Generate subscriptions data
  const generateSubscriptions = (): Subscription[] => {
    const brands = [
      'TechCorp Solutions', 'Fashion Forward', 'Eco Products', 'Digital Dynamics', 
      'Health Plus', 'Smart Retail', 'Global Logistics', 'Creative Agency',
      'FinTech Pro', 'EduTech Solutions'
    ];
    
    const plans: Array<'Basic' | 'Premium' | 'Enterprise'> = ['Basic', 'Premium', 'Enterprise'];
    const statuses: Array<'Active' | 'Cancelled' | 'Expired' | 'Trial'> = ['Active', 'Cancelled', 'Expired', 'Trial'];
    const paymentMethods = ['Credit Card', 'Bank Transfer', 'PayPal', 'Wire Transfer'];
    
    return brands.map((brand, index) => {
      const plan = plans[index % plans.length];
      const isActive = Math.random() > 0.2;
      const status = isActive ? 'Active' : statuses[Math.floor(Math.random() * statuses.length)];
      
      const planCosts = {
        Basic: { monthly: 5000, annual: 50000 },
        Premium: { monthly: 15000, annual: 150000 },
        Enterprise: { monthly: 35000, annual: 350000 }
      };
      
      const planLimits = {
        Basic: { api_calls: 10000, storage: 10, users: 5, reports: 20 },
        Premium: { api_calls: 50000, storage: 50, users: 20, reports: 100 },
        Enterprise: { api_calls: 200000, storage: 200, users: 100, reports: 500 }
      };
      
      return {
        id: `sub-${index + 1}`,
        brand_name: brand,
        brand_id: `brand-${index + 1}`,
        plan,
        status,
        start_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        monthly_cost: planCosts[plan].monthly,
        annual_cost: planCosts[plan].annual,
        billing_cycle: Math.random() > 0.6 ? 'Annual' : 'Monthly',
        features: plan === 'Basic' ? ['Analytics', 'Basic Reports'] : 
                 plan === 'Premium' ? ['Analytics', 'Advanced Reports', 'API Access', 'Data Export'] :
                 ['Analytics', 'Advanced Reports', 'API Access', 'Data Export', 'Custom Integrations', 'Priority Support'],
        usage_stats: {
          api_calls: Math.floor(Math.random() * planLimits[plan].api_calls),
          storage_gb: Math.round(Math.random() * planLimits[plan].storage * 10) / 10,
          users: Math.floor(Math.random() * planLimits[plan].users),
          reports_generated: Math.floor(Math.random() * planLimits[plan].reports),
          data_exports: Math.floor(Math.random() * 50)
        },
        limits: {
          api_calls_limit: planLimits[plan].api_calls,
          storage_limit_gb: planLimits[plan].storage,
          users_limit: planLimits[plan].users,
          reports_limit: planLimits[plan].reports
        },
        roi_metrics: {
          revenue_tracked: Math.floor(500000 + Math.random() * 2000000),
          cost_savings: Math.floor(50000 + Math.random() * 200000),
          efficiency_gain: Math.round((0.15 + Math.random() * 0.35) * 100),
          customer_insights: Math.floor(100 + Math.random() * 500)
        },
        auto_renewal: Math.random() > 0.3,
        payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        next_billing_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    });
  };

  // Generate alerts
  const generateAlerts = (subscriptions: Subscription[]): Alert[] => {
    const alertTypes = [
      { type: 'usage_limit' as const, titles: ['API Limit Approaching', 'Storage Nearly Full'], severities: ['warning', 'critical'] },
      { type: 'payment_due' as const, titles: ['Payment Due Soon', 'Payment Failed'], severities: ['info', 'critical'] },
      { type: 'renewal_reminder' as const, titles: ['Subscription Renewal', 'Trial Ending'], severities: ['info', 'warning'] },
      { type: 'performance_milestone' as const, titles: ['ROI Milestone Reached', 'Usage Goal Achieved'], severities: ['info'] },
      { type: 'roi_update' as const, titles: ['Monthly ROI Report', 'Performance Summary'], severities: ['info'] }
    ];

    const alerts: Alert[] = [];
    subscriptions.forEach(sub => {
      const alertCount = Math.floor(Math.random() * 3);
      for (let i = 0; i < alertCount; i++) {
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const title = alertType.titles[Math.floor(Math.random() * alertType.titles.length)];
        const severity = alertType.severities[Math.floor(Math.random() * alertType.severities.length)] as 'info' | 'warning' | 'critical';
        
        alerts.push({
          id: `alert-${sub.id}-${i}`,
          subscription_id: sub.id,
          type: alertType.type,
          title,
          message: `Alert for ${sub.brand_name}: ${title}`,
          severity,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: Math.random() > 0.3 ? 'active' : 'acknowledged',
          action_required: severity === 'critical' || Math.random() > 0.7
        });
      }
    });

    return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Generate ROI reports
  const generateROIReports = (subscriptions: Subscription[]): ROIReport[] => {
    return subscriptions.map(sub => ({
      subscription_id: sub.id,
      period: 'Last 30 Days',
      metrics: {
        revenue_increase: Math.round((0.1 + Math.random() * 0.3) * 100),
        cost_reduction: Math.round((0.05 + Math.random() * 0.2) * 100),
        time_saved_hours: Math.floor(20 + Math.random() * 100),
        accuracy_improvement: Math.round((0.1 + Math.random() * 0.4) * 100),
        customer_satisfaction: Math.round((0.8 + Math.random() * 0.2) * 100),
        market_share_growth: Math.round((0.02 + Math.random() * 0.08) * 100)
      },
      insights: [
        'Data-driven decisions increased conversion rates',
        'Automated reporting saved significant time',
        'Predictive analytics improved inventory management',
        'Real-time insights enhanced customer experience'
      ].slice(0, Math.floor(2 + Math.random() * 3))
    }));
  };

  // Generate usage summaries
  const generateUsageSummaries = (subscriptions: Subscription[]): UsageSummary[] => {
    return subscriptions.map(sub => ({
      subscription_id: sub.id,
      period: 'Last 30 Days',
      summary: {
        total_api_calls: sub.usage_stats.api_calls,
        avg_response_time: Math.round((100 + Math.random() * 200) * 10) / 10,
        data_processed_gb: Math.round((sub.usage_stats.storage_gb + Math.random() * 10) * 10) / 10,
        reports_generated: sub.usage_stats.reports_generated,
        unique_users: sub.usage_stats.users,
        peak_usage_day: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      },
      trends: {
        usage_growth: Math.round((0.05 + Math.random() * 0.25) * 100),
        user_adoption: Math.round((0.1 + Math.random() * 0.3) * 100),
        feature_utilization: Math.round((0.6 + Math.random() * 0.4) * 100)
      }
    }));
  };

  // Update data
  const updateData = () => {
    setLoading(true);
    setTimeout(() => {
      const newSubscriptions = generateSubscriptions();
      setSubscriptions(newSubscriptions);
      setAlerts(generateAlerts(newSubscriptions));
      setROIReports(generateROIReports(newSubscriptions));
      setUsageSummaries(generateUsageSummaries(newSubscriptions));
      setLastUpdate(new Date());
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    updateData();
  }, [selectedTimeframe]);

  // Filtered data based on selections
  const filteredSubscriptions = useMemo(() => {
    return selectedSubscription === 'all' 
      ? subscriptions 
      : subscriptions.filter(sub => sub.id === selectedSubscription);
  }, [subscriptions, selectedSubscription]);

  const filteredAlerts = useMemo(() => {
    return selectedSubscription === 'all' 
      ? alerts 
      : alerts.filter(alert => alert.subscription_id === selectedSubscription);
  }, [alerts, selectedSubscription]);

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Active');
    const totalRevenue = activeSubscriptions.reduce((sum, sub) => 
      sum + (sub.billing_cycle === 'Annual' ? sub.annual_cost : sub.monthly_cost * 12), 0
    );
    const totalROI = roiReports.reduce((sum, report) => sum + report.metrics.revenue_increase, 0) / roiReports.length;
    const activeAlerts = alerts.filter(alert => alert.status === 'active').length;

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      totalRevenue,
      avgROI: Math.round(totalROI),
      activeAlerts,
      churnRate: Math.round(((subscriptions.length - activeSubscriptions.length) / subscriptions.length) * 100)
    };
  }, [subscriptions, alerts, roiReports]);

  const subscriptionStats = useMemo(() => {
    const planCounts = subscriptions.reduce((acc, sub) => {
      acc[sub.plan] = (acc[sub.plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(planCounts).map(([plan, count]) => ({
      name: plan,
      value: count,
      revenue: subscriptions.filter(s => s.plan === plan).reduce((sum, s) => 
        sum + (s.billing_cycle === 'Annual' ? s.annual_cost : s.monthly_cost * 12), 0)
    }));
  }, [subscriptions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'Basic': return <Star className="h-4 w-4 text-gray-500" />;
      case 'Premium': return <Crown className="h-4 w-4 text-blue-500" />;
      case 'Enterprise': return <Zap className="h-4 w-4 text-purple-500" />;
      default: return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Cancelled': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Expired': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'Trial': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'usage_limit': return <BarChart3 className="h-4 w-4 text-orange-500" />;
      case 'payment_due': return <CreditCard className="h-4 w-4 text-red-500" />;
      case 'renewal_reminder': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'performance_milestone': return <Target className="h-4 w-4 text-green-500" />;
      case 'roi_update': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
              <span className="text-lg text-gray-600">Loading subscription management...</span>
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
                <CreditCard className="h-8 w-8 text-blue-600" />
                Subscription Management
              </h1>
              <p className="text-gray-600 mt-1">ROI tracking, usage summaries, and automated alerts for brand subscriptions</p>
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
                <span>Export Report</span>
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
              { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
              { key: 'roi', label: 'ROI Tracking', icon: TrendingUp },
              { key: 'alerts', label: 'Alerts', icon: Bell },
              { key: 'usage', label: 'Usage', icon: Users }
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
                {tab.key === 'alerts' && filteredAlerts.filter(a => a.status === 'active').length > 0 && (
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {filteredAlerts.filter(a => a.status === 'active').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex space-x-2">
              <label className="text-sm font-medium text-gray-700">Subscription:</label>
              <select
                value={selectedSubscription}
                onChange={(e) => setSelectedSubscription(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Subscriptions</option>
                {subscriptions.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.brand_name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-2">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              {[
                { key: '30d', label: '30 Days' },
                { key: '90d', label: '90 Days' },
                { key: '1y', label: '1 Year' }
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

          {/* Subscription Management Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                Subscription Management Active: {keyMetrics.activeSubscriptions} active subscriptions • {keyMetrics.activeAlerts} pending alerts
              </span>
              <span className="text-green-600">•</span>
              <span className="text-sm text-green-700">
                Automated billing & alerts enabled
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
                    <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                    <p className="text-2xl font-bold text-gray-900">{keyMetrics.totalSubscriptions}</p>
                    <p className="text-sm text-green-600">{keyMetrics.activeSubscriptions} active</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Annual Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(keyMetrics.totalRevenue)}</p>
                    <p className="text-sm text-green-600">+15% YoY growth</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average ROI</p>
                    <p className="text-2xl font-bold text-gray-900">{keyMetrics.avgROI}%</p>
                    <p className="text-sm text-green-600">Above industry avg</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{keyMetrics.activeAlerts}</p>
                    <p className="text-sm text-yellow-600">Requires attention</p>
                  </div>
                  <Bell className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Subscription Plans Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  Subscription Plans
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

              {/* Revenue by Plan */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Revenue by Plan
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subscriptionStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                    <Bar dataKey="revenue" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'subscriptions' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Subscription Details
              </h3>
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Send Reminders</span>
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Brand</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Billing</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Usage</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ROI</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Next Billing</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => {
                    const usage = (sub.usage_stats.api_calls / sub.limits.api_calls_limit) * 100;
                    const roiReport = roiReports.find(r => r.subscription_id === sub.id);
                    return (
                      <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{sub.brand_name}</div>
                          <div className="text-sm text-gray-500">{sub.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getPlanIcon(sub.plan)}
                            <span className="text-gray-900">{sub.plan}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(sub.status)}
                            <span className={`text-sm ${
                              sub.status === 'Active' ? 'text-green-600' : 
                              sub.status === 'Cancelled' ? 'text-red-600' : 
                              sub.status === 'Expired' ? 'text-gray-600' : 'text-yellow-600'
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-900">
                            {formatCurrency(sub.billing_cycle === 'Annual' ? sub.annual_cost : sub.monthly_cost)}
                          </div>
                          <div className="text-sm text-gray-500">{sub.billing_cycle}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-900">{Math.round(usage)}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${usage > 80 ? 'bg-red-500' : usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(usage, 100)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-900">
                            {roiReport ? `${roiReport.metrics.revenue_increase}%` : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">Revenue increase</div>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {new Date(sub.next_billing_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Settings className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-800">
                              <Download className="h-4 w-4" />
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

        {selectedTab === 'roi' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                ROI Performance Reports
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roiReports.slice(0, 6).map((report) => {
                  const subscription = subscriptions.find(s => s.id === report.subscription_id);
                  return (
                    <div key={report.subscription_id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">{subscription?.brand_name}</h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Revenue Increase:</span>
                          <span className="font-medium text-green-600">+{report.metrics.revenue_increase}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Cost Reduction:</span>
                          <span className="font-medium text-blue-600">-{report.metrics.cost_reduction}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Time Saved:</span>
                          <span className="font-medium text-purple-600">{report.metrics.time_saved_hours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Accuracy Improvement:</span>
                          <span className="font-medium text-orange-600">+{report.metrics.accuracy_improvement}%</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Key Insights:</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {report.insights.slice(0, 2).map((insight, idx) => (
                            <li key={idx}>• {insight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'alerts' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                Automated Alerts
              </h3>
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <span>Configure Alerts</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredAlerts.slice(0, 15).map((alert) => {
                const subscription = subscriptions.find(s => s.id === alert.subscription_id);
                return (
                  <div key={alert.id} className={`p-4 border rounded-lg ${
                    alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                    alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          alert.severity === 'critical' ? 'bg-red-100' :
                          alert.severity === 'warning' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          {getAlertIcon(alert.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{subscription?.brand_name}</span>
                            <span>•</span>
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            {alert.action_required && (
                              <>
                                <span>•</span>
                                <span className="text-red-600 font-medium">Action Required</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {alert.status === 'active' && (
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            Acknowledge
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-800 text-sm">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTab === 'usage' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Usage Summaries
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {usageSummaries.slice(0, 6).map((summary) => {
                const subscription = subscriptions.find(s => s.id === summary.subscription_id);
                return (
                  <div key={summary.subscription_id} className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">{subscription?.brand_name}</h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{summary.summary.total_api_calls.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">API Calls</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{summary.summary.data_processed_gb}GB</div>
                        <div className="text-sm text-gray-600">Data Processed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{summary.summary.reports_generated}</div>
                        <div className="text-sm text-gray-600">Reports</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{summary.summary.unique_users}</div>
                        <div className="text-sm text-gray-600">Active Users</div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4">
                      <h5 className="font-medium text-gray-700 mb-3">Growth Trends</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Usage Growth:</span>
                          <span className="text-sm font-medium text-green-600">+{summary.trends.usage_growth}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">User Adoption:</span>
                          <span className="text-sm font-medium text-blue-600">+{summary.trends.user_adoption}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Feature Utilization:</span>
                          <span className="text-sm font-medium text-purple-600">{summary.trends.feature_utilization}%</span>
                        </div>
                      </div>
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

export default SubscriptionManagement;
