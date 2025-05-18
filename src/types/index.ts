export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';

export interface Chart {
  id: string;
  title: string;
  type: ChartType;
  data: any[];
  query: string;
}

export interface Message {
  id: string;
  type: 'user' | 'ai' | 'system' | 'error';
  content: string;
}

export interface FinancialData {
  // This would be expanded with actual financial data schema
  id: string;
  [key: string]: any;
}