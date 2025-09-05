import { ChartType } from '../types';

interface EnhancedApiResponse {
  message: string;
  chartData?: any[];
  chartType?: ChartType;
  title?: string;
  queryType?: 'data-analysis' | 'general' | 'business' | 'technical' | 'creative' | 'educational';
  confidence?: number;
}

interface DialogueTurn { 
  role: 'user' | 'assistant'; 
  content: string; 
}

interface ConversationContext {
  previousQueries: string[];
  userPreferences: Record<string, any>;
  domainExpertise: string[];
  conversationHistory: DialogueTurn[];
}

// Enhanced AI service with comprehensive training for any kind of query
export class EnhancedAiService {
  private static conversationContext: ConversationContext = {
    previousQueries: [],
    userPreferences: {},
    domainExpertise: ['business', 'data-analysis', 'finance', 'technology'],
    conversationHistory: []
  };

  // Enhanced rate limiting utility with longer delays
  private static rateLimiter = {
    requests: [] as number[],
    maxRequests: 3, // Reduced from 10 to 3 requests
    windowMs: 60000, // Per minute
    lastRequestTime: 0,
    minDelay: 5000, // 5 second minimum delay between requests
    
    canMakeRequest(): boolean {
      const now = Date.now();
      this.requests = this.requests.filter(time => now - time < this.windowMs);
      
      // Check if we're within rate limit AND minimum delay has passed
      const timeSinceLastRequest = now - this.lastRequestTime;
      return this.requests.length < this.maxRequests && timeSinceLastRequest >= this.minDelay;
    },
    
    recordRequest(): void {
      const now = Date.now();
      this.requests.push(now);
      this.lastRequestTime = now;
    }
  };

  // Main processing function that handles ANY kind of query
  static async processAnyQuery(
    query: string,
    uploadedData?: any[],
    uploadedColumns?: string[],
    priorDialogue?: DialogueTurn[]
  ): Promise<EnhancedApiResponse> {
    try {
      // Store query in context
      EnhancedAiService.conversationContext.previousQueries.push(query);
      EnhancedAiService.conversationContext.conversationHistory = priorDialogue || [];

      // Classify the query type
      const queryType = EnhancedAiService.classifyQuery(query);
      
      // Handle based on query type
      switch (queryType) {
        case 'data-analysis':
          return await EnhancedAiService.handleDataAnalysisQuery(query, uploadedData, uploadedColumns, priorDialogue);
        
        case 'business':
          return await EnhancedAiService.handleBusinessQuery(query, priorDialogue);
        
        case 'technical':
          return await EnhancedAiService.handleTechnicalQuery(query, priorDialogue);
        
        case 'creative':
          return await EnhancedAiService.handleCreativeQuery(query, priorDialogue);
        
        case 'educational':
          return await EnhancedAiService.handleEducationalQuery(query, priorDialogue);
        
        case 'general':
        default:
          return await EnhancedAiService.handleGeneralQuery(query, priorDialogue);
      }
    } catch (error) {
      console.error('Enhanced AI service error:', error);
      return {
        message: "I encountered an error processing your request. Could you please rephrase your question?",
        queryType: 'general',
        confidence: 0
      };
    }
  }

  // Query classification using pattern matching and keywords
  private static classifyQuery(query: string): 'data-analysis' | 'general' | 'business' | 'technical' | 'creative' | 'educational' {
    const lowerQuery = query.toLowerCase();
    
    // Data analysis keywords
    const dataKeywords = [
      'analyze', 'chart', 'graph', 'data', 'statistics', 'report', 'trend', 'compare',
      'average', 'sum', 'count', 'total', 'top', 'bottom', 'highest', 'lowest',
      'revenue', 'sales', 'profit', 'expense', 'budget', 'growth', 'performance'
    ];
    
    // Business keywords
    const businessKeywords = [
      'strategy', 'market', 'customer', 'product', 'service', 'competition', 'roi',
      'investment', 'pricing', 'marketing', 'sales strategy', 'business plan',
      'kpi', 'metrics', 'growth strategy', 'market analysis', 'swot'
    ];
    
    // Technical keywords
    const technicalKeywords = [
      'code', 'programming', 'software', 'algorithm', 'database', 'api', 'framework',
      'javascript', 'python', 'react', 'node', 'sql', 'html', 'css', 'technology',
      'system', 'architecture', 'deployment', 'security', 'performance optimization'
    ];
    
    // Creative keywords
    const creativeKeywords = [
      'create', 'design', 'write', 'story', 'poem', 'idea', 'brainstorm', 'innovative',
      'creative', 'artistic', 'content', 'copywriting', 'branding', 'logo', 'slogan'
    ];
    
    // Educational keywords
    const educationalKeywords = [
      'explain', 'learn', 'teach', 'tutorial', 'how to', 'what is', 'definition',
      'concept', 'theory', 'principle', 'example', 'demonstrate', 'understand'
    ];
    
    // Check for data analysis patterns (highest priority if data is available)
    if (dataKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'data-analysis';
    }
    
    // Check other categories
    if (businessKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'business';
    }
    
    if (technicalKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'technical';
    }
    
    if (creativeKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'creative';
    }
    
    if (educationalKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'educational';
    }
    
    return 'general';
  }

