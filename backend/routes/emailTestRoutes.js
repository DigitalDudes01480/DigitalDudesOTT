import express from 'express';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// Simple email test endpoint (no auth required for testing)
router.post('/simple-test', async (req, res) => {
  try {
    const { to = 'digitaldudes18@gmail.com', subject = 'Test Email', message = 'This is a test email from Digital Dudes' } = req.body;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Test Email - Digital Dudes</h2>
        <p>${message}</p>
        <p style="color: #666; font-size: 14px;">This is a test email from Digital Dudes email system.</p>
        <p style="color: #666; font-size: 14px;">Sent at: ${new Date().toLocaleString()}</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Digital Dudes OTT Platform</p>
      </div>
    `;

    console.log('📧 Testing email service...');
    const result = await sendEmail({
      to,
      subject,
      html
    });

    console.log('📧 Email test result:', result);

    res.status(200).json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
      error: result.error,
      details: {
        to,
        subject,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Simple email test error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.toString()
    });
  }
});

export default router;
