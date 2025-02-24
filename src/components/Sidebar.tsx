import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  LineChart,
  Users,
  Settings,
  Moon,
  Sun,
  DollarSign,
  LogOut,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-800'
    }`}
  >
    <span className="w-5 h-5">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isDarkMode: boolean;
  onDarkModeChange: (isDark: boolean) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange,
  isDarkMode,
  onDarkModeChange,
  onLogout
}) => {
  const { settings } = useSettings();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
    { icon: <ShoppingCart size={20} />, label: 'Sell Books', id: 'sell' },
    { icon: <Package size={20} />, label: 'Inventory', id: 'inventory' },
    { icon: <LineChart size={20} />, label: 'Reports', id: 'reports' },
    { icon: <Users size={20} />, label: 'Students', id: 'students' },
    { icon: <DollarSign size={20} />, label: 'Suppliers', id: 'suppliers' },
    { icon: <Settings size={20} />, label: 'Settings', id: 'settings' },
  ];

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col">
      <div className="flex items-center space-x-3 px-4 py-5">
        <Package size={28} className="text-blue-600" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{settings.store_name}</h1>
      </div>
      
      <div className="px-4 py-2 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Welcome,</p>
        <p className="font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
          />
        ))}
      </nav>

      <div className="space-y-2">
        <button
          onClick={() => onDarkModeChange(!isDarkMode)}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span className="w-5 h-5">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </span>
          <span className="font-medium">
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <span className="w-5 h-5">
            <LogOut size={20} />
          </span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;