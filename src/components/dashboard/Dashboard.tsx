import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import ChartCard from './ChartCard';
import DraggableGrid from './DraggableGrid';
import EmptyState from './EmptyState';

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const { charts } = useDashboard();

  return (
    <div className={`bg-gray-100 overflow-y-auto p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Your Dashboard</h2>
        <p className="text-sm text-gray-500">
          {charts.length 
            ? `Showing ${charts.length} visualizations based on your queries` 
            : 'Use the AI assistant to generate visualizations'}
        </p>
      </div>
      
      {charts.length === 0 ? (
        <EmptyState />
      ) : (
        <DraggableGrid>
          {charts.map(chart => (
            <ChartCard 
              key={chart.id} 
              chart={chart}
            />
          ))}
        </DraggableGrid>
      )}
    </div>
  );
};

export default Dashboard;