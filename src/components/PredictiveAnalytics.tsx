import React, { useState, useEffect, useMemo } from 'react';
import {
  Line, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, Package, AlertTriangle, MapPin, RefreshCw, Brain
} from 'lucide-react';

interface DemandForecast {
  date: string;
  actual?: number;
  predicted: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
  category: string;
  region: string;
}

interface MarketShareData {
  region: string;
  currentShare: number;
  predictedGrowth: number;
  competitorShare: number;
  marketSize: number;
  growthRate: number;
  confidence: number;
}

interface InventoryOptimization {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDemand: number;
  optimalStock: number;
  reorderPoint: number;
  leadTime: number;
  stockoutRisk: number;
  carryingCost: number;
  category: string;
}

interface PredictiveAlert {
  id: string;
  type: 'demand_spike' | 'stockout' | 'market_opportunity' | 'seasonal_trend';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  predictedDate: string;
  confidence: number;
  actionRequired: string;
  impact: number;
}

const PredictiveAnalytics: React.FC = () => {
  const [demandForecasts, setDemandForecasts] = useState<DemandForecast[]>([]);
  const [marketShareData, setMarketShareData] = useState<MarketShareData[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryOptimization[]>([]);
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Generate predictive demand forecasting data
  const generateDemandForecasts = (): DemandForecast[] => {
    const data: DemandForecast[] = [];
    const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books'];
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 
                 selectedTimeframe === '90d' ? 90 : 365;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      categories.forEach(category => {
        regions.forEach(region => {
          // Create realistic demand patterns with seasonality
          const seasonalFactor = Math.sin((i / days) * 2 * Math.PI) * 0.3 + 1;
          const trendFactor = 1 + (i / days) * 0.2; // Growing trend
          const randomVariation = 0.8 + Math.random() * 0.4;
          
          const baseDemand = 100 + Math.random() * 200;
          const predicted = Math.round(baseDemand * seasonalFactor * trendFactor * randomVariation);
          const confidence = 0.7 + Math.random() * 0.25;
          const variance = predicted * (1 - confidence) * 0.5;
          
          // Add historical data for comparison
          const actual = i <= 7 ? Math.round(predicted * (0.9 + Math.random() * 0.2)) : undefined;
          
          data.push({
            date: date.toISOString().split('T')[0],
            actual,
            predicted,
            confidence: Math.round(confidence * 100),
            lowerBound: Math.round(predicted - variance),
            upperBound: Math.round(predicted + variance),
            category,
            region
          });
        });
      });
    }
    
    return data;
  };

  // Generate market share growth predictions
  const generateMarketShareData = (): MarketShareData[] => {
    const regions = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
    
    return regions.map(region => {
      const currentShare = 15 + Math.random() * 25; // 15-40%
      const growthRate = -5 + Math.random() * 20; // -5% to +15%
      const predictedGrowth = currentShare * (1 + growthRate / 100);
      const competitorShare = 100 - currentShare - Math.random() * 30;
      
      return {
        region,
        currentShare: Math.round(currentShare * 10) / 10,
        predictedGrowth: Math.round(predictedGrowth * 10) / 10,
        competitorShare: Math.round(competitorShare * 10) / 10,
        marketSize: Math.round(50000 + Math.random() * 200000),
        growthRate: Math.round(growthRate * 10) / 10,
        confidence: Math.round((0.75 + Math.random() * 0.2) * 100)
      };
    });
  };

  // Generate inventory optimization data
  const generateInventoryData = (): InventoryOptimization[] => {
    const products = [
      'iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Air M3', 'Dell XPS 13',
      'Sony WH-1000XM5', 'iPad Pro', 'Surface Laptop', 'AirPods Pro',
      'Nike Air Max', 'Adidas Ultraboost', 'Levi\'s Jeans', 'North Face Jacket'
    ];
    
    const categories = ['Electronics', 'Fashion', 'Accessories', 'Computing'];
    
    return products.map((product, index) => {
      const currentStock = Math.round(50 + Math.random() * 500);
      const predictedDemand = Math.round(30 + Math.random() * 200);
      const optimalStock = Math.round(predictedDemand * 1.2 + Math.random() * 50);
      const leadTime = Math.round(3 + Math.random() * 14); // 3-17 days
      
      return {
        productId: `PRD-${1000 + index}`,
        productName: product,
        currentStock,
        predictedDemand,
        optimalStock,
        reorderPoint: Math.round(predictedDemand * 0.3),
        leadTime,
        stockoutRisk: Math.round(Math.max(0, (predictedDemand - currentStock) / predictedDemand) * 100),
        carryingCost: Math.round(currentStock * (10 + Math.random() * 40)),
        category: categories[Math.floor(Math.random() * categories.length)]
      };
    });
  };

  // Generate predictive alerts
  const generatePredictiveAlerts = (): PredictiveAlert[] => {
    const alertTypes = [
      {
        type: 'demand_spike' as const,
        message: 'Demand spike predicted for Electronics category',
        severity: 'high' as const,
        actionRequired: 'Increase inventory by 40%'
      },
      {
        type: 'stockout' as const,
        message: 'Stock-out risk for iPhone 15 Pro in Mumbai',
        severity: 'critical' as const,
        actionRequired: 'Reorder immediately'
      },
      {
        type: 'market_opportunity' as const,
        message: 'Market share growth opportunity in Delhi',
        severity: 'medium' as const,
        actionRequired: 'Increase marketing spend'
      },
      {
        type: 'seasonal_trend' as const,
        message: 'Seasonal increase expected in Fashion',
        severity: 'low' as const,
        actionRequired: 'Prepare seasonal inventory'
      }
    ];

    return alertTypes.map((alert, index) => ({
      id: `alert_${index}`,
      ...alert,
      predictedDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      confidence: Math.round((0.7 + Math.random() * 0.25) * 100),
      impact: Math.round(10000 + Math.random() * 50000)
    }));
  };

  // Update data
  const updateData = () => {
    setLoading(true);
    setTimeout(() => {
      setDemandForecasts(generateDemandForecasts());
      setMarketShareData(generateMarketShareData());
      setInventoryData(generateInventoryData());
      setAlerts(generatePredictiveAlerts());
      setLastUpdate(new Date());
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    updateData();
  }, [selectedTimeframe]);

  // Filter data based on selections
  const filteredDemandData = useMemo(() => {
    return demandForecasts.filter(item => 
      selectedCategory === 'all' || item.category === selectedCategory
    );
  }, [demandForecasts, selectedCategory]);

  const aggregatedDemandData = useMemo(() => {
    const grouped = filteredDemandData.reduce((acc, item) => {
      const key = item.date;
      if (!acc[key]) {
        acc[key] = {
          date: key,
          actual: 0,
          predicted: 0,
          lowerBound: 0,
          upperBound: 0,
          confidence: 0,
          count: 0
        };
      }
      acc[key].actual += item.actual || 0;
      acc[key].predicted += item.predicted;
      acc[key].lowerBound += item.lowerBound;
      acc[key].upperBound += item.upperBound;
      acc[key].confidence += item.confidence;
      acc[key].count += 1;
      return acc;
    }, {} as any);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      confidence: Math.round(item.confidence / item.count)
    })).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [filteredDemandData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
              <span className="text-lg text-gray-600">Loading predictive analytics...</span>
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
                <Brain className="h-8 w-8 text-purple-600" />
                Predictive Analytics
              </h1>
              <p className="text-gray-600 mt-1">AI-powered demand forecasting, market analysis, and inventory optimization</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={updateData}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex space-x-2">
              <label className="text-sm font-medium text-gray-700">Timeframe:</label>
              {[
                { key: '7d', label: '7 Days' },
                { key: '30d', label: '30 Days' },
                { key: '90d', label: '90 Days' },
                { key: '1y', label: '1 Year' }
              ].map((timeframe) => (
                <button
                  key={timeframe.key}
                  onClick={() => setSelectedTimeframe(timeframe.key as any)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    selectedTimeframe === timeframe.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Sports">Sports</option>
                <option value="Books">Books</option>
              </select>
            </div>
          </div>

          {/* AI Status */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-800">
                AI Model Active: Real-time predictive analytics • Confidence: 85%
              </span>
              <span className="text-purple-600">•</span>
              <span className="text-sm text-purple-700">
                Next model update in 4 hours
              </span>
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Predictive Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{alert.message}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{alert.actionRequired}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Predicted: {alert.predictedDate}</span>
                  <span>Confidence: {alert.confidence}%</span>
                  <span>Impact: {formatCurrency(alert.impact)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Demand Forecasting */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Demand Forecasting
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={aggregatedDemandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString() : value,
                    name
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stackId="1"
                  stroke="none"
                  fill="#E5E7EB"
                  fillOpacity={0.3}
                  name="Confidence Interval"
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stackId="1"
                  stroke="none"
                  fill="#FFFFFF"
                  fillOpacity={1}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Predicted Demand"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Actual Demand"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Market Share Growth */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Regional Market Share Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marketShareData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  `${value}%`,
                  name
                ]} />
                <Legend />
                <Bar dataKey="currentShare" fill="#10B981" name="Current Share" />
                <Bar dataKey="predictedGrowth" fill="#3B82F6" name="Predicted Growth" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Optimization */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            Inventory Optimization
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Current Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Predicted Demand</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Optimal Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Stockout Risk</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.slice(0, 8).map((item) => (
                  <tr key={item.productId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{item.productName}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{item.currentStock.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-900">{item.predictedDemand.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-900">{item.optimalStock.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.stockoutRisk > 70 ? 'bg-red-100 text-red-800' :
                        item.stockoutRisk > 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.stockoutRisk}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.currentStock < item.reorderPoint ? (
                        <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                          Reorder Now
                        </button>
                      ) : item.currentStock > item.optimalStock ? (
                        <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                          Reduce Stock
                        </button>
                      ) : (
                        <span className="text-green-600 text-sm font-medium">Optimal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
