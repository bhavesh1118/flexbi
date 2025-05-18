import { ChartType } from '../types';

interface ApiResponse {
  message: string;
  chartData?: any[];
  chartType?: ChartType;
  title?: string;
}

export const processQuery = async (query: string): Promise<ApiResponse> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerQuery = query.toLowerCase();
    
    // Basic pattern matching to generate mock responses
    if (lowerQuery.includes('profit') && lowerQuery.includes('expense') && lowerQuery.includes('region')) {
      return {
        message: "I've analyzed the Q1 profit vs expense data by region. Here's a visualization that shows the comparison across different regions.",
        chartType: 'bar',
        title: 'Q1 Profit vs Expense by Region',
        chartData: [
          { name: 'North America', profit: 420000, expense: 350000 },
          { name: 'Europe', profit: 380000, expense: 320000 },
          { name: 'Asia Pacific', profit: 520000, expense: 410000 },
          { name: 'Latin America', profit: 190000, expense: 150000 },
          { name: 'Africa', profit: 110000, expense: 90000 },
        ]
      };
    } 
    
    if (lowerQuery.includes('monthly sales') || (lowerQuery.includes('sales') && lowerQuery.includes('month'))) {
      return {
        message: "Here's a trend line showing monthly sales for the current year. There's a noticeable uptick in Q2.",
        chartType: 'line',
        title: 'Monthly Sales Trend (2025)',
        chartData: [
          { name: 'Jan', sales: 320000 },
          { name: 'Feb', sales: 340000 },
          { name: 'Mar', sales: 380000 },
          { name: 'Apr', sales: 420000 },
          { name: 'May', sales: 450000 },
          { name: 'Jun', sales: 480000 },
          { name: 'Jul', sales: 460000 },
          { name: 'Aug', sales: 470000 },
          { name: 'Sep', sales: 490000 },
        ]
      };
    }
    
    if (lowerQuery.includes('revenue') && lowerQuery.includes('product')) {
      return {
        message: "I've generated a pie chart showing the revenue breakdown by product category. Tech products make up the largest portion of revenue.",
        chartType: 'pie',
        title: 'Revenue by Product Category',
        chartData: [
          { name: 'Tech Products', value: 42 },
          { name: 'Office Supplies', value: 18 },
          { name: 'Furniture', value: 16 },
          { name: 'Services', value: 24 }
        ]
      };
    }
    
    if (lowerQuery.includes('department') && lowerQuery.includes('budget')) {
      return {
        message: "Here's a comparison of budget allocation vs actual spending by department for the current quarter.",
        chartType: 'bar',
        title: 'Department Budget vs Actual (Q2 2025)',
        chartData: [
          { name: 'Sales', budget: 200000, actual: 190000 },
          { name: 'Marketing', budget: 150000, actual: 170000 },
          { name: 'R&D', budget: 300000, actual: 280000 },
          { name: 'Operations', budget: 250000, actual: 240000 },
          { name: 'HR', budget: 100000, actual: 95000 },
        ]
      };
    }
    
    if (lowerQuery.includes('comparison') || lowerQuery.includes('compare')) {
      return {
        message: "I've created a year-over-year comparison of quarterly revenue. There's consistent growth compared to the previous year.",
        chartType: 'bar',
        title: 'YoY Quarterly Revenue Comparison',
        chartData: [
          { name: 'Q1', '2024': 1200000, '2025': 1450000 },
          { name: 'Q2', '2024': 1350000, '2025': 1580000 },
          { name: 'Q3', '2024': 1400000, '2025': 1620000 },
          { name: 'Q4', '2024': 1500000, '2025': 1730000 },
        ]
      };
    }
    
    // Default response if no pattern is matched
    return {
      message: "I understand you want to analyze some financial data. Could you provide more specific details? For example, you could ask to see profit vs expense by region, monthly sales trends, or revenue by product category."
    };
  } catch (error) {
    console.error('Error processing query:', error);
    throw new Error('Failed to process your request. Please try again.');
  }
};