  // Handle data analysis queries (existing functionality)
  private static async handleDataAnalysisQuery(
    query: string,
    uploadedData?: any[],
    uploadedColumns?: string[],
    priorDialogue?: DialogueTurn[]
  ): Promise<EnhancedApiResponse> {
    // Use existing processQuery logic from aiService
    const { processQuery } = await import('./aiService');
    
    try {
      const result = await processQuery(query, uploadedData, uploadedColumns, priorDialogue);
      return {
        ...result,
        queryType: 'data-analysis',
        confidence: 90
      };
    } catch (error) {
      return await EnhancedAiService.callAdvancedLLM(query, 'data-analysis', priorDialogue, uploadedData, uploadedColumns);
    }
  }

  // Handle business-related queries
  private static async handleBusinessQuery(query: string, priorDialogue?: DialogueTurn[]): Promise<EnhancedApiResponse> {
    const businessKnowledge = `
As a business expert, I can help with:
• Strategic planning and analysis
• Market research and competitive analysis
• Financial planning and ROI calculations
• Customer acquisition and retention strategies
• Product development and positioning
• Operations optimization
• Risk management
• Leadership and team management
• Digital transformation strategies
• Performance metrics and KPIs
    `;

    return await EnhancedAiService.callAdvancedLLM(query, 'business', priorDialogue, undefined, undefined, businessKnowledge);
  }

  // Handle technical queries
  private static async handleTechnicalQuery(query: string, priorDialogue?: DialogueTurn[]): Promise<EnhancedApiResponse> {
    const technicalKnowledge = `
As a technical expert, I can help with:
• Programming languages (JavaScript, Python, React, Node.js, etc.)
• Software architecture and design patterns
• Database design and optimization
• API development and integration
• Cloud computing and DevOps
• Security best practices
• Performance optimization
• Debugging and troubleshooting
• Code review and best practices
• Technology stack recommendations
    `;

    return await EnhancedAiService.callAdvancedLLM(query, 'technical', priorDialogue, undefined, undefined, technicalKnowledge);
  }

  // Handle creative queries
  private static async handleCreativeQuery(query: string, priorDialogue?: DialogueTurn[]): Promise<EnhancedApiResponse> {
    const creativeKnowledge = `
As a creative assistant, I can help with:
• Content creation and copywriting
• Brainstorming and ideation
• Story writing and narrative development
• Marketing copy and slogans
• Creative problem solving
• Design concepts and branding ideas
• Social media content
• Blog posts and articles
• Product naming and descriptions
• Creative project planning
    `;

    return await EnhancedAiService.callAdvancedLLM(query, 'creative', priorDialogue, undefined, undefined, creativeKnowledge);
  }

  // Handle educational queries
  private static async handleEducationalQuery(query: string, priorDialogue?: DialogueTurn[]): Promise<EnhancedApiResponse> {
    const educationalKnowledge = `
As an educational assistant, I can help with:
• Explaining complex concepts in simple terms
• Providing step-by-step tutorials
• Creating learning materials
• Answering "how-to" questions
• Offering examples and demonstrations
• Breaking down difficult topics
• Providing context and background information
• Suggesting learning resources
• Creating study guides
• Facilitating understanding through analogies
    `;

    return await EnhancedAiService.callAdvancedLLM(query, 'educational', priorDialogue, undefined, undefined, educationalKnowledge);
  }

