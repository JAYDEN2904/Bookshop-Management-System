import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SellBooks from './components/SellBooks';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Students from './components/Students';
import Settings from './components/Settings';
import Suppliers from './components/Suppliers';
import AuthLayout from './components/auth/AuthLayout';
import { SettingsProvider } from './contexts/SettingsContext';
import { SalesProvider } from './contexts/SalesContext';
import { auth } from './services/api';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AuthLayout onLogin={handleLogin} />;
  }

  const renderActiveSection = () => {
    console.log('Active section:', activeSection);
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'sell':
        return <SellBooks />;
      case 'inventory':
        return <Inventory />;
      case 'reports':
        return <Reports />;
      case 'students':
        return <Students />;
      case 'suppliers':
        console.log('Rendering Suppliers component');
        return <Suppliers />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SettingsProvider>
      <SalesProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            isDarkMode={isDarkMode}
            onDarkModeChange={setIsDarkMode}
            onLogout={handleLogout}
          />
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex">
              {renderActiveSection()}
            </div>
          </main>
        </div>
      </SalesProvider>
    </SettingsProvider>
  );
}

export default App;