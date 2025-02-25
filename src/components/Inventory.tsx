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
    title: '',
    subject: SUBJECTS[0],
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
      const data = await books.getAll() as Book[];
      setBooksList(data);
    } catch (error) {
      console.error('Error loading books:', error);
      setError('Failed to load books. Please try again.');
    }
  };

  const handleAddBook = async () => {
    try {
      // Validate inputs
      if (!newBook.title || !newBook.subject || !newBook.class) {
        setError('Please fill in all required fields');
        return;
      }

      const price = Number(newBook.price);
      const stock = Number(newBook.stock);

      if (isNaN(price) || price <= 0) {
        setError('Price must be greater than 0');
        return;
      }

      if (isNaN(stock) || stock < 0) {
        setError('Stock cannot be negative');
        return;
      }

      // Create book with proper data structure
      const bookData = {
        title: newBook.title,
        subject: newBook.subject,
        class_level: newBook.class,
        price: price,
        stock: stock
      };

      // Send to backend
      await books.create(bookData);
      
      // Reload books list
      await loadBooks();
      
      // Reset form and close modal
      setNewBook({
        title: '',
        subject: SUBJECTS[0],
        class: CLASSES[0],
        price: '',
        stock: ''
      });
      setIsAddingBook(false);
      setError('');
    } catch (error: any) {
      console.error('Error adding book:', error);
      setError(error.response?.data?.message || error.message || 'Failed to add book');
    }
  };

  const handleUpdateStock = async (bookId: string) => {
    try {
      await books.updateStock(bookId, newStockAmount);
      await loadBooks();
      setEditingStock(null);
      setNewStockAmount(0);
      setError('');
    } catch (error: any) {
      console.error('Error updating stock:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update stock');
    }
  };

  const handleUpdatePrice = async (bookId: string) => {
    try {
      await books.updatePrice(bookId, newPrice);
      await loadBooks();
      setEditingPrice(null);
      setNewPrice(0);
      setError('');
    } catch (error: any) {
      console.error('Error updating price:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update price');
    }
  };

  // Filter books based on search term
  const filteredBooks = booksList.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.class_level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <button
            onClick={() => setIsAddingBook(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Book</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
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

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Title</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Subject</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Class</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Price</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Stock</th>
                    <th className="pb-3 text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book._id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4">
                        <span className="font-medium text-gray-900 dark:text-white">{book.title}</span>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">{book.subject}</td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">{book.class_level}</td>
                      <td className="py-4">
                        {editingPrice === book._id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(Number(e.target.value))}
                              className="w-24 px-2 py-1 border rounded"
                              min="0"
                              step="0.01"
                            />
                            <button
                              onClick={() => handleUpdatePrice(book._id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-900 dark:text-white">
                              {settings.currency === 'GHS' ? '₵' : settings.currency === 'USD' ? '$' : '€'}
                              {book.price.toFixed(2)}
                            </span>
                            <button
                              onClick={() => {
                                setEditingPrice(book._id);
                                setNewPrice(book.price);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </button>
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
                              className="w-24 px-2 py-1 border rounded"
                              min="0"
                            />
                            <button
                              onClick={() => handleUpdateStock(book._id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className={`${book.stock < 10 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                              {book.stock}
                            </span>
                            <button
                              onClick={() => {
                                setEditingStock(book._id);
                                setNewStockAmount(book.stock);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <button
                          onClick={async () => {
                            try {
                              await books.deleteBook(book._id);
                              await loadBooks();
                            } catch (error: any) {
                              setError(error.response?.data?.message || error.message || 'Failed to delete book');
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isAddingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Book</h2>
              <button
                onClick={() => setIsAddingBook(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddBook(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Enter book title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <select
                    value={newBook.subject}
                    onChange={(e) => setNewBook({ ...newBook, subject: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {SUBJECTS.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
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
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingBook(false)}
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