import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { processEnhancedQuery, getEnhancedSuggestions } from '../../services/enhancedAiService';
import SimpleChatMessage from './SimpleChatMessage';
import AICapabilitiesDemo from './AICapabilitiesDemo';
import { Message, DialogueTurn } from '../../types';
import { useUploadedData } from '../../context/UploadedDataContext';

interface ChatPanelProps {
  className?: string;
}



const ChatPanel: React.FC<ChatPanelProps> = ({ className }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      type: 'system', 
      content: '🤖 Hello! I\'m your enhanced AI assistant trained to help with ANY kind of query! I can assist with:\n\n📊 **Data Analysis & Reports** - Analyze your data, create charts, generate insights\n💼 **Business Strategy** - Marketing, planning, market analysis, ROI calculations\n💻 **Technical Help** - Programming, software development, troubleshooting\n🎨 **Creative Projects** - Content creation, brainstorming, writing, design ideas\n📚 **Learning & Education** - Explanations, tutorials, concept breakdowns\n💭 **General Questions** - Any topic you\'d like to explore!\n\nJust ask me anything and I\'ll provide intelligent, context-aware responses!' 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addChart } = useDashboard();
  const { data: uploadedData, columns: uploadedColumns } = useUploadedData();
  const sampleQueries = uploadedColumns && uploadedColumns.length > 0 ? getEnhancedSuggestions(uploadedColumns) : getEnhancedSuggestions();
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recentQueries') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save query to history
  const saveQueryToHistory = (query: string) => {
    setRecentQueries(prev => {
      const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
      localStorage.setItem('recentQueries', JSON.stringify(updated));
      return updated;
    });
  };



  // Helper to extract last N user/AI message pairs for context
  const getRecentDialogue = (n: number): DialogueTurn[] => {
    // Get last n*2 messages, filter for user/ai, and format as dialogue
    const dialogue = messages
      .filter(m => m.type === 'user' || m.type === 'ai')
      .slice(-n * 2)
      .map(m => ({ 
        role: m.type === 'user' ? 'user' as const : 'assistant' as const, 
        content: m.content 
      }));
    return dialogue;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    saveQueryToHistory(input.trim());
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Get last 5 user/AI message pairs for conversational context
    const priorDialogue = getRecentDialogue(5);

    // Try backend analytics first
    try {
      const backendRes = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: uploadedData, question: input }),
      });
      const backendResult = await backendRes.json();
      if (backendResult.answer && !backendResult.answer.startsWith('Sorry')) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: backendResult.answer,
          queryType: 'data-analysis',
          confidence: 95
        }]);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      // If backend fails, fallback to LLM
    }

    // Fallback: use AI service, now with uploaded data and prior dialogue
    try {
      const result = await processEnhancedQuery(input, uploadedData, uploadedColumns, priorDialogue);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: result.message,
        queryType: result.queryType,
        confidence: result.confidence
      };
      setMessages(prev => [...prev, aiResponse]);
      if (result.chartData) {
        if (result.chartType) {
          addChart({
            id: Date.now().toString(),
            title: result.title || 'Generated Chart',
            type: result.chartType || 'bar',
            data: result.chartData,
            query: input
          });
        } else {
          // If chartData is present but no chartType, show as table in chat
          if (result.chartData) {
            setMessages(prev => [
              ...prev,
              {
                id: (Date.now() + 2).toString(),
                type: 'ai',
                content: renderTable(result.chartData || [], uploadedColumns ? uploadedColumns : []),
                queryType: result.queryType,
                confidence: result.confidence
              }
            ]);
          }
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: 'Sorry, I encountered an error processing your request.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render a table as HTML string
  function renderTable(data: any[], columns?: string[]) {
    if (!data || data.length === 0) return '<div>No results found.</div>';
    const cols = columns && columns.length > 0 ? columns : Object.keys(data[0]);
    let html = '<div style="overflow-x:auto;"><table border="1" style="border-collapse:collapse; width:100%;"><thead><tr>';
    html += '<th style="padding:4px 8px; background-color:#f3f4f6; font-weight:bold;">S.No</th>';
    html += cols.map(col => `<th style='padding:4px 8px; background-color:#f3f4f6; font-weight:bold;'>${col}</th>`).join('');
    html += '</tr></thead><tbody>';
    html += data.map((row, index) => `<tr><td style='padding:4px 8px; background-color:#f9fafb; font-weight:bold;'>${index + 1}</td>${cols.map(col => `<td style='padding:4px 8px;'>${row[col] ?? ''}</td>`).join('')}</tr>`).join('');
    html += '</tbody></table></div>';
    return html;
  }

  // Merge sample queries and recent queries, deduplicate
  const allSuggestions = Array.from(new Set([...recentQueries, ...sampleQueries]));
  // Filtered suggestions for autocomplete
  const filteredSuggestions = input
    ? allSuggestions.filter(q => q.toLowerCase().includes(input.toLowerCase()))
    : allSuggestions;

  // Handle keyboard navigation for autocomplete
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete || filteredSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      setHighlightedIdx(idx => (idx + 1) % filteredSuggestions.length);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlightedIdx(idx => (idx - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      e.preventDefault();
    } else if (e.key === 'Enter' && highlightedIdx >= 0) {
      setInput(filteredSuggestions[highlightedIdx]);
      setShowAutocomplete(false);
      setHighlightedIdx(-1);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
      setHighlightedIdx(-1);
    }
  };

  return (
    <div className={`flex flex-col border-r border-gray-200 bg-white h-full ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Enhanced AI Assistant</h2>
        <p className="text-sm text-gray-500">Ask me anything - I'm trained for any type of query!</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* AI Capabilities Demo */}
        {messages.length === 1 && (
          <div className="p-4">
            <AICapabilitiesDemo onSelectQuery={(query) => setInput(query)} />
          </div>
        )}
        
        {/* Chat Messages */}
        <div className="p-4 space-y-4">
          {messages.map(message => (
            <SimpleChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        {allSuggestions.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {allSuggestions.map((q, i) => (
              <button
                key={i}
                className={`bg-gray-100 hover:bg-indigo-100 text-xs px-2 py-1 rounded border border-gray-200 transition ${recentQueries.includes(q) ? 'border-indigo-300' : ''}`}
                onClick={() => {
                  setInput(q);
                  setShowAutocomplete(false);
                  setHighlightedIdx(-1);
                  saveQueryToHistory(q);
                }}
                type="button"
                title={recentQueries.includes(q) ? 'Recent query' : 'Suggested'}
              >
                {q}
                {recentQueries.includes(q) && <span className="ml-1 text-indigo-400">★</span>}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-xs text-gray-500">
            <p>Try: "Show Q1 profit vs expense by region" or "Create a report of monthly sales"</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 relative">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowAutocomplete(true);
                setHighlightedIdx(-1);
              }}
              onFocus={() => setShowAutocomplete(true)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 100)}
              onKeyDown={handleInputKeyDown}
              placeholder="Ask me anything - data analysis, business advice, technical help, creative ideas, or general questions..."
              className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            />
            {showAutocomplete && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded shadow z-10 mt-1 max-h-40 overflow-y-auto">
                {filteredSuggestions.map((q, i) => (
                  <div
                    key={i}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-indigo-50 ${i === highlightedIdx ? 'bg-indigo-100' : ''}`}
                    onMouseDown={() => {
                      setInput(q);
                      setShowAutocomplete(false);
                      setHighlightedIdx(-1);
                      inputRef.current?.focus();
                    }}
                  >
                    {q}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            className={`p-2 rounded-lg ${
              isLoading || !input.trim()
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } transition-colors`}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;