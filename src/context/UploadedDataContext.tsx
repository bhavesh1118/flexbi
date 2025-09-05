import React, { createContext, useContext, useState } from 'react';

interface UploadedDataContextType {
  data: any[];
  setData: (data: any[]) => void;
  columns: string[];
  setColumns: (columns: string[]) => void;
}

const UploadedDataContext = createContext<UploadedDataContextType | undefined>(undefined);

export const UploadedDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  return (
    <UploadedDataContext.Provider value={{ data, setData, columns, setColumns }}>
      {children}
    </UploadedDataContext.Provider>
  );
};

export const useUploadedData = () => {
  const context = useContext(UploadedDataContext);
  if (!context) {
    throw new Error('useUploadedData must be used within an UploadedDataProvider');
  }
  return context;
}; 