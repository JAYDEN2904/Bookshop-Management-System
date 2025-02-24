import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit2, Trash2, DollarSign, Save } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface Supplier {
  id: string;
  name: string;
  totalDebt: number;
  lastPayment: string;
  lastPaymentAmount: number;
}

const Suppliers: React.FC = () => {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('bookshopSuppliers');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', totalDebt: 0 });
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem('bookshopSuppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  const handleAddSupplier = () => {
    if (newSupplier.name && newSupplier.totalDebt) {
      setSuppliers([...suppliers, {
        id: Date.now().toString(),
        name: newSupplier.name,
        totalDebt: newSupplier.totalDebt,
        lastPayment: '-',
        lastPaymentAmount: 0
      }]);
      setNewSupplier({ name: '', totalDebt: 0 });
      setIsAddingSupplier(false);
    }
  };

  const handlePayment = (supplierId: string) => {
    if (paymentAmount > 0) {
      setSuppliers(suppliers.map(supplier => {
        if (supplier.id === supplierId) {
          return {
            ...supplier,
            totalDebt: supplier.totalDebt - paymentAmount,
            lastPayment: new Date().toISOString().split('T')[0],
            lastPaymentAmount: paymentAmount
          };
        }
        return supplier;
      }));
      setEditingSupplier(null);
      setPaymentAmount(0);
    }
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(supplier => supplier.id !== supplierId));
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Supplier Management</h1>
          <button 
            onClick={() => setIsAddingSupplier(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <UserPlus size={20} />
            <span>Add New Supplier</span>
          </button>
        </div>

        {isAddingSupplier && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Supplier</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Supplier Name"
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Initial Debt Amount"
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={newSupplier.totalDebt || ''}
                onChange={(e) => setNewSupplier({ ...newSupplier, totalDebt: parseFloat(e.target.value) })}
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsAddingSupplier(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSupplier}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Supplier
              </button>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search suppliers..."
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Supplier Name</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Total Debt</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Last Payment</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Last Payment Amount</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map(supplier => (
                    <tr key={supplier.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4">
                        <span className="font-medium text-gray-900 dark:text-white">{supplier.name}</span>
                      </td>
                      <td className="py-4 text-gray-900 dark:text-white">
                        {settings.currency === 'GHS' ? '₵' : settings.currency === 'USD' ? '$' : '€'}
                        {supplier.totalDebt.toFixed(2)}
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">{supplier.lastPayment}</td>
                      <td className="py-4 text-gray-900 dark:text-white">
                        {supplier.lastPaymentAmount > 0 ? (
                          `${settings.currency === 'GHS' ? '₵' : settings.currency === 'USD' ? '$' : '€'}${supplier.lastPaymentAmount.toFixed(2)}`
                        ) : '-'}
                      </td>
                      <td className="py-4">
                        {editingSupplier === supplier.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              placeholder="Payment amount"
                              className="w-24 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              value={paymentAmount || ''}
                              onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                            />
                            <button
                              onClick={() => handlePayment(supplier.id)}
                              className="text-green-600 hover:text-green-700 dark:text-green-400"
                            >
                              <Save size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setEditingSupplier(supplier.id)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                              <DollarSign size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suppliers;