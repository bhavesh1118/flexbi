import React, { useState } from 'react';
import { Brain, BarChart3, Briefcase, Code, Palette, BookOpen, MessageCircle, Sparkles } from 'lucide-react';

interface DemoQuery {
  category: string;
  icon: React.ReactNode;
  queries: string[];
  color: string;
}

const AICapabilitiesDemo: React.FC<{ onSelectQuery: (query: string) => void }> = ({ onSelectQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const demoQueries: DemoQuery[] = [
    {
      category: 'Data Analysis',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'blue',
      queries: [
        'Analyze the sales trends in my uploaded data',
        'Create a pie chart showing revenue by category',
        'What are the top 10 customers by total spending?',
        'Show me outliers in the profit column',
        'Calculate the correlation between price and sales'
      ]
    },
    {
      category: 'Business Strategy',
      icon: <Briefcase className="w-5 h-5" />,
      color: 'green',
      queries: [
        'How can I improve customer retention rates?',
        'What pricing strategies work best for SaaS products?',
        'Help me create a marketing plan for a new product',
        'Analyze my competitive positioning strategy',
        'What are the key KPIs I should track for growth?'
      ]
    },
    {
      category: 'Technical Help',
      icon: <Code className="w-5 h-5" />,
      color: 'purple',
      queries: [
        'How do I optimize React component performance?',
        'Explain the difference between SQL joins',
        'Best practices for API security',
        'How to implement authentication in Node.js?',
        'Debugging memory leaks in JavaScript'
      ]
    },
    {
      category: 'Creative Ideas',
      icon: <Palette className="w-5 h-5" />,
      color: 'pink',
      queries: [
        'Help me brainstorm names for my startup',
        'Write a compelling product description',
        'Create a social media content calendar',
        'Design a logo concept for my brand',
        'Write an engaging email subject line'
      ]
    },
    {
      category: 'Learning & Education',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'orange',
      queries: [
        'Explain machine learning in simple terms',
        'How does blockchain technology work?',
        'Teach me about financial planning basics',
        'What are design patterns in programming?',
        'Explain quantum computing concepts'
      ]
    },
    {
      category: 'General Knowledge',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'gray',
      queries: [
        'What are the current technology trends?',
        'How can I improve my productivity?',
        'Explain the benefits of renewable energy',
        'What are effective leadership strategies?',
        'Help me plan a healthy meal routine'
      ]
    }
  ];

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-4 border">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">Enhanced AI Capabilities</h3>
        <Sparkles className="w-5 h-5 text-yellow-500" />
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Your AI assistant is now trained to handle ANY type of query! Try these examples:
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {demoQueries.map((demo) => (
          <div key={demo.category} className="relative">
            <button
              onClick={() => setSelectedCategory(selectedCategory === demo.category ? null : demo.category)}
              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${selectedCategory === demo.category 
                  ? `border-${demo.color}-500 bg-${demo.color}-50` 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`text-${demo.color}-500`}>
                  {demo.icon}
                </div>
                <span className="font-medium text-sm text-gray-800">{demo.category}</span>
              </div>
              <p className="text-xs text-gray-500">
                {demo.queries.length} example queries
              </p>
            </button>

            {selectedCategory === demo.category && (
              <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white rounded-lg shadow-lg border p-3 max-h-40 overflow-y-auto">
                {demo.queries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onSelectQuery(query);
                      setSelectedCategory(null);
                    }}
                    className="w-full text-left p-2 text-xs rounded hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {query}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-indigo-100 rounded-lg">
        <p className="text-xs text-indigo-800">
          <strong>🚀 Pro Tip:</strong> You can ask follow-up questions, request specific formats, or combine different types of queries. 
          The AI maintains conversation context and adapts to your needs!
        </p>
      </div>
    </div>
  );
};

export default AICapabilitiesDemo;
