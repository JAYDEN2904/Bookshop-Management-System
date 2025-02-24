import { Router } from 'express';
import Book from '../models/Book';

const router = Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort('-createdAt');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error });
  }
});

// Add new book
router.post('/', async (req, res) => {
  try {
    const { title, subject, class_level, price, stock } = req.body;

    // Validate required fields
    if (!title || !subject || !class_level || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new book
    const book = new Book({
      title,
      subject,
      class_level,
      price: Number(price),
      stock: Number(stock)
    });
    
    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ 
      message: 'Error creating book', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update book stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const book = await Book.findByIdAndUpdate(
      id,
      { stock: Number(stock) },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error updating book stock', error });
  }
});

// Add this route to handle price updates
router.patch('/:id/price', async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    const book = await Book.findByIdAndUpdate(
      id,
      { price: Number(price) },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error updating book price', error });
  }
});

// Add delete book route
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book', error });
  }
});

export default router; 