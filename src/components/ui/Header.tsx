import React from 'react';
import { Bell, HelpCircle, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 mr-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Financial Dashboard</h1>
            <p className="text-sm text-gray-500">Q2 2025 Overview</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <HelpCircle size={20} />
          </button>
          <div className="relative">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
            </button>
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;