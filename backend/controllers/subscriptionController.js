import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';

export const getMySubscriptions = async (req, res) => {
  try {
    const { status } = req.query;

    let query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    const subscriptions = await Subscription.find(query)
      .populate('product', 'name ottType image')
      .populate('order', 'orderItems totalAmount')
      .sort('-createdAt');

    const subscriptionsWithTimeRemaining = subscriptions.map(sub => {
      const subObj = sub.toObject();
      const now = new Date();
      const expiry = new Date(sub.expiryDate);
      const diffTime = expiry - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      subObj.daysRemaining = diffDays > 0 ? diffDays : 0;
      subObj.isExpired = now > expiry;
      
      return subObj;
    });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions: subscriptionsWithTimeRemaining
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('product')
      .populate('user', 'name email')
      .populate('order');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this subscription'
      });
    }

    const subObj = subscription.toObject();
    const now = new Date();
    const expiry = new Date(subscription.expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    subObj.daysRemaining = diffDays > 0 ? diffDays : 0;
    subObj.isExpired = now > expiry;

    res.status(200).json({
      success: true,
      subscription: subObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllSubscriptions = async (req, res) => {
  try {
    const { status, ottType, userId } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (ottType) {
      query.ottType = ottType;
    }

    if (userId) {
      query.user = userId;
    }

    const subscriptions = await Subscription.find(query)
      .populate('user', 'name email phone')
      .populate('product', 'name ottType')
      .populate('order')
      .sort('-createdAt');

    const subscriptionsWithTimeRemaining = subscriptions.map(sub => {
      const subObj = sub.toObject();
      const now = new Date();
      const expiry = new Date(sub.expiryDate);
      const diffTime = expiry - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      subObj.daysRemaining = diffDays > 0 ? diffDays : 0;
      subObj.isExpired = now > expiry;
      
      return subObj;
    });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions: subscriptionsWithTimeRemaining
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { status, expiryDate, credentials, activationKey, notes } = req.body;

    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (status) subscription.status = status;
    if (expiryDate) subscription.expiryDate = expiryDate;
    if (credentials) subscription.credentials = credentials;
    if (activationKey) subscription.activationKey = activationKey;
    if (notes) subscription.notes = notes;

    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this subscription'
      });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    
    const expiredSubscriptions = await Subscription.updateMany(
      {
        expiryDate: { $lt: now },
        status: 'active'
      },
      {
        $set: { status: 'expired' }
      }
    );

    console.log(`Updated ${expiredSubscriptions.modifiedCount} expired subscriptions`);
    
    return expiredSubscriptions;
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
  }
};
