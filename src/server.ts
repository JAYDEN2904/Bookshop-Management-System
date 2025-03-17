import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import connectDB from './config/database';
import { authenticate } from './middleware/authenticate';
import authRoutes from './routes/auth';
import bookRoutes from './routes/books';
import saleRoutes from './routes/sales';
import supplierRoutes from './routes/suppliers';
import studentRoutes from './routes/students';
import settingsRoutes from './routes/settings';
import testRoutes from './routes/test';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'https://your-vercel-app-url.vercel.app', // Replace with your Vercel domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/books', authenticate, bookRoutes);
app.use('/api/sales', authenticate, saleRoutes);
app.use('/api/suppliers', authenticate, supplierRoutes);
app.use('/api/students', authenticate, studentRoutes);
app.use('/api/settings', authenticate, settingsRoutes);
app.use('/api/test', testRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 