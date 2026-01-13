import express from 'express';
import orderAssistantService from '../services/orderAssistantService.js';
import Product from '../models/Product.js';
import connectDB from '../config/database.js';

const router = express.Router();

router.get('/catalog', async (req, res) => {
  try {
    await connectDB();
    const products = await orderAssistantService.getProductCatalog();
    res.json({
      success: true,
      count: products.length,
      products: products.map(p => ({
        name: p.name,
        ottType: p.ottType,
        pricingCount: p.pricing?.length || 0,
        samplePricing: p.pricing?.[0]
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/detect/:message', async (req, res) => {
  try {
    const detected = orderAssistantService.detectProductIntent(req.params.message);
    res.json({ success: true, detected });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/format/:product', async (req, res) => {
  try {
    const result = await orderAssistantService.formatPriceList(req.params.product);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/db-direct', async (req, res) => {
  try {
    await connectDB();
    const products = await Product.find({ status: 'active' }).lean();
    res.json({
      success: true,
      count: products.length,
      mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      products: products.map(p => ({
        name: p.name,
        ottType: p.ottType,
        profileTypesCount: p.profileTypes?.length
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
});

export default router;
