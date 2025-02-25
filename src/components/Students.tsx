import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSales } from '../contexts/SalesContext';

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
  const { recentSales } = useSales();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  // Process sales data to get student purchase history
  const studentPurchases: StudentPurchase[] = Object.values(
    recentSales.reduce((acc: { [key: string]: StudentPurchase }, sale) => {
      const key = `${sale.student.name}-${sale.student.class_level}`;
      if (!acc[key]) {
        acc[key] = {
          name: sale.student.name,
          class: sale.student.class_level,
          totalSpent: 0,
          purchaseCount: 0,
          lastPurchase: sale.createdAt,
          bookCount: 0
        };
      }
      acc[key].totalSpent += sale.total_amount;
      acc[key].purchaseCount += 1;
      acc[key].bookCount += sale.items.reduce((sum, item) => sum + item.quantity, 0);
      if (new Date(sale.createdAt) > new Date(acc[key].lastPurchase)) {
        acc[key].lastPurchase = sale.createdAt;
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
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                  >
                    <option value="all">All Classes</option>
                    <option value="Basic 1">Basic 1</option>
                    <option value="Basic 2">Basic 2</option>
                    <option value="Basic 3">Basic 3</option>
                    <option value="Basic 4">Basic 4</option>
                    <option value="Basic 5">Basic 5</option>
                    <option value="Basic 6">Basic 6</option>
                  </select>
                </div>
              </div>
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Student Name</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Class</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Total Spent</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Books Purchased</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Purchase Count</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Last Purchase</th>
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