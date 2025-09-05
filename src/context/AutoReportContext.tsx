import React, { createContext, useContext, useState } from 'react';
import { AdvancedReport } from '../services/advancedReportService';

interface AutoReportContextType {
  showAutoReport: boolean;
  setShowAutoReport: (show: boolean) => void;
  currentReport: AdvancedReport | null;
  setCurrentReport: (report: AdvancedReport | null) => void;
  autoGenerateEnabled: boolean;
  setAutoGenerateEnabled: (enabled: boolean) => void;
}

const AutoReportContext = createContext<AutoReportContextType | undefined>(undefined);

export const AutoReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showAutoReport, setShowAutoReport] = useState(false);
  const [currentReport, setCurrentReport] = useState<AdvancedReport | null>(null);
  const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(true); // Auto-generate by default

  return (
    <AutoReportContext.Provider value={{
      showAutoReport,
      setShowAutoReport,
      currentReport,
      setCurrentReport,
      autoGenerateEnabled,
      setAutoGenerateEnabled
    }}>
      {children}
    </AutoReportContext.Provider>
  );
};

export const useAutoReport = () => {
  const context = useContext(AutoReportContext);
  if (!context) {
    throw new Error('useAutoReport must be used within an AutoReportProvider');
  }
  return context;
};
