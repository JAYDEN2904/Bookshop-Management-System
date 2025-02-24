import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  store_name: {
    type: String,
    required: true,
    default: "Faith Community Baptist School Bookshop",
  },
  currency: {
    type: String,
    required: true,
    enum: ['GHS', 'USD', 'EUR'],
    default: 'GHS',
  },
  low_stock_threshold: {
    type: Number,
    required: true,
    default: 10,
  },
}, { timestamps: true });

export default mongoose.model('Setting', settingSchema); 