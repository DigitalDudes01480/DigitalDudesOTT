import User from '../models/User.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const expiredSubscriptions = await Subscription.countDocuments({ status: 'expired' });
    
    // Calculate revenue from delivered orders only
    const revenueFromOrders = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalRevenue = revenueFromOrders.length > 0 ? revenueFromOrders[0].total : 0;

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product', 'name ottType')
      .sort('-createdAt')
      .limit(10);

    const recentTransactions = await Transaction.find()
      .populate('user', 'name email')
      .populate('order', 'totalAmount')
      .sort('-createdAt')
      .limit(10);

    const monthlyRevenue = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalSales: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          delivered: deliveredOrders
        },
        subscriptions: {
          active: activeSubscriptions,
          expired: expiredSubscriptions
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue
        },
        recentOrders,
        recentTransactions,
        topProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const { isActive, search } = req.query;

    let query = { role: 'customer' };

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await User.find(query)
      .select('-password')
      .sort('-createdAt');

    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({ user: customer._id });
        const subscriptionCount = await Subscription.countDocuments({ user: customer._id });
        const totalSpent = await Transaction.aggregate([
          { $match: { user: customer._id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        return {
          ...customer.toObject(),
          stats: {
            orders: orderCount,
            subscriptions: subscriptionCount,
            totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      count: customers.length,
      customers: customersWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const toggleCustomerStatus = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customer.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify admin account'
      });
    }

    customer.isActive = !customer.isActive;
    await customer.save();

    res.status(200).json({
      success: true,
      message: `Customer ${customer.isActive ? 'activated' : 'deactivated'} successfully`,
      customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCustomerDetails = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const orders = await Order.find({ user: customer._id })
      .populate('orderItems.product')
      .sort('-createdAt');

    const subscriptions = await Subscription.find({ user: customer._id })
      .populate('product')
      .sort('-createdAt');

    const transactions = await Transaction.find({ user: customer._id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      customer,
      orders,
      subscriptions,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
