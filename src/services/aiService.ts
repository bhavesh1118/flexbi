import { ChartType } from '../types';
import { generateFallbackAnalysis } from './fallbackAnalysisService';

interface ApiResponse {
  message: string;
  chartData?: any[];
  chartType?: ChartType;
  title?: string;
}

function isNumber(val: any) {
  return !isNaN(Number(val));
}

// Expanded synonym map for business and domain-specific terms
const COLUMN_SYNONYMS: Record<string, string[]> = {
  revenue: ['totalprice', 'revenue', 'amount', 'sales', 'total', 'modalprice', 'modal_x0020_price'],
  sales: ['totalprice', 'sales', 'amount', 'total', 'modalprice', 'modal_x0020_price'],
  salesperson: ['salesperson', 'salespersonname', 'employee', 'rep'],
  product: ['product', 'item', 'sku', 'commodity'],
  region: ['region', 'area', 'zone', 'state', 'district', 'market', 'location'],
  customer: ['customer', 'customername', 'client'],
  order: ['order', 'orderid', 'ordernumber'],
  profit: ['profit', 'netprofit', 'margin'],
  expense: ['expense', 'cost', 'spend'],
  date: ['date', 'orderdate', 'deliverydate', 'arrivaldate'],
  price: ['price', 'unitprice', 'modalprice', 'modal_x0020_price', 'maxprice', 'max_x0020_price', 'minprice', 'min_x0020_price'],
  quantity: ['quantity', 'qty', 'amount'],
  discount: ['discount'],
  payment: ['payment', 'paymentmethod'],
  shipping: ['shipping', 'shippingcost'],
  grade: ['grade'],
  variety: ['variety'],
};

function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function fuzzyFindColumn(columns: string[], query: string) {
  const normQuery = normalize(query);
  // 1. Direct match
  let best = '';
  let bestScore = 0;
  for (const col of columns) {
    const normCol = normalize(col);
    if (normCol === normQuery) return col;
    if (normCol.includes(normQuery) || normQuery.includes(normCol)) {
      if (normCol.length > bestScore) {
        best = col;
        bestScore = normCol.length;
      }
    }
  }
  // 2. Synonym match
  for (const [, colNames] of Object.entries(COLUMN_SYNONYMS)) {
    if (colNames.some(s => normQuery === s || normQuery.includes(s) || s.includes(normQuery))) {
      for (const col of columns) {
        if (colNames.some(s => normalize(col) === s || normalize(col).includes(s))) {
          return col;
        }
      }
    }
  }
  // 3. Plural/singular match
  for (const col of columns) {
    const normCol = normalize(col);
    if (normCol + 's' === normQuery || normCol === normQuery + 's') return col;
  }
  return best || columns.find(col => normalize(col).split(/\s+/).some(word => normQuery.includes(word))) || '';
}

// Removed unused fuzzyFindValue function

function groupBySum(data: any[], groupCol: string, sumCol: string) {
  const grouped: Record<string, number> = {};
  data.forEach(row => {
    const key = row[groupCol];
    const val = Number(row[sumCol]);
    if (!key || isNaN(val)) return;
    grouped[key] = (grouped[key] || 0) + val;
  });
  return grouped;
}

// Generate dynamic sample queries based on columns
export function getSampleQueries(columns: string[]): string[] {
  if (!columns || columns.length === 0) return [];
  const samples: string[] = [];
  
  // Enhanced query patterns
  const catCol = columns.find(c => /product|commodity|item|category|variety/i.test(c));
  const numCol = columns.find(c => /price|total|amount|revenue|sales|quantity|qty|discount|cost|profit/i.test(c));
  const regionCol = columns.find(c => /region|state|district|market|area/i.test(c));
  const dateCol = columns.find(c => /date|time|month|year|quarter/i.test(c));
  
  if (catCol && numCol) {
    samples.push(`Compare ${catCol} by total ${numCol}`);
    samples.push(`Find top 5 ${catCol} by ${numCol}`);
    samples.push(`Show ${numCol} distribution by ${catCol}`);
  }
  
  if (regionCol && numCol) {
    samples.push(`Compare ${numCol} across regions`);
    samples.push(`Find the best performing region by ${numCol}`);
    samples.push(`Show regional trends in ${numCol}`);
  }
  
  if (dateCol && numCol) {
    samples.push(`Show ${numCol} trends over time`);
    samples.push(`Compare this quarter vs last quarter ${numCol}`);
    samples.push(`Identify seasonal patterns in ${numCol}`);
  }
  
  if (numCol) {
    samples.push(`Find outliers in ${numCol}`);
    samples.push(`Show the distribution of ${numCol}`);
    samples.push(`What are the trends in ${numCol}?`);
  }
  
  return samples.slice(0, 8);
}

