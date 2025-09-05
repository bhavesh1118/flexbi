import React, { useState, useMemo, lazy, Suspense, useCallback, memo, useEffect } from 'react';
import { LayoutDashboard, Settings, BarChart3, PieChart, X, ChevronLeft, ChevronRight, FileText, MapPin, Activity, Brain, Building2, CreditCard, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from './ui/Header';
import { usePerformance } from '../context/PerformanceContext';
import { PerformanceMonitor } from './PerformanceMonitor';

// Lazy load components for faster initial load
const ChatPanel = lazy(() => import('./chat/ChatPanel'));
const Dashboard = lazy(() => import('./dashboard/Dashboard'));
const ReportGenerator = lazy(() => import('./ReportGenerator'));
const Analytics = lazy(() => import('./Analytics'));
const HyperlocalAnalytics = lazy(() => import('./HyperlocalAnalytics'));
const RealTimeAnalytics = lazy(() => import('./RealTimeAnalytics'));
const PredictiveAnalytics = lazy(() => import('./PredictiveAnalytics'));
const ConsumerPersonaSegmentation = lazy(() => import('./ConsumerPersonaSegmentation'));
const BrandPortalIntegration = lazy(() => import('./BrandPortalIntegration'));
const SubscriptionManagement = lazy(() => import('./SubscriptionManagement'));

// Loading spinner component
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
));

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  onClick?: () => void;
  onHover?: () => void;
}

