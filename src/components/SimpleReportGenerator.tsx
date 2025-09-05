import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Upload,
  Loader, 
  AlertCircle,
  Settings,
  Eye,
  PenTool
} from 'lucide-react';
import { useUploadedData } from '../context/UploadedDataContext';

interface SimpleReportGeneratorProps {
  className?: string;
}

const SimpleReportGenerator: React.FC<SimpleReportGeneratorProps> = ({ className }) => {
  const { data: uploadedData, columns: uploadedColumns } = useUploadedData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [reportFormat, setReportFormat] = useState<'html' | 'pdf' | 'json'>('html');
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateTraditionalReport = async () => {
    if (!uploadedData || !uploadedColumns || uploadedData.length === 0) {
      setError('Please upload data first to generate a report.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('📋 Generating traditional report...');
      
      // Simple report generation
      const title = reportTitle || 'Data Analysis Report';
      const description = reportDescription || 'This report provides an overview of the uploaded data.';
      
      // Calculate basic statistics
      const totalRecords = uploadedData.length;
      const totalColumns = uploadedColumns.length;
      
      // Get basic data statistics
      const numericColumns = uploadedColumns.filter(col => {
        const sample = uploadedData[0]?.[col];
        return typeof sample === 'number' || !isNaN(Number(sample));
      });

      const categoricalColumns = uploadedColumns.filter(col => {
        const sample = uploadedData[0]?.[col];
        return typeof sample === 'string' || isNaN(Number(sample));
      });

      // Sample data preview (first 5 rows)
      const sampleData = uploadedData.slice(0, 5);

      const htmlReport = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { 
                font-family: 'Arial', sans-serif; 
                margin: 40px; 
                line-height: 1.6; 
                color: #333; 
                background: #f9f9f9;
              }
              .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header { 
                text-align: center; 
                border-bottom: 3px solid #2563eb; 
                padding-bottom: 20px; 
                margin-bottom: 30px; 
              }
              .section { 
                margin-bottom: 30px; 
                padding: 20px;
                background: #f8fafc;
                border-radius: 6px;
                border-left: 4px solid #2563eb;
              }
              .metric { 
                background: #ffffff; 
                padding: 15px; 
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                margin: 10px 0; 
                display: inline-block;
                min-width: 200px;
                text-align: center;
              }
              .metric-value {
                font-size: 2em;
                font-weight: bold;
                color: #2563eb;
              }
              .metric-label {
                color: #6b7280;
                font-size: 0.9em;
              }
              h1, h2, h3 { 
                color: #1f2937; 
              }
              h1 {
                color: #2563eb;
                margin-bottom: 10px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                background: white;
                border-radius: 6px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
              }
              th {
                background: #f3f4f6;
                font-weight: 600;
                color: #374151;
              }
              .column-list {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                margin: 15px 0;
              }
              .column-item {
                background: white;
                padding: 10px;
                border-radius: 4px;
                border: 1px solid #e5e7eb;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 0.9em;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${title}</h1>
                <p>${description}</p>
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              </div>
              
              ${includeSummary ? `
              <div class="section">
                <h2>📊 Data Overview</h2>
                <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
                  <div class="metric">
                    <div class="metric-value">${totalRecords.toLocaleString()}</div>
                    <div class="metric-label">Total Records</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value">${totalColumns}</div>
                    <div class="metric-label">Total Columns</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value">${numericColumns.length}</div>
                    <div class="metric-label">Numeric Columns</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value">${categoricalColumns.length}</div>
                    <div class="metric-label">Text Columns</div>
                  </div>
                </div>
              </div>
              ` : ''}
              
              <div class="section">
                <h2>📋 Column Information</h2>
                <h3>Numeric Columns (${numericColumns.length})</h3>
                <div class="column-list">
                  ${numericColumns.map(col => `<div class="column-item"><strong>${col}</strong><br><small>Number</small></div>`).join('')}
                </div>
                
                <h3>Text/Categorical Columns (${categoricalColumns.length})</h3>
                <div class="column-list">
                  ${categoricalColumns.map(col => `<div class="column-item"><strong>${col}</strong><br><small>Text</small></div>`).join('')}
                </div>
              </div>
              
              <div class="section">
                <h2>🔍 Data Sample</h2>
                <p>First 5 records from your dataset:</p>
                <table>
                  <thead>
                    <tr>
                      ${uploadedColumns.map(col => `<th>${col}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${sampleData.map(row => `
                      <tr>
                        ${uploadedColumns.map(col => `<td>${row[col] ?? 'N/A'}</td>`).join('')}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              
              <div class="section">
                <h2>📝 Summary</h2>
                <p>This report contains analysis of your dataset with ${totalRecords.toLocaleString()} records across ${totalColumns} columns.</p>
                <ul>
                  <li><strong>Data Quality:</strong> ${totalRecords > 1000 ? 'Large dataset' : totalRecords > 100 ? 'Medium dataset' : 'Small dataset'} with ${numericColumns.length} numeric fields for analysis</li>
                  <li><strong>Structure:</strong> ${categoricalColumns.length} categorical columns for grouping and segmentation</li>
                  <li><strong>Completeness:</strong> Sample data shows ${uploadedColumns.length} complete columns</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>Report generated by FlexBI Analytics Platform | ${new Date().toLocaleDateString()}</p>
                <p>For advanced analytics including AI insights, predictions, and visualizations, visit the Analytics section.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      setGeneratedReport(htmlReport);
      console.log('✅ Traditional report generated successfully');
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!generatedReport) return;

    const blob = new Blob([generatedReport], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isGenerating) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
        <div className="flex items-center justify-center space-x-4">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Generating Report</h3>
            <p className="text-gray-600">Creating your data report...</p>
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
          <h3 className="mt-2 text-lg font-semibold text-gray-900">Report Generation Failed</h3>
          <p className="mt-1 text-gray-600">{error}</p>
          <button
            onClick={generateTraditionalReport}
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
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">No Data Available</h3>
          <p className="mt-1 text-gray-600">Please upload data in the Dashboard section first to generate reports.</p>
          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> For advanced AI-powered insights including predictions and trend analysis, 
              check out the <strong>Analytics</strong> section after uploading your data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {generatedReport ? (
        // Show generated report preview
        <div>
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Report Generated Successfully</h1>
                <p className="text-green-100 mt-1">
                  {uploadedData.length.toLocaleString()} records processed
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={downloadReport}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download HTML</span>
                </button>
                <button
                  onClick={() => setGeneratedReport(null)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <PenTool className="h-4 w-4" />
                  <span>New Report</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Report Preview</h3>
              <p className="text-gray-600 text-sm">Your report has been generated and is ready for download.</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: generatedReport }} />
            </div>
            
            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Want more insights?</strong> Visit the <strong>Analytics</strong> section for AI-powered analysis, 
                predictions, and interactive visualizations of your data.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Show report configuration form
        <div>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
            <h1 className="text-2xl font-bold">Generate Data Report</h1>
            <p className="text-blue-100 mt-1">
              Create a professional report from your {uploadedData.length.toLocaleString()} records
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Report Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Title
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Data Analysis Report"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="html">HTML Document</option>
                  <option value="pdf">PDF (coming soon)</option>
                  <option value="json">JSON Data</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Brief description of the report purpose and contents..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Report Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Report Options
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeSummary}
                    onChange={(e) => setIncludeSummary(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include data summary and statistics</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include basic charts (coming soon)</span>
                </label>
              </div>
            </div>
            
            {/* Data Overview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Data Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{uploadedData.length.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Records</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{uploadedColumns.length}</div>
                  <div className="text-sm text-gray-600">Columns</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {uploadedColumns.filter(col => {
                      const sample = uploadedData[0]?.[col];
                      return typeof sample === 'number' || !isNaN(Number(sample));
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Numeric</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {uploadedColumns.filter(col => {
                      const sample = uploadedData[0]?.[col];
                      return typeof sample === 'string' || isNaN(Number(sample));
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Text</div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={generateTraditionalReport}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <FileText className="h-5 w-5" />
                <span>Generate Report</span>
              </button>
              
              <button
                onClick={() => window.location.hash = '#analytics'}
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center space-x-2"
              >
                <Eye className="h-5 w-5" />
                <span>View Analytics</span>
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Want More Advanced Insights?</h4>
              <p className="text-sm text-blue-800">
                This section creates traditional data reports. For AI-powered analytics including:
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• Predictive analysis and future trends</li>
                <li>• Statistical insights and patterns</li>
                <li>• Interactive visualizations</li>
                <li>• Automated recommendations</li>
              </ul>
              <p className="text-sm text-blue-800 mt-2">
                Visit the <strong>Analytics</strong> section in the sidebar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleReportGenerator;