// Utility to summarize columns and sample rows for LLM context
function generateDataSummary(columns: string[], data: any[], maxRows: number = 500): string {
  const totalRows = data.length;
  const sampleRows = data.slice(0, Math.min(maxRows, totalRows));
  
  // Generate statistical summary for numeric columns
  const numericCols = columns.filter(col => 
    data.some(row => typeof row[col] === 'number' && !isNaN(row[col]))
  );
  
  let summary = `Dataset Summary:\n`;
  summary += `• Total rows: ${totalRows}\n`;
  summary += `• Total columns: ${columns.length}\n`;
  summary += `• Numeric columns: ${numericCols.join(', ')}\n`;
  summary += `• Categorical columns: ${columns.filter(col => !numericCols.includes(col)).join(', ')}\n\n`;
  
  // Add statistical summary for numeric columns
  if (numericCols.length > 0) {
    summary += `Numeric Column Statistics:\n`;
    numericCols.forEach(col => {
      const values = data.map(row => Number(row[col])).filter(v => !isNaN(v));
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        summary += `• ${col}: avg=${avg.toFixed(2)}, min=${min}, max=${max}, count=${values.length}\n`;
      }
    });
    summary += `\n`;
  }
  
  // Add sample data (limited to avoid token limits)
  const sampleSize = Math.min(10, sampleRows.length);
  summary += `Sample data (first ${sampleSize} rows):\n`;
  summary += JSON.stringify(sampleRows.slice(0, sampleSize), null, 2);
  
  return summary;
}

interface DialogueTurn { role: 'user' | 'assistant'; content: string; }

// Rate limiting utility
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  getWaitTime(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, oldestRequest + this.windowMs - Date.now());
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter(
  parseInt(import.meta.env.VITE_OPENAI_RATE_LIMIT || '8'), 
  parseInt(import.meta.env.VITE_OPENAI_RATE_WINDOW || '60000')
); // Configurable rate limiting

async function callLLM(query: string, columns: string[], data: any[], priorDialogue?: DialogueTurn[]): Promise<ApiResponse> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY; // Use Vite env variable
  if (!apiKey) {
    return { message: 'OpenAI API key not set. Please set VITE_OPENAI_API_KEY in your environment.' };
  }

  // Check rate limiting
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = Math.ceil(rateLimiter.getWaitTime() / 1000);
    return { 
      message: `Rate limit exceeded. Please wait ${waitTime} seconds before making another request. I'll provide a basic analysis based on your data instead.` 
    };
  }

  // Record this request
  rateLimiter.recordRequest();
  
  // Prepare a summary of the data for context
  const dataSummary = generateDataSummary(columns, data, 500);
  // Build message history for LLM
  const systemPrompt = `You are a data analyst. Here is a summary of the uploaded data:\n${dataSummary}\n\nIf you can answer directly, do so. If the question is ambiguous, malformed, or references missing columns, explain what is missing and suggest how the user can rephrase or provide more information. Always provide a helpful response, even if you cannot answer exactly.`;
  const messages = [
    { role: 'system', content: systemPrompt },
    ...(priorDialogue || []),
    { role: 'user', content: query }
  ];
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // or 'gpt-4' if available
        messages,
        max_tokens: 500
      })
    });
    
    const result = await response.json();
    console.log('LLM raw result:', result);
    
    if (response.status === 429) {
      // Rate limit hit - provide fallback response
      console.log('Rate limit exceeded, using fallback analysis');
      return generateFallbackAnalysis(query, data, columns);
    }
    
    if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
      return { message: result.choices[0].message.content };
    } else if (result.error) {
      // Handle specific API errors
      if (result.error.code === 'quota_exceeded' || result.error.code === 'rate_limit_exceeded') {
        console.log('Quota exceeded, using fallback analysis');
        return generateFallbackAnalysis(query, data, columns);
      } else if (result.error.code === 'invalid_api_key') {
        return { 
          message: 'Invalid OpenAI API key. Please check your configuration.' 
        };
      } else {
        console.log('LLM error, using fallback analysis');
        return generateFallbackAnalysis(query, data, columns);
      }
    } else {
      return { message: 'No answer from LLM.' };
    }
  } catch (err) {
    console.error('OpenAI API error:', err);
    console.log('API error, using fallback analysis');
    return generateFallbackAnalysis(query, data, columns);
  }
}

// Define patterns for reuse
const locationPatterns = /(city|taluk|district|region|area|location|market|state|town|village)/i;
const valuePatterns = /(number|count|quantity|amount|value|total|sum|fish|markets)/i;

