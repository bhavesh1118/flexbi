import React, { useState } from 'react';
import LargeFileUpload from './LargeFileUpload';
import { FileText, Database, TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface ProcessingResult {
  type: string;
  source_type: string;
  analysis: {
    rows: number;
    columns: number;
    memory_usage?: number;
    column_info: Record<string, any>;
    data_types: Record<string, string>;
    null_counts: Record<string, number>;
    data_preview: any[];
    summary_stats?: Record<string, any>;
  };
  insights: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
  processing_time: number;
}

const EnhancedDataProcessingPage: React.FC = () => {
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileProcessed = (result: ProcessingResult) => {
    setProcessingResult(result);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setProcessingResult(null);
  };

  const formatMemoryUsage = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'info':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Enhanced Data Processing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload and process files up to 200MB with unlimited rows. 
            Get real-time insights with advanced analytics and memory-efficient processing.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Large File Support</h3>
              <p className="text-gray-600 text-sm">
                Process files up to 200MB with chunked uploads and memory-efficient algorithms
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
              <p className="text-gray-600 text-sm">
                Get instant insights and statistics as your data is being processed
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Formats</h3>
              <p className="text-gray-600 text-sm">
                Support for CSV, Excel, JSON, TSV files with automatic format detection
              </p>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-900">Upload Your Data</h2>
            <p className="text-gray-600 mt-1">
              Drag and drop or select a file to begin processing
            </p>
          </div>
          <div className="p-6">
            <LargeFileUpload 
              onFileProcessed={handleFileProcessed}
              onError={handleError}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-red-800 font-medium">Processing Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Processing Results */}
        {processingResult && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-semibold text-gray-900">Processing Complete</h2>
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  Processed in {processingResult.processing_time.toFixed(2)} seconds
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {processingResult.analysis.rows.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Rows</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {processingResult.analysis.columns}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Columns</div>
                  </div>
                  
                  {processingResult.analysis.memory_usage && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {formatMemoryUsage(processingResult.analysis.memory_usage)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Memory Usage</div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {Object.values(processingResult.analysis.null_counts).reduce((a, b) => a + b, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Null Values</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Insights */}
            {processingResult.insights.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold text-gray-900">Data Insights</h3>
                </div>
                <div className="p-6 space-y-3">
                  {processingResult.insights.map((insight, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}
                    >
                      <div className="flex items-center">
                        {getSeverityIcon(insight.severity)}
                        <span className="ml-2 font-medium capitalize">{insight.type}</span>
                      </div>
                      <p className="mt-1 text-sm">{insight.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Preview */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Data Preview</h3>
                <p className="text-gray-600 text-sm mt-1">
                  First {processingResult.analysis.data_preview.length} rows of your dataset
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(processingResult.analysis.data_preview[0] || {}).map((column) => (
                        <th key={column} className="px-6 py-3 text-left font-medium text-gray-900 border-b">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {processingResult.analysis.data_preview.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {Object.values(row).map((value, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 text-gray-900 border-b">
                            {value !== null && value !== undefined ? String(value) : 
                             <span className="text-gray-400 italic">null</span>
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Column Analysis */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Column Analysis</h3>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {Object.entries(processingResult.analysis.column_info).map(([column, info]: [string, any]) => (
                    <div key={column} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{column}</h4>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {info.data_type}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Unique Values:</span>
                          <div className="font-medium">{info.unique_values.toLocaleString()}</div>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">Null Count:</span>
                          <div className="font-medium">{info.null_count.toLocaleString()}</div>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">Null %:</span>
                          <div className="font-medium">{info.null_percentage.toFixed(1)}%</div>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">Memory:</span>
                          <div className="font-medium">{formatMemoryUsage(info.memory_usage)}</div>
                        </div>
                      </div>
                      
                      {/* Numeric column stats */}
                      {(info.min !== undefined) && (
                        <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Min:</span>
                            <div className="font-medium">{info.min}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Max:</span>
                            <div className="font-medium">{info.max}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Mean:</span>
                            <div className="font-medium">{info.mean?.toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Std Dev:</span>
                            <div className="font-medium">{info.std?.toFixed(2)}</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Text column stats */}
                      {info.avg_length !== undefined && (
                        <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Avg Length:</span>
                            <div className="font-medium">{info.avg_length?.toFixed(1)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Max Length:</span>
                            <div className="font-medium">{info.max_length}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Statistics */}
            {processingResult.analysis.summary_stats && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold text-gray-900">Summary Statistics</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Statistical summary for numeric columns
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium text-gray-900 border-b">Statistic</th>
                        {Object.keys(processingResult.analysis.summary_stats).map((column) => (
                          <th key={column} className="px-6 py-3 text-left font-medium text-gray-900 border-b">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'].map((stat) => (
                        <tr key={stat} className="border-b">
                          <td className="px-6 py-4 font-medium text-gray-900">{stat}</td>
                          {Object.entries(processingResult.analysis.summary_stats || {}).map(([column, stats]: [string, any]) => (
                            <td key={column} className="px-6 py-4 text-gray-700">
                              {stats[stat] !== undefined ? 
                                (typeof stats[stat] === 'number' ? stats[stat].toFixed(2) : stats[stat]) : 
                                '-'
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDataProcessingPage;
