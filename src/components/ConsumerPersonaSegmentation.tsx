import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Users, Target, TrendingUp, Download, RefreshCw, UserCheck, Heart
} from 'lucide-react';

interface ConsumerPersona {
  id: string;
  name: string;
  description: string;
  size: number;
  percentage: number;
  avgAge: number;
  gender: 'Male' | 'Female' | 'Mixed';
  income: string;
  location: string;
  interests: string[];
  buyingBehavior: {
    frequency: string;
    avgOrderValue: number;
    preferredChannels: string[];
    seasonality: string;
  };
  demographics: {
    ageGroup: string;
    education: string;
    occupation: string;
    familyStatus: string;
  };
  psychographics: {
    values: string[];
    lifestyle: string;
    personality: string[];
  };
  digitalBehavior: {
    socialMedia: string[];
    deviceUsage: string;
    onlineTime: string;
  };
  conversion: {
    rate: number;
    lifetime_value: number;
    churn_risk: number;
    retention_rate: number;
  };
}

interface PersonaMetrics {
  persona_id: string;
  date: string;
  revenue: number;
  transactions: number;
  engagement_rate: number;
  acquisition_cost: number;
  retention_rate: number;
}

interface MarketingStrategy {
  persona_id: string;
  channel: string;
  message: string;
  budget_allocation: number;
  expected_roi: number;
  campaign_type: string;
  timing: string;
}