// Enhanced chart selection logic
function selectOptimalChartType(query: string, data: any[], columns: string[]): { type: ChartType; x: string; y: string; title: string } | null {
  const lower = query.toLowerCase();
  
  // Extract chart type preference from query - prioritize explicit requests
  const chartTypeMap: Record<string, ChartType> = {
    'pie': 'pie',
    'pie chart': 'pie',
    'line': 'line',
    'line chart': 'line', 
    'bar': 'bar',
    'bar chart': 'bar',
    'scatter': 'scatter',
    'scatter plot': 'scatter',
    'histogram': 'bar',
    'distribution': 'bar',
    'trend': 'line',
    'time': 'line',
    'compare': 'bar',
    'composition': 'pie',
    'correlation': 'scatter',
    'outlier': 'scatter'
  };
  
  let preferredType: ChartType = 'bar';
  // First check for explicit chart type requests
  for (const [keyword, type] of Object.entries(chartTypeMap)) {
    if (lower.includes(keyword)) {
      preferredType = type;
      break;
    }
  }
  
  // Find relevant columns with smart detection
  const numericCols = columns.filter(col => 
    data.some(row => typeof row[col] === 'number' && !isNaN(row[col]))
  );
  const categoricalCols = columns.filter(col => 
    data.some(row => typeof row[col] === 'string' || typeof row[col] === 'object')
  );
  
  // Smart location/city detection
  const locationCols = categoricalCols.filter(col => locationPatterns.test(col));
  
  // Smart value/quantity detection
  const valueCols = numericCols.filter(col => valuePatterns.test(col));
  
  let x = '', y = '';
  
  // Smart column selection based on query content
  if (lower.includes('by') || lower.includes('compare')) {
    // For comparisons, prioritize location columns for X and value columns for Y
    x = locationCols[0] || categoricalCols[0] || columns[0];
    y = valueCols[0] || numericCols[0] || columns[1];
  } else if (lower.includes('trend') || lower.includes('time') || lower.includes('over time')) {
    // For trends, look for date/time columns
    const timeCol = columns.find(col => /date|time|month|year|quarter/i.test(col));
    x = timeCol || locationCols[0] || categoricalCols[0] || columns[0];
    y = valueCols[0] || numericCols[0] || columns[1];
    // Only override if no specific chart type was requested
    if (!lower.includes('pie') && !lower.includes('bar') && !lower.includes('scatter')) {
      preferredType = 'line';
    }
  } else if (lower.includes('distribution') || lower.includes('histogram')) {
    // For distributions, use numeric column for both
    x = numericCols[0] || columns[0];
    y = 'count';
    // Only override if no specific chart type was requested
    if (!lower.includes('pie') && !lower.includes('line') && !lower.includes('scatter')) {
      preferredType = 'bar';
    }
  } else if (lower.includes('correlation') || lower.includes('relationship')) {
    // For correlations, use two numeric columns
    x = numericCols[0] || columns[0];
    y = numericCols[1] || columns[1];
    // Only override if no specific chart type was requested
    if (!lower.includes('pie') && !lower.includes('bar') && !lower.includes('line')) {
      preferredType = 'scatter';
    }
  } else {
    // Default: prioritize location columns for X and value columns for Y
    x = locationCols[0] || categoricalCols[0] || columns[0];
    y = valueCols[0] || numericCols[0] || columns[1];
  }
  
  // Generate title
  let title = query;
  if (x && y) {
    // Create more descriptive titles
    if (locationPatterns.test(x) && valuePatterns.test(y)) {
      title = `${y} by ${x}`;
    } else if (locationPatterns.test(x)) {
      title = `${y} by ${x}`;
    } else if (valuePatterns.test(y)) {
      title = `${y} by ${x}`;
    } else {
      title = `${y} by ${x}`;
    }
  }
  
  return { type: preferredType, x, y, title };
}

// Generate narrative insights
function generateNarrativeInsights(_query: string, chartData: any[], chartType: ChartType, _columns: string[]): string {
  let insights = '';
  
  if (chartData.length === 0) return insights;
  
  const firstItem = chartData[0];
  const keys = Object.keys(firstItem).filter(key => key !== 'name');
  
  if (keys.length > 0) {
    const values = chartData.map(item => item[keys[0]]).filter(v => typeof v === 'number');
    if (values.length > 0) {
      const max = Math.max(...values);
      const min = Math.min(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const maxItem = chartData.find(item => item[keys[0]] === max);
      const minItem = chartData.find(item => item[keys[0]] === min);
      
      insights += `\n\n📊 **Key Insights**:`;
      insights += `\n• The ${keys[0]} values range from ${min} to ${max} with an average of ${avg.toFixed(2)}`;
      
      if (maxItem) {
        insights += `\n• Highest value: ${maxItem.name || 'Unknown'} with ${max}`;
      }
      if (minItem) {
        insights += `\n• Lowest value: ${minItem.name || 'Unknown'} with ${min}`;
      }
      
      // Detect patterns
      if (chartType === 'line') {
        const trend = values[values.length - 1] > values[0] ? 'increasing' : 'decreasing';
        insights += `\n• Overall trend: ${trend}`;
      }
      
      if (chartType === 'bar') {
        const variance = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length);
        if (variance > avg * 0.5) {
          insights += `\n• High variability in the data`;
        } else {
          insights += `\n• Relatively consistent values`;
        }
      }
    }
  }
  
  return insights;
}

