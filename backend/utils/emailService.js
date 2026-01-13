import nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const createSmtpTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const sendViaSES = async ({ to, subject, html }) => {
  const from = process.env.EMAIL_FROM;

  if (!from) {
    return { success: false, error: 'EMAIL_FROM is not configured' };
  }

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return { success: false, error: 'AWS SES credentials are not configured' };
  }

  try {
    const command = new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } }
      }
    });

    await sesClient.send(command);
    return { success: true };
  } catch (error) {
    return { success: false, error: error?.message || 'SES send failed' };
  }
};

const sendViaResend = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY is not configured' };
  }

  if (!from) {
    return { success: false, error: 'EMAIL_FROM is not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html
      })
    });

    if (!response.ok) {
      let details = '';
      try {
        const data = await response.json();
        details = data?.message || JSON.stringify(data);
      } catch (e) {
        details = await response.text();
      }
      return { success: false, error: `Resend API error: ${details}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error?.message || 'Resend API request failed' };
  }
};

export const sendEmail = async (options) => {
  try {
    const recipientEmail = options.to || options.email;
    
    if (!recipientEmail) {
      console.error('No recipient email provided');
      return { success: false, error: 'No recipient email provided' };
    }

    // Try SES first (preferred if domain is verified in SES)
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const result = await sendViaSES({
        to: recipientEmail,
        subject: options.subject,
        html: options.html
      });
      if (!result.success) {
        console.error('SES send error:', result.error);
      }
      return result;
    }

    // Try Resend next
    if (process.env.RESEND_API_KEY) {
      const result = await sendViaResend({
        to: recipientEmail,
        subject: options.subject,
        html: options.html
      });
      if (!result.success) {
        console.error('Resend send error:', result.error);
      }
      return result;
    }

    // Fallback to SMTP
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: options.subject,
      html: options.html
    };

    const transporter = createSmtpTransporter();
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

export const sendOrderConfirmation = async (user, order) => {
  const itemsHtml = (order.orderItems || [])
    .map((item) => {
      const duration = item?.duration?.value && item?.duration?.unit ? `${item.duration.value} ${item.duration.unit}` : '';
      const customerEmail = item?.customerEmail ? ` (${item.customerEmail})` : '';
      const profile = item?.selectedProfile ? `<p><strong>Profile:</strong> ${item.selectedProfile}</p>` : '';
      const pin = item?.pin ? `<p><strong>Pin:</strong> ${item.pin}</p>` : '';
      const notes = item?.notes ? `<p><strong>Notes:</strong> ${item.notes}</p>` : '';
      return `
        <li style="margin-bottom: 20px; border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px;">
          <p><strong>${item.ottType || item.name}</strong>${duration ? ` - ${duration}` : ''}${customerEmail}</p>
          ${profile}
          ${pin}
          ${notes}
        </li>
      `;
    })
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="https://frontend-virid-nu-28.vercel.app/images/Untitled%20design-5.png" alt="Digital Dudes" style="max-width: 200px; height: auto;" />
      </div>
      <h2 style="color: #4F46E5;">Order Confirmation - Digital Dudes</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for your order! Your order ID is: <strong>${order._id}</strong></p>
      <p>Order Total: <strong>$${order.totalAmount}</strong></p>
      <div style="margin: 24px 0;">
        <h3 style="margin-bottom: 12px;">Order Details:</h3>
        <ul style="list-style: none; padding: 0;">${itemsHtml}</ul>
      </div>
      <p>We will process your order and deliver your subscription details shortly.</p>
      <p>Best regards,<br>Digital Dudes Team</p>
    </div>
  `;

  return await sendEmail({
    email: user.email,
    subject: 'Order Confirmation - Digital Dudes',
    html
  });
};

export const sendAdminNewOrderNotification = async (adminEmail, order) => {
  if (!adminEmail) {
    return { success: true };
  }

  const itemsHtml = (order.orderItems || [])
    .map((item) => {
      const duration = item?.duration?.value && item?.duration?.unit ? `${item.duration.value} ${item.duration.unit}` : '';
      const customerEmail = item?.customerEmail ? ` (${item.customerEmail})` : '';
      return `<li>${item.ottType || item.name}${duration ? ` - ${duration}` : ''}${customerEmail}</li>`;
    })
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">New Order Received - Digital Dudes</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Total:</strong> $${order.totalAmount}</p>
      <p><strong>Customer:</strong> ${order.user?.name || ''} (${order.user?.email || ''})</p>
      <p><strong>Status:</strong> ${order.orderStatus}</p>
      <div style="margin: 16px 0;">
        <strong>Items:</strong>
        <ul>${itemsHtml}</ul>
      </div>
    </div>
  `;

  return await sendEmail({
    email: adminEmail,
    subject: `New Order Received - ${order._id}`,
    html
  });
};

export const sendOrderStatusUpdate = async (user, order, previousStatus) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Order Update - Digital Dudes</h2>
      <p>Hi ${user.name},</p>
      <p>Your order <strong>${order._id}</strong> has been updated.</p>
      ${previousStatus ? `<p><strong>Previous status:</strong> ${previousStatus}</p>` : ''}
      <p><strong>Current status:</strong> ${order.orderStatus}</p>
      <p>Best regards,<br>Digital Dudes Team</p>
    </div>
  `;

  return await sendEmail({
    email: user.email,
    subject: `Order Update - ${order.orderStatus}`,
    html
  });
};

export const sendSubscriptionDelivery = async (user, subscription, deliveryDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Your Subscription is Ready!</h2>
      <p>Hi ${user.name},</p>
      <p>Your ${subscription.ottType} subscription has been activated!</p>
      ${deliveryDetails.credentials ? `
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Login Credentials:</h3>
          <p><strong>Email:</strong> ${deliveryDetails.credentials.email}</p>
          <p><strong>Password:</strong> ${deliveryDetails.credentials.password}</p>
        </div>
      ` : ''}
      ${deliveryDetails.activationKey ? `
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Activation Key:</h3>
          <p><strong>${deliveryDetails.activationKey}</strong></p>
        </div>
      ` : ''}
      ${deliveryDetails.instructions ? `
        <div style="margin: 20px 0;">
          <h3>Instructions:</h3>
          <p>${deliveryDetails.instructions}</p>
        </div>
      ` : ''}
      <p>Subscription valid until: <strong>${new Date(subscription.expiryDate).toLocaleDateString()}</strong></p>
      <p>Best regards,<br>Digital Dudes Team</p>
    </div>
  `;

  return await sendEmail({
    email: user.email,
    subject: `Your ${subscription.ottType} Subscription is Ready!`,
    html
  });
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Reset Your Password - Digital Dudes</h2>
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your password. Click the button below to set a new password.</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 18px; background: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 8px;">Reset Password</a>
      </div>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>This link will expire soon for security reasons.</p>
      <p>Best regards,<br>Digital Dudes Team</p>
    </div>
  `;

  return await sendEmail({
    email: user.email,
    subject: 'Reset Your Password - Digital Dudes',
    html
  });
};