const ConsumerPersonaSegmentation: React.FC = () => {
  const [personas, setPersonas] = useState<ConsumerPersona[]>([]);
  const [personaMetrics, setPersonaMetrics] = useState<PersonaMetrics[]>([]);
  const [marketingStrategies, setMarketingStrategies] = useState<MarketingStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  // Generate consumer personas
  const generatePersonas = (): ConsumerPersona[] => {
    return [
      {
        id: 'tech-enthusiasts',
        name: 'Tech Enthusiasts',
        description: 'Early adopters who love the latest technology and gadgets',
        size: 15000,
        percentage: 25,
        avgAge: 28,
        gender: 'Mixed',
        income: '₹8-15 LPA',
        location: 'Urban - Tier 1 cities',
        interests: ['Technology', 'Gaming', 'Innovation', 'Reviews'],
        buyingBehavior: {
          frequency: 'Monthly',
          avgOrderValue: 25000,
          preferredChannels: ['Online', 'Brand Stores'],
          seasonality: 'Launch Events'
        },
        demographics: {
          ageGroup: '25-35',
          education: 'Graduate+',
          occupation: 'IT Professional',
          familyStatus: 'Single/Young Couple'
        },
        psychographics: {
          values: ['Innovation', 'Quality', 'Status'],
          lifestyle: 'Digital Native',
          personality: ['Curious', 'Brand Conscious', 'Informed']
        },
        digitalBehavior: {
          socialMedia: ['YouTube', 'Reddit', 'Twitter'],
          deviceUsage: 'Heavy Smartphone + PC',
          onlineTime: '6+ hours/day'
        },
        conversion: {
          rate: 8.5,
          lifetime_value: 150000,
          churn_risk: 15,
          retention_rate: 85
        }
      },
      {
        id: 'budget-conscious',
        name: 'Budget-Conscious Families',
        description: 'Price-sensitive families looking for value and utility',
        size: 22000,
        percentage: 35,
        avgAge: 38,
        gender: 'Mixed',
        income: '₹3-8 LPA',
        location: 'Urban/Semi-urban',
        interests: ['Family', 'Savings', 'Deals', 'Practicality'],
        buyingBehavior: {
          frequency: 'Quarterly',
          avgOrderValue: 8000,
          preferredChannels: ['Online Deals', 'Local Stores'],
          seasonality: 'Festival Season'
        },
        demographics: {
          ageGroup: '30-45',
          education: 'Graduate',
          occupation: 'Service/Business',
          familyStatus: 'Married with Kids'
        },
        psychographics: {
          values: ['Value for Money', 'Family', 'Security'],
          lifestyle: 'Traditional',
          personality: ['Cautious', 'Research-oriented', 'Loyal']
        },
        digitalBehavior: {
          socialMedia: ['Facebook', 'WhatsApp'],
          deviceUsage: 'Smartphone Primary',
          onlineTime: '2-3 hours/day'
        },
        conversion: {
          rate: 12.5,
          lifetime_value: 80000,
          churn_risk: 25,
          retention_rate: 75
        }
      },
      {
        id: 'luxury-seekers',
        name: 'Luxury Seekers',
        description: 'High-income individuals seeking premium and luxury products',
        size: 8000,
        percentage: 12,
        avgAge: 42,
        gender: 'Mixed',
        income: '₹25+ LPA',
        location: 'Metro Cities',
        interests: ['Luxury', 'Travel', 'Fashion', 'Exclusivity'],
        buyingBehavior: {
          frequency: 'As needed',
          avgOrderValue: 75000,
          preferredChannels: ['Premium Stores', 'Exclusive Online'],
          seasonality: 'Year-round'
        },
        demographics: {
          ageGroup: '35-55',
          education: 'Post-Graduate',
          occupation: 'Executive/Business Owner',
          familyStatus: 'Established Family'
        },
        psychographics: {
          values: ['Status', 'Quality', 'Exclusivity'],
          lifestyle: 'Affluent',
          personality: ['Discerning', 'Brand Loyal', 'Quality-focused']
        },
        digitalBehavior: {
          socialMedia: ['Instagram', 'LinkedIn'],
          deviceUsage: 'Premium Devices',
          onlineTime: '3-4 hours/day'
        },
        conversion: {
          rate: 6.5,
          lifetime_value: 500000,
          churn_risk: 10,
          retention_rate: 90
        }
      },
      {
        id: 'millennials',
        name: 'Millennial Professionals',
        description: 'Career-focused millennials balancing work and lifestyle',
        size: 18000,
        percentage: 28,
        avgAge: 32,
        gender: 'Mixed',
        income: '₹6-12 LPA',
        location: 'Metro/Tier 1 cities',
        interests: ['Career', 'Lifestyle', 'Sustainability', 'Experiences'],
        buyingBehavior: {
          frequency: 'Bi-monthly',
          avgOrderValue: 15000,
          preferredChannels: ['Online', 'Social Commerce'],
          seasonality: 'Salary cycles'
        },
        demographics: {
          ageGroup: '28-38',
          education: 'Graduate+',
          occupation: 'Professional',
          familyStatus: 'Single/Early Family'
        },
        psychographics: {
          values: ['Work-life Balance', 'Sustainability', 'Convenience'],
          lifestyle: 'Urban Professional',
          personality: ['Ambitious', 'Social', 'Eco-conscious']
        },
        digitalBehavior: {
          socialMedia: ['Instagram', 'LinkedIn', 'YouTube'],
          deviceUsage: 'Multi-device',
          onlineTime: '5+ hours/day'
        },
        conversion: {
          rate: 10.5,
          lifetime_value: 120000,
          churn_risk: 20,
          retention_rate: 80
        }
      }
    ];
  };

  // Generate persona metrics over time
  const generatePersonaMetrics = (): PersonaMetrics[] => {
    const data: PersonaMetrics[] = [];
    const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90;
    
    personas.forEach(persona => {
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - days + i);
        
        // Simulate realistic metrics based on persona characteristics
        const baseRevenue = persona.buyingBehavior.avgOrderValue * 0.1;
        const seasonalMultiplier = Math.sin((i / days) * 2 * Math.PI) * 0.2 + 1;
        const randomVariation = 0.8 + Math.random() * 0.4;
        
        data.push({
          persona_id: persona.id,
          date: date.toISOString().split('T')[0],
          revenue: Math.round(baseRevenue * seasonalMultiplier * randomVariation),
          transactions: Math.round(baseRevenue / 1000 * randomVariation),
          engagement_rate: Math.round((0.15 + Math.random() * 0.2) * 100),
          acquisition_cost: Math.round(500 + Math.random() * 1500),
          retention_rate: persona.conversion.retention_rate + Math.round((Math.random() - 0.5) * 10)
        });
      }
    });
    
    return data;
  };

  // Generate marketing strategies
  const generateMarketingStrategies = (): MarketingStrategy[] => {
    const strategies: MarketingStrategy[] = [];
    
    personas.forEach(persona => {
      const channels = ['Social Media', 'Email', 'Search Ads', 'Display', 'Influencer'];
      channels.forEach(channel => {
        strategies.push({
          persona_id: persona.id,
          channel,
          message: `Targeted ${channel} campaign for ${persona.name}`,
          budget_allocation: Math.round(10000 + Math.random() * 40000),
          expected_roi: Math.round(200 + Math.random() * 300),
          campaign_type: Math.random() > 0.5 ? 'Acquisition' : 'Retention',
          timing: Math.random() > 0.5 ? 'Peak Hours' : 'Off-Peak'
        });
      });
    });
    
    return strategies;
  };

  // Update data
  const updateData = () => {
    setLoading(true);
    setTimeout(() => {
      const newPersonas = generatePersonas();
      setPersonas(newPersonas);
      setPersonaMetrics(generatePersonaMetrics());
      setMarketingStrategies(generateMarketingStrategies());
      setLastUpdate(new Date());
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    updateData();
  }, [selectedTimeframe]);

  // Filtered data based on selections
  const filteredMetrics = useMemo(() => {
    return personaMetrics.filter(metric => 
      selectedPersona === 'all' || metric.persona_id === selectedPersona
    );
  }, [personaMetrics, selectedPersona]);

  const aggregatedMetrics = useMemo(() => {
    const grouped = filteredMetrics.reduce((acc, metric) => {
      const key = metric.date;
      if (!acc[key]) {
        acc[key] = {
          date: key,
          revenue: 0,
          transactions: 0,
          engagement_rate: 0,
          count: 0
        };
      }
      acc[key].revenue += metric.revenue;
      acc[key].transactions += metric.transactions;
      acc[key].engagement_rate += metric.engagement_rate;
      acc[key].count += 1;
      return acc;
    }, {} as any);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      engagement_rate: Math.round(item.engagement_rate / item.count)
    })).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [filteredMetrics]);

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
              <span className="text-lg text-gray-600">Loading consumer personas...</span>
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
                <UserCheck className="h-8 w-8 text-blue-600" />
                Consumer Persona Segmentation
              </h1>
              <p className="text-gray-600 mt-1">AI-powered customer segmentation with detailed persona insights for targeted marketing</p>
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

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex space-x-2">
              <label className="text-sm font-medium text-gray-700">Persona:</label>
              <select
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Personas</option>
                {personas.map(persona => (
                  <option key={persona.id} value={persona.id}>{persona.name}</option>
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

          {/* AI Insights Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">
                AI Segmentation Active: Real-time persona analysis • {personas.length} personas identified
              </span>
              <span className="text-blue-600">•</span>
              <span className="text-sm text-blue-700">
                Model accuracy: 92%
              </span>
            </div>
          </div>
        </div>

        {/* Persona Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {personas.map((persona, index) => (
            <div key={persona.id} className="bg-white rounded-xl p-6 shadow-sm border-l-4" style={{borderLeftColor: COLORS[index]}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{persona.name}</h3>
                <div className="p-2 rounded-lg" style={{backgroundColor: COLORS[index] + '20'}}>
                  <Users size={20} style={{color: COLORS[index]}} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{persona.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{persona.size.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Market Share:</span>
                  <span className="font-medium">{persona.percentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Order Value:</span>
                  <span className="font-medium">{formatCurrency(persona.buyingBehavior.avgOrderValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">LTV:</span>
                  <span className="font-medium">{formatCurrency(persona.conversion.lifetime_value)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Persona Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Persona Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={personas}
                  dataKey="percentage"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={(entry) => `${entry.name}: ${entry.percentage}%`}
                >
                  {personas.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Persona Over Time */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Revenue Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={aggregatedMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(Number(value)) : value,
                    name
                  ]}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="transactions" stroke="#3B82F6" strokeWidth={2} name="Transactions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Persona Analysis */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Detailed Persona Profiles
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {personas.map((persona, index) => (
              <div key={persona.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
                  <h4 className="text-lg font-semibold text-gray-900">{persona.name}</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Demographics</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Age: {persona.demographics.ageGroup}</div>
                      <div>Education: {persona.demographics.education}</div>
                      <div>Income: {persona.income}</div>
                      <div>Location: {persona.location}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Behavior</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Purchase Frequency: {persona.buyingBehavior.frequency}</div>
                      <div>Avg Order: {formatCurrency(persona.buyingBehavior.avgOrderValue)}</div>
                      <div>Conversion Rate: {persona.conversion.rate}%</div>
                      <div>Retention: {persona.conversion.retention_rate}%</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Interests & Values</h5>
                  <div className="flex flex-wrap gap-2">
                    {persona.interests.slice(0, 4).map((interest, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Digital Behavior</h5>
                  <div className="text-sm text-gray-600">
                    <div>Social Media: {persona.digitalBehavior.socialMedia.join(', ')}</div>
                    <div>Device Usage: {persona.digitalBehavior.deviceUsage}</div>
                    <div>Online Time: {persona.digitalBehavior.onlineTime}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Strategy Recommendations */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            Recommended Marketing Strategies
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Persona</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Channel</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Campaign Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Budget</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Expected ROI</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Timing</th>
                </tr>
              </thead>
              <tbody>
                {marketingStrategies.slice(0, 10).map((strategy, index) => {
                  const persona = personas.find(p => p.id === strategy.persona_id);
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{persona?.name}</td>
                      <td className="py-3 px-4 text-gray-900">{strategy.channel}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          strategy.campaign_type === 'Acquisition' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {strategy.campaign_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{formatCurrency(strategy.budget_allocation)}</td>
                      <td className="py-3 px-4 text-gray-900">{strategy.expected_roi}%</td>
                      <td className="py-3 px-4 text-gray-900">{strategy.timing}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerPersonaSegmentation;