// Add date filtering utility functions for month-based data structure
function extractDateFilter(query: string): { month?: string; year?: string; monthColumn?: string } | null {
  const lowerQuery = query.toLowerCase();
  
  // Month patterns - map to both month names and column names
  const monthPatterns = [
    { pattern: /(january|jan)/i, month: '01', monthName: 'jan', columnName: 'Jan.' },
    { pattern: /(february|feb)/i, month: '02', monthName: 'feb', columnName: 'Feb.' },
    { pattern: /(march|mar)/i, month: '03', monthName: 'mar', columnName: 'Mar.' },
    { pattern: /(april|apr)/i, month: '04', monthName: 'apr', columnName: 'Apr.' },
    { pattern: /(may)/i, month: '05', monthName: 'may', columnName: 'May' },
    { pattern: /(june|jun)/i, month: '06', monthName: 'jun', columnName: 'June' },
    { pattern: /(july|jul)/i, month: '07', monthName: 'jul', columnName: 'July' },
    { pattern: /(august|aug)/i, month: '08', monthName: 'aug', columnName: 'Aug.' },
    { pattern: /(september|sep|sept)/i, month: '09', monthName: 'sep', columnName: 'Sept.' },
    { pattern: /(october|oct)/i, month: '10', monthName: 'oct', columnName: 'Oct.' },
    { pattern: /(november|nov)/i, month: '11', monthName: 'nov', columnName: 'Nov.' },
    { pattern: /(december|dec)/i, month: '12', monthName: 'dec', columnName: 'Dec.' }
  ];
  
  // Year patterns
  const yearMatch = lowerQuery.match(/(?:in|from|for|during)\s+(20\d{2})/);
  const year = yearMatch ? yearMatch[1] : undefined;
  
  // Month patterns
  let month: string | undefined;
  let monthColumn: string | undefined;
  for (const monthPattern of monthPatterns) {
    if (monthPattern.pattern.test(lowerQuery)) {
      month = monthPattern.month;
      monthColumn = monthPattern.columnName;
      break;
    }
  }
  
  if (month || year || monthColumn) {
    return { month, year, monthColumn };
  }
  
  return null;
}

function getMonthColumnForQuery(query: string, columns: string[]): string | null {
  const lowerQuery = query.toLowerCase();
  
  // Month column mapping
  const monthColumns = {
    'january': ['Jan.', 'Jan', 'January'],
    'jan': ['Jan.', 'Jan', 'January'],
    'february': ['Feb.', 'Feb', 'February'],
    'feb': ['Feb.', 'Feb', 'February'],
    'march': ['Mar.', 'Mar', 'March'],
    'mar': ['Mar.', 'Mar', 'March'],
    'april': ['Apr.', 'Apr', 'April'],
    'apr': ['Apr.', 'Apr', 'April'],
    'may': ['May', 'May.'],
    'june': ['June', 'Jun', 'Jun.'],
    'jun': ['June', 'Jun', 'Jun.'],
    'july': ['July', 'Jul', 'Jul.'],
    'jul': ['July', 'Jul', 'Jul.'],
    'august': ['Aug.', 'Aug', 'August'],
    'aug': ['Aug.', 'Aug', 'August'],
    'september': ['Sept.', 'Sep', 'September'],
    'sep': ['Sept.', 'Sep', 'September'],
    'sept': ['Sept.', 'Sep', 'September'],
    'october': ['Oct.', 'Oct', 'October'],
    'oct': ['Oct.', 'Oct', 'October'],
    'november': ['Nov.', 'Nov', 'November'],
    'nov': ['Nov.', 'Nov', 'November'],
    'december': ['Dec.', 'Dec', 'December'],
    'dec': ['Dec.', 'Dec', 'December']
  };
  
  for (const [queryMonth, possibleColumns] of Object.entries(monthColumns)) {
    if (lowerQuery.includes(queryMonth)) {
      // Find the matching column in the actual data
      for (const col of possibleColumns) {
        if (columns.includes(col)) {
          return col;
        }
      }
    }
  }
  
  return null;
}

