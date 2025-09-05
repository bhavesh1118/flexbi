import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Cloud, 
  FileText, 
  Globe, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  Settings,
  BarChart3
} from 'lucide-react';
import { realDataService, RealDataSource } from '../services/realDataIntegrationService';
import RealDataDashboard from './RealDataDashboard';

interface RealDataIntegrationProps {
  onDataConnected: (data: any[], source: string) => void;
}

const RealDataIntegration: React.FC<RealDataIntegrationProps> = ({ onDataConnected }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sources' | 'api' | 'database' | 'files' | 'ecommerce' | 'analytics'>('dashboard');
  const [connectedSources, setConnectedSources] = useState<RealDataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // API Connection Form
  const [apiConfig, setApiConfig] = useState({
    name: '',
    url: '',
    apiKey: '',
    method: 'GET' as 'GET' | 'POST',
    headers: ''
  });

  // Google Sheets Config
  const [sheetsConfig, setSheetsConfig] = useState({
    sheetId: '',
    apiKey: ''
  });

  // Database Config
  const [dbConfig, setDbConfig] = useState({
    type: 'mongodb' as 'mongodb' | 'mysql' | 'postgresql',
    connectionString: '',
    query: '',
    database: ''
  });

  // E-commerce Config
  const [ecommerceConfig, setEcommerceConfig] = useState({
    platform: 'shopify' as 'shopify' | 'woocommerce' | 'magento',
    storeUrl: '',
    apiKey: '',
    apiSecret: ''
  });

  // Analytics Config
  const [analyticsConfig, setAnalyticsConfig] = useState({
    platform: 'google_analytics' as 'google_analytics' | 'facebook_ads' | 'google_ads',
    accessToken: '',
    accountId: '',
    propertyId: ''
  });

  useEffect(() => {
    loadConnectedSources();
  }, []);

  const loadConnectedSources = () => {
    const sources = realDataService.getConnectedSources();
    setConnectedSources(sources);
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAPIConnection = async () => {
    if (!apiConfig.name || !apiConfig.url) {
      showMessage('error', 'Please provide API name and URL');
      return;
    }

    setLoading(true);
    try {
      const headers = apiConfig.headers ? JSON.parse(apiConfig.headers) : {};
      const result = await realDataService.connectToAPI({
        name: apiConfig.name,
        url: apiConfig.url,
        apiKey: apiConfig.apiKey,
        headers,
        method: apiConfig.method
      });

      if (result.success && result.data) {
        onDataConnected(result.data, `API: ${apiConfig.name}`);
        showMessage('success', `Successfully connected to ${apiConfig.name} API`);
        loadConnectedSources();
        setApiConfig({ name: '', url: '', apiKey: '', method: 'GET', headers: '' });
      } else {
        showMessage('error', result.error || 'API connection failed');
      }
    } catch (error) {
      showMessage('error', 'Failed to connect to API');
    }
    setLoading(false);
  };

  const handleGoogleSheetsConnection = async () => {
    if (!sheetsConfig.sheetId || !sheetsConfig.apiKey) {
      showMessage('error', 'Please provide Google Sheets ID and API key');
      return;
    }

    setLoading(true);
    try {
      const result = await realDataService.connectToGoogleSheets(
        sheetsConfig.sheetId,
        sheetsConfig.apiKey
      );

      if (result.success && result.data) {
        onDataConnected(result.data, 'Google Sheets');
        showMessage('success', 'Successfully connected to Google Sheets');
        loadConnectedSources();
        setSheetsConfig({ sheetId: '', apiKey: '' });
      } else {
        showMessage('error', result.error || 'Google Sheets connection failed');
      }
    } catch (error) {
      showMessage('error', 'Failed to connect to Google Sheets');
    }
    setLoading(false);
  };

  const handleDatabaseConnection = async () => {
    if (!dbConfig.connectionString || !dbConfig.query) {
      showMessage('error', 'Please provide connection string and query');
      return;
    }

    setLoading(true);
    try {
      const result = await realDataService.connectToDatabase(dbConfig);

      if (result.success && result.data) {
        onDataConnected(result.data, `${dbConfig.type.toUpperCase()} Database`);
        showMessage('success', `Successfully connected to ${dbConfig.type} database`);
        loadConnectedSources();
        setDbConfig({ type: 'mongodb', connectionString: '', query: '', database: '' });
      } else {
        showMessage('error', result.error || 'Database connection failed');
      }
    } catch (error) {
      showMessage('error', 'Failed to connect to database');
    }
    setLoading(false);
  };

  const handleEcommerceConnection = async () => {
    if (!ecommerceConfig.storeUrl || !ecommerceConfig.apiKey) {
      showMessage('error', 'Please provide store URL and API key');
      return;
    }

    setLoading(true);
    try {
      const result = await realDataService.connectToEcommercePlatform(
        ecommerceConfig.platform,
        {
          storeUrl: ecommerceConfig.storeUrl,
          apiKey: ecommerceConfig.apiKey,
          apiSecret: ecommerceConfig.apiSecret
        }
      );

      if (result.success && result.data) {
        onDataConnected(result.data, `${ecommerceConfig.platform} Store`);
        showMessage('success', `Successfully connected to ${ecommerceConfig.platform}`);
        loadConnectedSources();
        setEcommerceConfig({ platform: 'shopify', storeUrl: '', apiKey: '', apiSecret: '' });
      } else {
        showMessage('error', result.error || 'E-commerce connection failed');
      }
    } catch (error) {
      showMessage('error', 'Failed to connect to e-commerce platform');
    }
    setLoading(false);
  };

  const handleAnalyticsConnection = async () => {
    if (!analyticsConfig.accessToken) {
      showMessage('error', 'Please provide access token');
      return;
    }

    setLoading(true);
    try {
      const result = await realDataService.connectToAnalyticsPlatform(
        analyticsConfig.platform,
        analyticsConfig
      );

      if (result.success && result.data) {
        onDataConnected(result.data, `${analyticsConfig.platform.replace('_', ' ')}`);
        showMessage('success', `Successfully connected to ${analyticsConfig.platform}`);
        loadConnectedSources();
        setAnalyticsConfig({ platform: 'google_analytics', accessToken: '', accountId: '', propertyId: '' });
      } else {
        showMessage('error', result.error || 'Analytics connection failed');
      }
    } catch (error) {
      showMessage('error', 'Failed to connect to analytics platform');
    }
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await realDataService.processBusinessFile(file);

      if (result.success && result.data) {
        onDataConnected(result.data, `File: ${file.name}`);
        showMessage('success', `Successfully processed ${file.name}`);
        loadConnectedSources();
      } else {
        showMessage('error', result.error || 'File processing failed');
      }
    } catch (error) {
      showMessage('error', 'Failed to process file');
    }
    setLoading(false);
  };

  const disconnectSource = (sourceId: string) => {
    if (realDataService.disconnectSource(sourceId)) {
      showMessage('success', 'Data source disconnected');
      loadConnectedSources();
    }
  };

  const syncAllSources = async () => {
    setLoading(true);
    try {
      const result = await realDataService.syncAllSources();
      showMessage('success', `Synced ${result.results.length} data sources`);
      loadConnectedSources();
    } catch (error) {
      showMessage('error', 'Failed to sync data sources');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🌍 Real Data Integration</h2>
        <p className="text-gray-600">
          Connect your actual business data sources - no more dummy data! 
          Import from APIs, databases, files, e-commerce platforms, and analytics tools.
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
             message.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
             <Globe className="w-4 h-4" />}
            {message.text}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b">
        {[
          { id: 'dashboard', label: 'Dummy vs Real Data', icon: BarChart3 },
          { id: 'sources', label: 'Connected Sources', icon: Database },
          { id: 'api', label: 'API Integration', icon: Cloud },
          { id: 'database', label: 'Database', icon: Database },
          { id: 'files', label: 'File Upload', icon: FileText },
          { id: 'ecommerce', label: 'E-commerce', icon: Globe },
          { id: 'analytics', label: 'Analytics', icon: Download }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-700 border-blue-500'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Comparison Tab */}
      {activeTab === 'dashboard' && (
        <div>
          <RealDataDashboard />
        </div>
      )}

      {/* Connected Sources Tab */}
      {activeTab === 'sources' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Connected Data Sources</h3>
            <button
              onClick={syncAllSources}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync All
            </button>
          </div>

          {connectedSources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No data sources connected yet.</p>
              <p className="text-sm">Use the tabs above to connect your real business data.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {connectedSources.map(source => (
                <div key={source.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-3 h-3 rounded-full ${
                          source.status === 'connected' ? 'bg-green-500' :
                          source.status === 'error' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}></span>
                        <h4 className="font-semibold">{source.name}</h4>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {source.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Last sync: {source.lastSync ? new Date(source.lastSync).toLocaleString() : 'Never'}
                      </p>
                      {source.url && (
                        <p className="text-xs text-gray-500 mt-1">URL: {source.url}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-500 hover:text-gray-700">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => disconnectSource(source.id)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* API Integration Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">🔗 API Integration</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Generic API Connection</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="API Name (e.g., Sales API)"
                    value={apiConfig.name}
                    onChange={(e) => setApiConfig({...apiConfig, name: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                  <input
                    type="url"
                    placeholder="API URL"
                    value={apiConfig.url}
                    onChange={(e) => setApiConfig({...apiConfig, url: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                  <input
                    type="password"
                    placeholder="API Key (optional)"
                    value={apiConfig.apiKey}
                    onChange={(e) => setApiConfig({...apiConfig, apiKey: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                  <select
                    value={apiConfig.method}
                    onChange={(e) => setApiConfig({...apiConfig, method: e.target.value as 'GET' | 'POST'})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                  <textarea
                    placeholder="Custom Headers (JSON format)"
                    value={apiConfig.headers}
                    onChange={(e) => setApiConfig({...apiConfig, headers: e.target.value})}
                    className="w-full p-2 border rounded-md h-20"
                  />
                  <button
                    onClick={handleAPIConnection}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Connecting...' : 'Connect API'}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Google Sheets Integration</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Google Sheets ID"
                    value={sheetsConfig.sheetId}
                    onChange={(e) => setSheetsConfig({...sheetsConfig, sheetId: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                  <input
                    type="password"
                    placeholder="Google Sheets API Key"
                    value={sheetsConfig.apiKey}
                    onChange={(e) => setSheetsConfig({...sheetsConfig, apiKey: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                  <button
                    onClick={handleGoogleSheetsConnection}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Connecting...' : 'Connect Google Sheets'}
                  </button>
                  <div className="text-xs text-gray-500">
                    <p>📝 How to get Google Sheets API key:</p>
                    <p>1. Go to Google Cloud Console</p>
                    <p>2. Enable Google Sheets API</p>
                    <p>3. Create credentials</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">🗄️ Database Connection</h3>
          <div className="max-w-md space-y-3">
            <select
              value={dbConfig.type}
              onChange={(e) => setDbConfig({...dbConfig, type: e.target.value as any})}
              className="w-full p-2 border rounded-md"
            >
              <option value="mongodb">MongoDB</option>
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
            </select>
            <input
              type="text"
              placeholder="Connection String"
              value={dbConfig.connectionString}
              onChange={(e) => setDbConfig({...dbConfig, connectionString: e.target.value})}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Database Name"
              value={dbConfig.database}
              onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
              className="w-full p-2 border rounded-md"
            />
            <textarea
              placeholder="Query"
              value={dbConfig.query}
              onChange={(e) => setDbConfig({...dbConfig, query: e.target.value})}
              className="w-full p-2 border rounded-md h-20"
            />
            <button
              onClick={handleDatabaseConnection}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Database'}
            </button>
          </div>
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">📁 File Upload</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Upload your business data files</p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Choose File
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: CSV, Excel (.xlsx, .xls)
            </p>
          </div>
        </div>
      )}

      {/* E-commerce Tab */}
      {activeTab === 'ecommerce' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">🛒 E-commerce Integration</h3>
          <div className="max-w-md space-y-3">
            <select
              value={ecommerceConfig.platform}
              onChange={(e) => setEcommerceConfig({...ecommerceConfig, platform: e.target.value as any})}
              className="w-full p-2 border rounded-md"
            >
              <option value="shopify">Shopify</option>
              <option value="woocommerce">WooCommerce</option>
              <option value="magento">Magento</option>
            </select>
            <input
              type="url"
              placeholder="Store URL"
              value={ecommerceConfig.storeUrl}
              onChange={(e) => setEcommerceConfig({...ecommerceConfig, storeUrl: e.target.value})}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="password"
              placeholder="API Key"
              value={ecommerceConfig.apiKey}
              onChange={(e) => setEcommerceConfig({...ecommerceConfig, apiKey: e.target.value})}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="password"
              placeholder="API Secret (if required)"
              value={ecommerceConfig.apiSecret}
              onChange={(e) => setEcommerceConfig({...ecommerceConfig, apiSecret: e.target.value})}
              className="w-full p-2 border rounded-md"
            />
            <button
              onClick={handleEcommerceConnection}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Store'}
            </button>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">📊 Analytics Integration</h3>
          <div className="max-w-md space-y-3">
            <select
              value={analyticsConfig.platform}
              onChange={(e) => setAnalyticsConfig({...analyticsConfig, platform: e.target.value as any})}
              className="w-full p-2 border rounded-md"
            >
              <option value="google_analytics">Google Analytics</option>
              <option value="facebook_ads">Facebook Ads</option>
              <option value="google_ads">Google Ads</option>
            </select>
            <input
              type="password"
              placeholder="Access Token"
              value={analyticsConfig.accessToken}
              onChange={(e) => setAnalyticsConfig({...analyticsConfig, accessToken: e.target.value})}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Account ID"
              value={analyticsConfig.accountId}
              onChange={(e) => setAnalyticsConfig({...analyticsConfig, accountId: e.target.value})}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Property ID (for GA)"
              value={analyticsConfig.propertyId}
              onChange={(e) => setAnalyticsConfig({...analyticsConfig, propertyId: e.target.value})}
              className="w-full p-2 border rounded-md"
            />
            <button
              onClick={handleAnalyticsConnection}
              disabled={loading}
              className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Analytics'}
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">🚀 Getting Started with Real Data</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• <strong>APIs:</strong> Connect to your business APIs or third-party services</p>
          <p>• <strong>Databases:</strong> Import data directly from your company database</p>
          <p>• <strong>Files:</strong> Upload CSV or Excel files with your actual business data</p>
          <p>• <strong>E-commerce:</strong> Connect your Shopify, WooCommerce, or Magento store</p>
          <p>• <strong>Analytics:</strong> Import data from Google Analytics, Facebook Ads, etc.</p>
          <p className="pt-2 font-medium">✅ All your real business data will replace the dummy data instantly!</p>
        </div>
      </div>
    </div>
  );
};

export default RealDataIntegration;
