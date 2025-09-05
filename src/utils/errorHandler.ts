// Error handler to suppress browser extension errors
export function setupErrorHandling() {
  // Store original error handlers
  const originalOnError = window.onerror;
  const originalOnUnhandledRejection = window.onunhandledrejection;

  // Filter out browser extension errors
  window.onerror = function(message, source, lineno, colno, error) {
    // Ignore MetaMask and other extension errors
    if (typeof message === 'string') {
      if (message.includes('MetaMask') || 
          message.includes('inpage.js') || 
          message.includes('content-all.js') ||
          message.includes('translate-page') ||
          message.includes('chrome-extension') ||
          message.includes('moz-extension') ||
          message.includes('Could not establish connection') ||
          message.includes('Receiving end does not exist') ||
          message.includes('runtime.lastError') ||
          message.includes('message channel closed')) {
        console.log('🔇 Suppressed browser extension error:', message);
        return true; // Prevent error from being logged
      }
    }
    
    // Call original handler for real errors
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Handle unhandled promise rejections
  window.onunhandledrejection = function(event) {
    const reason = event.reason;
    
    // Ignore MetaMask and extension connection errors
    if (reason && typeof reason === 'object' && 'message' in reason) {
      const message = String(reason.message);
      if (message.includes('MetaMask') || 
          message.includes('Failed to connect') ||
          message.includes('extension not found') ||
          message.includes('Could not establish connection') ||
          message.includes('Receiving end does not exist') ||
          message.includes('runtime.lastError') ||
          message.includes('message channel closed')) {
        console.log('🔇 Suppressed extension connection error:', message);
        event.preventDefault(); // Prevent error from being logged
        return;
      }
    }
    
    // Call original handler for real errors
    if (originalOnUnhandledRejection) {
      originalOnUnhandledRejection.call(window, event);
    }
  };

  // Also handle console errors from extensions
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('MetaMask') || 
        message.includes('inpage.js') || 
        message.includes('content-all.js') ||
        message.includes('translate-page') ||
        message.includes('chrome-extension') ||
        message.includes('moz-extension') ||
        message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('runtime.lastError') ||
        message.includes('message channel closed')) {
      console.log('🔇 Suppressed extension console error:', message);
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

// Function to check if we're in a browser environment
export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
