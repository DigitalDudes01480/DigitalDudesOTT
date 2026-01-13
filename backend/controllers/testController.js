import { sendEmail, sendOrderConfirmation } from '../utils/emailService.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

export const testEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide to, subject, and message'
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Test Email - Digital Dudes</h2>
        <p>${message}</p>
        <p style="color: #666; font-size: 14px;">This is a test email from Digital Dudes email system.</p>
        <p style="color: #666; font-size: 14px;">Sent at: ${new Date().toLocaleString()}</p>
      </div>
    `;

    const result = await sendEmail({
      to,
      subject,
      html
    });

    res.status(200).json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
      error: result.error
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const testOrderEmail = async (req, res) => {
  try {
    // Get a test user and order
    const user = await User.findOne().limit(1);
    const order = await Order.findOne().populate('user').limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No users found in database'
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No orders found in database'
      });
    }

    const result = await sendOrderConfirmation(order.user, order);

    res.status(200).json({
      success: result.success,
      message: result.success ? 'Order confirmation email sent successfully' : 'Failed to send order confirmation email',
      error: result.error,
      userEmail: order.user.email,
      orderId: order._id
    });
  } catch (error) {
    console.error('Test order email error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
