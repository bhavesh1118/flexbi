export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'area'
  | 'geo'
  | 'heatmap'
  | 'scatter'; // ✅ Added this

export interface Chart {
  id: string;
  title: string;
  type: ChartType;
  data: any[];
  query: string;
  valueKey?: string;
  categoryKey?: string;
  dateKey?: string;
  transactions?: any[];
}

export interface ApiResponse {
  message: string;
  chartData?: any[];
  chartType?: ChartType;
  title?: string;
}

// Chat-related types
export interface Message {
  id: string;
  type: 'user' | 'ai' | 'system' | 'error';
  content: string;
  queryType?: 'data-analysis' | 'general' | 'business' | 'technical' | 'creative' | 'educational';
  confidence?: number;
}

export type DialogueTurn = {
  role: 'user' | 'assistant';
  content: string;
};

// Data insight types for advanced reporting
export interface DataInsight {
  id: string;
  type: 'trend' | 'outlier' | 'correlation' | 'pattern' | 'anomaly';
  column: string;
  description: string;
  confidence: number;
  value?: any;
  impact: 'high' | 'medium' | 'low';
}

export interface StatisticalSummary {
  mean: number;
  median: number;
  mode: number[];
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  quartiles: number[];
  count: number;
  uniqueValues: number;
}

export interface ColumnAnalysis {
  column: string;
  dataType: 'numeric' | 'categorical' | 'datetime' | 'boolean';
  completeness: number;
  uniqueness: number;
  statistics?: StatisticalSummary;
  insights: DataInsight[];
}

// Hyperlocal data types
export interface HyperlocalData {
  pincode: string;
  neighborhood: string;
  city: string;
  state: string;
  sales: number;
  impressions: number;
  conversions: number;
  conversionRate: number;
  avgOrderValue: number;
  productsSold: number;
  timestamp: string;
  topProducts: Array<{
    name: string;
    sales: number;
    category: string;
  }>;
  demographics: Array<{
    ageGroup: string;
    percentage: number;
  }>;
  timeOfDay: Array<{
    hour: number;
    sales: number;
    conversions: number;
  }>;
}
