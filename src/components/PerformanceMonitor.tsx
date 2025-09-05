import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock } from 'lucide-react';

interface PerformanceMetrics {
  navigationTime: number;
  renderTime: number;
  memoryUsage: number;
  fps: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    navigationTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    fps: 60
  });

  const [showMonitor, setShowMonitor] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as any).memory?.usedJSHeapSize 
            ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
            : 0
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    if (showMonitor) {
      measureFPS();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [showMonitor]);

  // Measure navigation performance
  useEffect(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      setMetrics(prev => ({
        ...prev,
        navigationTime: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
        renderTime: Math.round(navigation.loadEventEnd - navigation.domContentLoadedEventStart)
      }));
    }
  }, []);

  if (!showMonitor) {
    return (
      <button
        onClick={() => setShowMonitor(true)}
        className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-50"
        title="Show Performance Monitor"
      >
        <Activity size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[250px] z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Zap size={16} className="text-green-500" />
          Performance Monitor
        </h3>
        <button
          onClick={() => setShowMonitor(false)}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Navigation:</span>
          <span className={`font-medium ${metrics.navigationTime < 1000 ? 'text-green-600' : 'text-yellow-600'}`}>
            {metrics.navigationTime}ms
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Render:</span>
          <span className={`font-medium ${metrics.renderTime < 500 ? 'text-green-600' : 'text-yellow-600'}`}>
            {metrics.renderTime}ms
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 flex items-center gap-1">
            <Clock size={12} />
            FPS:
          </span>
          <span className={`font-medium ${metrics.fps >= 55 ? 'text-green-600' : metrics.fps >= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
            {metrics.fps}
          </span>
        </div>
        
        {metrics.memoryUsage > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Memory:</span>
            <span className={`font-medium ${metrics.memoryUsage < 50 ? 'text-green-600' : 'text-yellow-600'}`}>
              {metrics.memoryUsage}MB
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500 text-center">
          🚀 Optimized with FastAPI + React
        </div>
      </div>
    </div>
  );
};
