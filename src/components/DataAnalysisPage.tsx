import React, { useState, useRef } from 'react';
import DataUpload from './DataUpload';
import DataAnalysis from './DataAnalysis';
import DataTable from './DataTable';
import DataFilters from './DataFilters';
import AutoDashboard from './AutoDashboard';
import InsightsPanel from './InsightsPanel';
import ChartDownload from './ChartDownload';

const DataAnalysisPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDataParsed = (parsed: any[], cols: string[]) => {
    setData(parsed);
    setColumns(cols);
    setFilteredData(parsed);
  };

  const handleFilter = (filtered: any[]) => {
    setFilteredData(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Data Analysis & Visualization Tool</h1>
        <DataUpload onDataParsed={handleDataParsed} />
        {data.length > 0 && (
          <>
            <DataAnalysis data={data} columns={columns} />
            <DataTable data={data} columns={columns} title="Raw Data with Serial Numbers" />
            <DataFilters data={data} columns={columns} onFilter={handleFilter} />
            <div ref={chartRef}>
              <AutoDashboard data={filteredData} columns={columns} />
            </div>
            <ChartDownload chartRef={chartRef} />
            <InsightsPanel data={filteredData} columns={columns} />
          </>
        )}
      </div>
    </div>
  );
};

export default DataAnalysisPage; 