  // Handle general queries
  private static async handleGeneralQuery(query: string, priorDialogue?: DialogueTurn[]): Promise<EnhancedApiResponse> {
    const generalKnowledge = `
As a helpful AI assistant, I can assist with:
• General knowledge questions
• Casual conversation
• Life advice and suggestions
• Current events and news (within my knowledge)
• Problem-solving assistance
• Information lookup and research
• Personal productivity tips
• Health and wellness guidance (general information only)
• Travel and lifestyle recommendations
• Entertainment and hobby suggestions
    `;

    return await EnhancedAiService.callAdvancedLLM(query, 'general', priorDialogue, undefined, undefined, generalKnowledge);
  }

  // Advanced LLM call with specialized prompts
  private static async callAdvancedLLM(
    query: string, 
    queryType: string, 
    priorDialogue?: DialogueTurn[],
    uploadedData?: any[],
    uploadedColumns?: string[],
    domainKnowledge?: string
  ): Promise<EnhancedApiResponse> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      return EnhancedAiService.getEnhancedFallbackResponse(query, queryType);
    }

    // Check rate limiting
    if (!EnhancedAiService.rateLimiter.canMakeRequest()) {
      return EnhancedAiService.getEnhancedFallbackResponse(query, queryType);
    }

    EnhancedAiService.rateLimiter.recordRequest();

    try {
      // Construct enhanced system prompt based on query type
      let systemPrompt = `You are an expert AI assistant specializing in ${queryType} queries. `;
      
      if (domainKnowledge) {
        systemPrompt += domainKnowledge;
      }
      
      systemPrompt += `
      
You should:
• Provide comprehensive, accurate, and helpful responses
• Use clear, professional language appropriate for the context
• Include specific examples when helpful
• Break down complex topics into understandable parts
• Offer actionable advice when appropriate
• Ask clarifying questions if the query is ambiguous
• Admit limitations when you don't have specific information
• Maintain a helpful and professional tone

If the user has uploaded data and asks data-related questions, reference their specific dataset when possible.
      `;

      // Add data context if available
      if (uploadedData && uploadedColumns && uploadedData.length > 0) {
        const dataSummary = EnhancedAiService.generateDataSummary(uploadedColumns, uploadedData);
        systemPrompt += `\n\nUser's uploaded data context:\n${dataSummary}`;
      }

      // Build message history
      const messages = [
        { role: 'system', content: systemPrompt },
        ...(priorDialogue || []),
        { role: 'user', content: query }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 800,
          temperature: 0.7
        })
      });

      const result = await response.json();

      if (result.choices && result.choices[0] && result.choices[0].message) {
        return {
          message: result.choices[0].message.content,
          queryType: queryType as any,
          confidence: 85
        };
      } else {
        return EnhancedAiService.getEnhancedFallbackResponse(query, queryType);
      }
    } catch (error) {
      console.error('LLM API error:', error);
      return EnhancedAiService.getEnhancedFallbackResponse(query, queryType);
    }
  }

  // Generate data summary for context
  private static generateDataSummary(columns: string[], data: any[], maxRows: number = 5): string {
    const sampleData = data.slice(0, maxRows);
    return `Dataset: ${data.length} rows, ${columns.length} columns\nColumns: ${columns.join(', ')}\nSample data: ${JSON.stringify(sampleData, null, 2)}`;
  }

  // Enhanced fallback responses for different query types
  private static getEnhancedFallbackResponse(query: string, queryType: string): EnhancedApiResponse {
    const enhancedFallbackResponses = {
      'business': this.getBusinessResponse(query),
      'technical': this.getTechnicalResponse(query),
      'creative': this.getCreativeResponse(query),
      'educational': this.getEducationalResponse(query),
      'data-analysis': this.getDataAnalysisResponse(query),
      'general': this.getGeneralResponse(query)
    };

    return enhancedFallbackResponses[queryType as keyof typeof enhancedFallbackResponses] || enhancedFallbackResponses.general;
  }

  private static getBusinessResponse(query: string): EnhancedApiResponse {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('customer retention')) {
      return {
        message: `🎯 **Customer Retention Strategies:**

**Key Approaches:**
• **Personalization**: Tailor experiences based on customer behavior and preferences
• **Loyalty Programs**: Reward repeat customers with points, discounts, or exclusive access
• **Exceptional Support**: Provide 24/7 customer service with quick response times
• **Regular Communication**: Send personalized emails, newsletters, and updates
• **Feedback Loops**: Actively seek and act on customer feedback

**Metrics to Track:**
• Customer Lifetime Value (CLV)
• Churn Rate
• Net Promoter Score (NPS)
• Customer Satisfaction Score (CSAT)

**Quick Wins:**
• Implement welcome email sequences for new customers
• Create onboarding tutorials or guides
• Offer surprise rewards to loyal customers
• Follow up after purchases to ensure satisfaction`,
        queryType: 'business',
        confidence: 85
      };
    }
    
    if (lowerQuery.includes('marketing strategies') || lowerQuery.includes('marketing plan')) {
      return {
        message: `📈 **Effective Marketing Strategies:**

**Digital Marketing:**
• **Content Marketing**: Create valuable blog posts, videos, and guides
• **Social Media**: Engage on platforms where your audience is active
• **Email Marketing**: Build and nurture email lists with valuable content
• **SEO**: Optimize for search engines to increase organic traffic
• **PPC Advertising**: Use Google Ads and social media ads for quick results

**Traditional Approaches:**
• **Networking**: Attend industry events and build relationships
• **Partnerships**: Collaborate with complementary businesses
• **Referral Programs**: Incentivize existing customers to refer others

**Key Performance Indicators:**
• Cost Per Acquisition (CPA)
• Return on Investment (ROI)
• Conversion Rates
• Brand Awareness Metrics

**Budget Allocation (typical):**
• 40% Digital Advertising
• 25% Content Creation
• 20% Email Marketing
• 15% Events/Networking`,
        queryType: 'business',
        confidence: 88
      };
    }

    return {
      message: `💼 **Business Strategy Insights:**

I can help you with various business topics including:
• Strategic planning and market analysis
• Financial planning and ROI calculations
• Customer acquisition and retention
• Product development and positioning
• Operations optimization and efficiency
• Leadership and team management

**Common Business Challenges:**
• Market competition analysis
• Pricing strategy optimization
• Digital transformation planning
• Risk management frameworks
• Performance measurement systems

Could you provide more specific details about your business challenge? I'll give you targeted advice and actionable strategies.`,
      queryType: 'business',
      confidence: 75
    };
  }

  private static getTechnicalResponse(query: string): EnhancedApiResponse {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('react') && lowerQuery.includes('performance')) {
      return {
        message: `⚡ **React Performance Optimization:**

**Key Techniques:**
• **Use React.memo()**: Prevent unnecessary re-renders of functional components
• **Implement useMemo()**: Memoize expensive calculations
• **Apply useCallback()**: Memoize function references
• **Code Splitting**: Use React.lazy() and Suspense for dynamic imports
• **Virtual Scrolling**: For large lists, render only visible items

**Best Practices:**
\`\`\`javascript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  onClick(id);
}, [onClick, id]);

// Component memoization
const MyComponent = React.memo(({ prop1, prop2 }) => {
  return <div>{prop1} {prop2}</div>;
});
\`\`\`

**Performance Monitoring:**
• React DevTools Profiler
• Web Vitals metrics
• Bundle analysis tools`,
        queryType: 'technical',
        confidence: 92
      };
    }

    if (lowerQuery.includes('database') && lowerQuery.includes('optimization')) {
      return {
        message: `🔧 **Database Optimization Strategies:**

**Indexing:**
• Create indexes on frequently queried columns
• Use composite indexes for multi-column queries
• Monitor index usage and remove unused ones

**Query Optimization:**
• Use EXPLAIN to analyze query execution plans
• Avoid SELECT * statements
• Use appropriate JOIN types
• Implement proper WHERE clause ordering

**Schema Design:**
• Normalize data appropriately (3NF typically)
• Use appropriate data types
• Consider denormalization for read-heavy workloads

**Performance Monitoring:**
• Track slow query logs
• Monitor connection pool usage
• Implement query caching
• Use database profiling tools

**Example Index Creation:**
\`\`\`sql
-- Single column index
CREATE INDEX idx_user_email ON users(email);

-- Composite index
CREATE INDEX idx_order_date_status ON orders(order_date, status);
\`\`\``,
        queryType: 'technical',
        confidence: 89
      };
    }

    return {
      message: `💻 **Technical Assistance Available:**

I can help with:
• **Programming**: JavaScript, Python, React, Node.js, SQL
• **Architecture**: System design, microservices, APIs
• **DevOps**: CI/CD, cloud deployment, monitoring
• **Security**: Best practices, authentication, data protection
• **Performance**: Optimization techniques, debugging

**Popular Topics:**
• Code review and best practices
• Debugging techniques
• Algorithm optimization
• Database design
• API development

What specific technical challenge are you facing? I can provide code examples, best practices, and step-by-step guidance.`,
      queryType: 'technical',
      confidence: 80
    };
  }

  private static getCreativeResponse(query: string): EnhancedApiResponse {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('brainstorm') && lowerQuery.includes('name')) {
      return {
        message: `🎨 **Creative Naming Strategies:**

**Approaches to Consider:**
• **Descriptive Names**: Clear about what you do (DataFlow, QuickBooks)
• **Abstract Names**: Memorable and brandable (Google, Spotify)
• **Compound Words**: Combine relevant terms (Facebook, LinkedIn)
• **Made-up Words**: Unique and trademarkable (Kodak, Xerox)

**Brainstorming Techniques:**
• **Word Association**: Start with core concepts and branch out
• **Problem-Solution**: Focus on the problem you solve
• **Metaphors**: Use analogies from nature, mythology, or other fields
• **Foreign Languages**: Explore words from different languages

**Testing Your Names:**
• Say it out loud - is it easy to pronounce?
• Check domain availability
• Search for existing trademarks
• Test with your target audience
• Consider future expansion possibilities

**Tools to Help:**
• Thesaurus for synonyms
• Name generators online
• Domain name checkers
• Social media handle availability

Would you like me to help brainstorm names for a specific industry or product type?`,
        queryType: 'creative',
        confidence: 87
      };
    }

    return {
      message: `🎨 **Creative Services Available:**

I can assist with:
• **Content Creation**: Blog posts, articles, social media content
• **Brainstorming**: Product names, marketing ideas, solutions
• **Writing**: Copy, descriptions, emails, scripts
• **Branding**: Concept development, messaging, positioning

**Creative Process:**
• Understanding your goals and audience
• Generating multiple concepts
• Refining and developing ideas
• Testing and iterating

What creative project are you working on? I can help generate ideas, provide frameworks, or give feedback on existing concepts.`,
      queryType: 'creative',
      confidence: 78
    };
  }

  private static getEducationalResponse(query: string): EnhancedApiResponse {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('machine learning')) {
      return {
        message: `📚 **Machine Learning Explained Simply:**

**What is Machine Learning?**
Machine Learning is a way to teach computers to find patterns in data and make predictions without being explicitly programmed for every scenario.

**Real-World Analogy:**
Think of it like teaching a child to recognize cats:
• Show them 1000 photos labeled "cat" or "not cat"
• They learn patterns (whiskers, pointy ears, etc.)
• Now they can identify cats in new photos

**Types of Machine Learning:**

**1. Supervised Learning** 🎯
• Has labeled examples (like the cat photos)
• Examples: Email spam detection, price prediction
• Algorithms: Linear Regression, Decision Trees

**2. Unsupervised Learning** 🔍
• No labels, finds hidden patterns
• Examples: Customer segmentation, recommendation systems
• Algorithms: K-means clustering, Association rules

**3. Reinforcement Learning** 🎮
• Learns through trial and error with rewards
• Examples: Game AI, autonomous vehicles
• Like training a pet with treats

**Common Applications:**
• Netflix recommendations
• Google search results
• Fraud detection
• Medical diagnosis
• Voice assistants`,
        queryType: 'educational',
        confidence: 91
      };
    }

    return {
      message: `📖 **Educational Support Available:**

I can help explain:
• **Technology**: AI, blockchain, cloud computing, programming
• **Business**: Finance, marketing, operations, strategy
• **Science**: Data science, statistics, research methods
• **Skills**: Communication, leadership, productivity

**Teaching Approach:**
• Break complex topics into simple concepts
• Use real-world examples and analogies
• Provide step-by-step explanations
• Offer practice exercises and examples

What would you like to learn about? I'll explain it in a way that's easy to understand and actionable.`,
      queryType: 'educational',
      confidence: 82
    };
  }

  private static getDataAnalysisResponse(_query: string): EnhancedApiResponse {
    return {
      message: `📊 **Data Analysis Capabilities:**

I can help you analyze your uploaded data in many ways:

**Chart Types Available:**
• **Bar Charts**: Compare categories or groups
• **Line Charts**: Show trends over time
• **Pie Charts**: Display proportions and percentages
• **Scatter Plots**: Explore relationships between variables

**Analysis Options:**
• Statistical summaries (mean, median, mode)
• Trend identification and forecasting
• Outlier detection and data quality checks
• Correlation analysis between variables
• Top/bottom performers identification

**Sample Queries You Can Try:**
• "Show me the top 10 items by revenue"
• "Create a trend analysis for the last 6 months"
• "Compare performance across different categories"
• "Find correlations between price and sales"
• "Identify any unusual patterns in the data"

If you have data uploaded, I can create specific visualizations and insights. What aspect of your data would you like to explore?`,
      queryType: 'data-analysis',
      confidence: 88
    };
  }

  private static getGeneralResponse(_query: string): EnhancedApiResponse {
    return {
      message: `🤖 **How I Can Help You:**

I'm trained to assist with virtually any question or task:

**Core Capabilities:**
• **Problem Solving**: Break down complex challenges
• **Research & Analysis**: Gather and synthesize information
• **Planning & Strategy**: Help organize and structure approaches
• **Learning & Education**: Explain concepts clearly
• **Creative Support**: Generate ideas and content

**Response Quality:**
• I provide detailed, actionable responses
• Include examples and step-by-step guidance
• Offer multiple perspectives when relevant
• Adapt to your specific context and needs

**Best Results:**
• Be specific about what you need
• Provide context about your situation
• Ask follow-up questions for clarification
• Let me know if you need a different approach

What would you like to explore or accomplish today? I'm here to provide comprehensive assistance tailored to your needs.`,
      queryType: 'general',
      confidence: 85
    };
  }

  // Enhanced suggestion system
  static getEnhancedSuggestions(columns?: string[]): string[] {
    const suggestions = [
      // Data analysis suggestions
      ...(columns ? [
        `Analyze trends in ${columns[0] || 'your data'}`,
        `Compare ${columns[0] || 'categories'} by ${columns[1] || 'values'}`,
        `Show top 5 ${columns[0] || 'items'} by performance`
      ] : []),
      
      // Business suggestions
      "How can I improve customer retention?",
      "What are effective marketing strategies for small businesses?",
      "Help me create a business plan",
      "Analyze market competition strategies",
      
      // Technical suggestions
      "Explain React best practices",
      "How to optimize database performance?",
      "Security considerations for web applications",
      "Code review checklist",
      
      // Creative suggestions
      "Help me brainstorm product names",
      "Write engaging social media content",
      "Create a marketing slogan",
      "Develop a brand story",
      
      // Educational suggestions
      "Explain machine learning concepts",
      "How does blockchain technology work?",
      "Teach me about financial planning",
      "What are design patterns in programming?",
      
      // General suggestions
      "Help me solve a problem",
      "Give me productivity tips",
      "Explain current technology trends",
      "Provide career advice"
    ];
    
    return suggestions.slice(0, 12);
  }

  // Context-aware response enhancement
  static enhanceResponseWithContext(response: string, queryType: string): string {
    const contextEnhancements = {
      'business': "\n\n💡 **Business Tip**: Consider the long-term implications and ROI of any strategy discussed.",
      'technical': "\n\n🔧 **Technical Note**: Always test implementations in a development environment first.",
      'creative': "\n\n🎨 **Creative Insight**: Remember that great ideas often come from combining existing concepts in new ways.",
      'educational': "\n\n📚 **Learning Tip**: Practice applying these concepts with real examples to deepen understanding.",
      'data-analysis': "\n\n📊 **Data Insight**: Consider data quality and sample size when interpreting results.",
      'general': "\n\n💭 **General Advice**: Feel free to ask follow-up questions for more specific guidance."
    };

    return response + (contextEnhancements[queryType as keyof typeof contextEnhancements] || contextEnhancements.general);
  }
}

// Export the main function for backward compatibility
export const processEnhancedQuery = EnhancedAiService.processAnyQuery;
export const getEnhancedSuggestions = EnhancedAiService.getEnhancedSuggestions;
