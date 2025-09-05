import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
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
  ArrowRight,
  Zap
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useUploadedData } from '../context/UploadedDataContext';
import { AdvancedReportService, AdvancedReport } from '../services/advancedReportService';

interface ReportGeneratorProps {
  className?: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ className }) => {
  const { data: uploadedData, columns: uploadedColumns } = useUploadedData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<AdvancedReport | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includePredictive, setIncludePredictive] = useState(true);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'word' | 'json'>('pdf');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'categories' | 'distributions' | 'predictions' | 'visualizations'>('overview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate report when data is available
  useEffect(() => {
    if (uploadedData && uploadedData.length > 0 && uploadedColumns.length > 0) {
      generateAdvancedReport();
    }
  }, [uploadedData, uploadedColumns]);

  // Handle file upload for additional data
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, we'll focus on the existing uploaded data
    // In a full implementation, you'd parse the file here
    console.log('File uploaded:', file.name);
  };

  // Generate advanced AI-powered report
  const generateAdvancedReport = async () => {
    if (!uploadedData || !uploadedColumns || uploadedData.length === 0) {
      setError('Please upload data first to generate a report.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('🚀 Generating advanced AI report...');
      const report = await AdvancedReportService.generateAdvancedReport(uploadedData, uploadedColumns);
      setGeneratedReport(report);
      setReportTitle(report.title);
      console.log('✅ Advanced report generated successfully');
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };
    setError(null);

    try {
      const report = await ReportGenerationService.generateReport(
        uploadedData,
        uploadedColumns,
        reportTitle || 'AI-Generated Data Analysis Report',
        includeCharts,
        includePredictive
      );

      setGeneratedReport(report);
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      console.error('Report generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export report in different formats
  const exportReport = async (format: 'pdf' | 'word' | 'json') => {
    if (!generatedReport) return;

    try {
      if (format === 'json') {
        const exportData = ReportGenerationService.exportReportData(generatedReport);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${generatedReport.title.replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // Use the enhanced PDF export service
        PDFExportService.exportAsHTML(generatedReport);
      } else {
        // Word format - enhanced formatting
        const content = ReportGenerationService.formatReportForPDF(generatedReport);
        const htmlContent = `
          <html>
            <head><title>${generatedReport.title}</title></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
              <h1>${generatedReport.title}</h1>
              <p><strong>Generated:</strong> ${generatedReport.createdAt.toLocaleDateString()}</p>
              <hr>
              ${content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
            </body>
          </html>
        `;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${generatedReport.title.replace(/\s+/g, '_')}.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Failed to export report.');
      console.error('Export error:', err);
    }
  };

  // Render report preview
  const renderReportPreview = () => {
    if (!generatedReport) return null;

    return (
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{generatedReport.title}</h2>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>Generated: {generatedReport.createdAt.toLocaleDateString()}</span>
            <span>•</span>
            <span>{generatedReport.metadata.recordCount.toLocaleString()} records</span>
            <span>•</span>
            <span>{generatedReport.sections.length} sections</span>
            <span>•</span>
            <span>{generatedReport.metadata.generationTime}ms</span>
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Summary</h3>
          <p className="text-gray-700">{generatedReport.summary}</p>
        </div>

        {/* Report Sections */}
        <div className="divide-y divide-gray-200">
          {generatedReport.sections.map((section) => (
            <div key={section.id} className="p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                {section.type === 'chart' && <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />}
                {section.type === 'insight' && <TrendingUp className="w-5 h-5 mr-2 text-green-500" />}
                {section.type === 'text' && <FileText className="w-5 h-5 mr-2 text-gray-500" />}
                {section.title}
              </h3>
              
              {section.type === 'chart' ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p>Chart: {section.chartConfig?.type} - {section.chartConfig?.xAxis} vs {section.chartConfig?.yAxis}</p>
                    <p className="text-sm mt-1">{section.content}</p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  {section.content.split('\n').map((line, index) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <h4 key={index} className="font-semibold text-gray-900 mt-4 mb-2">{line.slice(2, -2)}</h4>;
                    }
                    if (line.startsWith('•')) {
                      return <li key={index} className="ml-4">{line.slice(1).trim()}</li>;
                    }
                    if (line.trim() === '') {
                      return <br key={index} />;
                    }
                    return <p key={index} className="mb-2">{line}</p>;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Predictive Analysis Summary */}
        {generatedReport.predictiveAnalysis.length > 0 && (
          <div className="p-6 bg-blue-50 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Predictive Analysis Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedReport.predictiveAnalysis.map((pred, index) => {
                const change = ((pred.predictedValue - pred.currentValue) / pred.currentValue * 100);
                const isPositive = change > 0;
                return (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900">{pred.metric}</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Current:</span>
                        <span>{pred.currentValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Predicted:</span>
                        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                          {pred.predictedValue.toFixed(2)} ({isPositive ? '+' : ''}{change.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Confidence:</span>
                        <span>{(pred.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`p-6 max-w-7xl mx-auto ${className || ''}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Report Generator</h1>
        <p className="text-gray-600">
          Generate comprehensive, professional reports with AI-driven insights, visualizations, and predictive analysis
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Data Source */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-500" />
            Data Source
          </h2>
          
          {uploadedData && uploadedData.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Data loaded: {uploadedData.length.toLocaleString()} records</span>
              </div>
              <div className="text-sm text-gray-600">
                Columns: {uploadedColumns?.join(', ')}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center text-amber-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>No data loaded</span>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Upload Data
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Report Settings */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-500" />
            Report Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="AI-Generated Data Analysis Report"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Include Data Visualizations</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includePredictive}
                  onChange={(e) => setIncludePredictive(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Include Predictive Analysis</span>
              </label>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Download className="w-5 h-5 mr-2 text-purple-500" />
            Export Options
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'word' | 'json')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF Report</option>
                <option value="word">Word Document</option>
                <option value="json">JSON Data</option>
              </select>
            </div>
            
            {generatedReport && (
              <button
                onClick={() => exportReport(exportFormat)}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex items-center justify-center"
              >
                {exportFormat === 'pdf' && <FileImage className="w-4 h-4 mr-2" />}
                {exportFormat === 'word' && <FileText className="w-4 h-4 mr-2" />}
                {exportFormat === 'json' && <FileSpreadsheet className="w-4 h-4 mr-2" />}
                Export {exportFormat.toUpperCase()}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="mb-8">
        <button
          onClick={generateReport}
          disabled={isGenerating || !uploadedData || uploadedData.length === 0}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center text-lg font-semibold"
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5 mr-2" />
              Generate AI-Powered Report
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Report Preview */}
      {generatedReport && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Eye className="w-6 h-6 mr-2" />
              Report Preview
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => exportReport('pdf')}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center"
              >
                <FileImage className="w-4 h-4 mr-2" />
                PDF
              </button>
              <button
                onClick={() => exportReport('word')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Word
              </button>
            </div>
          </div>
          {renderReportPreview()}
        </div>
      )}

      {/* Features Info */}
      {!generatedReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border rounded-lg p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
            <p className="text-gray-600 text-sm">
              Natural language insights and key findings automatically generated from your data
            </p>
          </div>
          
          <div className="bg-white border rounded-lg p-6 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Visualizations</h3>
            <p className="text-gray-600 text-sm">
              Professional charts and graphs that highlight important patterns and trends
            </p>
          </div>
          
          <div className="bg-white border rounded-lg p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h3 className="text-lg font-semibold mb-2">Predictions</h3>
            <p className="text-gray-600 text-sm">
              Future trends and outcomes based on statistical analysis and AI modeling
            </p>
          </div>
          
          <div className="bg-white border rounded-lg p-6 text-center">
            <Download className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <h3 className="text-lg font-semibold mb-2">Export</h3>
            <p className="text-gray-600 text-sm">
              Professional PDF and Word reports ready for sharing and presentation
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