// Memoized NavItem for better performance
const NavItem = memo<NavItemProps>(({ icon, text, active, onClick, onHover }) => {
  const { optimizeHover } = usePerformance();

  const handleClick = useCallback(() => {
    // Use requestAnimationFrame for smooth navigation
    requestAnimationFrame(() => {
      onClick?.();
    });
  }, [onClick]);

  const handleMouseEnter = useCallback(() => {
    if (optimizeHover) {
      onHover?.();
    }
  }, [onHover, optimizeHover]);

  return (
    <li>
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        className={`w-full flex items-center p-3 rounded-lg transition-all duration-100 ease-out space-x-3 nav-item-optimized transform-gpu ${
          active 
            ? 'bg-indigo-800 active scale-[0.98] shadow-inner' 
            : 'hover:bg-indigo-700 hover:scale-105 hover:shadow-lg'
        }`}
        style={{ 
          backfaceVisibility: 'hidden',
          willChange: optimizeHover ? 'transform' : 'auto'
        }}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span className="font-medium">{text}</span>
      </button>
    </li>
  );
});

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'dashboard' | 'reports' | 'analytics' | 'hyperlocal' | 'realtime' | 'predictive' | 'personas' | 'brands' | 'subscriptions'>('dashboard');
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);
  
  // Use performance context
  const { prefetchComponent, measurePerformance } = usePerformance();

  // Memoized navigation items for better performance
  const navigationItems = useMemo(() => [
    { key: 'dashboard', icon: <LayoutDashboard size={20} />, text: 'Dashboard' },
    { key: 'reports', icon: <FileText size={20} />, text: 'Reports' },
    { key: 'analytics', icon: <PieChart size={20} />, text: 'Analytics' },
    { key: 'hyperlocal', icon: <MapPin size={20} />, text: 'Hyperlocal Insights' },
    { key: 'realtime', icon: <Activity size={20} />, text: 'Real-Time Analytics' },
    { key: 'predictive', icon: <Brain size={20} />, text: 'Predictive Analytics' },
    { key: 'personas', icon: <UserCheck size={20} />, text: 'Consumer Personas' },
    { key: 'brands', icon: <Building2 size={20} />, text: 'Brand Portal' },
    { key: 'subscriptions', icon: <CreditCard size={20} />, text: 'Subscriptions' },
  ], []);

  // Optimized view change handler with performance measurement
  const handleViewChange = useCallback((view: typeof activeView) => {
    if (view !== activeView) {
      measurePerformance(`View change to ${view}`, () => {
        setActiveView(view);
        // Prefetch the next likely component
        prefetchComponent(view);
        
        // Close mobile sidebar when switching views
        if (sidebarOpen) {
          setSidebarOpen(false);
        }
      });
    }
  }, [activeView, sidebarOpen, measurePerformance, prefetchComponent]);

  // Optimized sidebar toggle
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const toggleAssistant = useCallback(() => {
    setAssistantCollapsed(prev => !prev);
  }, []);

  // Prefetch components on hover for instant loading
  const handleNavItemHover = useCallback((componentKey: string) => {
    prefetchComponent(componentKey);
  }, [prefetchComponent]);

  // Prefetch critical components on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      prefetchComponent('dashboard');
      prefetchComponent('reports');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [prefetchComponent]);

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden w-full" style={{ height: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Optimized Sidebar */}
      <div 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative lg:translate-x-0 z-30 w-64 text-white sidebar-transition flex flex-col`}
        style={{ 
          height: '100vh', 
          backgroundColor: '#312e81',
          willChange: 'transform'
        }}
      >
        {/* Top Section - Header and Navigation */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-xl font-bold">FlexBI</h1>
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-full hover:bg-indigo-800 transition-colors duration-150 nav-item-optimized"
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-4 optimized-scroll">
              {navigationItems.map((item) => (
                <NavItem 
                  key={item.key}
                  icon={item.icon} 
                  text={item.text} 
                  active={activeView === item.key} 
                  onClick={() => handleViewChange(item.key as typeof activeView)}
                  onHover={() => handleNavItemHover(item.key)}
                />
              ))}
              
              {/* Data Tool Link */}
              <li>
                <Link 
                  to="/data-tool" 
                  className="w-full flex items-center p-3 rounded-lg hover:bg-indigo-800/50 transition-all duration-150 ease-out space-x-3 nav-item-optimized hover:transform hover:scale-[1.02] hover:shadow-md"
                >
                  <span className="flex-shrink-0"><BarChart3 size={20} /></span>
                  <span className="font-medium">Data Tool</span>
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
        <div className="p-4 border-t border-indigo-700" style={{ backgroundColor: '#312e81' }}>
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
        <Header onMenuClick={toggleSidebar} />
        
        {/* Optimized Mobile View Selector */}
        <div className="lg:hidden flex border-b border-gray-200 bg-white overflow-x-auto">
          {navigationItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleViewChange(item.key as typeof activeView)}
              className={`flex-none px-3 py-3 text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                activeView === item.key
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              {item.text}
            </button>
          ))}
          <button
            onClick={() => handleViewChange('chat')}
            className={`flex-none px-3 py-3 text-sm font-medium whitespace-nowrap transition-all duration-150 ${
              activeView === 'chat' 
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
                : 'text-gray-500 hover:text-indigo-600'
            }`}
          >
            AI Assistant
          </button>
        </div>
        
        <div className="flex-1 flex overflow-y-auto min-h-0 relative">
          {/* AI Assistant (left) */}
          <div
            className={`
              ${activeView === 'chat' ? 'block' : 'hidden'}
              lg:block transition-all duration-200 ease-out border-r border-gray-200 bg-white
              ${assistantCollapsed ? 'w-0 overflow-hidden' : 'w-full lg:w-[360px] flex-none'}
            `}
            style={{ willChange: 'width' }}
          >
            {!assistantCollapsed && (
              <Suspense fallback={<LoadingSpinner />}>
                <ChatPanel className="h-full" />
              </Suspense>
            )}
          </div>

          {/* Toggle button between panels (desktop) */}
          <button
            type="button"
            onClick={toggleAssistant}
            className="hidden lg:flex items-center justify-center absolute z-20 top-1/2 -translate-y-1/2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 shadow rounded-r-md w-6 h-12 transition-all duration-200 ease-out hover:shadow-lg"
            style={{ 
              left: assistantCollapsed ? 0 : 360,
              willChange: 'left'
            }}
            aria-label={assistantCollapsed ? 'Expand assistant' : 'Collapse assistant'}
            title={assistantCollapsed ? 'Expand assistant' : 'Collapse assistant'}
          >
            {assistantCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Optimized Content Views with Lazy Loading */}
          
          {/* Main Dashboard Content */}
          <div
            className={`
              ${activeView === 'dashboard' ? 'block' : 'hidden'}
              lg:${activeView === 'dashboard' ? 'block' : 'hidden'} flex-1 min-w-0 transition-opacity duration-200 ease-out
            `}
            style={{ willChange: 'opacity' }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard className="h-full" />
            </Suspense>
          </div>

          {/* Reports View */}
          <div
            className={`
              ${activeView === 'reports' ? 'block' : 'hidden'}
              lg:${activeView === 'reports' ? 'block' : 'hidden'} flex-1 min-w-0 transition-opacity duration-200 ease-out overflow-y-auto
            `}
          >
            {activeView === 'reports' && (
              <Suspense fallback={<LoadingSpinner />}>
                <ReportGenerator className="h-full" />
              </Suspense>
            )}
          </div>

          {/* Analytics View */}
          <div
            className={`
              ${activeView === 'analytics' ? 'block' : 'hidden'}
              lg:${activeView === 'analytics' ? 'block' : 'hidden'} flex-1 min-w-0 transition-opacity duration-200 ease-out overflow-y-auto
            `}
          >
            {activeView === 'analytics' && (
              <Suspense fallback={<LoadingSpinner />}>
                <Analytics className="h-full" />
              </Suspense>
            )}
          </div>

          {/* Hyperlocal Insights View */}
          <div
            className={`
              ${activeView === 'hyperlocal' ? 'block' : 'hidden'}
              lg:${activeView === 'hyperlocal' ? 'block' : 'hidden'} flex-1 min-w-0 transition-opacity duration-200 ease-out overflow-y-auto
            `}
          >
            {activeView === 'hyperlocal' && (
              <Suspense fallback={<LoadingSpinner />}>
                <HyperlocalAnalytics />
              </Suspense>
            )}
          </div>

          {/* Real-Time Analytics View */}
          <div
            className={`
              ${activeView === 'realtime' ? 'block' : 'hidden'}
              lg:${activeView === 'realtime' ? 'block' : 'hidden'} flex-1 min-w-0 transition-opacity duration-200 ease-out overflow-y-auto
            `}
          >
            {activeView === 'realtime' && (
              <Suspense fallback={<LoadingSpinner />}>
                <RealTimeAnalytics />
              </Suspense>
            )}
          </div>

          {/* Predictive Analytics View */}
          <div
            className={`
              ${activeView === 'predictive' ? 'block' : 'hidden'}
              lg:${activeView === 'predictive' ? 'block' : 'hidden'} flex-1 min-w-0 transition-opacity duration-200 ease-out overflow-y-auto
            `}
          >
            {activeView === 'predictive' && (
              <Suspense fallback={<LoadingSpinner />}>
                <PredictiveAnalytics />
              </Suspense>
            )}
          </div>

          {/* Consumer Persona Segmentation View */}
          <div
            className={`
              ${activeView === 'personas' ? 'block' : 'hidden'}
              lg:${activeView === 'personas' ? 'block' : 'hidden'} flex-1 min-w-0 transition-opacity duration-200 ease-out overflow-y-auto
            `}
          >
            {activeView === 'personas' && (
              <Suspense fallback={<LoadingSpinner />}>
                <ConsumerPersonaSegmentation />
              </Suspense>
            )}
          </div>

          {/* Brand Portal Integration View */}
          <div
            className={`
              ${activeView === 'brands' ? 'block' : 'hidden'}
              lg:${activeView === 'brands' ? 'block' : 'hidden'} flex-1 min-w-0 transition-opacity duration-200 ease-out overflow-y-auto
            `}
          >
            {activeView === 'brands' && (
              <Suspense fallback={<LoadingSpinner />}>
                <BrandPortalIntegration />
              </Suspense>
            )}
          </div>

          {/* Subscription Management View */}
          <div
            className={`
              ${activeView === 'subscriptions' ? 'block' : 'hidden'}
              lg:${activeView === 'subscriptions' ? 'block' : 'hidden'} flex-1 min-w-0 transition-opacity duration-200 ease-out overflow-y-auto
            `}
          >
            {activeView === 'subscriptions' && (
              <Suspense fallback={<LoadingSpinner />}>
                <SubscriptionManagement />
              </Suspense>
            )}
          </div>
        </div>
      </div>
      
      {/* Performance Monitor */}
      <PerformanceMonitor />
    </div>
  );
};

export default Layout;
