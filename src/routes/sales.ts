import { Router } from 'express';
import mongoose from 'mongoose';
import Sale from '../models/Sale';
import Book from '../models/Book';
import Student from '../models/Student';

interface SaleItem {
  book_id: string;
  quantity: number;
  price: number;
}

interface SaleRequest {
  student_id: string;
  items: SaleItem[];
}

const router = Router();

// Create new sale
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { student_id, items }: SaleRequest = req.body;

    // Calculate total amount and validate stock
    let total_amount = 0;
    for (const item of items) {
      const book = await Book.findById(item.book_id).session(session);
      if (!book) {
        throw new Error(`Book ${item.book_id} not found`);
      }
      if (book.stock < item.quantity) {
        throw new Error(`Insufficient stock for book ${book.title}`);
      }
      total_amount += book.price * item.quantity;
    }

    // Create sale
    const sale = new Sale({
      student: student_id,
      items: items.map((item: SaleItem) => ({
        book: item.book_id,
        quantity: item.quantity,
        price_at_sale: item.price
      })),
      total_amount
    });

    await sale.save({ session });

    // Update book stock
    for (const item of items) {
      await Book.findByIdAndUpdate(
        item.book_id,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    await session.commitTransaction();
    
    const populatedSale = await Sale.findById(sale._id)
      .populate('student')
      .populate('items.book');
    
    res.status(201).json(populatedSale);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Error creating sale', error });
  } finally {
    session.endSession();
  }
});

// Get sales report
router.get('/report', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const query: any = {};
    if (start_date || end_date) {
      query.createdAt = {};
      if (start_date) query.createdAt.$gte = new Date(start_date as string);
      if (end_date) query.createdAt.$lte = new Date(end_date as string);
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