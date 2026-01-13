import SharedProfileCode from '../models/SharedProfileCode.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';

// Generate and send shared profile code
export const generateSharedProfileCode = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { userId, notes } = req.body;

    // Verify subscription exists and is shared profile
    const subscription = await Subscription.findById(subscriptionId)
      .populate('user')
      .populate('product');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (!subscription.credentials.isSharedProfile) {
      return res.status(400).json({
        success: false,
        message: 'This is not a shared profile subscription'
      });
    }

    // Check if user already has an active code
    const existingCode = await SharedProfileCode.findOne({
      subscription: subscriptionId,
      user: userId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active code for this subscription'
      });
    }

    // Generate new code
    const code = SharedProfileCode.generateCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    const sharedCode = new SharedProfileCode({
      subscription: subscriptionId,
      code,
      user: userId,
      expiresAt,
      notes
    });

    await sharedCode.save();

    // Get user details for email
    const user = await User.findById(userId);

    // Send email with code
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Shared Profile Access Code</h2>
        <p>Hi ${user.name},</p>
        <p>Your access code for <strong>${subscription.ottType}</strong> shared profile is ready!</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">Your Access Code:</h3>
          <div style="font-size: 24px; font-weight: bold; color: #4F46E5; letter-spacing: 2px; background: white; padding: 15px; border-radius: 4px; border: 2px solid #4F46E5;">
            ${code}
          </div>
        </div>
        <p><strong>Important:</strong></p>
        <ul>
          <li>This code will expire in 24 hours</li>
          <li>Keep this code secure and do not share it</li>
          <li>Use this code to access your shared profile</li>
        </ul>
        <p>Best regards,<br>Digital Dudes Team</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: `Shared Profile Access Code - ${subscription.ottType}`,
      html: emailHtml
    });

    res.status(201).json({
      success: true,
      message: 'Shared profile code generated and sent successfully',
      data: {
        code: sharedCode.code,
        expiresAt: sharedCode.expiresAt
      }
    });

  } catch (error) {
    console.error('Error generating shared profile code:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Request shared profile code (from customer dashboard)
export const requestSharedProfileCode = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    // Verify subscription exists and user has access
    const subscription = await Subscription.findById(subscriptionId)
      .populate('user')
      .populate('product');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (!subscription.credentials.isSharedProfile) {
      return res.status(400).json({
        success: false,
        message: 'This is not a shared profile subscription'
      });
    }

    // Add request to subscription
    const request = {
      user: userId,
      status: 'pending',
      requestDate: new Date()
    };

    subscription.sharedProfileRequests.push(request);
    await subscription.save();

    // Notify admin of new request
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">New Shared Profile Code Request</h2>
          <p>A customer has requested a shared profile access code:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Customer:</strong> ${req.user.name} (${req.user.email})</p>
            <p><strong>Subscription:</strong> ${subscription.ottType}</p>
            <p><strong>Subscription ID:</strong> ${subscription._id}</p>
            <p><strong>Request Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>Please review this request and generate a code if approved.</p>
          <p>Best regards,<br>Digital Dudes System</p>
        </div>
      `;

      await sendEmail({
        email: adminEmail,
        subject: `New Shared Profile Code Request - ${subscription.ottType}`,
        html: adminHtml
      });
    }

    res.status(201).json({
      success: true,
      message: 'Shared profile code request submitted successfully'
    });

  } catch (error) {
    console.error('Error requesting shared profile code:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Validate shared profile code
export const validateSharedProfileCode = async (req, res) => {
  try {
    const { code } = req.params;

    const sharedCode = await SharedProfileCode.findOne({
      code: code.toUpperCase(),
      status: 'active'
    })
      .populate('subscription')
      .populate('user');

    if (!sharedCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired code'
      });
    }

    if (sharedCode.isExpired) {
      sharedCode.status = 'expired';
      await sharedCode.save();
      return res.status(400).json({
        success: false,
        message: 'Code has expired'
      });
    }

    if (sharedCode.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'Code has already been used'
      });
    }

    // Mark code as used
    sharedCode.status = 'used';
    sharedCode.usedAt = new Date();
    sharedCode.usedBy = req.user?.id || null;
    sharedCode.accessCount += 1;
    await sharedCode.save();

    res.status(200).json({
      success: true,
      message: 'Code validated successfully',
      data: {
        subscription: sharedCode.subscription,
        credentials: {
          email: sharedCode.subscription.credentials.email,
          profile: sharedCode.subscription.credentials.profile,
          profilePin: sharedCode.subscription.credentials.profilePin,
          additionalNote: sharedCode.subscription.credentials.additionalNote
        }
      }
    });

  } catch (error) {
    console.error('Error validating shared profile code:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's shared profile codes
export const getUserSharedProfileCodes = async (req, res) => {
  try {
    const userId = req.user.id;

    const codes = await SharedProfileCode.find({ user: userId })
      .populate('subscription')
      .populate('subscription.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: codes
    });

  } catch (error) {
    console.error('Error getting user shared profile codes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all shared profile requests (admin)
export const getSharedProfileRequests = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      'sharedProfileRequests.0': { $exists: true }
    })
      .populate('sharedProfileRequests.user')
      .populate('user')
      .populate('product')
      .sort({ 'sharedProfileRequests.requestDate': -1 });

    const requests = [];
    subscriptions.forEach(subscription => {
      subscription.sharedProfileRequests.forEach(request => {
        if (request.status === 'pending') {
          requests.push({
            ...request.toObject(),
            subscription: {
              _id: subscription._id,
              ottType: subscription.ottType,
              user: subscription.user,
              product: subscription.product
            }
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error getting shared profile requests:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
