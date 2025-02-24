import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  payment_date: {
    type: Date,
    default: Date.now,
  },
});

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  total_debt: {
    type: Number,
    default: 0,
  },
  payments: [paymentSchema],
}, { timestamps: true });

export default mongoose.model('Supplier', supplierSchema); 