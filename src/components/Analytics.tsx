import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Loader, 
  CheckCircle,
  AlertCircle,
  Target,
  Activity,
  Brain,
  PieChart as PieIcon,
  Zap
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useUploadedData } from '../context/UploadedDataContext';
import { AdvancedReportService, AdvancedReport } from '../services/advancedReportService';

interface AnalyticsProps {
  className?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ className }) => {
  const { data: uploadedData, columns: uploadedColumns } = useUploadedData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAnalytics, setGeneratedAnalytics] = useState<AdvancedReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'categories' | 'distributions' | 'predictions' | 'visualizations'>('overview');

  // Auto-generate analytics when data is available
  useEffect(() => {
    if (uploadedData && uploadedData.length > 0 && uploadedColumns.length > 0) {
      generateAdvancedAnalytics();
    }
  }, [uploadedData, uploadedColumns]);

  // Generate advanced AI-powered analytics
  const generateAdvancedAnalytics = async () => {
    if (!uploadedData || !uploadedColumns || uploadedData.length === 0) {
      setError('Please upload data first to generate analytics.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('🚀 Generating advanced AI analytics...');
      const analytics = await AdvancedReportService.generateAdvancedReport(uploadedData, uploadedColumns);
      setGeneratedAnalytics(analytics);
      console.log('✅ Advanced analytics generated successfully');
    } catch (err) {
      console.error('Analytics generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate analytics');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export analytics in different formats
  const exportAnalytics = async (format: 'pdf' | 'word' | 'json') => {
    if (!generatedAnalytics) return;

    try {
      if (format === 'json') {
        const exportData = {
          ...generatedAnalytics,
          generatedAt: generatedAnalytics.generatedAt.toISOString()
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `advanced_analytics_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // PDF/HTML export
        const htmlContent = `
          <html>
            <head>
              <title>AI-Powered Analytics - ${generatedAnalytics.title}</title>
              <style>
                body { font-family: 'Arial', sans-serif; margin: 40px; line-height: 1.6; color: #333; }
                .header { text-align: center; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
                .section { margin-bottom: 30px; }
                .metric { background: #F8FAFC; padding: 15px; border-left: 4px solid #4F46E5; margin: 10px 0; }
                .insight { background: #FEF3C7; padding: 12px; border-radius: 6px; margin: 8px 0; }
                .recommendation { background: #D1FAE5; padding: 12px; border-radius: 6px; margin: 8px 0; }
                h1, h2, h3 { color: #1F2937; }
                .metadata { font-size: 0.9em; color: #6B7280; background: #F9FAFB; padding: 15px; border-radius: 6px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>AI-Powered Analytics Report</h1>
                <h2>${generatedAnalytics.title}</h2>
                <p>Generated: ${generatedAnalytics.generatedAt.toLocaleDateString()} | Accuracy: ${generatedAnalytics.accuracy}%</p>
              </div>
              
              <div class="section">
                <h2>Executive Summary</h2>
                <div>${generatedAnalytics.executiveSummary.replace(/\n/g, '<br>')}</div>
              </div>
              
              <div class="section">
                <h2>Key Insights</h2>
                ${generatedAnalytics.keyFindings.map(finding => `<div class="insight">• ${finding}</div>`).join('')}
              </div>
              
              <div class="section">
                <h2>Predictive Analysis</h2>
                ${generatedAnalytics.predictions.map(pred => `
                  <div class="recommendation">
                    <strong>${pred.column}:</strong> ${pred.prediction}<br>
                    <em>Confidence: ${pred.confidence.toFixed(0)}% | ${pred.timeframe}</em>
                  </div>
                `).join('')}
              </div>
              
              <div class="section">
                <h2>Data Quality Metrics</h2>
                <div class="metric">Total Records: ${generatedAnalytics.dataOverview.totalRecords.toLocaleString()}</div>
                <div class="metric">Data Quality Score: ${generatedAnalytics.dataOverview.qualityScore}%</div>
                <div class="metric">Completeness: ${generatedAnalytics.dataOverview.completenessScore}%</div>
                <div class="metric">Trend Strength: ${generatedAnalytics.trendAnalysis.trendStrength.toFixed(1)}%</div>
              </div>
              
              <div class="metadata">
                <h3>Analytics Metadata</h3>
                <p>Processing Time: ${generatedAnalytics.metadata.processingTime}ms</p>
                <p>Data Size: ${generatedAnalytics.metadata.dataSize}</p>
                <p>AI Algorithms Used: ${generatedAnalytics.metadata.algorithmsUsed.join(', ')}</p>
              </div>
            </body>
          </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_analytics_${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const renderVisualization = (viz: any) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#ffbb28', '#ff8042'];
    
    switch (viz.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viz.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viz.config.xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={viz.config.yKey} 
                stroke={viz.config.color} 
                strokeWidth={2}
                dot={{ fill: viz.config.color, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={viz.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viz.config.xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={viz.config.yKey} fill={viz.config.color} />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={viz.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={viz.config.valueKey}
              >
                {viz.data.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={viz.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viz.config.xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={viz.config.yKey} fill={viz.config.color} />
            </BarChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div className="text-gray-500">Visualization type not supported</div>;
    }
  };

  if (isGenerating) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
        <div className="flex items-center justify-center space-x-4">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Generating Real-Time Analytics</h3>
            <p className="text-gray-600">Processing {uploadedData?.length?.toLocaleString()} records with live statistical analysis...</p>
            <div className="mt-2 text-sm text-blue-600">
              ⚡ Real-time data processing • Statistical accuracy calculation • Live trend analysis
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">Analytics Generation Failed</h3>
          <p className="mt-1 text-gray-600">{error}</p>
          <button
            onClick={generateAdvancedAnalytics}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!uploadedData || uploadedData.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">No Data Available</h3>
          <p className="mt-1 text-gray-600">Please upload data in the Dashboard section first to generate analytics.</p>
        </div>
      </div>
    );
  }

  if (!generatedAnalytics) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
        <div className="text-center">
          <Brain className="mx-auto h-12 w-12 text-blue-500" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">Ready to Generate Analytics</h3>
          <p className="mt-1 text-gray-600">Click the button below to generate real-time AI analytics with accurate statistical insights.</p>
          <button
            onClick={generateAdvancedAnalytics}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <Zap className="h-5 w-5" />
            <span>Generate Real-Time Analytics</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-2xl ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Real-Time AI Analytics</h1>
            <p className="text-blue-100 mt-1">
              {generatedAnalytics.dataOverview.totalRecords.toLocaleString()} records • {generatedAnalytics.accuracy}% real-time accuracy • 
              Generated {generatedAnalytics.generatedAt.toLocaleDateString()} at {generatedAnalytics.generatedAt.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => exportAnalytics('json')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => exportAnalytics('pdf')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>HTML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'categories', label: 'Categories', icon: BarChart3 },
            { id: 'distributions', label: 'Distributions', icon: Activity },
            { id: 'predictions', label: 'Predictions', icon: Brain },
            { id: 'visualizations', label: 'Charts', icon: PieIcon }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Executive Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-600" />
                Real-Time AI Insights Summary
              </h2>
              <div className="mb-4 bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Analysis Accuracy</span>
                  <span className="text-lg font-bold text-blue-900">{generatedAnalytics.accuracy}%</span>
                </div>
                <div className="mt-1 bg-blue-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${generatedAnalytics.accuracy}%` }}
                  ></div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Based on data quality, sample size, and statistical confidence
                </p>
              </div>
              <div className="prose text-gray-700 whitespace-pre-line">
                {generatedAnalytics.executiveSummary}
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Data Quality</p>
                    <p className="text-2xl font-bold text-blue-900">{generatedAnalytics.dataOverview.qualityScore}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-xl">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Completeness</p>
                    <p className="text-2xl font-bold text-green-900">{generatedAnalytics.dataOverview.completenessScore}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-xl">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Trend Strength</p>
                    <p className="text-2xl font-bold text-purple-900">{generatedAnalytics.trendAnalysis.trendStrength.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-xl">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">Predictions</p>
                    <p className="text-2xl font-bold text-orange-900">{generatedAnalytics.predictions.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Findings */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3 text-2xl">💡</span>
                Key Business Insights
              </h3>
              
              {generatedAnalytics.keyFindings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedAnalytics.keyFindings.map((finding, index) => {
                    // Extract icon and clean text
                    const iconMatch = finding.match(/^([📊📈📉⚠️🏆✅💰⚡🌍🔍🎯])\s*/);
                    const icon = iconMatch ? iconMatch[1] : '💡';
                    const cleanText = finding.replace(/^([📊📈📉⚠️🏆✅💰⚡🌍🔍🎯])\s*/, '');
                    
                    // Determine card style based on content
                    const isPositive = finding.includes('growth') || finding.includes('excellent') || finding.includes('positive') || finding.includes('top');
                    const isWarning = finding.includes('⚠️') || finding.includes('declining') || finding.includes('needs');
                    const isNeutral = !isPositive && !isWarning;
                    
                    let cardStyle = 'bg-blue-50 border-blue-200 border-l-blue-400';
                    if (isPositive) cardStyle = 'bg-green-50 border-green-200 border-l-green-400';
                    if (isWarning) cardStyle = 'bg-yellow-50 border-yellow-200 border-l-yellow-400';
                    
                    return (
                      <div key={index} className={`${cardStyle} border border-l-4 p-4 rounded-r-lg shadow-sm hover:shadow-md transition-all duration-200`}>
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl flex-shrink-0 mt-1">
                            {icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 leading-relaxed font-medium">{cleanText}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
                  <div className="text-gray-400 text-4xl mb-3">📊</div>
                  <p className="text-gray-600 font-medium">No insights available yet</p>
                  <p className="text-gray-500 text-sm mt-1">Upload data to generate meaningful business insights</p>
                </div>
              )}
            </div>

            {/* Opportunities */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3 text-2xl">🚀</span>
                Strategic Opportunities
              </h3>
              
              {generatedAnalytics.opportunities.length > 0 ? (
                <div className="space-y-3">
                  {generatedAnalytics.opportunities.map((opportunity, index) => {
                    const iconMatch = opportunity.match(/^([🚀📊📈🎯🔗💡📍🔍])\s*/);
                    const icon = iconMatch ? iconMatch[1] : '🚀';
                    const cleanText = opportunity.replace(/^([🚀📊📈🎯🔗💡📍🔍])\s*/, '');
                    
                    return (
                      <div key={index} className="bg-green-50 border border-green-200 border-l-4 border-l-green-400 p-4 rounded-r-lg shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl flex-shrink-0 mt-1">
                            {icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 leading-relaxed font-medium">{cleanText}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
                  <div className="text-gray-400 text-4xl mb-3">🚀</div>
                  <p className="text-gray-600 font-medium">Strategic opportunities will appear here</p>
                  <p className="text-gray-500 text-sm mt-1">Based on your data analysis and performance patterns</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold mb-4">Overall Trend Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Trend Direction</p>
                  <p className="text-xl font-bold capitalize text-blue-600">{generatedAnalytics.trendAnalysis.overallTrend}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Growth Rate</p>
                  <p className="text-xl font-bold text-green-600">{generatedAnalytics.trendAnalysis.growthRate.toFixed(2)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Volatility Index</p>
                  <p className="text-xl font-bold text-orange-600">{generatedAnalytics.trendAnalysis.volatilityIndex.toFixed(1)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Column-wise Trends</h3>
              <div className="space-y-4">
                {generatedAnalytics.trendAnalysis.trendDetails.map((trend, index) => (
                  <div key={index} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{trend.column}</h4>
                        <p className="text-gray-600">{trend.description}</p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          trend.trend === 'increasing' 
                            ? 'bg-green-100 text-green-800'
                            : trend.trend === 'decreasing'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {trend.trend === 'increasing' ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : trend.trend === 'decreasing' ? (
                            <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />
                          ) : null}
                          {trend.confidence.toFixed(0)}% confidence
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            {generatedAnalytics.categoryPerformance.topPerformers.length > 0 && (
              <>
                <div>
                  <h3 className="text-lg font-bold mb-4">Top Performers</h3>
                  <div className="space-y-2">
                    {generatedAnalytics.categoryPerformance.topPerformers.map((performer, index) => (
                      <div key={index} className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-green-900">#{performer.rank} {performer.category}</h4>
                          <p className="text-green-700">{performer.percentage.toFixed(1)}% of total</p>
                        </div>
                        <div className="text-2xl font-bold text-green-800">
                          {performer.value.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4">Areas for Improvement</h3>
                  <div className="space-y-2">
                    {generatedAnalytics.categoryPerformance.bottomPerformers.map((performer, index) => (
                      <div key={index} className="bg-red-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-red-900">#{performer.rank} {performer.category}</h4>
                          <p className="text-red-700">{performer.percentage.toFixed(1)}% of total</p>
                        </div>
                        <div className="text-2xl font-bold text-red-800">
                          {performer.value.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'distributions' && (
          <div className="space-y-6">
            {generatedAnalytics.numericDistributions.map((dist, index) => (
              <div key={index} className="bg-white border rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">{dist.column} Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Mean</p>
                    <p className="text-lg font-bold">{dist.mean.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Median</p>
                    <p className="text-lg font-bold">{dist.median.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Std Dev</p>
                    <p className="text-lg font-bold">{dist.standardDeviation.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Outliers</p>
                    <p className="text-lg font-bold">{dist.outliers.length}</p>
                  </div>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  dist.distribution === 'normal' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  Distribution: {dist.distribution}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-6">
            {generatedAnalytics.predictions.map((prediction, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{prediction.column}</h3>
                    <p className="text-gray-700 mt-1">{prediction.description}</p>
                    <div className="mt-3 space-y-1">
                      <p><span className="font-medium">Prediction:</span> {prediction.prediction}</p>
                      <p><span className="font-medium">Timeframe:</span> {prediction.timeframe}</p>
                      <p><span className="font-medium">Methodology:</span> {prediction.methodology}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-white px-3 py-2 rounded-lg">
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className="text-2xl font-bold text-blue-600">{prediction.confidence.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'visualizations' && (
          <div className="space-y-8">
            {generatedAnalytics.visualizations.map((viz, index) => (
              <div key={index} className="bg-white border rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">{viz.title}</h3>
                {renderVisualization(viz)}
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Insights:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {viz.insights.map((insight: string, i: number) => (
                      <li key={i} className="text-gray-700">{insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations Footer */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-b-xl border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3 text-2xl">🎯</span>
          AI-Powered Action Recommendations
        </h3>
        
        {generatedAnalytics.recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedAnalytics.recommendations.map((recommendation, index) => {
              const iconMatch = recommendation.match(/^([🎯🔧📊🛡️🔬💡])\s*/);
              const icon = iconMatch ? iconMatch[1] : '💡';
              const cleanText = recommendation.replace(/^([🎯🔧📊🛡️🔬💡])\s*/, '');
              
              return (
                <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl flex-shrink-0 mt-1">
                      {icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed font-medium">{cleanText}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-6 rounded-lg text-center">
            <div className="text-gray-400 text-4xl mb-3">🎯</div>
            <p className="text-gray-600 font-medium">Action recommendations will appear here</p>
            <p className="text-gray-500 text-sm mt-1">Based on your data insights and business intelligence</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
