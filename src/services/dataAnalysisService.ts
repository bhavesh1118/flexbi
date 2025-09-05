export interface DataInsight {
  type: 'outlier' | 'trend' | 'pattern' | 'summary'; // 'outlier' commented out functionality but keeping type for compatibility
  message: string;
  severity: 'low' | 'medium' | 'high';
  data?: any[];
}

export interface CleanedData {
  data: any[];
  insights: DataInsight[];
  summary: {
    totalRecords: number;
    totalColumns: number;
    numericColumns: string[];
    categoricalColumns: string[];
    missingValues: Record<string, number>;
    outliers: Record<string, any[]>;
  };
}

export class DataAnalysisService {
  
  // Clean and prepare data automatically
  static prepareData(rawData: any[], columns: string[]): CleanedData {
    if (!rawData || rawData.length === 0) {
      return {
        data: [],
        insights: [],
        summary: {
          totalRecords: 0,
          totalColumns: 0,
          numericColumns: [],
          categoricalColumns: [],
          missingValues: {},
          outliers: {}
        }
      };
    }

    const insights: DataInsight[] = [];
    const cleanedData = rawData.map((row) => {
      const cleanedRow: any = {};
      
      columns.forEach(col => {
        let value = row[col];
        
        // Clean numeric values
        if (typeof value === 'string' && !isNaN(Number(value))) {
          value = Number(value);
        }
        
        // Handle missing values
        if (value === null || value === undefined || value === '') {
          value = 0;
        }
        
        cleanedRow[col] = value;
      });
      
      return cleanedRow;
    });

    // Analyze data structure
    const numericColumns = columns.filter(col => 
      cleanedData.some(row => typeof row[col] === 'number' && !isNaN(row[col]))
    );
    const categoricalColumns = columns.filter(col => 
      cleanedData.some(row => typeof row[col] === 'string' || typeof row[col] === 'object')
    );

    // Detect missing values
    const missingValues: Record<string, number> = {};
    columns.forEach(col => {
      const missing = rawData.filter(row => 
        row[col] === null || row[col] === undefined || row[col] === ''
      ).length;
      if (missing > 0) {
        missingValues[col] = missing;
      }
    });

    // Detect outliers - Commented out for now
    const outliers: Record<string, any[]> = {};
    // numericColumns.forEach(col => {
    //   const values = cleanedData.map(row => row[col]).filter(v => typeof v === 'number');
    //   if (values.length > 0) {
    //     const sorted = values.sort((a, b) => a - b);
    //     const q1 = sorted[Math.floor(sorted.length * 0.25)];
    //     const q3 = sorted[Math.floor(sorted.length * 0.75)];
    //     const iqr = q3 - q1;
    //     const outlierValues = values.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);
    //     
    //     if (outlierValues.length > 0) {
    //       outliers[col] = outlierValues;
    //       insights.push({
    //         type: 'outlier',
    //         message: `Found ${outlierValues.length} outliers in ${col}`,
    //         severity: outlierValues.length > values.length * 0.1 ? 'high' : 'medium',
    //         data: outlierValues
    //       });
    //     }
    //   }
    // });

    // Detect trends
    numericColumns.forEach(col => {
      const values = cleanedData.map(row => row[col]).filter(v => typeof v === 'number');
      if (values.length > 10) {
        const trend = this.detectTrend(values);
        if (trend !== 'stable') {
          insights.push({
            type: 'trend',
            message: `Detected ${trend} trend in ${col}`,
            severity: 'medium',
            data: values
          });
        }
      }
    });

    // Generate summary insights
    insights.push({
      type: 'summary',
      message: `Dataset contains ${cleanedData.length} records with ${columns.length} columns`,
      severity: 'low'
    });

    if (Object.keys(missingValues).length > 0) {
      insights.push({
        type: 'pattern',
        message: `Found missing values in ${Object.keys(missingValues).length} columns`,
        severity: 'medium'
      });
    }

    return {
      data: cleanedData,
      insights,
      summary: {
        totalRecords: cleanedData.length,
        totalColumns: columns.length,
        numericColumns,
        categoricalColumns,
        missingValues,
        outliers
      }
    };
  }

