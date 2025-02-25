import React, { useState } from 'react';
import { Save, Bell, Store } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof typeof settings, value: string | number) => {
    setLocalSettings({
      ...localSettings,
      [field]: value
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      await updateSettings(localSettings);
      alert('Settings saved successfully!');
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Store className="text-blue-600" size={24} />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Store Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={localSettings.store_name}
                    onChange={(e) => handleChange('store_name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={localSettings.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                  >
                    <option value="GHS">GHS (₵)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Bell className="text-blue-600" size={24} />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={localSettings.low_stock_threshold}
                    onChange={(e) => handleChange('low_stock_threshold', parseInt(e.target.value))}
                    min="0"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Items with stock below this number will be marked as low stock
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save size={20} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 