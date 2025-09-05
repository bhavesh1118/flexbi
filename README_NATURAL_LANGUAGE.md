# Natural Language Query System

## Overview

The Natural Language Query System allows users to interact with their data using plain English queries, both typed and spoken. The system automatically:

1. **Cleans and prepares data** - Handles missing values, data type conversion, and data quality issues
2. **Selects optimal charts** - Automatically chooses the best visualization type based on the query
3. **Generates AI narratives** - Provides clear, contextual explanations of the results
4. **Suggests follow-up questions** - Offers intelligent follow-up queries based on the analysis
5. **Exports results** - Allows easy sharing and collaboration

## Features

### 🤖 AI-Powered Data Analysis

- **Natural Language Processing**: Understands queries like "Compare region-wise expenses for Q2" or "Find the top 3 outlier products"
- **Automatic Chart Selection**: Chooses the best chart type (bar, line, pie, scatter) based on query content
- **Smart Data Cleaning**: Automatically handles missing values, data type conversion, and outlier detection
- **Contextual Insights**: Provides meaningful narratives about the data and results

### 🎤 Voice Recognition

- **Speech-to-Text**: Speak your queries instead of typing them
- **Real-time Processing**: Immediate feedback during speech recognition
- **Cross-browser Support**: Works with Chrome, Firefox, Safari, and Edge
- **Error Handling**: Graceful fallback when speech recognition is unavailable

### 📊 Intelligent Chart Generation

- **Automatic Type Selection**: 
  - Bar charts for comparisons
  - Line charts for trends over time
  - Pie charts for compositions
  - Scatter plots for correlations
- **Smart Column Mapping**: Automatically identifies relevant columns from your query
- **Data Aggregation**: Handles grouping, summing, and statistical calculations

### 💡 Follow-up Suggestions

- **Context-Aware**: Suggestions based on your current query and data analysis
- **Progressive Discovery**: Each query builds on previous analysis
- **Strategic Questions**: Suggests business-relevant follow-up questions
- **Drill-down Capabilities**: Enables deeper exploration of the data

### 📈 Data Insights & Analysis

- **Outlier Detection**: Automatically identifies and reports statistical outliers
- **Trend Analysis**: Detects increasing, decreasing, or stable trends
- **Data Quality Assessment**: Reports missing values and data inconsistencies
- **Statistical Summaries**: Provides key metrics and distributions

### 📤 Export & Collaboration

- **Comprehensive Reports**: Exports analysis history, insights, and recommendations
- **JSON Format**: Structured data for easy integration with other tools
- **Timestamped Results**: Tracks analysis sessions with timestamps
- **Recommendations**: Includes actionable insights and next steps

## Usage Examples

### Basic Queries

```
"Compare region-wise expenses for Q2"
"Find the top 3 outlier products in quantity and plot them"
"Show me a bar chart of sales by region"
"Create a pie chart of revenue by product category"
"Plot monthly sales trends over time"
```

### Advanced Queries

```
"What are the trends in our data?"
"Find anomalies in our dataset"
"Compare this quarter to last quarter"
"Show me the distribution of our key metrics"
"Identify sales outliers by region"
```

### Follow-up Questions

After running an initial query, the system suggests relevant follow-up questions:

- "What caused these patterns?"
- "How does this compare to industry benchmarks?"
- "What are the implications for business strategy?"
- "Show me the data behind this insight"

## Technical Implementation

### Components

1. **NaturalLanguageQuery.tsx**: Main component handling user interaction
2. **DataAnalysisService.ts**: Core data processing and analysis logic
3. **aiService.ts**: Enhanced with smart chart selection and narrative generation
4. **Speech Recognition**: Web Speech API integration with fallbacks

### Data Flow

1. **Input Processing**: User types or speaks a query
2. **Data Preparation**: Automatic cleaning and validation
3. **Query Analysis**: Intelligent parsing and column mapping
4. **Chart Generation**: Optimal visualization selection and data processing
5. **Narrative Generation**: AI-powered explanation of results
6. **Follow-up Suggestions**: Context-aware next steps

### Chart Selection Logic

The system uses intelligent rules to select the best chart type:

- **Bar Charts**: For comparisons, rankings, and categorical data
- **Line Charts**: For trends, time series, and continuous data
- **Pie Charts**: For compositions, percentages, and proportions
- **Scatter Plots**: For correlations, relationships, and outlier detection

### Data Cleaning Features

- **Missing Value Handling**: Automatic replacement with appropriate defaults
- **Data Type Conversion**: Smart conversion of strings to numbers
- **Outlier Detection**: Statistical identification using IQR method
- **Trend Analysis**: Pattern recognition in time series data

## Browser Compatibility

### Speech Recognition Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)

### Fallback Behavior

When speech recognition is not available:
- Graceful degradation to text-only input
- Clear user feedback about feature availability
- Maintains all other functionality

## Configuration

### Environment Variables

```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Customization

The system can be customized by modifying:

- `sampleQueries` array in NaturalLanguageQuery.tsx
- Chart selection logic in aiService.ts
- Data cleaning rules in DataAnalysisService.ts
- Follow-up suggestion algorithms

## Error Handling

### Speech Recognition Errors

- Network connectivity issues
- Microphone permissions
- Browser compatibility
- Language support

### Data Processing Errors

- Invalid data formats
- Missing required columns
- Insufficient data for analysis
- Memory constraints with large datasets

### Graceful Degradation

- Falls back to text input when speech fails
- Provides clear error messages
- Maintains core functionality
- Suggests alternative approaches

## Performance Considerations

### Large Datasets

- Efficient data processing algorithms
- Lazy loading of chart components
- Memory management for large files
- Progressive data analysis

### Real-time Processing

- Optimized query parsing
- Cached analysis results
- Background processing for complex queries
- Responsive UI updates

## Future Enhancements

### Planned Features

1. **Multi-language Support**: Support for additional languages
2. **Advanced Visualizations**: More chart types and customizations
3. **Machine Learning**: Improved query understanding and suggestions
4. **Collaboration Tools**: Real-time sharing and commenting
5. **Integration APIs**: Connect with external data sources

### Technical Improvements

1. **Offline Support**: Work without internet connection
2. **Progressive Web App**: Installable application
3. **Advanced Analytics**: Statistical modeling and forecasting
4. **Custom Themes**: User-defined styling and branding

## Troubleshooting

### Common Issues

1. **Speech Recognition Not Working**
   - Check microphone permissions
   - Ensure HTTPS connection
   - Try refreshing the page

2. **Charts Not Generating**
   - Verify data format
   - Check column names
   - Ensure sufficient data

3. **Slow Performance**
   - Reduce dataset size
   - Close other browser tabs
   - Check internet connection

### Getting Help

- Check browser console for error messages
- Verify data format and structure
- Test with sample data first
- Contact support with specific error details

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add comprehensive tests

### Testing

- Unit tests for data processing
- Integration tests for chart generation
- E2E tests for user workflows
- Performance testing for large datasets
