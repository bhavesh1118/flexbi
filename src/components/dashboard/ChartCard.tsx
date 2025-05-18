import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { MoreHorizontal, Maximize2, Trash2, Edit } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { Chart } from '../../types';

interface ChartCardProps {
  chart: Chart;
}

const ChartCard: React.FC<ChartCardProps> = ({ chart }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { removeChart } = useDashboard();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderChart = () => {
    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
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
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
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
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
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
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
        <p>Query: "{chart.query}"</p>
      </div>
    </div>
  );
};

export default ChartCard;