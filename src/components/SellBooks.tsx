import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Receipt, Plus, Minus } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSales } from '../contexts/SalesContext';
import { books, sales, students } from '../services/api';

interface Book {
  _id: string;
  title: string;
  subject: string;
  class: string;
  price: number;
  stock: number;
}

interface SaleItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
}

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

interface CreateSaleData {
  student: string;
  items: Array<{
    book: string;
    quantity: number;
    price_at_sale: number;
  }>;
  total_amount: number;
}

function SellBooks() {
  const { settings } = useSettings();
  const { refreshSales } = useSales();
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('Basic 1');
  const [selectedBooks, setSelectedBooks] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [booksList, setBooksList] = useState<Book[]>([]);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await books.getAll();
      setBooksList(data);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const filteredBooks = booksList.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (book: Book) => {
    const existingItem = selectedBooks.find(item => item.bookId === book._id);
    if (existingItem) {
      setSelectedBooks(selectedBooks.map(item =>
        item.bookId === book._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedBooks([...selectedBooks, {
        bookId: book._id,
        title: book.title,
        price: book.price,
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (bookId: string) => {
    setSelectedBooks(selectedBooks.filter(item => item.bookId !== bookId));
  };

  const updateQuantity = (bookId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      setSelectedBooks(selectedBooks.map(item =>
        item.bookId === bookId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return selectedBooks.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCompleteSale = async () => {
    if (!studentName || selectedBooks.length === 0) {
      return;
    }

    try {
      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated - please log in');
      }

      // Check book stock before proceeding
      const stockErrors = [];
      for (const item of selectedBooks) {
        const book = booksList.find(b => b._id === item.bookId);
        if (!book) {
          stockErrors.push(`Book ${item.title} not found`);
        } else if (book.stock < item.quantity) {
          stockErrors.push(`Insufficient stock for ${item.title}: requested ${item.quantity}, available ${book.stock}`);
        }
      }

      if (stockErrors.length > 0) {
        throw new Error('Stock validation failed:\n' + stockErrors.join('\n'));
      }

      // Step 1: Create student first
      const studentResponse = await students.create({
        name: studentName,
        class_level: studentClass
      });

      if (!studentResponse?._id) {
        throw new Error('Failed to create student - no ID returned');
      }

      // Step 2: Prepare sale data exactly matching MongoDB schema
      const saleData: CreateSaleData = {
        student: studentResponse._id,
        items: selectedBooks.map(item => ({
          book: item.bookId,         // This should be the MongoDB ObjectId
          quantity: item.quantity,
          price_at_sale: Number(item.price)
        })),
        total_amount: Number(calculateTotal())
      };

      // Debug log
      console.log('Submitting sale:', JSON.stringify(saleData, null, 2));

      // Step 3: Create the sale
      const result = await sales.create(saleData);

      if (!result) {
        throw new Error('No result returned from sale creation');
      }

      // Step 4: Update UI with sale result
      setCurrentSale({
        _id: result._id,
        student: {
          _id: studentResponse._id,
          name: studentResponse.name,
          class_level: studentResponse.class_level
        },
        items: result.items.map(item => ({
          book: {
            _id: item.book._id || item.book,
            title: item.book.title || selectedBooks.find(b => b.bookId === item.book)?.title || '',
            price: item.price_at_sale
          },
          quantity: item.quantity,
          price_at_sale: item.price_at_sale
        })),
        total_amount: result.total_amount,
        createdAt: result.createdAt || new Date().toISOString()
      });

      // Step 5: Reset form and show receipt
      setShowReceipt(true);
      setSelectedBooks([]);
      setStudentName('');
      await loadBooks(); // Refresh book list to update stock
      await refreshSales(); // Refresh sales data globally

    } catch (error: any) {
      console.error('Complete sale error:', {
        error: error.response?.data || error,
        message: error.message,
        stack: error.stack,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to complete sale: ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred';
      }
      
      alert(errorMessage);
    }
  };

  const formatCurrency = (amount: number) => {
    const symbol = settings.currency === 'GHS' ? '₵' : settings.currency === 'USD' ? '$' : '€';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const Receipt = ({ sale }: { sale: Sale }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {settings.store_name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Sales Receipt</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">Date: {new Date(sale.createdAt).toLocaleDateString()}</p>
          <p className="text-gray-900 dark:text-white">Student: {sale.student.name}</p>
          <p className="text-gray-900 dark:text-white">Class: {sale.student.class_level}</p>
        </div>

        <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-4">
          {sale.items.map(item => (
            <div key={item.book._id} className="flex justify-between mb-2">
              <div>
                <p className="text-gray-900 dark:text-white">{item.book.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(item.book.price)} x {item.quantity}
                </p>
              </div>
              <p className="text-gray-900 dark:text-white">
                {formatCurrency(item.price_at_sale * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-lg font-bold mb-6">
          <span className="text-gray-900 dark:text-white">Total</span>
          <span className="text-gray-900 dark:text-white">{formatCurrency(sale.total_amount)}</span>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              setShowReceipt(false);
              setStudentName('');
              setSelectedBooks([]);
              setCurrentSale(null);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Books Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Books</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search books..."
                      className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredBooks.map(book => (
                    <div key={book._id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{book.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {book.class} - Stock: {book.stock}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(book.price)}
                        </span>
                        <button
                          onClick={() => addToCart(book)}
                          disabled={book.stock === 0}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg disabled:opacity-50"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Student Purchase</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                >
                  {['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6'].map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              {selectedBooks.map(item => (
                <div key={item.bookId} className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-900 dark:text-white">{item.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <button
                        onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-gray-900 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.bookId)}
                      className="text-red-600 hover:text-red-700 text-sm mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={selectedBooks.length === 0 || !studentName}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Complete Purchase
            </button>
          </div>
        </div>
      </div>

      {showReceipt && currentSale && <Receipt sale={currentSale} />}
    </div>
  );
}

export default SellBooks; 