import { Router } from 'express';
import Setting from '../models/Setting';

const router = Router();

// Get settings
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error });
  }
});

// Update settings
router.put('/', async (req, res) => {
  try {
    const { store_name, currency, low_stock_threshold } = req.body;
    
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    settings.store_name = store_name;
    settings.currency = currency;
    settings.low_stock_threshold = low_stock_threshold;

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error });
  }
});

export default router; 