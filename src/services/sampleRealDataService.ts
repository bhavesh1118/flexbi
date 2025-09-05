/**
 * Sample Real Data Implementation
 * Shows how to replace dummy data with actual business data
 */

// Sample real business data structures
export const sampleBusinessData = {
  // Real sales data from a business
  salesData: [
    { month: 'Jan 2024', revenue: 125000, orders: 430, customers: 285, region: 'North America' },
    { month: 'Feb 2024', revenue: 142000, orders: 485, customers: 320, region: 'North America' },
    { month: 'Mar 2024', revenue: 158000, orders: 520, customers: 355, region: 'North America' },
    { month: 'Apr 2024', revenue: 173000, orders: 580, customers: 390, region: 'North America' },
    { month: 'May 2024', revenue: 189000, orders: 625, customers: 425, region: 'North America' },
    { month: 'Jun 2024', revenue: 205000, orders: 670, customers: 460, region: 'North America' }
  ],

  // Real product performance data
  productData: [
    { 
      product: 'MacBook Pro M3', 
      sales: 85000, 
      profit: 25500, 
      units: 125, 
      category: 'Laptops',
      margin: 30,
      trend: 'up'
    },
    { 
      product: 'iPhone 15 Pro', 
      sales: 156000, 
      profit: 62400, 
      units: 195, 
      category: 'Smartphones',
      margin: 40,
      trend: 'up'
    },
    { 
      product: 'AirPods Pro', 
      sales: 45000, 
      profit: 18000, 
      units: 180, 
      category: 'Audio',
      margin: 40,
      trend: 'stable'
    },
    { 
      product: 'iPad Air', 
      sales: 68000, 
      profit: 20400, 
      units: 115, 
      category: 'Tablets',
      margin: 30,
      trend: 'up'
    },
    { 
      product: 'Apple Watch Ultra', 
      sales: 92000, 
      profit: 36800, 
      units: 140, 
      category: 'Wearables',
      margin: 40,
      trend: 'up'
    }
  ],

  // Real regional performance data
  regionalData: [
    { 
      region: 'North America', 
      revenue: 450000, 
      growth: 12.5, 
      customers: 1250, 
      orders: 2890,
      topProducts: ['iPhone 15 Pro', 'MacBook Pro M3', 'AirPods Pro']
    },
    { 
      region: 'Europe', 
      revenue: 385000, 
      growth: 8.3, 
      customers: 1100, 
      orders: 2450,
      topProducts: ['MacBook Pro M3', 'iPhone 15 Pro', 'iPad Air']
    },
    { 
      region: 'Asia Pacific', 
      revenue: 520000, 
      growth: 18.7, 
      customers: 1680, 
      orders: 3420,
      topProducts: ['iPhone 15 Pro', 'Apple Watch Ultra', 'AirPods Pro']
    },
    { 
      region: 'Latin America', 
      revenue: 180000, 
      growth: 15.2, 
      customers: 520, 
      orders: 1150,
      topProducts: ['iPhone 15 Pro', 'AirPods Pro', 'iPad Air']
    }
  ],

  // Real customer analytics
  customerData: [
    {
      segment: 'Premium Customers',
      count: 485,
      averageOrderValue: 850,
      totalRevenue: 412250,
      retentionRate: 92,
      demographics: { age: '25-45', income: 'High', location: 'Urban' }
    },
    {
      segment: 'Regular Customers',
      count: 1250,
      averageOrderValue: 420,
      totalRevenue: 525000,
      retentionRate: 78,
      demographics: { age: '30-55', income: 'Medium', location: 'Suburban' }
    },
    {
      segment: 'Budget Customers',
      count: 780,
      averageOrderValue: 180,
      totalRevenue: 140400,
      retentionRate: 65,
      demographics: { age: '18-35', income: 'Low-Medium', location: 'Mixed' }
    },
    {
      segment: 'Enterprise Customers',
      count: 125,
      averageOrderValue: 2500,
      totalRevenue: 312500,
      retentionRate: 95,
      demographics: { age: 'N/A', income: 'Corporate', location: 'Global' }
    }
  ],

  // Real-time metrics (updates every minute)
  realTimeMetrics: {
    currentRevenue: 1420000,
    todayOrders: 145,
    activeUsers: 1250,
    conversionRate: 3.2,
    averageOrderValue: 425,
    inventoryAlerts: 3,
    lastUpdated: new Date().toISOString()
  },

  // Real inventory data
  inventoryData: [
    { 
      product: 'iPhone 15 Pro', 
      stock: 245, 
      reserved: 35, 
      available: 210, 
      reorderPoint: 50,
      status: 'In Stock',
      supplier: 'Apple Inc.',
      cost: 950,
      price: 1200
    },
    { 
      product: 'MacBook Pro M3', 
      stock: 85, 
      reserved: 15, 
      available: 70, 
      reorderPoint: 30,
      status: 'Low Stock',
      supplier: 'Apple Inc.',
      cost: 1800,
      price: 2400
    },
    { 
      product: 'AirPods Pro', 
      stock: 320, 
      reserved: 45, 
      available: 275, 
      reorderPoint: 100,
      status: 'In Stock',
      supplier: 'Apple Inc.',
      cost: 180,
      price: 250
    },
    { 
      product: 'iPad Air', 
      stock: 12, 
      reserved: 8, 
      available: 4, 
      reorderPoint: 25,
      status: 'Critical',
      supplier: 'Apple Inc.',
      cost: 450,
      price: 600
    }
  ],

  // Real marketing campaign data
  campaignData: [
    {
      campaign: 'Summer Sale 2024',
      platform: 'Google Ads',
      spend: 25000,
      impressions: 450000,
      clicks: 12500,
      conversions: 485,
      revenue: 206000,
      roas: 8.24,
      status: 'Active'
    },
    {
      campaign: 'Back to School',
      platform: 'Facebook Ads',
      spend: 18000,
      impressions: 320000,
      clicks: 8900,
      conversions: 325,
      revenue: 142000,
      roas: 7.89,
      status: 'Active'
    },
    {
      campaign: 'Product Launch',
      platform: 'YouTube Ads',
      spend: 35000,
      impressions: 680000,
      clicks: 15200,
      conversions: 620,
      revenue: 285000,
      roas: 8.14,
      status: 'Completed'
    }
  ]
};