  // Detect trends in numeric data
  static detectTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 3) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  // Generate chart suggestions based on data analysis
  static suggestCharts(data: any[], columns: string[], insights: DataInsight[]): string[] {
    const suggestions: string[] = [];
    const numericCols = columns.filter(col => 
      data.some(row => typeof row[col] === 'number' && !isNaN(row[col]))
    );
    const categoricalCols = columns.filter(col => 
      data.some(row => typeof row[col] === 'string' || typeof row[col] === 'object')
    );

    // Outlier analysis - Commented out for now
    // const outlierInsights = insights.filter(i => i.type === 'outlier');
    // if (outlierInsights.length > 0) {
    //   suggestions.push("Show outliers in the data");
    //   suggestions.push("Compare outliers to normal patterns");
    // }

    // Trend analysis
    const trendInsights = insights.filter(i => i.type === 'trend');
    if (trendInsights.length > 0) {
      suggestions.push("Visualize trends over time");
      suggestions.push("Show seasonal patterns");
    }

    // Distribution analysis
    if (numericCols.length > 0) {
      suggestions.push("Show distribution of key metrics");
      suggestions.push("Compare categories by performance");
    }

    // Correlation analysis
    if (numericCols.length >= 2) {
      suggestions.push("Find correlations between variables");
      suggestions.push("Show relationships in the data");
    }

    // Comparative analysis
    if (categoricalCols.length > 0 && numericCols.length > 0) {
      suggestions.push("Compare performance across categories");
      suggestions.push("Show top performers by metric");
    }

    return suggestions.slice(0, 6);
  }

  // Generate follow-up questions based on current analysis
  static generateFollowUpQuestions(
    currentQuery: string, 
    insights: DataInsight[]
    // data: any[], // Removed unused parameter
    // columns: string[] // Removed unused parameter
  ): string[] {
    const questions: string[] = [];
    const lowerQuery = currentQuery.toLowerCase();

    // Based on outliers - Commented out for now
    // const outlierInsights = insights.filter(i => i.type === 'outlier');
    // if (outlierInsights.length > 0) {
    //   questions.push("What caused these outliers?");
    //   questions.push("How do outliers compare to normal patterns?");
    //   questions.push("Are there similar outliers in other metrics?");
    // }

    // Based on trends
    const trendInsights = insights.filter(i => i.type === 'trend');
    if (trendInsights.length > 0) {
      questions.push("What factors influenced this trend?");
      questions.push("How does this compare to industry benchmarks?");
      questions.push("What are the implications for future planning?");
    }

    // Based on query content
    if (lowerQuery.includes('region') || lowerQuery.includes('location')) {
      questions.push("Drill down into specific regions");
      questions.push("Compare regions over time");
      questions.push("Find the best performing region");
    }

    if (lowerQuery.includes('trend') || lowerQuery.includes('time')) {
      questions.push("Show seasonal patterns");
      questions.push("Compare year-over-year growth");
      questions.push("Identify trend changes");
    }

    if (lowerQuery.includes('top') || lowerQuery.includes('best')) {
      questions.push("Show bottom performers");
      questions.push("Compare top vs bottom");
      questions.push("Analyze performance factors");
    }

    // General strategic questions
    questions.push("What are the business implications?");
    questions.push("How can we improve performance?");
    questions.push("What actions should we take based on this data?");

    return questions.slice(0, 4);
  }

  // Export analysis results
  static exportAnalysis(
    // data: any[], // Removed unused parameter
    insights: DataInsight[], 
    summary: any, 
    conversationHistory: any[]
  ): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      dataSummary: summary,
      insights: insights.map(i => ({
        type: i.type,
        message: i.message,
        severity: i.severity
      })),
      conversationHistory,
      recommendations: this.generateRecommendations(insights, summary)
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Generate recommendations based on insights
  static generateRecommendations(insights: DataInsight[], summary: any): string[] {
    const recommendations: string[] = [];

    // Data quality recommendations
    if (summary.missingValues && Object.keys(summary.missingValues).length > 0) {
      recommendations.push("Consider data cleaning to address missing values");
    }

    // Outlier recommendations - Commented out for now
    // const outlierInsights = insights.filter(i => i.type === 'outlier');
    // if (outlierInsights.length > 0) {
    //   recommendations.push("Investigate outliers to understand their causes");
    //   recommendations.push("Consider whether outliers should be included in analysis");
    // }

    // Trend recommendations
    const trendInsights = insights.filter(i => i.type === 'trend');
    if (trendInsights.length > 0) {
      recommendations.push("Monitor trends to identify opportunities or risks");
      recommendations.push("Consider forecasting based on identified trends");
    }

    // General recommendations
    if (summary.numericColumns && summary.numericColumns.length >= 2) {
      recommendations.push("Explore correlations between different metrics");
    }

    if (summary.categoricalColumns && summary.categoricalColumns.length > 0) {
      recommendations.push("Segment analysis by different categories");
    }

    return recommendations;
  }
}
