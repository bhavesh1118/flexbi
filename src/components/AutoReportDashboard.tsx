import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart as PieIcon,
  Download, FileText, Eye, Target, AlertTriangle,
  CheckCircle, ArrowRight, Zap, Brain, Activity
} from 'lucide-react';
import { AdvancedReportService, AdvancedReport } from '../services/advancedReportService';

interface AutoReportDashboardProps {
  data: any[];
  columns: string[];
  onClose?: () => void;
}

const AutoReportDashboard: React.FC<AutoReportDashboardProps> = ({ 
  data, 
  columns, 
  onClose 
}) => {
  const [report, setReport] = useState<AdvancedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'categories' | 'distributions' | 'predictions' | 'visualizations'>('overview');

  // Auto-generate report when component mounts
  useEffect(() => {
    generateReport();
  }, [data, columns]);

  const generateReport = async () => {
    if (!data || data.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Auto-generating advanced report...');
      const advancedReport = await AdvancedReportService.generateAdvancedReport(data, columns);
      setReport(advancedReport);
      console.log('✅ Advanced report generated successfully');
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'json') => {
    if (!report) return;
    
    try {
      if (format === 'json') {
        const exportData = {
          ...report,
          generatedAt: report.generatedAt.toISOString()
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `advanced_report_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // PDF export - create formatted HTML
        const htmlContent = `
          <html>
            <head>
              <title>${report.title}</title>
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
                <h1>${report.title}</h1>
                <p>Generated: ${report.generatedAt.toLocaleDateString()} | Accuracy: ${report.accuracy}%</p>
              </div>
              
              <div class="section">
                <h2>Executive Summary</h2>
                <div>${report.executiveSummary.replace(/\\n/g, '<br>')}</div>
              </div>
              
              <div class="section">
                <h2>Key Findings</h2>
                ${report.keyFindings.map(finding => `<div class="insight">• ${finding}</div>`).join('')}
              </div>
              
              <div class="section">
                <h2>Strategic Recommendations</h2>
                ${report.recommendations.map(rec => `<div class="recommendation">• ${rec}</div>`).join('')}
              </div>
              
              <div class="section">
                <h2>Data Overview</h2>
                <div class="metric">Total Records: ${report.dataOverview.totalRecords.toLocaleString()}</div>
                <div class="metric">Total Columns: ${report.dataOverview.totalColumns}</div>
                <div class="metric">Data Quality Score: ${report.dataOverview.qualityScore}%</div>
                <div class="metric">Completeness: ${report.dataOverview.completenessScore}%</div>
              </div>
              
              <div class="metadata">
                <h3>Report Metadata</h3>
                <p>Processing Time: ${report.metadata.processingTime}ms</p>
                <p>Data Size: ${report.metadata.dataSize}</p>
                <p>Algorithms Used: ${report.metadata.algorithmsUsed.join(', ')}</p>
              </div>
            </body>
          </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `advanced_report_${Date.now()}.html`;
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Generating Advanced Report</h3>
            <p className="text-gray-600">Analyzing {data.length.toLocaleString()} records with AI-powered insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">Report Generation Failed</h3>
          <p className="mt-1 text-gray-600">{error}</p>
          <button
            onClick={generateReport}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="bg-white rounded-xl shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{report.title}</h1>
            <p className="text-blue-100 mt-1">
              {report.dataOverview.totalRecords.toLocaleString()} records • {report.accuracy}% accuracy • 
              Generated {report.generatedAt.toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => exportReport('json')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => exportReport('pdf')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>HTML</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg"
              >
                ×
              </button>
            )}
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
                Executive Summary
              </h2>
              <div className="prose text-gray-700 whitespace-pre-line">
                {report.executiveSummary}
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Data Quality</p>
                    <p className="text-2xl font-bold text-blue-900">{report.dataOverview.qualityScore}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-xl">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Completeness</p>
                    <p className="text-2xl font-bold text-green-900">{report.dataOverview.completenessScore}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-xl">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Trend Strength</p>
                    <p className="text-2xl font-bold text-purple-900">{report.trendAnalysis.trendStrength.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-xl">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">Predictions</p>
                    <p className="text-2xl font-bold text-orange-900">{report.predictions.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Findings */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Key Findings</h3>
              <div className="space-y-3">
                {report.keyFindings.map((finding, index) => (
                  <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-gray-800">{finding}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Strategic Opportunities</h3>
              <div className="space-y-3">
                {report.opportunities.map((opportunity, index) => (
                  <div key={index} className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg flex items-start">
                    <ArrowRight className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                    <p className="text-gray-800">{opportunity}</p>
                  </div>
                ))}
              </div>
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
                  <p className="text-xl font-bold capitalize text-blue-600">{report.trendAnalysis.overallTrend}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Growth Rate</p>
                  <p className="text-xl font-bold text-green-600">{report.trendAnalysis.growthRate.toFixed(2)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Volatility Index</p>
                  <p className="text-xl font-bold text-orange-600">{report.trendAnalysis.volatilityIndex.toFixed(1)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Column-wise Trends</h3>
              <div className="space-y-4">
                {report.trendAnalysis.trendDetails.map((trend, index) => (
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
                            <TrendingDown className="h-4 w-4 mr-1" />
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
            {report.categoryPerformance.topPerformers.length > 0 && (
              <>
                <div>
                  <h3 className="text-lg font-bold mb-4">Top Performers</h3>
                  <div className="space-y-2">
                    {report.categoryPerformance.topPerformers.map((performer, index) => (
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
                    {report.categoryPerformance.bottomPerformers.map((performer, index) => (
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
            {report.numericDistributions.map((dist, index) => (
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
            {report.predictions.map((prediction, index) => (
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
            {report.visualizations.map((viz, index) => (
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
      <div className="bg-gray-50 p-6 rounded-b-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Strategic Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.recommendations.map((recommendation, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <p className="text-gray-800">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutoReportDashboard;
