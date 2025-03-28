import React, { createContext, useContext, useState, useEffect } from 'react';
import { settings as settingsApi } from '../services/api';

interface SettingsState {
  store_name: string;
  currency: string;
  low_stock_threshold: number;
}

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (newSettings: SettingsState) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>({
    store_name: "Faith Community Baptist School Bookshop",
    currency: "GHS",
    low_stock_threshold: 10
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsApi.get() as SettingsState;
      if (response) {
        setSettings(response);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = async (newSettings: SettingsState) => {
    try {
      const response = await settingsApi.update(newSettings) as SettingsState;
      if (response) {
        setSettings(response);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 