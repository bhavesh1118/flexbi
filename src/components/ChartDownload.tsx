import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ChartDownloadProps {
  chartRef: React.RefObject<HTMLDivElement>;
}

const ChartDownload: React.FC<ChartDownloadProps> = ({ chartRef }) => {
  const handleDownloadImage = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement('a');
    link.download = 'chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape' });
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 10, 10, width - 20, height - 20);
    pdf.save('chart.pdf');
  };

  return (
    <div className="flex gap-2 my-2">
      <button onClick={handleDownloadImage} className="px-3 py-1 bg-blue-500 text-white rounded">Download PNG</button>
      <button onClick={handleDownloadPDF} className="px-3 py-1 bg-green-500 text-white rounded">Download PDF</button>
    </div>
  );
};

export default ChartDownload; 