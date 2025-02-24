import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/test-db', async (req, res) => {
  try {
    // Check if we're connected to MongoDB
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    if (state === 1) {
      res.json({
        status: 'success',
        message: 'Successfully connected to MongoDB',
        database: mongoose.connection.db.databaseName,
        host: mongoose.connection.host
      });
    } else {
      res.json({
        status: 'error',
        message: `MongoDB is ${states[state]}`,
        state: state
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error checking database connection',
      error: error
    });
  }
});

export default router; 