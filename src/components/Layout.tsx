import React, { useState } from 'react';
import { LayoutDashboard, Settings, BarChart3, PieChart, Menu, X } from 'lucide-react';
import ChatPanel from './chat/ChatPanel';
import Dashboard from './dashboard/Dashboard';
import Header from './ui/Header';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'dashboard'>('dashboard');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative lg:translate-x-0 z-30 w-64 bg-indigo-900 text-white transition-transform duration-300 h-full`}
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">FlexBI</h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-full hover:bg-indigo-800"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-4">
            <NavItem 
              icon={<LayoutDashboard size={20} />} 
              text="Dashboard" 
              active={true} 
              onClick={() => setActiveView('dashboard')}
            />
            <NavItem 
              icon={<BarChart3 size={20} />} 
              text="Reports" 
              active={false} 
            />
            <NavItem 
              icon={<PieChart size={20} />} 
              text="Analytics" 
              active={false} 
            />
            <NavItem 
              icon={<Settings size={20} />} 
              text="Settings" 
              active={false} 
            />
          </ul>
        </nav>
        
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center">
              <span className="text-white font-medium">JD</span>
            </div>
            <div>
              <h3 className="text-sm font-medium">John Doe</h3>
              <p className="text-xs text-indigo-200">Financial Analyst</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Mobile View Selector */}
        <div className="lg:hidden flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveView('chat')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeView === 'chat' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            AI Assistant
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeView === 'dashboard' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            Dashboard
          </button>
        </div>
        
        <div className="flex-1 flex overflow-y-hidden">
          <ChatPanel 
            className={`
              ${activeView === 'chat' ? 'block' : 'hidden'} 
              lg:block w-full lg:w-1/3 
              transition-all duration-300
            `} 
          />
          <Dashboard 
            className={`
              ${activeView === 'dashboard' ? 'block' : 'hidden'} 
              lg:block w-full lg:w-2/3 
              transition-all duration-300
            `} 
          />
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, active, onClick }) => {
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full flex items-center p-3 rounded-lg ${
          active ? 'bg-indigo-800' : 'hover:bg-indigo-800/50'
        } transition-colors duration-200 space-x-3`}
      >
        <span>{icon}</span>
        <span>{text}</span>
      </button>
    </li>
  );
};