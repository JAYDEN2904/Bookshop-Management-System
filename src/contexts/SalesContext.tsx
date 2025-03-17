import React, { createContext, useContext, useState, useEffect } from 'react';
import { sales } from '../services/api';

interface Sale {
  _id: string;
  student: {
    _id: string;
    name: string;
    class_level: string;
  };
  items: {
    book: {
      _id: string;
      title: string;
      price: number;
    };
    quantity: number;
    price_at_sale: number;
  }[];
  total_amount: number;
  createdAt: string;
}

interface SalesContextType {
  recentSales: Sale[];
  todaySales: number;
  totalSales: number;
  refreshSales: () => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};

// Helper function to check if a date is today
const isToday = (dateString: string) => {
  const today = new Date();
  const date = new Date(dateString);
  
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [todaySales, setTodaySales] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  const loadSales = async () => {
    try {
      // Get all sales
      const response = await sales.getReport();
      const allSalesData = response as Sale[];

      if (!Array.isArray(allSalesData)) {
        console.error('Invalid sales data format');
        return;
      }

      // Calculate today's sales
      const todayTotal = allSalesData
        .filter(sale => isToday(sale.createdAt))
        .reduce((sum, sale) => sum + sale.total_amount, 0);
      setTodaySales(todayTotal);

      // Calculate total sales
      const total = allSalesData.reduce((sum, sale) => sum + sale.total_amount, 0);
      setTotalSales(total);

      // Sort by date and take most recent
      const sortedSales = [...allSalesData].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentSales(sortedSales.slice(0, 5));
    } catch (error) {
      console.error('Error loading sales data:', error);
    }
  };

  useEffect(() => {
    loadSales();
    // Set up an interval to refresh sales data every minute
    const interval = setInterval(loadSales, 60000);
    return () => clearInterval(interval);
  }, []);

  const refreshSales = async () => {
    await loadSales();
  };

  return (
    <SalesContext.Provider value={{
      recentSales,
      todaySales,
      totalSales,
      refreshSales
    }}>
      {children}
    </SalesContext.Provider>
  );
}; 