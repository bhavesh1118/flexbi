import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';

interface PerformanceContextType {
  prefetchComponent: (componentName: string) => void;
  measurePerformance: (action: string, fn: () => void) => void;
  optimizeRender: () => void;
  optimizeHover: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const componentCacheRef = useRef<Set<string>>(new Set());

  // Prefetch components for faster loading
  const prefetchComponent = useCallback((componentName: string) => {
    if (componentCacheRef.current.has(componentName)) {
      return;
    }

    componentCacheRef.current.add(componentName);

    // Use requestIdleCallback for non-blocking prefetching
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        // Prefetch the component
        switch (componentName) {
          case 'dashboard':
            import('../components/dashboard/Dashboard');
            break;
          case 'reports':
            import('../components/ReportGenerator');
            break;
          case 'analytics':
            import('../components/Analytics');
            break;
          case 'hyperlocal':
            import('../components/HyperlocalAnalytics');
            break;
          case 'realtime':
            import('../components/RealTimeAnalytics');
            break;
          case 'predictive':
            import('../components/PredictiveAnalytics');
            break;
          case 'personas':
            import('../components/ConsumerPersonaSegmentation');
            break;
          case 'brands':
            import('../components/BrandPortalIntegration');
            break;
          case 'subscriptions':
            import('../components/SubscriptionManagement');
            break;
        }
      });
    }
  }, []);

  // Measure performance of critical operations
  const measurePerformance = useCallback((action: string, fn: () => void) => {
    const startTime = performance.now();
    fn();
    const endTime = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${action} took ${(endTime - startTime).toFixed(2)}ms`);
    }
  }, []);

  // Global render optimizations
  const optimizeRender = useCallback(() => {
    // Enable CSS containment for better performance
    document.documentElement.style.contain = 'layout style paint';
    
    // Optimize scrolling performance
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Reduce repaints
    document.body.style.willChange = 'auto';
  }, []);

  // Initialize performance optimizations
  useEffect(() => {
    optimizeRender();

    // Prefetch critical components after initial render
    const timer = setTimeout(() => {
      prefetchComponent('dashboard');
      prefetchComponent('reports');
      prefetchComponent('analytics');
    }, 1000);

    return () => clearTimeout(timer);
  }, [optimizeRender, prefetchComponent]);

  const value: PerformanceContextType = {
    prefetchComponent,
    measurePerformance,
    optimizeRender,
    optimizeHover: true, // Enable hover optimizations
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};
