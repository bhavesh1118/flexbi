import { HyperlocalData } from '../types';

interface HyperlocalApiResponse {
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

class HyperlocalDataService {
  private baseUrl: string;
  private cache: Map<string, HyperlocalData[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Check if we have a backend server running
    this.baseUrl = 'http://localhost:3002';
  }

  /**
   * Fetch real hyperlocal data from API or file
   */
  async fetchHyperlocalData(): Promise<HyperlocalData[]> {
    const cacheKey = 'hyperlocal_data';
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Try to fetch from API first
      const apiData = await this.fetchFromAPI();
      if (apiData && apiData.length > 0) {
        this.updateCache(cacheKey, apiData);
        return apiData;
      }
    } catch (error) {
      console.warn('Failed to fetch from API, trying local data:', error);
    }

    try {
      // Fallback to local data file
      const localData = await this.fetchFromLocalFile();
      if (localData && localData.length > 0) {
        this.updateCache(cacheKey, localData);
        return localData;
      }
    } catch (error) {
      console.warn('Failed to fetch from local file:', error);
    }

    // If all else fails, return enriched sample data
    console.info('Using enriched sample data as fallback');
    const fallbackData = this.generateEnrichedSampleData();
    this.updateCache(cacheKey, fallbackData);
    return fallbackData;
  }

