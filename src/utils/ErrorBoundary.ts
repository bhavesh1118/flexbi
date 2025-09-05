// Error boundary and extension conflict resolver
export class ErrorBoundary {
  static suppressExtensionErrors() {
    // Suppress browser extension errors that don't affect the app
    const originalError = window.console.error;
    const originalWarn = window.console.warn;
    
    window.console.error = (...args) => {
      const message = args[0]?.toString() || '';
      
      // Suppress known extension errors
      if (
        message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('runtime.lastError') ||
        message.includes('message channel closed') ||
        message.includes('content-all.js') ||
        message.includes('extension')
      ) {
        return; // Suppress these errors
      }
      
      originalError.apply(console, args);
    };
    
    window.console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      
      // Suppress known extension warnings
      if (
        message.includes('extension') ||
        message.includes('runtime.lastError') ||
        message.includes('content-all.js')
      ) {
        return; // Suppress these warnings
      }
      
      originalWarn.apply(console, args);
    };
  }
  
  static handleUnhandledRejection() {
    window.addEventListener('unhandledrejection', (event) => {
      const message = event.reason?.message || event.reason?.toString() || '';
      
      // Suppress extension-related promise rejections
      if (
        message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('runtime.lastError') ||
        message.includes('message channel closed') ||
        message.includes('extension')
      ) {
        event.preventDefault(); // Prevent the error from being logged
        return;
      }
    });
  }
  
  static handleErrors() {
    window.addEventListener('error', (event) => {
      const message = event.message || '';
      const filename = event.filename || '';
      
      // Suppress extension-related errors
      if (
        message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('runtime.lastError') ||
        filename.includes('content-all.js') ||
        filename.includes('extension')
      ) {
        event.preventDefault(); // Prevent the error from being logged
        return;
      }
    });
  }
  
  static init() {
    this.suppressExtensionErrors();
    this.handleUnhandledRejection();
    this.handleErrors();
    
    console.log('🛡️ Error boundary initialized - Extension conflicts suppressed');
  }
}
