import { Router } from 'express';
import mongoose from 'mongoose';
import Sale from '../models/Sale';
import Book from '../models/Book';
import Student from '../models/Student';

// Define interfaces for the request body
interface SaleItem {
  book: string;      // MongoDB ObjectId as string
  quantity: number;
  price_at_sale: number;
}

interface CreateSaleRequest {
  student: string;   // MongoDB ObjectId as string
  items: SaleItem[];
  total_amount: number;
}

const router = Router();

// Create new sale
router.post('/', async (req, res) => {
  try {
    const { student, items, total_amount } = req.body as CreateSaleRequest;

    // Validate required fields
    if (!student || !items || !total_amount) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        error: 'student, items, and total_amount are required' 
      });
    }

    // Create new sale with the correct schema
    const sale = new Sale({
      student,
      items: items.map((item: SaleItem) => ({
        book: item.book,
        quantity: item.quantity,
        price_at_sale: item.price_at_sale
      })),
      total_amount
    });

    // Update book stock
    for (const item of items) {
      const book = await Book.findById(item.book);
      if (!book) {
        throw new Error(`Book with ID ${item.book} not found`);
      }
      if (book.stock < item.quantity) {
        throw new Error(`Insufficient stock for book ${book.title}: requested ${item.quantity}, available ${book.stock}`);
      }
      await Book.findByIdAndUpdate(
        item.book,
        { $inc: { stock: -item.quantity } }
      );
    }

    const savedSale = await sale.save();
    
    // Populate the sale with book and student details
    const populatedSale = await Sale.findById(savedSale._id)
      .populate('student')
      .populate('items.book');

    res.status(201).json(populatedSale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ 
      message: 'Error creating sale', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get sales report
router.get('/report', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const query: Record<string, any> = {};
    if (start_date || end_date) {
      query.createdAt = {};
      if (start_date) {
        const startDate = new Date(start_date as string);
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);
        query.createdAt.$gte = startOfDay;
      }
      if (end_date) {
        const endDate = new Date(end_date as string);
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endOfDay;
      }
    }

    const sales = await Sale.find(query)
      .populate('student')
      .populate('items.book')
      .sort('-createdAt');

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales report', error });
  }
});

export default router; 