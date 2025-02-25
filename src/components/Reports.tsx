import React, { useState, useEffect } from 'react';
import { Calendar, Search, Download } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSales } from '../contexts/SalesContext';
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

function Reports() {
  const { settings } = useSettings();
  const { refreshSales } = useSales();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSales();
  }, [startDate, endDate]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await sales.getReport(startDate, endDate);
      setSalesData(response);
      await refreshSales(); // Refresh global sales data after loading report data
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const symbol = settings.currency === 'GHS' ? '₵' : settings.currency === 'USD' ? '$' : '€';
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Filter sales based on search term
  const filteredSales = salesData.filter(sale => {
    const matchesSearch = sale.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       sale.student.class_level.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       sale.items.some(item => item.book.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  // Calculate summary statistics
  const summary = {
    totalSales: filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0),
    totalTransactions: filteredSales.length,
    totalBooks: filteredSales.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    ),
    averageTransactionValue: filteredSales.length > 0 
      ? filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0) / filteredSales.length 
      : 0
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Student Name', 'Class', 'Books', 'Quantity', 'Total Amount'],
      ...filteredSales.flatMap(sale => 
        sale.items.map(item => [
          new Date(sale.createdAt).toLocaleDateString(),
          sale.student.name,
          sale.student.class_level,
          item.book.title,
          item.quantity.toString(),
          formatCurrency(sale.total_amount)
        ])
      )
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Reports</h1>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Export Report</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Sales</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(summary.totalSales)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {summary.totalTransactions}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Books Sold</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {summary.totalBooks}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Average Transaction</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(summary.averageTransactionValue)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar size={20} className="text-gray-400" />
                  <input
                    type="date"
                    className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Date</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Student</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Class</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Books</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale._id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4 text-gray-500 dark:text-gray-400">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {sale.student.name}
                        </span>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">
                        {sale.student.class_level}
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">
                        {sale.items.map(item => (
                          <div key={item.book._id}>
                            {item.book.title} (×{item.quantity})
                          </div>
                        ))}
                      </td>
                      <td className="py-4 text-gray-900 dark:text-white">
                        {formatCurrency(sale.total_amount)}
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500 dark:text-gray-400">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports; 