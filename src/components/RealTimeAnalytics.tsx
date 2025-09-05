import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Clock, TrendingUp, Calendar, Target, Activity, RefreshCw, Zap } from 'lucide-react';

interface MinuteData {
  timestamp: string;
  sales: number;
  orders: number;
  conversions: number;
  impressions: number;
  revenue: number;
  avgOrderValue: number;
  campaignSpend: number;
  roas: number; // Return on Ad Spend
}

interface SeasonalData {
  hour: number;
  weekdayAvg: number;
  weekendAvg: number;
  currentDay: number;
  variance: number;
}

interface CampaignEffect {
  campaignName: string;
  startTime: string;
  endTime: string;
  lift: number;
  impact: 'positive' | 'negative' | 'neutral';
  category: string;
}

const RealTimeAnalytics: React.FC = () => {
  const [minuteData, setMinuteData] = useState<MinuteData[]>([]);
  const [seasonalData, setSeasonalData] = useState<SeasonalData[]>([]);
  const [campaignEffects, setCampaignEffects] = useState<CampaignEffect[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '6h' | '24h' | '7d'>('6h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Generate real-time minute-by-minute data
  const generateMinuteData = (): MinuteData[] => {
    const data: MinuteData[] = [];
    const now = new Date();
    const minutes = selectedTimeframe === '1h' ? 60 : 
                   selectedTimeframe === '6h' ? 360 : 
                   selectedTimeframe === '24h' ? 1440 : 10080;

    for (let i = minutes; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000);
      const hour = timestamp.getHours();
      const minute = timestamp.getMinutes();
      const dayOfWeek = timestamp.getDay();
      
      // Create realistic patterns
      const baselineMultiplier = Math.sin((hour / 24) * 2 * Math.PI) * 0.3 + 1;
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.8 : 1.2;
      const minuteVariation = Math.sin((minute / 60) * 2 * Math.PI) * 0.1 + 1;
      const randomVariation = 0.8 + Math.random() * 0.4;
      
      // Simulate campaign spikes
      const campaignBoost = Math.random() > 0.95 ? 1.5 + Math.random() * 0.5 : 1;
      
      const multiplier = baselineMultiplier * weekendMultiplier * minuteVariation * randomVariation * campaignBoost;
      
      const sales = Math.round(50 + Math.random() * 100 * multiplier);
      const orders = Math.round(sales * (0.15 + Math.random() * 0.1));
      const impressions = Math.round(orders * (20 + Math.random() * 10));
      const conversions = Math.round(impressions * (0.02 + Math.random() * 0.03));
      const revenue = sales * (100 + Math.random() * 50);
      const campaignSpend = Math.round(revenue * (0.15 + Math.random() * 0.1));
      
      data.push({
        timestamp: timestamp.toISOString(),
        sales,
        orders,
        conversions,
        impressions,
        revenue,
        avgOrderValue: revenue / Math.max(orders, 1),
        campaignSpend,
        roas: revenue / Math.max(campaignSpend, 1)
      });
    }
    
    return data;
  };

  // Generate seasonal pattern data
  const generateSeasonalData = (): SeasonalData[] => {
    const data: SeasonalData[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const weekdayPattern = Math.sin((hour / 24) * 2 * Math.PI) * 30 + 70;
      const weekendPattern = Math.sin(((hour + 2) / 24) * 2 * Math.PI) * 25 + 60;
      const currentHour = new Date().getHours();
      const currentDay = hour === currentHour ? 
        weekdayPattern + (Math.random() - 0.5) * 20 : 
        weekdayPattern + (Math.random() - 0.5) * 10;
      
      data.push({
        hour,
        weekdayAvg: Math.round(weekdayPattern),
        weekendAvg: Math.round(weekendPattern),
        currentDay: Math.round(currentDay),
        variance: Math.round(Math.abs(currentDay - weekdayPattern))
      });
    }
    
    return data;
  };

  // Generate campaign effects data
  const generateCampaignEffects = (): CampaignEffect[] => {
    const campaigns = [
      'Flash Sale 2024', 'Weekend Special', 'New Product Launch', 
      'Social Media Push', 'Email Campaign', 'Retargeting Ads',
      'Seasonal Promotion', 'Influencer Collab'
    ];
    
    const categories = ['Email', 'Social', 'PPC', 'Display', 'Organic'];
    
    return campaigns.slice(0, 5).map((name, index) => {
      const now = new Date();
      const startTime = new Date(now.getTime() - (index + 1) * 2 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + (1 + Math.random()) * 60 * 60 * 1000);
      const lift = -20 + Math.random() * 60;
      
      return {
        campaignName: name,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        lift: Math.round(lift),
        impact: lift > 10 ? 'positive' : lift < -10 ? 'negative' : 'neutral',
        category: categories[Math.floor(Math.random() * categories.length)]
      };
    });
  };

  // Fetch and update data
  const updateData = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setMinuteData(generateMinuteData());
      setSeasonalData(generateSeasonalData());
      setCampaignEffects(generateCampaignEffects());
      setLastUpdate(new Date());
      setLoading(false);
    }, 500);
  };

  // Auto-refresh effect
  useEffect(() => {
    updateData();
    
    if (autoRefresh) {
      const interval = setInterval(updateData, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [selectedTimeframe, autoRefresh]);

  // Calculate current metrics
  const currentMetrics = useMemo(() => {
    if (minuteData.length === 0) return null;
    
    const latest = minuteData[minuteData.length - 1];
    const previous = minuteData[minuteData.length - 2];
    
    if (!previous) return {
      ...latest,
      salesChange: 0,
      ordersChange: 0,
      revenueChange: 0,
      roasChange: 0
    };
    
    return {
      ...latest,
      salesChange: ((latest.sales - previous.sales) / previous.sales) * 100,
      ordersChange: ((latest.orders - previous.orders) / previous.orders) * 100,
      revenueChange: ((latest.revenue - previous.revenue) / previous.revenue) * 100,
      roasChange: ((latest.roas - previous.roas) / previous.roas) * 100
    };
  }, [minuteData]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return selectedTimeframe === '1h' || selectedTimeframe === '6h' 
      ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading && minuteData.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
              <span className="text-lg text-gray-600">Loading real-time analytics...</span>
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
                <Activity className="h-8 w-8 text-blue-600" />
                Real-Time Analytics
              </h1>
              <p className="text-gray-600 mt-1">Minute-by-minute visibility into sales trends, seasonal shifts, and campaign effects</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Auto-refresh</span>
                </label>
              </div>
              <button
                onClick={updateData}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex space-x-2 mb-6">
            {[
              { key: '1h', label: '1 Hour' },
              { key: '6h', label: '6 Hours' },
              { key: '24h', label: '24 Hours' },
              { key: '7d', label: '7 Days' }
            ].map((timeframe) => (
              <button
                key={timeframe.key}
                onClick={() => setSelectedTimeframe(timeframe.key as any)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTimeframe === timeframe.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {timeframe.label}
              </button>
            ))}
          </div>

          {/* Live Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                LIVE: Real-time data streaming • {minuteData.length} data points
              </span>
              <span className="text-green-600">•</span>
              <span className="text-sm text-green-700">
                Next update in {autoRefresh ? '60s' : 'manual'}
              </span>
            </div>
          </div>
        </div>

        {/* Current Metrics Cards */}
        {currentMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Live Sales',
                value: currentMetrics.sales,
                change: currentMetrics.salesChange,
                icon: TrendingUp,
                color: 'bg-blue-500'
              },
              {
                title: 'Live Orders',
                value: currentMetrics.orders,
                change: currentMetrics.ordersChange,
                icon: Target,
                color: 'bg-green-500'
              },
              {
                title: 'Live Revenue',
                value: formatCurrency(currentMetrics.revenue),
                change: currentMetrics.revenueChange,
                icon: TrendingUp,
                color: 'bg-purple-500'
              },
              {
                title: 'Live ROAS',
                value: `${currentMetrics.roas.toFixed(2)}x`,
                change: currentMetrics.roasChange,
                icon: Zap,
                color: 'bg-orange-500'
              }
            ].map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      <div className="flex items-center mt-1">
                        <span
                          className={`text-sm font-medium ${
                            metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500 ml-1">vs last minute</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${metric.color} text-white`}>
                      <IconComponent size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Minute-by-Minute Sales Trend */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Minute-by-Minute Sales Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={minuteData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => formatTime(value)}
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString() : value,
                    name
                  ]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                  name="Sales"
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue & ROAS Tracking */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Revenue & ROAS Tracking
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={minuteData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  interval="preserveStartEnd"
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(value) => formatTime(value)}
                  formatter={(value, name) => [
                    name === 'Revenue' ? formatCurrency(Number(value)) :
                    name === 'ROAS' ? `${Number(value).toFixed(2)}x` :
                    typeof value === 'number' ? value.toLocaleString() : value,
                    name
                  ]}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="revenue" 
                  fill="#8B5CF6" 
                  name="Revenue"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="roas" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="ROAS"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seasonal Patterns */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Hourly Seasonal Patterns
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={seasonalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(hour) => `${hour}:00`}
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toFixed(0) : value,
                    name
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="weekdayAvg" 
                  stroke="#3B82F6" 
                  strokeDasharray="5 5"
                  name="Weekday Average"
                />
                <Line 
                  type="monotone" 
                  dataKey="weekendAvg" 
                  stroke="#10B981" 
                  strokeDasharray="5 5"
                  name="Weekend Average"
                />
                <Line 
                  type="monotone" 
                  dataKey="currentDay" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="Today"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Campaign Effects */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Active Campaign Effects
            </h3>
            <div className="space-y-4">
              {campaignEffects.map((campaign, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          campaign.impact === 'positive' ? 'bg-green-500' :
                          campaign.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                        }`}
                      ></div>
                      <span className="font-medium">{campaign.campaignName}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {campaign.category}
                      </span>
                    </div>
                    <span 
                      className={`font-bold ${
                        campaign.lift > 0 ? 'text-green-600' : 
                        campaign.lift < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}
                    >
                      {campaign.lift > 0 ? '+' : ''}{campaign.lift}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Started: {new Date(campaign.startTime).toLocaleTimeString()} • 
                    Ends: {new Date(campaign.endTime).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalytics;