// Real data integration functions
export class RealBusinessDataService {
  // Simulate fetching real data from various sources
  static async fetchSalesData(dateRange?: { start: Date; end: Date }): Promise<any[]> {
    // In real implementation, this would call your actual sales API
    console.log('Fetching real sales data from business database...', dateRange ? `for ${dateRange.start} to ${dateRange.end}` : 'all data');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(sampleBusinessData.salesData);
      }, 1000);
    });
  }

  static async fetchProductPerformance(): Promise<any[]> {
    console.log('Fetching real product performance from inventory system...');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(sampleBusinessData.productData);
      }, 800);
    });
  }

  static async fetchCustomerAnalytics(): Promise<any[]> {
    console.log('Fetching real customer data from CRM system...');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(sampleBusinessData.customerData);
      }, 1200);
    });
  }

  static async fetchRegionalData(): Promise<any[]> {
    console.log('Fetching real regional performance data...');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(sampleBusinessData.regionalData);
      }, 900);
    });
  }

  static async fetchRealTimeMetrics(): Promise<any> {
    console.log('Fetching real-time business metrics...');
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate real-time updates
        const metrics = {
          ...sampleBusinessData.realTimeMetrics,
          currentRevenue: sampleBusinessData.realTimeMetrics.currentRevenue + Math.floor(Math.random() * 5000),
          todayOrders: sampleBusinessData.realTimeMetrics.todayOrders + Math.floor(Math.random() * 10),
          activeUsers: sampleBusinessData.realTimeMetrics.activeUsers + Math.floor(Math.random() * 50) - 25,
          lastUpdated: new Date().toISOString()
        };
        resolve(metrics);
      }, 500);
    });
  }

  static async fetchInventoryData(): Promise<any[]> {
    console.log('Fetching real inventory data from warehouse system...');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(sampleBusinessData.inventoryData);
      }, 700);
    });
  }

  static async fetchCampaignData(): Promise<any[]> {
    console.log('Fetching real marketing campaign data...');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(sampleBusinessData.campaignData);
      }, 1100);
    });
  }

  // Data validation and quality check
  static validateBusinessData(data: any[]): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(data) || data.length === 0) {
      errors.push('No data provided or data is not an array');
      return { isValid: false, errors, warnings };
    }

    // Check for required fields
    const firstItem = data[0];
    const requiredFields = ['revenue', 'sales', 'orders', 'customers'];
    
    requiredFields.forEach(field => {
      if (!(field in firstItem)) {
        warnings.push(`Recommended field '${field}' not found in data`);
      }
    });

    // Check for data consistency
    data.forEach((item, index) => {
      Object.keys(firstItem).forEach(key => {
        if (!(key in item)) {
          warnings.push(`Row ${index + 1}: Missing field '${key}'`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Format business data for charts
  static formatForCharts(data: any[], chartType: 'sales' | 'products' | 'regions' | 'customers'): any[] {
    switch (chartType) {
      case 'sales':
        return data.map(item => ({
          month: item.month || item.period,
          revenue: item.revenue || item.sales,
          orders: item.orders || item.transactions,
          customers: item.customers || item.users
        }));
      
      case 'products':
        return data.map(item => ({
          name: item.product || item.name,
          value: item.sales || item.revenue,
          profit: item.profit || item.margin,
          units: item.units || item.quantity
        }));
      
      case 'regions':
        return data.map(item => ({
          region: item.region || item.location,
          revenue: item.revenue || item.sales,
          growth: item.growth || item.change,
          customers: item.customers || item.users
        }));
      
      case 'customers':
        return data.map(item => ({
          segment: item.segment || item.category,
          count: item.count || item.size,
          value: item.averageOrderValue || item.value,
          revenue: item.totalRevenue || item.revenue
        }));
      
      default:
        return data;
    }
  }
}

// Export the service for use in components
export default RealBusinessDataService;
