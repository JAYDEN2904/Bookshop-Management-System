import { Router } from 'express';
import mongoose from 'mongoose';
import Supplier from '../models/Supplier';

const router = Router();

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort('-createdAt');
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers', error });
  }
});

// Add new supplier
router.post('/', async (req, res) => {
  try {
    const { name, total_debt } = req.body;
    const supplier = new Supplier({ name, total_debt });
    const savedSupplier = await supplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    res.status(500).json({ message: 'Error creating supplier', error });
  }
});

// Add payment to supplier
router.post('/:id/payments', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { amount } = req.body;

    const supplier = await Supplier.findById(id).session(session);
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    // Add payment to payments array
    supplier.payments.push({ amount });
    
    // Update total debt
    supplier.total_debt = Math.max(0, supplier.total_debt - amount);
    
    await supplier.save({ session });
    await session.commitTransaction();

    res.json(supplier);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Error processing payment', error });
  } finally {
    session.endSession();
  }
});

export default router; 