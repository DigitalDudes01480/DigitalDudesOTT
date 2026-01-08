import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

export const sendOrderConfirmation = async (user, order) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Order Confirmation - Digital Dudes</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for your order! Your order ID is: <strong>${order._id}</strong></p>
      <p>Order Total: <strong>$${order.totalAmount}</strong></p>
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
