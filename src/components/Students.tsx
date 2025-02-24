import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface Sale {
  id: string;
  studentName: string;
  studentClass: string;
  items: {
    bookId: string;
    title: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  date: string;
}

interface StudentPurchase {
  name: string;
  class: string;
  totalSpent: number;
  purchaseCount: number;
  lastPurchase: string;
  bookCount: number;
}

function Students() {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  // Get all sales from localStorage
  const sales: Sale[] = JSON.parse(localStorage.getItem('bookshopSales') || '[]');

  // Process sales data to get student purchase history
  const studentPurchases: StudentPurchase[] = Object.values(
    sales.reduce((acc: { [key: string]: StudentPurchase }, sale) => {
      const key = `${sale.studentName}-${sale.studentClass}`;
      if (!acc[key]) {
        acc[key] = {
          name: sale.studentName,
          class: sale.studentClass,
          totalSpent: 0,
          purchaseCount: 0,
          lastPurchase: sale.date,
          bookCount: 0
        };
      }
      acc[key].totalSpent += sale.total;
      acc[key].purchaseCount += 1;
      acc[key].bookCount += sale.items.reduce((sum, item) => sum + item.quantity, 0);
      if (new Date(sale.date) > new Date(acc[key].lastPurchase)) {
        acc[key].lastPurchase = sale.date;
      }
      return acc;
    }, {})
  );

  const formatCurrency = (amount: number) => {
    const symbol = settings.currency === 'GHS' ? '₵' : settings.currency === 'USD' ? '$' : '€';
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Filter students based on search term and class
  const filteredStudents = studentPurchases.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || student.class === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Purchase History</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-4">
                <Filter size={20} className="text-gray-400" />
                <select
                  className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <option value="all">All Classes</option>
                  {['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6'].map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Student Name</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Class</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Total Amount Paid</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Books Purchased</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Purchase Count</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Date Purchased</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={`${student.name}-${student.class}`} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4">
                        <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">{student.class}</td>
                      <td className="py-4 text-gray-900 dark:text-white">
                        {formatCurrency(student.totalSpent)}
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">{student.bookCount}</td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">{student.purchaseCount}</td>
                      <td className="py-4 text-gray-500 dark:text-gray-400">
                        {new Date(student.lastPurchase).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-500 dark:text-gray-400">
                        No student purchase records found
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

export default Students; 