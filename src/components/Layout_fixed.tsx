import React, { useState } from 'react';
import { LayoutDashboard, Settings, BarChart3, PieChart, X, ChevronLeft, ChevronRight, FileText, MapPin, Activity, Brain, Building2, CreditCard, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChatPanel from './chat/ChatPanel';
import Dashboard from './dashboard/Dashboard';
import ReportGenerator from './ReportGenerator';
import Analytics from './Analytics';
import HyperlocalAnalytics from './HyperlocalAnalytics';
import RealTimeAnalytics from './RealTimeAnalytics';
import PredictiveAnalytics from './PredictiveAnalytics';
import ConsumerPersonaSegmentation from './ConsumerPersonaSegmentation';
import BrandPortalIntegration from './BrandPortalIntegration';
import SubscriptionManagement from './SubscriptionManagement';
import Header from './ui/Header';

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

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'dashboard' | 'reports' | 'analytics' | 'hyperlocal' | 'realtime' | 'predictive' | 'personas' | 'brands' | 'subscriptions'>('dashboard');
  // Desktop-only: collapse/expand the AI assistant panel to mimic VibeChart layout
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden w-full" style={{ height: '100vh', backgroundColor: '#f9fafb' }}>
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
        } fixed lg:relative lg:translate-x-0 z-30 w-64 text-white transition-transform duration-300 flex flex-col`}
        style={{ 
          height: '100vh', 
          backgroundColor: '#312e81'
        }}
      >
        {/* Top Section - Header and Navigation */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
                active={activeView === 'dashboard'} 
                onClick={() => setActiveView('dashboard')}
              />
              <NavItem 
                icon={<FileText size={20} />} 
                text="Reports" 
                active={activeView === 'reports'} 
                onClick={() => setActiveView('reports')}
              />
              <NavItem 
                icon={<PieChart size={20} />} 
                text="Analytics" 
                active={activeView === 'analytics'} 
                onClick={() => setActiveView('analytics')}
              />
              <NavItem 
                icon={<MapPin size={20} />} 
                text="Hyperlocal Insights" 
                active={activeView === 'hyperlocal'} 
                onClick={() => setActiveView('hyperlocal')}
              />
              <NavItem 
                icon={<Activity size={20} />} 
                text="Real-Time Analytics" 
                active={activeView === 'realtime'} 
                onClick={() => setActiveView('realtime')}
              />
              <NavItem 
                icon={<Brain size={20} />} 
                text="Predictive Analytics" 
                active={activeView === 'predictive'} 
                onClick={() => setActiveView('predictive')}
              />
              <NavItem 
                icon={<UserCheck size={20} />} 
                text="Consumer Personas" 
                active={activeView === 'personas'} 
                onClick={() => setActiveView('personas')}
              />
              <NavItem 
                icon={<Building2 size={20} />} 
                text="Brand Portal" 
                active={activeView === 'brands'} 
                onClick={() => setActiveView('brands')}
              />
              <NavItem 
                icon={<CreditCard size={20} />} 
                text="Subscriptions" 
                active={activeView === 'subscriptions'} 
                onClick={() => setActiveView('subscriptions')}
              />
              {/* Data Tool NavItem */}
              <li>
                <Link to="/data-tool" className="w-full flex items-center p-3 rounded-lg hover:bg-indigo-800/50 transition-colors duration-200 space-x-3">
                  <span><BarChart3 size={20} /></span>
                  <span>Data Tool</span>
                </Link>
              </li>
              <NavItem 
                icon={<Settings size={20} />} 
                text="Settings" 
                active={false} 
              />
            </ul>
          </nav>
        </div>
        
        {/* Profile Section at Bottom */}
        <div className="p-4" style={{ backgroundColor: '#312e81' }}>
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
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden" style={{ height: '100vh', backgroundColor: '#f9fafb' }}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Mobile View Selector */}
        <div className="lg:hidden flex border-b border-gray-200 bg-white overflow-x-auto">
          <button
            onClick={() => setActiveView('chat')}
            className={`flex-none px-3 py-3 text-sm font-medium whitespace-nowrap ${
              activeView === 'chat' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            AI Assistant
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex-none px-3 py-3 text-sm font-medium whitespace-nowrap ${
              activeView === 'dashboard' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('reports')}
            className={`flex-none px-3 py-3 text-sm font-medium whitespace-nowrap ${
              activeView === 'reports' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`flex-none px-3 py-3 text-sm font-medium whitespace-nowrap ${
              activeView === 'analytics' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveView('hyperlocal')}
            className={`flex-none px-3 py-3 text-sm font-medium whitespace-nowrap ${
              activeView === 'hyperlocal' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            Hyperlocal
          </button>
          <button
            onClick={() => setActiveView('realtime')}
            className={`flex-none px-3 py-3 text-sm font-medium whitespace-nowrap ${
              activeView === 'realtime' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            Real-Time
          </button>
          <button
            onClick={() => setActiveView('predictive')}
            className={`flex-none px-3 py-3 text-sm font-medium whitespace-nowrap ${
              activeView === 'predictive' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            Predictive
          </button>
          <button
            onClick={() => setActiveView('personas')}
            className={`flex-none px-3 py-3 text-sm font-medium whitespace-nowrap ${
              activeView === 'personas' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            Personas
          </button>
          <button
            onClick={() => setActiveView('brands')}
            className={`flex-none px-3 py-3 text-sm font-medium whitespace-nowrap ${
              activeView === 'brands' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            Brands
          </button>
          <button
            onClick={() => setActiveView('subscriptions')}
            className={`flex-none px-3 py-3 text-sm font-medium whitespace-nowrap ${
              activeView === 'subscriptions' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            Subscriptions
          </button>
        </div>
        
        <div className="flex-1 flex overflow-y-auto min-h-0 relative">
          {/* AI Assistant (left) */}
          <div
            className={`
              ${activeView === 'chat' ? 'block' : 'hidden'}
              lg:block transition-all duration-300 border-r border-gray-200 bg-white
              ${assistantCollapsed ? 'w-0 overflow-hidden' : 'w-full lg:w-[360px] flex-none'}
            `}
          >
            {!assistantCollapsed && <ChatPanel className="h-full" />}
          </div>

          {/* Toggle button between panels (desktop) */}
          <button
            type="button"
            onClick={() => setAssistantCollapsed(v => !v)}
            className="hidden lg:flex items-center justify-center absolute z-20 top-1/2 -translate-y-1/2 left-[360px] border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 shadow rounded-r-md w-6 h-12 transition-all"
            style={{ left: assistantCollapsed ? 0 : 360 }}
            aria-label={assistantCollapsed ? 'Expand assistant' : 'Collapse assistant'}
            title={assistantCollapsed ? 'Expand assistant' : 'Collapse assistant'}
          >
            {assistantCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Main Content Area */}
          <div
            className={`
              ${activeView === 'dashboard' ? 'block' : 'hidden'}
              lg:${activeView === 'dashboard' ? 'block' : 'hidden'} flex-1 min-w-0 transition-all duration-300
            `}
          >
            <Dashboard className="h-full" />
          </div>

          {/* Reports View */}
          <div
            className={`
              ${activeView === 'reports' ? 'block' : 'hidden'}
              lg:${activeView === 'reports' ? 'block' : 'hidden'} flex-1 min-w-0 transition-all duration-300 overflow-y-auto
            `}
          >
            <ReportGenerator className="h-full" />
          </div>

          {/* Analytics View */}
          <div
            className={`
              ${activeView === 'analytics' ? 'block' : 'hidden'}
              lg:${activeView === 'analytics' ? 'block' : 'hidden'} flex-1 min-w-0 transition-all duration-300 overflow-y-auto
            `}
          >
            <Analytics className="h-full" />
          </div>

          {/* Hyperlocal Insights View */}
          <div
            className={`
              ${activeView === 'hyperlocal' ? 'block' : 'hidden'}
              lg:${activeView === 'hyperlocal' ? 'block' : 'hidden'} flex-1 min-w-0 transition-all duration-300 overflow-y-auto
            `}
          >
            <HyperlocalAnalytics />
          </div>

          {/* Real-Time Analytics View */}
          <div
            className={`
              ${activeView === 'realtime' ? 'block' : 'hidden'}
              lg:${activeView === 'realtime' ? 'block' : 'hidden'} flex-1 min-w-0 transition-all duration-300 overflow-y-auto
            `}
          >
            <RealTimeAnalytics />
          </div>

          {/* Predictive Analytics View */}
          <div
            className={`
              ${activeView === 'predictive' ? 'block' : 'hidden'}
              lg:${activeView === 'predictive' ? 'block' : 'hidden'} flex-1 min-w-0 transition-all duration-300 overflow-y-auto
            `}
          >
            <PredictiveAnalytics />
          </div>

          {/* Consumer Persona Segmentation View */}
          <div
            className={`
              ${activeView === 'personas' ? 'block' : 'hidden'}
              lg:${activeView === 'personas' ? 'block' : 'hidden'} flex-1 min-w-0 transition-all duration-300 overflow-y-auto
            `}
          >
            <ConsumerPersonaSegmentation />
          </div>

          {/* Brand Portal Integration View */}
          <div
            className={`
              ${activeView === 'brands' ? 'block' : 'hidden'}
              lg:${activeView === 'brands' ? 'block' : 'hidden'} flex-1 min-w-0 transition-all duration-300 overflow-y-auto
            `}
          >
            <BrandPortalIntegration />
          </div>

          {/* Subscription Management View */}
          <div
            className={`
              ${activeView === 'subscriptions' ? 'block' : 'hidden'}
              lg:${activeView === 'subscriptions' ? 'block' : 'hidden'} flex-1 min-w-0 transition-all duration-300 overflow-y-auto
            `}
          >
            <SubscriptionManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