  /**
   * Fetch data from backend API
   */
  private async fetchFromAPI(): Promise<HyperlocalData[]> {
    const response = await fetch(`${this.baseUrl}/api/hyperlocal-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const apiData: HyperlocalApiResponse[] = await response.json();
    return this.transformApiData(apiData);
  }

  /**
   * Fetch data from local JSON file
   */
  private async fetchFromLocalFile(): Promise<HyperlocalData[]> {
    try {
      // Try to load from a local data file
      const response = await fetch('/data/hyperlocal-data.json');
      if (!response.ok) {
        throw new Error('Local data file not found');
      }
      
      const localData: HyperlocalApiResponse[] = await response.json();
      return this.transformApiData(localData);
    } catch (error) {
      throw new Error('Failed to load local hyperlocal data file');
    }
  }

  /**
   * Transform API/file data to internal format
   */
  private transformApiData(apiData: HyperlocalApiResponse[]): HyperlocalData[] {
    return apiData.map(item => ({
      pincode: item.pincode,
      neighborhood: item.neighborhood,
      city: item.city,
      state: item.state,
      sales: item.sales,
      impressions: item.impressions,
      conversions: item.conversions,
      conversionRate: item.conversionRate,
      avgOrderValue: item.avgOrderValue,
      productsSold: item.productsSold,
      timestamp: new Date().toISOString(),
      topProducts: item.topProducts,
      demographics: item.demographics,
      timeOfDay: item.timeOfDay
    }));
  }

  /**
   * Generate enriched sample data (better than purely random)
   */
  private generateEnrichedSampleData(): HyperlocalData[] {
    // Real Indian neighborhoods with realistic data patterns
    const realNeighborhoods = [
      { pincode: '110001', neighborhood: 'Connaught Place', city: 'New Delhi', state: 'Delhi', tier: 'premium' },
      { pincode: '400001', neighborhood: 'Fort', city: 'Mumbai', state: 'Maharashtra', tier: 'premium' },
      { pincode: '560001', neighborhood: 'Chickpet', city: 'Bangalore', state: 'Karnataka', tier: 'mid' },
      { pincode: '600001', neighborhood: 'George Town', city: 'Chennai', state: 'Tamil Nadu', tier: 'mid' },
      { pincode: '700001', neighborhood: 'BBD Bagh', city: 'Kolkata', state: 'West Bengal', tier: 'mid' },
      { pincode: '411001', neighborhood: 'Pune Station', city: 'Pune', state: 'Maharashtra', tier: 'mid' },
      { pincode: '500001', neighborhood: 'Abids', city: 'Hyderabad', state: 'Telangana', tier: 'mid' },
      { pincode: '110016', neighborhood: 'Lajpat Nagar', city: 'New Delhi', state: 'Delhi', tier: 'premium' },
      { pincode: '400050', neighborhood: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', tier: 'premium' },
      { pincode: '560017', neighborhood: 'Rajajinagar', city: 'Bangalore', state: 'Karnataka', tier: 'premium' },
      { pincode: '600017', neighborhood: 'T. Nagar', city: 'Chennai', state: 'Tamil Nadu', tier: 'premium' },
      { pincode: '700019', neighborhood: 'Salt Lake', city: 'Kolkata', state: 'West Bengal', tier: 'premium' },
      { pincode: '302001', neighborhood: 'Pink City', city: 'Jaipur', state: 'Rajasthan', tier: 'tourist' },
      { pincode: '380001', neighborhood: 'Lal Darwaja', city: 'Ahmedabad', state: 'Gujarat', tier: 'commercial' },
      { pincode: '682001', neighborhood: 'Ernakulam', city: 'Kochi', state: 'Kerala', tier: 'commercial' }
    ];

    const realProducts = [
      { name: 'iPhone 15 Pro', category: 'Electronics', avgPrice: 125000 },
      { name: 'Samsung Galaxy S24', category: 'Electronics', avgPrice: 85000 },
      { name: 'MacBook Air M3', category: 'Electronics', avgPrice: 115000 },
      { name: 'Levi\'s Jeans', category: 'Fashion', avgPrice: 3500 },
      { name: 'Nike Air Force 1', category: 'Fashion', avgPrice: 8500 },
      { name: 'Sony WH-1000XM5', category: 'Electronics', avgPrice: 32000 },
      { name: 'Zara Shirt', category: 'Fashion', avgPrice: 2500 },
      { name: 'Apple Watch Series 9', category: 'Electronics', avgPrice: 45000 },
      { name: 'OnePlus Nord CE', category: 'Electronics', avgPrice: 25000 },
      { name: 'Adidas Ultraboost', category: 'Fashion', avgPrice: 12000 }
    ];

    return realNeighborhoods.map((location) => {
      // Realistic multipliers based on area tier
      const tierMultipliers = {
        premium: { base: 2.5, variance: 0.8 },
        mid: { base: 1.5, variance: 0.6 },
        commercial: { base: 1.8, variance: 0.7 },
        tourist: { base: 1.2, variance: 0.9 }
      };

      const multiplier = tierMultipliers[location.tier as keyof typeof tierMultipliers];
      const baseMultiplier = multiplier.base + (Math.random() - 0.5) * multiplier.variance;
      
      // More realistic impression ranges
      const impressions = Math.floor((8000 + Math.random() * 25000) * baseMultiplier);
      const conversionRate = 0.015 + Math.random() * 0.06; // 1.5-7.5%
      const conversions = Math.floor(impressions * conversionRate);
      
      // Realistic order values based on area
      const baseOrderValue = location.tier === 'premium' ? 2500 : 
                           location.tier === 'commercial' ? 1800 : 1200;
      const avgOrderValue = baseOrderValue + Math.random() * 1500;
      const sales = conversions * avgOrderValue;

      // Select realistic top products
      const topProducts = realProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(product => ({
          name: product.name,
          sales: Math.floor(sales * (0.15 + Math.random() * 0.25)),
          category: product.category
        }));

      // Realistic demographics based on area type
      const demographics = this.generateRealisticDemographics(location.tier);
      
      // Realistic hourly patterns
      const timeOfDay = Array.from({ length: 24 }, (_, hour) => {
        const hourMultiplier = this.getHourlyMultiplier(hour);
        return {
          hour,
          sales: Math.floor(sales / 24 * hourMultiplier),
          conversions: Math.floor(conversions / 24 * hourMultiplier)
        };
      });

      return {
        pincode: location.pincode,
        neighborhood: location.neighborhood,
        city: location.city,
        state: location.state,
        sales: Math.floor(sales),
        impressions,
        conversions,
        conversionRate: conversionRate * 100,
        avgOrderValue: Math.floor(avgOrderValue),
        productsSold: conversions,
        timestamp: new Date().toISOString(),
        topProducts,
        demographics,
        timeOfDay
      };
    });
  }

  private generateRealisticDemographics(tier: string) {
    const patterns = {
      premium: [
        { ageGroup: '18-25', percentage: 15 + Math.random() * 10 },
        { ageGroup: '26-35', percentage: 35 + Math.random() * 10 },
        { ageGroup: '36-45', percentage: 25 + Math.random() * 10 },
        { ageGroup: '46-55', percentage: 15 + Math.random() * 8 },
        { ageGroup: '55+', percentage: 10 + Math.random() * 5 }
      ],
      mid: [
        { ageGroup: '18-25', percentage: 25 + Math.random() * 10 },
        { ageGroup: '26-35', percentage: 30 + Math.random() * 10 },
        { ageGroup: '36-45', percentage: 20 + Math.random() * 10 },
        { ageGroup: '46-55', percentage: 15 + Math.random() * 8 },
        { ageGroup: '55+', percentage: 10 + Math.random() * 7 }
      ],
      commercial: [
        { ageGroup: '18-25', percentage: 20 + Math.random() * 15 },
        { ageGroup: '26-35', percentage: 35 + Math.random() * 10 },
        { ageGroup: '36-45', percentage: 25 + Math.random() * 10 },
        { ageGroup: '46-55', percentage: 12 + Math.random() * 8 },
        { ageGroup: '55+', percentage: 8 + Math.random() * 5 }
      ],
      tourist: [
        { ageGroup: '18-25', percentage: 30 + Math.random() * 15 },
        { ageGroup: '26-35', percentage: 28 + Math.random() * 12 },
        { ageGroup: '36-45', percentage: 22 + Math.random() * 10 },
        { ageGroup: '46-55', percentage: 12 + Math.random() * 8 },
        { ageGroup: '55+', percentage: 8 + Math.random() * 5 }
      ]
    };

    return patterns[tier as keyof typeof patterns] || patterns.mid;
  }

  private getHourlyMultiplier(hour: number): number {
    // Realistic hourly traffic patterns
    const patterns = [
      0.2, 0.1, 0.1, 0.1, 0.2, 0.3, 0.5, 0.7, // 0-7 AM
      0.8, 1.0, 1.3, 1.5, 1.7, 1.4, 1.6, 1.8, // 8-15 (8AM-3PM)
      2.0, 2.2, 2.4, 2.1, 1.8, 1.5, 1.0, 0.6  // 16-23 (4PM-11PM)
    ];
    return patterns[hour] || 1.0;
  }

  /**
   * Update specific location data (for real-time updates)
   */
  async updateLocationData(pincode: string, updates: Partial<HyperlocalData>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/hyperlocal-data/${pincode}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        // Invalidate cache
        this.cache.clear();
        this.cacheExpiry.clear();
      }
    } catch (error) {
      console.warn('Failed to update location data:', error);
    }
  }

  /**
   * Cache management
   */
  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    const data = this.cache.get(key);
    return !!(data && expiry && Date.now() < expiry);
  }

  private updateCache(key: string, data: HyperlocalData[]): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  /**
   * Clear cache manually
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export const hyperlocalDataService = new HyperlocalDataService();
export default hyperlocalDataService;
