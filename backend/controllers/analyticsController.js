import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Product from '../models/Product.js';

export const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Sales Overview
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.countDocuments({ createdAt: { $gte: startDate } });
    
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentRevenue = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'completed',
          createdAt: { $gte: startDate }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Customer Stats
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const newCustomers = await User.countDocuments({ 
      role: 'customer',
      createdAt: { $gte: startDate }
    });

    // Subscription Stats
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const expiredSubscriptions = await Subscription.countDocuments({ status: 'expired' });
    const expiringSubscriptions = await Subscription.countDocuments({
      status: 'active',
      expiryDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    });

    // Coupon Stats
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const couponUsage = await Coupon.aggregate([
      { $group: { _id: null, totalUsage: { $sum: '$usageCount' } } }
    ]);

    const totalDiscount = await Order.aggregate([
      { $match: { couponDiscount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$couponDiscount' } } }
    ]);

    // Daily Sales (last 30 days)
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top Products
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.ottType',
          count: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Top Coupons
    const topCoupons = await Coupon.find()
      .sort('-usageCount')
      .limit(5)
      .select('code description usageCount discountType discountValue');

    // Payment Method Distribution
    const paymentMethods = await Order.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Order Status Distribution
    const orderStatus = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalOrders,
          recentOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          recentRevenue: recentRevenue[0]?.total || 0,
          totalCustomers,
          newCustomers,
          activeSubscriptions,
          expiredSubscriptions,
          expiringSubscriptions
        },
        coupons: {
          totalCoupons,
          activeCoupons,
          totalUsage: couponUsage[0]?.totalUsage || 0,
          totalDiscount: totalDiscount[0]?.total || 0,
          topCoupons
        },
        sales: {
          dailySales,
          topProducts,
          paymentMethods,
          orderStatus
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const match = { paymentStatus: 'completed' };
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const revenue = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          discount: { $sum: '$couponDiscount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      revenue: revenue || []
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: error.message
    });
  }
};

export const getCouponAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Coupon usage over time
    const couponUsage = await Order.aggregate([
      {
        $match: {
          couponCode: { $exists: true, $ne: null },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            coupon: '$couponCode'
          },
          usage: { $sum: 1 },
          discount: { $sum: '$couponDiscount' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Most effective coupons
    const effectiveCoupons = await Order.aggregate([
      {
        $match: {
          couponCode: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$couponCode',
          usage: { $sum: 1 },
          totalDiscount: { $sum: '$couponDiscount' },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { usage: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        couponUsage: couponUsage || [],
        effectiveCoupons: effectiveCoupons || []
      }
    });
  } catch (error) {
    console.error('Coupon analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon analytics',
      error: error.message
    });
  }
};
