import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  AlertCircle,
  DollarSign,
  BookOpen,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSales } from '../contexts/SalesContext';
import { books } from '../services/api';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</h3>
        {trend && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            <TrendingUp size={16} className="inline mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        {icon}
      </div>
    </div>
  </div>
);

const RecentTransactions = () => {
  const { settings } = useSettings();
  const { recentSales } = useSales();

  const formatCurrency = (amount: number) => {
    const symbol = settings.currency === 'GHS' ? '₵' : settings.currency === 'USD' ? '$' : '€';
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
              <th className="pb-3">Student</th>
              <th className="pb-3">Class</th>
              <th className="pb-3">Books</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {recentSales.map((sale) => (
              <tr key={sale._id} className="border-t border-gray-100 dark:border-gray-700">
                <td className="py-3 text-gray-900 dark:text-white">{sale.student.name}</td>
                <td className="py-3 text-gray-600 dark:text-gray-300">{sale.student.class_level}</td>
                <td className="py-3 text-gray-600 dark:text-gray-300">
                  {sale.items.map(item => item.book.title).join(', ')}
                </td>
                <td className="py-3 text-gray-900 dark:text-white">
                  {formatCurrency(sale.total_amount)}
                </td>
                <td className="py-3 text-gray-500 dark:text-gray-400">
                  {new Date(sale.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {recentSales.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500 dark:text-gray-400">
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface DashboardStats {
  totalBooksInStock: number;
  lowStockBooks: any[];
}

interface Book {
  _id: string;
  title: string;
  stock: number;
}

const Dashboard: React.FC = () => {
  const { settings } = useSettings();
  const { todaySales, totalSales } = useSales();
  const [stats, setStats] = useState<DashboardStats>({
    totalBooksInStock: 0,
    lowStockBooks: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get books data
      const booksData = await books.getAll() as Book[];
      const totalBooksInStock = booksData.reduce((sum: number, book: Book) => sum + book.stock, 0);
      const lowStockBooks = booksData.filter((book: Book) => book.stock < 10);

      setStats({
        totalBooksInStock,
        lowStockBooks
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const symbol = settings.currency === 'GHS' ? '₵' : settings.currency === 'USD' ? '$' : '€';
    return `${symbol}${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return <div className="flex-1 p-8 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Sales Today"
            value={formatCurrency(todaySales)}
            icon={<DollarSign size={24} className="text-blue-600" />}
          />
          <StatCard
            title="Books in Stock"
            value={stats.totalBooksInStock.toString()}
            icon={<BookOpen size={24} className="text-blue-600" />}
          />
          <StatCard
            title="Total Sales"
            value={formatCurrency(totalSales)}
            icon={<Users size={24} className="text-blue-600" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Low Stock Alerts</h2>
            <div className="space-y-4">
              {stats.lowStockBooks.map((book) => (
                <div
                  key={book._id}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {book.title} ({book.class_level})
                    </span>
                  </div>
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {book.stock} left
                  </span>
                </div>
              ))}
              {stats.lowStockBooks.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No low stock alerts
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;