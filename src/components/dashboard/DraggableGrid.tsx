import React, { ReactNode } from 'react';

interface DraggableGridProps {
  children: ReactNode;
}

const DraggableGrid: React.FC<DraggableGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-6">
      {children}
    </div>
  );
};

export default DraggableGrid;