// Enhanced backend connection utility with retry and error handling
export class BackendConnection {
  private static baseUrl = 'http://localhost:3002';
  private static retryAttempts = 3;
  private static retryDelay = 1000;
  
  static async fetchWithRetry(
    endpoint: string, 
    options: RequestInit = {},
    retries = this.retryAttempts
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error: any) {
      console.log(`🔄 Attempt ${this.retryAttempts - retries + 1} failed for ${endpoint}`);
      
      if (retries > 0 && !error.name?.includes('AbortError')) {
        await this.delay(this.retryDelay);
        return this.fetchWithRetry(endpoint, options, retries - 1);
      }
      
      throw error;
    }
  }
  
  static async get(endpoint: string): Promise<any> {
    try {
      const response = await this.fetchWithRetry(endpoint);
      return await response.json();
    } catch (error: any) {
      console.warn(`⚠️ GET ${endpoint} failed:`, error.message);
      throw error;
    }
  }
  
  static async post(endpoint: string, data: any, options: RequestInit = {}): Promise<any> {
    try {
      const requestOptions: RequestInit = {
        method: 'POST',
        ...options,
      };
      
      // Handle FormData differently from JSON
      if (data instanceof FormData) {
        requestOptions.body = data;
        // Don't set Content-Type for FormData, let browser set it with boundary
      } else {
        requestOptions.body = JSON.stringify(data);
        requestOptions.headers = {
          'Content-Type': 'application/json',
          ...options.headers,
        };
      }
      
      const response = await this.fetchWithRetry(endpoint, requestOptions);
      return await response.json();
    } catch (error: any) {
      console.warn(`⚠️ POST ${endpoint} failed:`, error.message);
      throw error;
    }
  }
  
  static async patch(endpoint: string, data: any): Promise<any> {
    try {
      const response = await this.fetchWithRetry(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error: any) {
      console.warn(`⚠️ PATCH ${endpoint} failed:`, error.message);
      throw error;
    }
  }
  
  static getUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  static async testConnection(): Promise<boolean> {
    try {
      await this.get('/');
      console.log('✅ Backend connection successful');
      return true;
    } catch (error) {
      console.log('❌ Backend connection failed - using offline mode');
      return false;
    }
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  static setBaseUrl(url: string) {
    this.baseUrl = url;
  }
}
