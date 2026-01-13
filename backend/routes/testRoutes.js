import express from 'express';
import orderAssistantService from '../services/orderAssistantService.js';

const router = express.Router();

router.get('/catalog', async (req, res) => {
  try {
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

export default router;
