import { ChartType } from '../types';

interface FallbackResponse {
  message: string;
  chartData?: any[];
  chartType?: ChartType;
  title?: string;
}

export function generateFallbackAnalysis(
  query: string,
  data: any[],
  columns: string[]
): FallbackResponse {
  const lowerQuery = query.toLowerCase();
  
  // Basic data statistics
  const numericColumns = columns.filter(col => 
    data.some(row => typeof row[col] === 'number' && !isNaN(row[col]))
  );
  
  const categoricalColumns = columns.filter(col => 
    data.some(row => typeof row[col] === 'string' && row[col]?.trim())
  );

  // Generate basic insights
  let message = `📊 Basic Analysis of Your Data:\n\n`;
  message += `• Total records: ${data.length}\n`;
  message += `• Columns: ${columns.join(', ')}\n`;
  
  if (numericColumns.length > 0) {
    const firstNumeric = numericColumns[0];
    const values = data.map(row => row[firstNumeric]).filter(val => typeof val === 'number' && !isNaN(val));
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      message += `• ${firstNumeric}: Average ${avg.toFixed(2)}, Range ${min} - ${max}\n`;
    }
  }

  // Generate chart data based on query keywords
  let chartData: any[] = [];
  let chartType: ChartType = 'bar';
  let title = 'Data Overview';

  if (lowerQuery.includes('trend') || lowerQuery.includes('time') || lowerQuery.includes('over time')) {
    // Time-based analysis
    const timeCol = columns.find(col => /date|time|month|year|quarter/i.test(col));
    if (timeCol && numericColumns.length > 0) {
      const valueCol = numericColumns[0];
      chartData = data
        .filter(row => row[timeCol] && row[valueCol])
        .map(row => ({ x: row[timeCol], y: row[valueCol] }))
        .slice(0, 20); // Limit to first 20 points
      chartType = 'line';
      title = `${valueCol} Over Time`;
    }
  } else if (lowerQuery.includes('compare') || lowerQuery.includes('by')) {
    // Comparison analysis
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      const catCol = categoricalColumns[0];
      const numCol = numericColumns[0];
      
      // Group by categorical column and sum numeric values
      const grouped = data.reduce((acc, row) => {
        const key = row[catCol] || 'Unknown';
        acc[key] = (acc[key] || 0) + (row[numCol] || 0);
        return acc;
      }, {} as Record<string, number>);
      
      chartData = Object.entries(grouped)
        .map(([key, value]) => ({ x: key, y: value }))
        .sort((a, b) => b.y - a.y)
        .slice(0, 10); // Top 10
      
      title = `${numCol} by ${catCol}`;
    }
  } else if (lowerQuery.includes('distribution') || lowerQuery.includes('histogram')) {
    // Distribution analysis
    if (numericColumns.length > 0) {
      const numCol = numericColumns[0];
      const values = data.map(row => row[numCol]).filter(val => typeof val === 'number' && !isNaN(val));
      
      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        const bucketCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
        const bucketSize = range / bucketCount;
        
        const buckets: Record<string, number> = {};
        for (let i = 0; i < bucketCount; i++) {
          const bucketStart = min + i * bucketSize;
          const bucketEnd = min + (i + 1) * bucketSize;
          const bucketLabel = `${bucketStart.toFixed(1)}-${bucketEnd.toFixed(1)}`;
          buckets[bucketLabel] = 0;
        }
        
        values.forEach(value => {
          const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), bucketCount - 1);
          const bucketStart = min + bucketIndex * bucketSize;
          const bucketEnd = min + (bucketIndex + 1) * bucketSize;
          const bucketLabel = `${bucketStart.toFixed(1)}-${bucketEnd.toFixed(1)}`;
          buckets[bucketLabel]++;
        });
        
        chartData = Object.entries(buckets).map(([key, value]) => ({ x: key, y: value }));
        title = `${numCol} Distribution`;
      }
    }
  } else {
    // Default overview chart
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      const catCol = categoricalColumns[0];
      const numCol = numericColumns[0];
      
      const grouped = data.reduce((acc, row) => {
        const key = row[catCol] || 'Unknown';
        acc[key] = (acc[key] || 0) + (row[numCol] || 0);
        return acc;
      }, {} as Record<string, number>);
      
      chartData = Object.entries(grouped)
        .map(([key, value]) => ({ x: key, y: value }))
        .sort((a, b) => b.y - a.y)
        .slice(0, 8);
      
      title = `${numCol} by ${catCol}`;
    }
  }

  message += `\n💡 Tip: For more advanced AI-powered insights, please ensure your OpenAI API key is configured and try again in a few minutes.`;

  return {
    message,
    chartData: chartData.length > 0 ? chartData : undefined,
    chartType,
    title
  };
}
