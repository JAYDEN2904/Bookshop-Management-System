import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  class_level: {
    type: String,
    required: true,
    enum: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6'],
  },
}, { timestamps: true });

export default mongoose.model('Student', studentSchema); 