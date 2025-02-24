import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, BookOpen, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { books } from '../services/api';

interface Book {
  _id: string;
  title: string;
  subject: string;
  class_level: string;
  price: number;
  stock: number;
}

const CLASSES = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6'];

const SUBJECTS = [
  'English Language',
  'Mathematics',
  'Science',
  'Social Studies',
  'Religious and Moral Education',
  'Creative Arts',
  'Ghanaian Language',
  'ICT'
];

function Inventory() {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [booksList, setBooksList] = useState<Book[]>([]);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [newBook, setNewBook] = useState({
    subject: '',
    class: CLASSES[0],
    price: '',
    stock: ''
  });
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [newStockAmount, setNewStockAmount] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [error, setError] = useState('');

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

  const handleAddBook = async () => {
    try {
      // Validate inputs
      if (!newBook.subject || !newBook.class) {
        alert('Please fill in all required fields');
        return;
      }

      const price = Number(newBook.price);
      const stock = Number(newBook.stock);

      if (isNaN(price) || price <= 0) {
        alert('Price must be greater than 0');
        return;
      }

      if (isNaN(stock) || stock < 0) {
        alert('Stock cannot be negative');
        return;
      }

      // Create book with proper data structure
      const bookData = {
        title: newBook.subject,
        subject: newBook.subject,
        class_level: newBook.class,
        price: price,
        stock: stock
      };

      console.log('Sending book data:', bookData);

      // Send to backend
      const response = await books.create(bookData);
      console.log('Response:', response);
      
      // Reload books list
      await loadBooks();
      
      // Reset form and close modal
      setNewBook({
        subject: '',
        class: CLASSES[0],
        price: '',
        stock: ''
      });
      setIsAddingBook(false);
    } catch (error) {
      console.error('Error adding book:', error);
      if (error.response) {
        alert(`Failed to add book: ${error.response.data.message}`);
      } else {
        alert('Failed to add book. Please try again.');
      }
    }
  };

  const handleUpdateStock = async (bookId: string) => {
    try {
      await books.updateStock(bookId, newStockAmount);
      await loadBooks();
      setEditingStock(null);
      setNewStockAmount(0);
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleUpdatePrice = async (bookId: string) => {
    try {
      if (newPrice <= 0) {
        alert('Price must be greater than 0');
        return;
      }

      await books.updatePrice(bookId, newPrice);
      await loadBooks();
      setEditingPrice(null);
      setNewPrice(0);
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price. Please try again.');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await books.deleteBook(bookId);
        // Reload books after deletion
        await loadBooks();
        // Show success message
        alert('Book deleted successfully');
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Failed to delete book. Please try again.');
      }
    }
  };

  // Group books only by class
  const groupedBooks = CLASSES.reduce((acc, className) => {
    acc[className] = booksList.filter(book => book.class_level === className);
    return acc;
  }, {} as Record<string, Book[]>);

  const formatCurrency = (amount: number) => {
    const symbol = settings.currency === 'GHS' ? '₵' : settings.currency === 'USD' ? '$' : '€';
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="p-8 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
            <button 
              onClick={(e) => { e.preventDefault(); setIsAddingBook(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add New Book</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search books..."
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {CLASSES.map(className => {
            const classBooks = groupedBooks[className] || [];
            
            return (
              <div key={className} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {className}
                  </h2>
                  {classBooks.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                            <th className="pb-4 pl-4">Subject</th>
                            <th className="pb-4">Price</th>
                            <th className="pb-4">Stock</th>
                            <th className="pb-4 text-right pr-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classBooks.map(book => (
                            <tr key={book._id} className="border-t border-gray-100 dark:border-gray-700">
                              <td className="py-4 pl-4">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {book.title}
                                </span>
                              </td>
                              <td className="py-4">
                                {editingPrice === book._id ? (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      value={newPrice}
                                      onChange={(e) => setNewPrice(Number(e.target.value))}
                                      className="w-24 p-1 border rounded"
                                      min="0"
                                      step="0.01"
                                    />
                                    <button
                                      onClick={() => handleUpdatePrice(book._id)}
                                      className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingPrice(null);
                                        setNewPrice(0);
                                      }}
                                      className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-900 dark:text-white">
                                      {formatCurrency(book.price)}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="py-4">
                                {editingStock === book._id ? (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      value={newStockAmount}
                                      onChange={(e) => setNewStockAmount(Number(e.target.value))}
                                      className="w-24 p-1 border rounded"
                                      min="0"
                                    />
                                    <button
                                      onClick={() => handleUpdateStock(book._id)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <span className={`font-medium ${
                                      book.stock < settings.low_stock_threshold 
                                        ? 'text-red-600 dark:text-red-400' 
                                        : 'text-gray-900 dark:text-white'
                                    }`}>
                                      {book.stock}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="py-4 text-right pr-4">
                                <div className="flex items-center justify-end space-x-4">
                                  <button
                                    onClick={() => {
                                      setEditingPrice(book._id);
                                      setNewPrice(book.price);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                  >
                                    Edit Price
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingStock(book._id);
                                      setNewStockAmount(book.stock);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                  >
                                    Edit Stock
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBook(book._id)}
                                    className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No books added for {className}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Book Modal */}
      {isAddingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Book</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddBook();
            }} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <select
                  value={newBook.subject}
                  onChange={(e) => setNewBook({ ...newBook, subject: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a subject</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Class Level</label>
                <select
                  value={newBook.class}
                  onChange={(e) => setNewBook({ ...newBook, class: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  {CLASSES.map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  value={newBook.price}
                  onChange={(e) => setNewBook({ ...newBook, price: e.target.value })}
                  className="w-full p-2 border rounded"
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Initial Stock</label>
                <input
                  type="number"
                  value={newBook.stock}
                  onChange={(e) => setNewBook({ ...newBook, stock: e.target.value })}
                  className="w-full p-2 border rounded"
                  min="0"
                  placeholder="Enter initial stock"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setIsAddingBook(false); }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory; 