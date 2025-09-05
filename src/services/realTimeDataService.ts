export interface RealTimeMetrics {
  timestamp: string;
  sales: number;
  orders: number;
  conversions: number;
  impressions: number;
  revenue: number;
  avgOrderValue: number;
  campaignSpend: number;
  roas: number;
  conversionRate: number;
  ctr: number; // Click-through rate
  cpm: number; // Cost per mille
  bounceRate: number;
  sessionDuration: number;
}

export interface CampaignMetrics {
  id: string;
  name: string;
  type: 'email' | 'social' | 'ppc' | 'display' | 'organic';
  status: 'active' | 'paused' | 'completed';
  startTime: string;
  endTime?: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  lift: number;
  confidence: number;
}

export interface AlertData {
  id: string;
  type: 'spike' | 'drop' | 'anomaly' | 'campaign' | 'seasonal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  message: string;
  timestamp: string;
  value: number;
  threshold: number;
  autoResolved: boolean;
}

class RealTimeDataService {
  private ws: WebSocket | null = null;
  private isConnected = false;

  // Simulate real-time data generation
  generateRealTimeData(): RealTimeMetrics {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Create realistic business patterns
    const businessHoursMultiplier = hour >= 9 && hour <= 17 ? 1.5 : 0.7;
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.6 : 1.0;
    const lunchTimeMultiplier = hour >= 12 && hour <= 14 ? 1.2 : 1.0;
    const peakHoursMultiplier = (hour >= 10 && hour <= 12) || (hour >= 15 && hour <= 17) ? 1.3 : 1.0;
    
    // Add some randomness and seasonal patterns
    const randomVariation = 0.8 + Math.random() * 0.4;
    const seasonalPattern = Math.sin((hour / 24) * 2 * Math.PI) * 0.2 + 1;
    
    // Campaign effect simulation
    const campaignBoost = Math.random() > 0.9 ? 1.3 + Math.random() * 0.7 : 1.0;
    
    const totalMultiplier = businessHoursMultiplier * weekendMultiplier * 
                           lunchTimeMultiplier * peakHoursMultiplier * 
                           randomVariation * seasonalPattern * campaignBoost;
    
    // Base metrics
    const baseImpressions = 1000;
    const baseCTR = 0.025; // 2.5%
    const baseConversionRate = 0.03; // 3%
    const baseAOV = 150;
    
    const impressions = Math.round(baseImpressions * totalMultiplier);
    const clicks = Math.round(impressions * baseCTR * (0.8 + Math.random() * 0.4));
    const conversions = Math.round(clicks * baseConversionRate * (0.7 + Math.random() * 0.6));
    const avgOrderValue = baseAOV * (0.8 + Math.random() * 0.4);
    const revenue = conversions * avgOrderValue;
    const campaignSpend = revenue * (0.15 + Math.random() * 0.15); // 15-30% of revenue
    
    return {
      timestamp: now.toISOString(),
      sales: conversions,
      orders: conversions,
      conversions,
      impressions,
      revenue,
      avgOrderValue,
      campaignSpend,
      roas: revenue / Math.max(campaignSpend, 1),
      conversionRate: (conversions / Math.max(clicks, 1)) * 100,
      ctr: (clicks / Math.max(impressions, 1)) * 100,
      cpm: (campaignSpend / Math.max(impressions, 1)) * 1000,
      bounceRate: 30 + Math.random() * 40, // 30-70%
      sessionDuration: 120 + Math.random() * 300 // 2-7 minutes
    };
  }

  generateCampaignData(): CampaignMetrics[] {
    const campaigns = [
      { name: 'Holiday Sale 2024', type: 'email' as const },
      { name: 'Social Media Boost', type: 'social' as const },
      { name: 'Google Ads Campaign', type: 'ppc' as const },
      { name: 'Display Network', type: 'display' as const },
      { name: 'Organic Growth', type: 'organic' as const },
      { name: 'Retargeting Campaign', type: 'ppc' as const },
      { name: 'Influencer Partnership', type: 'social' as const }
    ];

    return campaigns.slice(0, 5).map((campaign, index) => {
      const now = new Date();
      const startTime = new Date(now.getTime() - (index + 1) * 4 * 60 * 60 * 1000);
      const budget = 5000 + Math.random() * 15000;
      const spent = budget * (0.3 + Math.random() * 0.6);
      const impressions = Math.round(spent * (100 + Math.random() * 200));
      const clicks = Math.round(impressions * (0.02 + Math.random() * 0.05));
      const conversions = Math.round(clicks * (0.02 + Math.random() * 0.08));
      const revenue = conversions * (100 + Math.random() * 200);
      const lift = -30 + Math.random() * 80;

      return {
        id: `campaign_${index}`,
        name: campaign.name,
        type: campaign.type,
        status: Math.random() > 0.8 ? 'paused' : 'active' as const,
        startTime: startTime.toISOString(),
        budget,
        spent,
        impressions,
        clicks,
        conversions,
        revenue,
        lift,
        confidence: 75 + Math.random() * 20
      };
    });
  }

  generateAlerts(): AlertData[] {
    const alertTypes = [
      {
        type: 'spike' as const,
        metric: 'Revenue',
        message: 'Revenue spike detected - 45% above normal',
        severity: 'medium' as const,
        value: 15000,
        threshold: 10000
      },
      {
        type: 'drop' as const,
        metric: 'Conversion Rate',
        message: 'Conversion rate dropped below threshold',
        severity: 'high' as const,
        value: 1.8,
        threshold: 2.5
      },
      {
        type: 'campaign' as const,
        metric: 'ROAS',
        message: 'Campaign performance exceeding expectations',
        severity: 'low' as const,
        value: 4.2,
        threshold: 3.0
      },
      {
        type: 'anomaly' as const,
        metric: 'Traffic',
        message: 'Unusual traffic pattern detected',
        severity: 'medium' as const,
        value: 5000,
        threshold: 3000
      }
    ];

    // Return 1-3 random alerts
    const numAlerts = Math.floor(Math.random() * 3) + 1;
    return alertTypes.slice(0, numAlerts).map((alert, index) => ({
      ...alert,
      id: `alert_${Date.now()}_${index}`,
      timestamp: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(),
      autoResolved: Math.random() > 0.7
    }));
  }

  // Simulate historical data for trends
  generateHistoricalData(minutes: number): RealTimeMetrics[] {
    const data: RealTimeMetrics[] = [];
    const now = new Date();

    for (let i = minutes; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000);
      
      // Temporarily set the current time for pattern generation
      const originalNow = Date.now;
      Date.now = () => timestamp.getTime();
      
      const metrics = this.generateRealTimeData();
      metrics.timestamp = timestamp.toISOString();
      data.push(metrics);
      
      // Restore original Date.now
      Date.now = originalNow;
    }

    return data;
  }

  // WebSocket connection simulation (for future real implementation)
  connect(onData: (data: RealTimeMetrics) => void, onError?: (error: Error) => void) {
    try {
      // In a real implementation, this would connect to a WebSocket server
      // For now, we'll simulate with intervals
      const interval = setInterval(() => {
        const data = this.generateRealTimeData();
        onData(data);
      }, 1000); // Update every second

      this.isConnected = true;
      
      // Return cleanup function
      return () => {
        clearInterval(interval);
        this.isConnected = false;
      };
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      return () => {};
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const realTimeDataService = new RealTimeDataService();
