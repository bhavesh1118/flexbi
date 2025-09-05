import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useUploadedData } from '../context/UploadedDataContext';
import { processQuery } from '../services/aiService';
import { DataAnalysisService, DataInsight } from '../services/dataAnalysisService';
import { generateFallbackAnalysis } from '../services/fallbackAnalysisService';

interface NaturalLanguageQueryProps {
  className?: string;
}

interface AnalysisContext {
  previousQueries: string[];
  generatedCharts: any[];
  dataInsights: DataInsight[];
  detectedTrends: string[];
  // outliers: any[]; // Commented out for now
  cleanedData: any[];
  dataSummary: any;
}

const NaturalLanguageQuery: React.FC<NaturalLanguageQueryProps> = ({ className }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [analysisContext, setAnalysisContext] = useState<AnalysisContext>({
    previousQueries: [],
    generatedCharts: [],
    dataInsights: [],
    detectedTrends: [],
    // outliers: [], // Commented out for now
    cleanedData: [],
    dataSummary: null
  });
  const [conversationHistory, setConversationHistory] = useState<Array<{
    query: string;
    response: string;
    charts: any[];
    timestamp: Date;
  }>>([]);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<'ok' | 'error' | 'unknown'>('unknown');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { addChart } = useDashboard();
  const { data: uploadedData, columns: uploadedColumns } = useUploadedData();

  // Enhanced sample queries with follow-up patterns
  const sampleQueries = [
    "Compare region-wise expenses for Q2",
    // "Find the top 3 outlier products in quantity and plot them", // Commented out outlier query
    "Show me a bar chart of sales by region",
    "Create a pie chart of revenue by product category",
    "Plot monthly sales trends over time",
    "Find products with highest profit margins",
    "Show customer satisfaction vs response time",
    "Compare budget vs actual spending by department",
    // "Identify sales outliers by region", // Commented out outlier query
    "Generate a heatmap of sales by hour and day",
    "What are the trends in our data?",
    "Find anomalies in our dataset",
    "Compare this quarter to last quarter",
    "Show me the distribution of our key metrics"
  ];

  useEffect(() => {
    // Initialize speech recognition with better error handling
    const initializeSpeechRecognition = async () => {
      try {
        // Check if speech recognition is supported
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          console.warn('Speech recognition not supported in this browser');
          setSpeechSupported(false);
          return;
        }
        
        setSpeechSupported(true);

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        
        // Configure recognition settings
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';
        // Note: maxAlternatives is not universally supported across all browsers
        if (recognitionInstance.maxAlternatives !== undefined) {
          recognitionInstance.maxAlternatives = 1;
        }

        recognitionInstance.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
        };

        recognitionInstance.onresult = (event) => {
          try {
            const transcript = event.results[0][0].transcript;
            console.log('Speech recognized:', transcript);
            setQuery(transcript);
            setIsListening(false);
            handleSubmit(transcript);
          } catch (error) {
            console.error('Error processing speech result:', error);
            setIsListening(false);
          }
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          // Handle specific error types with better fallback
          let errorMessage = 'Speech recognition failed.';
          let shouldRetry = false;
          
          switch (event.error) {
            case 'network':
              errorMessage = 'Network error. Speech recognition requires internet connection. You can still type your queries.';
              shouldRetry = false;
              break;
            case 'not-allowed':
              errorMessage = 'Microphone access denied. Please allow microphone permissions in your browser settings.';
              shouldRetry = false;
              break;
            case 'no-speech':
              errorMessage = 'No speech detected. Please try speaking more clearly or use text input.';
              shouldRetry = true;
              break;
            case 'audio-capture':
              errorMessage = 'Audio capture failed. Please check your microphone and try again.';
              shouldRetry = true;
              break;
            case 'service-not-allowed':
              errorMessage = 'Speech recognition service not available. Please use text input instead.';
              shouldRetry = false;
              break;
            case 'aborted':
              errorMessage = 'Speech recognition was aborted.';
              shouldRetry = false;
              break;
            default:
              errorMessage = `Speech recognition error: ${event.error}. Please use text input instead.`;
              shouldRetry = false;
          }
          
          // Show user-friendly error message
          console.warn(errorMessage);
          
          // Don't show alert for network errors to avoid spam
          if (event.error !== 'network') {
            alert(errorMessage);
          }
          
          // Disable speech recognition if it's not working
          if (!shouldRetry) {
            setSpeechSupported(false);
          }
        };

        recognitionInstance.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
      }
    };

    initializeSpeechRecognition();
  }, []);

  // Use DataAnalysisService for data preparation
  const prepareData = (data: any[], columns: string[]) => {
    return DataAnalysisService.prepareData(data, columns);
  };

  // Generate follow-up suggestions based on context
  const generateFollowUpSuggestions = (currentQuery: string, context: AnalysisContext) => {
    return DataAnalysisService.generateFollowUpQuestions(
      currentQuery, 
      context.dataInsights
      // context.cleanedData, // Removed unused parameter
      // uploadedColumns || [] // Removed unused parameter
    );
  };

  const handleSubmit = async (inputQuery?: string) => {
    const queryToProcess = inputQuery || query;
    if (!queryToProcess.trim()) return;

    setIsProcessing(true);
    
    try {
      // Prepare and clean data
      const { data: cleanedData, insights, summary } = prepareData(uploadedData || [], uploadedColumns || []);
      
      // Update analysis context
      setAnalysisContext(prev => ({
        ...prev,
        previousQueries: [...prev.previousQueries, queryToProcess],
        dataInsights: [...prev.dataInsights, ...insights],
        cleanedData,
        dataSummary: summary
      }));

      // Process query with enhanced context
      let result;
      try {
        result = await processQuery(queryToProcess, cleanedData, uploadedColumns, 
          conversationHistory.map(ch => ({ role: 'user', content: ch.query })));
        
        // Update API status based on result
        if (result.message.includes('quota exceeded') || result.message.includes('rate limit')) {
          setApiStatus('error');
          // Use fallback analysis when API is unavailable
          result = generateFallbackAnalysis(queryToProcess, cleanedData, uploadedColumns || []);
        } else {
          setApiStatus('ok');
        }
      } catch (error) {
        console.error('API error, using fallback:', error);
        setApiStatus('error');
        // Use fallback analysis when API fails
        result = generateFallbackAnalysis(queryToProcess, cleanedData, uploadedColumns || []);
      }
      
      // Add chart if chart data is available
      if (result.chartData && result.chartType) {
        const chartId = Date.now().toString();
        addChart({
          id: chartId,
          title: result.title || 'Generated Chart',
          type: result.chartType,
          data: result.chartData,
          query: queryToProcess
        });
        
        // Update context with new chart
        setAnalysisContext(prev => ({
          ...prev,
          generatedCharts: [...prev.generatedCharts, { id: chartId, type: result.chartType, data: result.chartData }]
        }));
      }

      // Generate AI narrative
      const narrative = await generateNarrative(queryToProcess, result, cleanedData, uploadedColumns);
      
      // Update conversation history
      const conversationEntry = {
        query: queryToProcess,
        response: narrative,
        charts: result.chartData ? [{ type: result.chartType, data: result.chartData }] : [],
        timestamp: new Date()
      };
      
      setConversationHistory(prev => [...prev, conversationEntry]);
      
      // Generate follow-up suggestions
      const followUps = generateFollowUpSuggestions(queryToProcess, analysisContext);
      setSuggestedFollowUps(followUps);

      // Clear input after processing
      if (!inputQuery) {
        setQuery('');
      }
    } catch (error) {
      console.error('Error processing query:', error);
      
      // Show user-friendly error message
      let errorMessage = 'An error occurred while processing your query.';
      if (error instanceof Error) {
        if (error.message.includes('quota exceeded') || error.message.includes('rate limit')) {
          errorMessage = 'OpenAI API quota exceeded. Please try again later or check your billing.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      // Add error to conversation history
      const errorEntry = {
        query: queryToProcess,
        response: errorMessage,
        charts: [],
        timestamp: new Date()
      };
      
      setConversationHistory(prev => [...prev, errorEntry]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate AI narrative for results
  const generateNarrative = async (_queryParam: string, result: any, _dataParam: any[], _columnsParam: string[]) => {
    let narrative = result.message || '';
    
    if (result.chartData && result.chartType) {
      const chartType = result.chartType;
      const dataLength = result.chartData.length;
      
      narrative += `\n\n📊 **Chart Generated**: I've created a ${chartType} chart with ${dataLength} data points. `;
      
      if (chartType === 'bar') {
        narrative += "This bar chart effectively compares values across different categories.";
      } else if (chartType === 'line') {
        narrative += "This line chart shows trends and patterns over time.";
      } else if (chartType === 'pie') {
        narrative += "This pie chart displays the composition and proportions of your data.";
      } else if (chartType === 'scatter') {
        narrative += "This scatter plot reveals relationships and correlations between variables.";
      }
      
      // Add data insights
      if (dataLength > 0) {
        const firstItem = result.chartData[0];
        const keys = Object.keys(firstItem).filter(key => key !== 'name');
        
        if (keys.length > 0) {
          const values = result.chartData.map((item: any) => item[keys[0]]).filter((v: any) => typeof v === 'number');
          if (values.length > 0) {
            const max = Math.max(...values);
            const min = Math.min(...values);
            const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
            
            narrative += `\n\n📈 **Key Insights**: The ${keys[0]} values range from ${min} to ${max} with an average of ${avg.toFixed(2)}.`;
          }
        }
      }
    }
    
    return narrative;
  };

  // Export functionality
  const exportResults = () => {
    const exportData = DataAnalysisService.exportAnalysis(
      // analysisContext.cleanedData, // Removed unused parameter
      analysisContext.dataInsights,
      analysisContext.dataSummary,
      conversationHistory
    );
    
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const startListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Firefox, Safari, or Edge.');
      return;
    }

    try {
      // Check if already listening
      if (isListening) {
        stopListening();
        return;
      }

      // Request microphone permission first
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          // Microphone permission granted, start recognition
          recognition.start();
        })
        .catch((error) => {
          console.error('Microphone permission denied:', error);
          alert('Microphone access is required for speech recognition. Please allow microphone permissions and try again.');
        });
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Failed to start speech recognition. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSubmit(suggestion);
  };

  const handleFollowUpClick = (followUp: string) => {
    setQuery(followUp);
    handleSubmit(followUp);
  };

  // Test speech recognition functionality
  const testSpeechRecognition = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Firefox, Safari, or Edge.');
      return;
    }

    if (!recognition) {
      alert('Speech recognition not initialized. Please refresh the page and try again.');
      return;
    }

    // Test microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        alert('Microphone access granted! Speech recognition should work. Try clicking the Speak button.');
      })
      .catch((error) => {
        alert(`Microphone access denied: ${error.message}. Please allow microphone permissions in your browser settings.`);
      });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          🎯 Ask Me About Your Data
        </h3>
        <p className="text-gray-600">
          Simply type or speak your question. I'll create charts and explain what I find.
        </p>
      </div>

      {/* Query Input */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Try: 'Compare region-wise expenses for Q2' or 'Find top 3 products by sales'"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isProcessing}
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && query.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {sampleQueries
                .filter(suggestion => 
                  suggestion.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 5)
                .map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Voice Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing || !speechSupported}
          className={`px-4 py-3 rounded-lg font-medium transition-colors ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : speechSupported
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-400 text-white cursor-not-allowed'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={speechSupported ? 'Click to speak your query' : 'Speech recognition not supported in this browser'}
        >
          {isListening ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Listening...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {speechSupported ? 'Speak' : 'Unavailable'}
            </div>
          )}
        </button>

        {/* Submit Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={!query.trim() || isProcessing}
          className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            'Analyze'
          )}
        </button>
      </div>

             {/* Sample Queries */}
       <div className="mb-6">
         <h4 className="text-lg font-semibold text-gray-800 mb-3">💡 Try These Examples:</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
           {sampleQueries.slice(0, 6).map((suggestion, index) => (
             <button
               key={index}
               onClick={() => handleSuggestionClick(suggestion)}
               className="p-3 text-left bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
             >
               {suggestion}
             </button>
           ))}
         </div>
       </div>

             {/* Follow-up Suggestions */}
       {suggestedFollowUps.length > 0 && (
         <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
           <h4 className="text-lg font-semibold text-green-800 mb-3">💭 Want to Know More?</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {suggestedFollowUps.map((followUp, index) => (
               <button
                 key={index}
                 onClick={() => handleFollowUpClick(followUp)}
                 className="p-3 text-left bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors border border-green-300"
               >
                 {followUp}
               </button>
             ))}
           </div>
         </div>
       )}

             {/* Conversation History */}
       {conversationHistory.length > 0 && (
         <div className="mb-6">
           <h4 className="text-lg font-semibold text-gray-800 mb-3">📋 Recent Analysis</h4>
           <div className="space-y-3">
             {conversationHistory.slice(-2).map((entry, index) => (
               <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                 <div className="font-semibold text-gray-900 mb-2">Q: {entry.query}</div>
                 <div className="text-gray-700 text-sm leading-relaxed">{entry.response}</div>
                 {entry.charts.length > 0 && (
                   <div className="text-sm text-green-600 mt-2 flex items-center">
                     <span className="mr-1">📊</span> Chart created
                   </div>
                 )}
               </div>
             ))}
           </div>
         </div>
       )}

             {/* Export Button */}
       {conversationHistory.length > 0 && (
         <div className="mb-6">
           <button
             onClick={exportResults}
             className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
           >
             <span className="mr-2">📤</span>
             Export Analysis Results
           </button>
         </div>
       )}

             {/* Test Speech Recognition Button (for debugging) */}
       <div className="mb-6">
         <button
           onClick={testSpeechRecognition}
           className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
         >
           🧪 Test Speech Recognition
         </button>
       </div>

             {/* Status Messages */}
       {isListening && (
         <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
           🎤 Listening... Speak your query clearly
         </div>
       )}

       {isProcessing && (
         <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
           ⚡ Processing your query, cleaning data, and generating insights...
         </div>
       )}

       {!speechSupported && (
         <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
           ⚠️ Speech recognition not available. You can still type your queries.
         </div>
       )}

       {apiStatus === 'error' && (
         <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
           ⚠️ OpenAI API quota exceeded. Some features may be limited. Please check your billing or try again later.
         </div>
       )}

             {/* Data Status */}
       {uploadedData && uploadedData.length > 0 ? (
         <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
           <div className="flex items-center mb-2">
             <span className="mr-2">📊</span>
             <strong>Working with {uploadedData.length.toLocaleString()} records</strong>
           </div>
           {analysisContext.dataSummary && (
             <div className="text-xs text-gray-500">
               {analysisContext.dataSummary.numericColumns.length} numeric columns, {analysisContext.dataSummary.categoricalColumns.length} categorical columns
             </div>
           )}
         </div>
       ) : (
         <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
           ⚠️ No data uploaded. Upload data first for better results.
         </div>
       )}
    </div>
  );
};

export default NaturalLanguageQuery;
