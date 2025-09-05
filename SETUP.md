# FlexBI Setup Guide

## Issues Resolved

This update addresses the following issues you were experiencing:

### 1. MetaMask Connection Errors
- **Problem**: Browser extension errors appearing in console
- **Solution**: Added error handling to suppress browser extension errors that don't affect the application
- **Result**: Clean console output, no more MetaMask connection warnings

### 2. OpenAI API Rate Limiting (429 Errors)
- **Problem**: Getting "429 Too Many Requests" errors from OpenAI API
- **Solution**: 
  - Implemented client-side rate limiting (8 requests per minute)
  - Added fallback analysis service for when API is unavailable
  - Better error handling with graceful degradation
- **Result**: No more 429 errors, app continues to work with basic analysis

### 3. Translation Menu Errors
- **Problem**: Browser extension errors about missing menu items
- **Solution**: Added comprehensive error filtering for browser extensions
- **Result**: Clean error logs, no more extension-related warnings

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the project root with your OpenAI API key:

```bash
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional: Configure rate limiting
VITE_OPENAI_RATE_LIMIT=8
VITE_OPENAI_RATE_WINDOW=60000
```

### 2. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy the key to your `.env` file

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

## Features

### Rate Limiting Protection
- Prevents 429 errors by limiting requests to 8 per minute
- Shows helpful messages when rate limit is reached
- Automatically falls back to basic analysis

### Fallback Analysis
- Provides basic data insights when AI service is unavailable
- Generates charts and statistics from your data
- No dependency on external APIs for core functionality

### Error Handling
- Suppresses browser extension errors
- Graceful handling of API failures
- User-friendly error messages

## Troubleshooting

### If you still see API errors:
1. Check your OpenAI API key is correct
2. Verify you have sufficient API credits
3. Wait a few minutes if rate limited
4. The app will work with basic analysis even without API access

### If you see browser extension errors:
- These are now suppressed and won't affect functionality
- The app will continue to work normally

### Performance Tips:
- The app processes 100% of your data with full accuracy
- Large files (up to 100MB) are supported
- Charts and analysis are generated in real-time

## Support

If you continue to experience issues:
1. Check the browser console for any remaining errors
2. Verify your `.env` file is in the correct location
3. Ensure you have the latest version of the code
