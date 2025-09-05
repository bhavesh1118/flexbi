import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { MapPin, TrendingUp, Users, Clock, ShoppingCart } from 'lucide-react';
import { HyperlocalData } from '../types';
import { hyperlocalDataService } from '../services/hyperlocalDataService';

const HyperlocalAnalytics = () => {
  const [data, setData] = useState<HyperlocalData | null>(null);
  const [allData, setAllData] = useState<HyperlocalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPincode, setSelectedPincode] = useState<string>('110001');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const hyperlocalData = await hyperlocalDataService.fetchHyperlocalData();
        setAllData(hyperlocalData);
        
        const selectedData = hyperlocalData.find(item => item.pincode === selectedPincode);
        if (selectedData) {
          setData(selectedData);
        } else {
          setData(hyperlocalData[0]);
        }
      } catch (error) {
        console.error('Error fetching hyperlocal data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (allData.length > 0) {
      const selectedData = allData.find(item => item.pincode === selectedPincode);
      if (selectedData) {
        setData(selectedData);
      }
    }
  }, [selectedPincode, allData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading hyperlocal insights...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Failed to load hyperlocal data</div>
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  const availablePincodes = allData.map(item => ({
    value: item.pincode,
    label: `${item.pincode} - ${item.neighborhood}, ${item.city}`
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Hyperlocal Insights</h2>
        </div>
        <select
          value={selectedPincode}
          onChange={(e) => setSelectedPincode(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          {availablePincodes.map(pincode => (
            <option key={pincode.value} value={pincode.value}>
              {pincode.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold">₹{data.sales.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Impressions</p>
              <p className="text-2xl font-bold">{data.impressions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold">{data.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold">₹{data.avgOrderValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Customer Demographics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.demographics}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ ageGroup, percentage }) => `${ageGroup}: ${percentage.toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {data.demographics.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
              <Bar dataKey="sales" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Peak Shopping Hours</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.timeOfDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Conversions']} />
              <Bar dataKey="conversions" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Order Value</span>
              <span className="text-lg font-bold">₹{data.avgOrderValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Products Sold</span>
              <span className="text-lg font-bold">{data.productsSold.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Conversions</span>
              <span className="text-lg font-bold">{data.conversions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Conversion Rate</span>
              <span className="text-lg font-bold">{data.conversionRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Location Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800">PIN Code</h4>
            <p className="text-2xl font-bold text-blue-600">{data.pincode}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800">Neighborhood</h4>
            <p className="text-lg font-bold text-green-600">{data.neighborhood}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800">City</h4>
            <p className="text-lg font-bold text-purple-600">{data.city}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-800">State</h4>
            <p className="text-lg font-bold text-orange-600">{data.state}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Hourly Sales & Conversions Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.timeOfDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} name="Sales (₹)" />
            <Line type="monotone" dataKey="conversions" stroke="#82ca9d" strokeWidth={2} name="Conversions" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HyperlocalAnalytics;
