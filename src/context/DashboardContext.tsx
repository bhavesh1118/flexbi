import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Chart } from '../types';

interface DashboardContextType {
  charts: Chart[];
  setCharts: (charts: Chart[]) => void;
  addChart: (chart: Chart) => void;
  removeChart: (id: string) => void;
  updateChart: (id: string, chart: Partial<Chart>) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [charts, setCharts] = useState<Chart[]>([]);

  const addChart = (chart: Chart) => {
    setCharts(prev => [...prev, chart]);
  };

  const removeChart = (id: string) => {
    setCharts(prev => prev.filter(chart => chart.id !== id));
  };

  const updateChart = (id: string, chartUpdate: Partial<Chart>) => {
    setCharts(prev => 
      prev.map(chart => 
        chart.id === id ? { ...chart, ...chartUpdate } : chart
      )
    );
  };

  return (
    <DashboardContext.Provider value={{ charts, setCharts, addChart, removeChart, updateChart }}>
      {children}
    </DashboardContext.Provider>
  );
};