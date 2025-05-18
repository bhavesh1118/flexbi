import React from 'react';
import { Layout } from './components/Layout';
import { DashboardProvider } from './context/DashboardContext';
import './index.css';

function App() {
  return (
    <DashboardProvider>
      <Layout />
    </DashboardProvider>
  );
}

export default App;