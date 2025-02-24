import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price_at_sale: {
    type: Number,
    required: true,
  },
});

const saleSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  items: [saleItemSchema],
  total_amount: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Sale', saleSchema); 