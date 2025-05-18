import React from 'react';
import { BarChart3 } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
        <BarChart3 size={32} className="text-indigo-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No charts yet</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        Use the AI assistant to generate visualizations based on your financial data.
        Try asking questions about profit, expense, or sales data.
      </p>
      <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-700 max-w-md">
        <p className="font-medium mb-2">Try these example queries:</p>
        <ul className="list-disc list-inside space-y-1 text-left">
          <li>"Show Q1 profit vs expense by region"</li>
          <li>"Create a pie chart of revenue by product category"</li>
          <li>"Generate a trend line of monthly sales for 2025"</li>
        </ul>
      </div>
    </div>
  );
};

export default EmptyState;