export const processQuery = async (
  query: string,
  uploadedData?: any[],
  uploadedColumns?: string[],
  priorDialogue?: DialogueTurn[]
): Promise<ApiResponse> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 400));
    const lowerQuery = query.toLowerCase();
    const normQuery = normalize(query);
    let debug = '';
    if (uploadedData && uploadedData.length > 0 && uploadedColumns && uploadedColumns.length > 0) {
      // Apply month-based filtering if query contains month references (do this first)
      let filteredData = uploadedData;
      let selectedMonthColumn: string | null = null;
      const dateFilter = extractDateFilter(query);
      
      if (dateFilter && dateFilter.monthColumn) {
        // Find the actual month column in the data
        selectedMonthColumn = getMonthColumnForQuery(query, uploadedColumns);
        
        if (selectedMonthColumn) {
          console.log(`Month filter applied: ${selectedMonthColumn}. Data will be analyzed using ${selectedMonthColumn} column.`);
        } else {
          console.log(`Month mentioned in query but no matching column found. Available columns: ${uploadedColumns.join(', ')}`);
        }
      }
      
      // 0. Data inconsistency: modal price > max price
      if (lowerQuery.includes('modal price') && lowerQuery.includes('max price') && (lowerQuery.includes('inconsist') || lowerQuery.includes('higher') || lowerQuery.includes('greater'))) {
        const modalCol = fuzzyFindColumn(uploadedColumns, 'modal price');
        const maxCol = fuzzyFindColumn(uploadedColumns, 'max price');
        if (modalCol && maxCol) {
          const inconsistent = filteredData.filter(row => Number(row[modalCol]) > Number(row[maxCol]));
          if (inconsistent.length > 0) {
            return {
              message: `Found ${inconsistent.length} records where ${modalCol} > ${maxCol}. Example: ` + JSON.stringify(inconsistent[0]),
            };
          } else {
            return {
              message: `No records found where ${modalCol} > ${maxCol}.`,
            };
          }
        }
      }
      // 1. Location + commodity/modal price query
      if (lowerQuery.includes('commodity') && (lowerQuery.includes('modal price') || lowerQuery.includes('modal'))) {
        // Try to extract location (e.g., 'Palakkad', 'Kerala')
        const locationCols = uploadedColumns.filter(c => /state|district|market|location/i.test(c));
        let locationVal = '';
        for (const col of locationCols) {
          for (const row of filteredData) {
            const val = String(row[col]);
            if (val && lowerQuery.includes(val.toLowerCase())) {
              locationVal = val;
              break;
            }
          }
          if (locationVal) break;
        }
        const commodityCol = fuzzyFindColumn(uploadedColumns, 'commodity');
        const modalCol = fuzzyFindColumn(uploadedColumns, 'modal price');
        if (commodityCol && modalCol) {
          let filtered = filteredData;
          if (locationVal && locationCols.length > 0) {
            filtered = filteredData.filter(row => locationCols.some(col => String(row[col]).toLowerCase() === locationVal.toLowerCase()));
          }
          const result = filtered.map(row => `${row[commodityCol]}: ${row[modalCol]}`).slice(0, 10);
          if (result.length > 0) {
            return {
              message: `Commodities and modal prices${locationVal ? ' in ' + locationVal : ''}:\n` + result.join('\n'),
            };
          } else {
            return {
              message: `No commodities found${locationVal ? ' in ' + locationVal : ''}.`,
            };
          }
        }
      }
      // 2. Flexible value/column filter: if question mentions a value (e.g., 'Palakkad'), try to match to any column
      for (const col of uploadedColumns) {
        for (const row of filteredData) {
          const val = String(row[col]);
          if (val && lowerQuery.includes(val.toLowerCase())) {
            // Return all records with this value
            const matches = filteredData.filter(r => String(r[col]).toLowerCase() === val.toLowerCase());
            return {
              message: `Found ${matches.length} records where ${col} = ${val}. Example: ` + JSON.stringify(matches[0]),
            };
          }
        }
      }
      
      // Special handling for month-specific queries
      if (selectedMonthColumn) {
        const itemColumn = uploadedColumns.find(col => /item|commodity|product/i.test(col)) || uploadedColumns[0];
        if (itemColumn) {
          // Determine chart type from user query
          let requestedChartType: ChartType = 'bar'; // default
          const lowerQuery = query.toLowerCase();
          
          if (lowerQuery.includes('pie') || lowerQuery.includes('pie chart')) {
            requestedChartType = 'pie';
          } else if (lowerQuery.includes('line') || lowerQuery.includes('line chart')) {
            requestedChartType = 'line';
          } else if (lowerQuery.includes('scatter') || lowerQuery.includes('scatter plot')) {
            requestedChartType = 'scatter';
          } else if (lowerQuery.includes('area') || lowerQuery.includes('area chart')) {
            requestedChartType = 'area';
          }
          
          // Create chart data using the selected month column and requested chart type
          let chartData: any[] = [];
          
          if (requestedChartType === 'pie') {
            // For pie charts, use name and value format
            chartData = filteredData.map(row => ({
              name: row[itemColumn],
              value: Number(row[selectedMonthColumn]) || 0
            })).filter(item => item.value > 0);
          } else {
            // For other chart types, use name and dynamic property format
            chartData = filteredData.map(row => ({
              name: row[itemColumn],
              [selectedMonthColumn]: Number(row[selectedMonthColumn]) || 0
            })).filter(item => item[selectedMonthColumn] > 0);
          }
          
          if (chartData.length > 0) {
            const insights = generateNarrativeInsights(query, chartData, requestedChartType, uploadedColumns);
            return {
              message: `I've analyzed your data and created a ${requestedChartType} chart showing ${selectedMonthColumn} by ${itemColumn}.${insights}\n\n📅 Chart shows data from the ${selectedMonthColumn} column.`,
              chartType: requestedChartType,
              title: `${selectedMonthColumn} by ${itemColumn}`,
              chartData: chartData
            };
          }
        }
      }
      
      // Enhanced chart generation with smart selection (using filtered data)
      let chartSelection = selectOptimalChartType(query, filteredData, uploadedColumns);
      

      
      if (chartSelection) {
        const { type, x, y, title } = chartSelection;
        
        // Generate chart data based on selected type
        let chartData: any[] = [];
        
        if (type === 'bar' || type === 'line') {
          // Group by x column and sum y column
          const grouped = groupBySum(filteredData, x, y);
          chartData = Object.entries(grouped).map(([name, value]) => ({ name, [y]: value }));
        } else if (type === 'pie') {
          // Group by x column and sum y column for pie chart
          const grouped = groupBySum(filteredData, x, y);
          chartData = Object.entries(grouped).map(([name, value]) => ({ name, value }));
        } else if (type === 'scatter') {
          // Use two numeric columns for scatter plot
          const numericCols = uploadedColumns.filter(col => 
            filteredData.some(row => typeof row[col] === 'number' && !isNaN(row[col]))
          );
          if (numericCols.length >= 2) {
            const xCol = numericCols[0];
            const yCol = numericCols[1];
            chartData = filteredData.map(row => ({ 
              x: row[xCol], 
              y: row[yCol],
              name: row[x] || `${row[xCol]}, ${row[yCol]}`
            }));
          }
        }
        
        if (chartData.length > 0) {
          // Generate narrative insights
          const insights = generateNarrativeInsights(query, chartData, type, uploadedColumns);
          
          // Add month filter information to the message
          let monthFilterInfo = '';
          if (selectedMonthColumn) {
            monthFilterInfo = `\n\n📅 Chart shows data from the ${selectedMonthColumn} column.`;
          }
          
          return {
            message: `I've analyzed your data and created a ${type} chart showing ${title}.${insights}${monthFilterInfo}${locationPatterns.test(x) ? '\n\n💡 Tip: The chart is now showing city/location data on the X-axis with corresponding values on the Y-axis.' : ''}`,
            chartType: type,
            title: title,
            chartData: chartData
          };
        }
      }
      
      // 1. Top-N/group-by: 'top 3 salespeople by total sales', 'top 5 products by revenue'
      const topMatch = lowerQuery.match(/top\s*(\d+)\s*([\w\s]+?)s?\s*(by|for|on|in)?\s*(?:total |sum |average |avg )?([\w\s]+)/);
      if (topMatch) {
        const n = parseInt(topMatch[1], 10);
        const groupColRaw = topMatch[2].trim();
        const valueColRaw = topMatch[4].trim();
        const groupCol = fuzzyFindColumn(uploadedColumns, groupColRaw);
        const valueCol = fuzzyFindColumn(uploadedColumns, valueColRaw);
        debug += `TopN: groupColRaw='${groupColRaw}', valueColRaw='${valueColRaw}', groupCol='${groupCol}', valueCol='${valueCol}'\n`;
        if (groupCol && valueCol) {
          const grouped = groupBySum(filteredData, groupCol, valueCol);
          const sorted = Object.entries(grouped)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n);
          
          // Create chart data for top N
          const chartData = sorted.map(([name, value]) => ({ name, [valueCol]: value }));
          const insights = generateNarrativeInsights(query, chartData, 'bar', uploadedColumns);
          
          // Add month filter information to the message
          let monthFilterInfo = '';
          if (selectedMonthColumn) {
            monthFilterInfo = `\n\n📅 Analysis based on ${selectedMonthColumn} column data.`;
          }
          
          return {
            message: `Top ${n} ${groupCol} by total ${valueCol}:\n` +
              sorted.map(([k, v], i) => `${i + 1}. ${k}: ${v}`).join('\n') + insights + monthFilterInfo,
            chartType: 'bar',
            title: `Top ${n} ${groupCol} by ${valueCol}`,
            chartData: chartData
          };
        } else if (!groupCol && valueCol) {
          // Only valueCol found
          return {
            message: `Could not find a column matching '${groupColRaw}'. Try using one of: ${uploadedColumns.join(', ')}`
          };
        } else if (groupCol && !valueCol) {
          // Only groupCol found
          return {
            message: `Could not find a column matching '${valueColRaw}'. Try using one of: ${uploadedColumns.join(', ')}`
          };
        } else {
          // Neither found
          return {
            message: `Could not find columns matching '${groupColRaw}' or '${valueColRaw}'. Try using one of: ${uploadedColumns.join(', ')}`
          };
        }
      }
      // 2. Multi-column filter + sum: 'total sales for the South region'
      const sumForMatch = lowerQuery.match(/total (\w+) for (.+)/);
      if (sumForMatch) {
        const valueCol = fuzzyFindColumn(uploadedColumns, sumForMatch[1]);
        let filterVal = sumForMatch[2].trim();
        let filterCol = '';
        for (const c of uploadedColumns) {
          if (uploadedData.some(row => normalize(String(row[c] ?? '')) === normalize(filterVal))) {
            filterCol = c;
            break;
          }
        }
        if (valueCol && filterCol) {
          const sum = filteredData
            .filter(row => normalize(String(row[filterCol] ?? '')) === normalize(filterVal))
            .reduce((acc, row) => acc + (isNumber(row[valueCol]) ? Number(row[valueCol]) : 0), 0);
          return {
            message: `The total ${valueCol} for ${filterVal} is ${sum}.`,
          };
        } else if (!valueCol && filterCol) {
          return {
            message: `Could not find a column matching '${sumForMatch[1]}'. Try using one of: ${uploadedColumns.join(', ')}`
          };
        } else if (valueCol && !filterCol) {
          return {
            message: `Could not find a column matching value '${filterVal}'. Try using one of: ${uploadedColumns.join(', ')}`
          };
        } else {
          return {
            message: `Could not find columns matching '${sumForMatch[1]}' or value '${filterVal}'. Try using one of: ${uploadedColumns.join(', ')}`
          };
        }
      }
      // 3. Count queries: 'How many ... in ...?'
      const countMatch = lowerQuery.match(/how many (\w+) (?:were )?(?:placed|sold|ordered)?(?: in | at | for | by )?([\w\s\-]+)?/);
      if (countMatch) {
        let col = fuzzyFindColumn(uploadedColumns, countMatch[1]);
        let value = countMatch[2]?.trim() || '';
        if (!col && value) {
          for (const c of uploadedColumns) {
            if (filteredData.some(row => normalize(String(row[c] ?? '')) === normalize(value))) {
              col = c;
              break;
            }
          }
        }
        if (col && value) {
          const count = filteredData.filter(row => normalize(String(row[col] ?? '')) === normalize(value)).length;
          return {
            message: `There were ${count} ${col}${count === 1 ? '' : 's'} placed in ${value}.`,
          };
        } else if (!col && value) {
          return {
            message: `Could not find a column matching '${countMatch[1]}'. Try using one of: ${uploadedColumns.join(', ')}`
          };
        } else {
          return {
            message: `Could not find a column or value to count. Try using one of: ${uploadedColumns.join(', ')}`
          };
        }
      }
      // 4. Average queries: 'average unit price for laptops'
      const avgMatch = lowerQuery.match(/average (\w+) (?:for|in|by) ([\w\s\-]+)/);
      if (avgMatch) {
        const valueCol = fuzzyFindColumn(uploadedColumns, avgMatch[1]);
        let filterVal = avgMatch[2].trim();
        let filterCol = '';
        for (const c of uploadedColumns) {
          if (filteredData.some(row => normalize(String(row[c] ?? '')) === normalize(filterVal))) {
            filterCol = c;
            break;
          }
        }
        if (valueCol && filterCol) {
          const filtered = filteredData.filter(row => normalize(String(row[filterCol] ?? '')) === normalize(filterVal));
          const avg = filtered.length > 0 ? filtered.reduce((acc, row) => acc + (isNumber(row[valueCol]) ? Number(row[valueCol]) : 0), 0) / filtered.length : 0;
          return {
            message: `The average ${valueCol} for ${filterVal} is ${avg}.`,
          };
        } else if (!valueCol && filterCol) {
          return {
            message: `Could not find a column matching '${avgMatch[1]}'. Try using one of: ${uploadedColumns.join(', ')}`
          };
        } else if (valueCol && !filterCol) {
          return {
            message: `Could not find a column matching value '${filterVal}'. Try using one of: ${uploadedColumns.join(', ')}`
          };
        } else {
          return {
            message: `Could not find columns matching '${avgMatch[1]}' or value '${filterVal}'. Try using one of: ${uploadedColumns.join(', ')}`
          };
        }
      }
      // 5. List unique values: 'List all ...', 'What are the ...?'
      if (lowerQuery.match(/list all|what are the/)) {
        for (const c of uploadedColumns) {
          if (lowerQuery.includes(c.toLowerCase())) {
            const uniqueVals = Array.from(new Set(filteredData.map(row => row[c])));
            return {
              message: `Unique values in column "${c}": ${uniqueVals.join(', ')}`
            };
          }
        }
        // Try to find a column by fuzzy match
        for (const c of uploadedColumns) {
          if (normQuery.includes(normalize(c))) {
            const uniqueVals = Array.from(new Set(filteredData.map(row => row[c])));
            return {
              message: `Unique values in column "${c}": ${uniqueVals.join(', ')}`
            };
          }
        }
        return {
          message: `Could not find a column to list unique values. Try using one of: ${uploadedColumns.join(', ')}`
        };
      }
      // If nothing matches, call LLM
      return await callLLM(query, uploadedColumns, filteredData, priorDialogue);
    }

    // --- CANNED RESPONSES (if no uploaded data) ---
    // 1. Profit vs Expense by Region (Bar)
    if (lowerQuery.includes('profit') && lowerQuery.includes('expense') && lowerQuery.includes('region')) {
      return {
        message: "I've analyzed the Q1 profit vs expense data by region.",
        chartType: 'bar',
        title: 'Q1 Profit vs Expense by Region',
        chartData: [
          { name: 'North America', profit: 420000, expense: 350000 },
          { name: 'Europe', profit: 380000, expense: 320000 },
          { name: 'Asia Pacific', profit: 520000, expense: 410000 },
          { name: 'Latin America', profit: 190000, expense: 150000 },
          { name: 'Africa', profit: 110000, expense: 90000 },
        ]
      };
    }

    // 2. Monthly Sales (Line)
    if (lowerQuery.includes('monthly sales') || (lowerQuery.includes('sales') && lowerQuery.includes('month'))) {
      return {
        message: "Here's a trend line showing monthly sales for 2025.",
        chartType: 'line',
        title: 'Monthly Sales Trend (2025)',
        chartData: [
          { name: 'Jan', sales: 320000 },
          { name: 'Feb', sales: 340000 },
          { name: 'Mar', sales: 380000 },
          { name: 'Apr', sales: 420000 },
          { name: 'May', sales: 450000 },
          { name: 'Jun', sales: 480000 },
          { name: 'Jul', sales: 460000 },
          { name: 'Aug', sales: 470000 },
          { name: 'Sep', sales: 490000 },
          { name: 'Oct', sales: 510000 },
          { name: 'Nov', sales: 530000 },
          { name: 'Dec', sales: 550000 },
        ]
      };
    }

    // 3. Revenue by Product (Pie)
    if (lowerQuery.includes('revenue') && lowerQuery.includes('product')) {
      return {
        message: "Here's a pie chart showing revenue by product category.",
        chartType: 'pie',
        title: 'Revenue by Product Category',
        chartData: [
          { name: 'Tech Products', value: 42 },
          { name: 'Office Supplies', value: 18 },
          { name: 'Furniture', value: 16 },
          { name: 'Services', value: 24 }
        ]
      };
    }

    // 4. Budget vs Actual by Department (Bar)
    if (lowerQuery.includes('department') && lowerQuery.includes('budget')) {
      return {
        message: "Here's a comparison of budget vs actual spending by department.",
        chartType: 'bar',
        title: 'Department Budget vs Actual (Q2 2025)',
        chartData: [
          { name: 'Sales', budget: 200000, actual: 190000 },
          { name: 'Marketing', budget: 150000, actual: 170000 },
          { name: 'R&D', budget: 300000, actual: 280000 },
          { name: 'Operations', budget: 250000, actual: 240000 },
          { name: 'HR', budget: 100000, actual: 95000 },
        ]
      };
    }

    // 5. YoY Comparison (Bar)
    if (lowerQuery.includes('comparison') || lowerQuery.includes('compare')) {
      return {
        message: "Here's a year-over-year comparison of quarterly revenue.",
        chartType: 'bar',
        title: 'YoY Quarterly Revenue Comparison',
        chartData: [
          { name: 'Q1', '2024': 1200000, '2025': 1450000 },
          { name: 'Q2', '2024': 1350000, '2025': 1580000 },
          { name: 'Q3', '2024': 1400000, '2025': 1620000 },
          { name: 'Q4', '2024': 1500000, '2025': 1730000 },
        ]
      };
    }

    // 6. Website Traffic Sources (Pie)
    if (lowerQuery.includes('traffic') && lowerQuery.includes('source')) {
      return {
        message: "Here's a pie chart of website traffic sources.",
        chartType: 'pie',
        title: 'Website Traffic by Source',
        chartData: [
          { name: 'Organic Search', value: 45 },
          { name: 'Paid Ads', value: 25 },
          { name: 'Direct', value: 15 },
          { name: 'Referral', value: 10 },
          { name: 'Social', value: 5 },
        ]
      };
    }

    // 7. Customer Satisfaction vs Response Time (Scatter)
    if (lowerQuery.includes('satisfaction') && lowerQuery.includes('response')) {
      return {
        message: "Here's a scatter plot of customer satisfaction vs support response time.",
        chartType: 'scatter',
        title: 'Customer Satisfaction vs Response Time',
        chartData: [
          { x: 2, y: 90 },
          { x: 4, y: 85 },
          { x: 6, y: 80 },
          { x: 8, y: 70 },
          { x: 10, y: 65 },
        ]
      };
    }

    // 8. Revenue by Region (Map)
    if (lowerQuery.includes('map') && lowerQuery.includes('revenue')) {
      return {
        message: "Here's a geographic map showing revenue by region.",
        chartType: 'geo',
        title: 'Revenue by Region',
        chartData: [
          { region: 'North America', value: 800000 },
          { region: 'Europe', value: 700000 },
          { region: 'Asia', value: 900000 },
          { region: 'South America', value: 300000 },
          { region: 'Africa', value: 200000 }
        ]
      };
    }

    // 9. Sales by Hour (Heatmap)
    if (lowerQuery.includes('sales') && lowerQuery.includes('hour')) {
      return {
        message: "Here's a heatmap of hourly sales throughout the week.",
        chartType: 'heatmap',
        title: 'Hourly Sales Heatmap',
        chartData: [
          { day: 'Mon', hours: [120, 100, 140, 160, 180, 200, 220] },
          { day: 'Tue', hours: [130, 110, 150, 170, 190, 210, 230] },
          // ... more days
        ]
      };
    }

    // Default fallback
    return {
      message: "I understand you're looking for a data visualization. Try asking about things like 'sales trends', 'revenue by product', or 'budget by department'."
    };

  } catch (error) {
    console.error('Error processing query:', error);
    throw new Error('Failed to process your request. Please try again.');
  }
};
