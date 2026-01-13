import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendEmail, emailTemplates } from '../utils/emailService.js';

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
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    // Find expired subscriptions
    const expiredSubscriptions = await Subscription.find({
      expiryDate: { $lt: now },
      status: 'active'
    }).populate('user').catch(err => {
      console.error('Error finding expired subscriptions:', err);
      return [];
    });

    for (const subscription of expiredSubscriptions) {
      try {
        subscription.status = 'expired';
        await subscription.save();
      } catch (saveError) {
        console.error(`Failed to update subscription ${subscription._id}:`, saveError);
      }
    }

    // Find subscriptions expiring in 3 days
    const expiringSubscriptions = await Subscription.find({
      expiryDate: { $gte: now, $lte: threeDaysFromNow },
      status: 'active'
    }).populate('user').catch(err => {
      console.error('Error finding expiring subscriptions:', err);
      return [];
    });

    // Send expiry warning emails
    for (const subscription of expiringSubscriptions) {
      try {
        if (!subscription) continue;
        if (!subscription.user) {
          console.warn(`Subscription ${subscription._id} has no user`);
          continue;
        }
        if (!subscription.user.email) {
          console.warn(`User ${subscription.user._id} has no email`);
          continue;
        }
        
        const daysRemaining = Math.ceil((new Date(subscription.expiryDate) - now) / (1000 * 60 * 60 * 24));
        const emailData = emailTemplates.subscriptionExpiring({
          ...subscription.toObject(),
          daysRemaining
        }, subscription.user);
        
        await sendEmail({
          to: subscription.user.email,
          subject: emailData.subject,
          html: emailData.html
        });
      } catch (emailError) {
        console.error(`Failed to send expiry email for subscription ${subscription?._id}:`, emailError);
      }
    }

    console.log(`Checked subscriptions: ${expiredSubscriptions.length} expired, ${expiringSubscriptions.length} expiring soon`);
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
    // Don't throw - let the function complete gracefully
  }
};

// Customer requests sign-in code
export const requestSignInCode = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this subscription'
      });
    }

    // Check if credential type is loginPin
    if (subscription.credentials?.credentialType !== 'loginPin') {
      return res.status(400).json({
        success: false,
        message: 'Sign-in code requests are only available for Login PIN credentials'
      });
    }

    // Add request to the array
    subscription.signInCodeRequests.push({
      requestedAt: new Date(),
      status: 'pending'
    });

    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Sign-in code request submitted. Admin will send the code shortly.',
      subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin sends sign-in code to customer
export const sendSignInCode = async (req, res) => {
  try {
    const { subscriptionId, requestId, code } = req.body;

    const subscription = await Subscription.findById(subscriptionId)
      .populate('user', 'name email')
      .populate('product', 'name ottType');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Find the request
    const request = subscription.signInCodeRequests.id(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Update request status
    request.status = 'sent';
    request.code = code;
    request.sentAt = new Date();

    await subscription.save();

    // Send email to customer with the sign-in code
    try {
      await sendEmail({
        to: subscription.user.email,
        subject: `Sign-In Code for ${subscription.product.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your Sign-In Code</h2>
            <p>Hello ${subscription.user.name},</p>
            <p>Here is your sign-in code for <strong>${subscription.product.name}</strong>:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
              ${code}
            </div>
            <p><strong>Email:</strong> ${subscription.credentials.email}</p>
            <p>Use this code to sign in to your account.</p>
            <p>If you didn't request this code, please contact support immediately.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This is an automated message from Digital Dudes OTT.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send sign-in code email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Sign-in code sent successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin gets all pending sign-in code requests
export const getSignInCodeRequests = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      'signInCodeRequests.status': 'pending'
    })
      .populate('user', 'name email')
      .populate('product', 'name ottType image')
      .sort('-signInCodeRequests.requestedAt');

    // Filter to only include subscriptions with pending requests
    const requestsData = subscriptions.map(sub => {
      const pendingRequests = sub.signInCodeRequests.filter(req => req.status === 'pending');
      return {
        subscription: sub,
        pendingRequests
      };
    }).filter(item => item.pendingRequests.length > 0);

    res.status(200).json({
      success: true,
      count: requestsData.length,
      requests: requestsData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
