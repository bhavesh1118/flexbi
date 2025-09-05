import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import DataAnalysisPage from './components/DataAnalysisPage';
import EnhancedDataProcessingPage from './components/EnhancedDataProcessingPage';
import { DashboardProvider } from './context/DashboardContext';
import { UploadedDataProvider } from './context/UploadedDataContext';
import { AutoReportProvider } from './context/AutoReportContext';
import { PerformanceProvider } from './context/PerformanceContext';
import { ErrorBoundary } from './utils/ErrorBoundary';
import { BackendConnection } from './utils/BackendConnection';
import { ReactErrorBoundary } from './components/ReactErrorBoundary';
import './index.css';

function App() {
  const [showHelp, setShowHelp] = useState(false);

  // Initialize error handling and backend connection
  useEffect(() => {
    // Initialize error boundary to suppress extension conflicts
    ErrorBoundary.init();
    
    // Test backend connection
    BackendConnection.testConnection().then(connected => {
      if (connected) {
        console.log('🚀 FlexBI initialized with backend connection');
      } else {
        console.log('🔄 FlexBI initialized in offline mode');
      }
    });
  }, []);

  return (
    <ReactErrorBoundary>
      <div className="App layout-optimized" style={{ height: '100vh', backgroundColor: 'inherit' }}>
        <PerformanceProvider>
          <DashboardProvider>
            <UploadedDataProvider>
              <AutoReportProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<Layout />} />
                    <Route path="/data-tool" element={<DataAnalysisPage />} />
                    <Route path="/enhanced-data" element={<EnhancedDataProcessingPage />} />
                  </Routes>
                </Router>
              </AutoReportProvider>
            </UploadedDataProvider>
          </DashboardProvider>
        </PerformanceProvider>
        
        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200">
            <div className="bg-white p-6 rounded-lg max-w-md transform transition-transform duration-200">
              <h3 className="text-lg font-semibold mb-4">Help</h3>
              <p className="text-gray-600 mb-4">
                This is your FlexBI Analytics Platform. Use the sidebar to navigate between different features.
              </p>
              <button
                onClick={() => setShowHelp(false)}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors duration-150"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </ReactErrorBoundary>
  );
}

export default App;
