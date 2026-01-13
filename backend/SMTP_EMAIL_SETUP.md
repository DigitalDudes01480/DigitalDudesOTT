# SMTP Email Setup Guide - Gmail Configuration

## ✅ SMTP Configuration Added
I've configured your backend to use SMTP (Option 3) with Gmail settings.

## 🔧 Steps to Complete Setup

### 1. Enable 2-Factor Authentication on Gmail
- Go to your Google Account settings
- Enable 2-Factor Authentication if not already enabled

### 2. Create App Password
- Go to: https://myaccount.google.com/apppasswords
- Select "Mail" for the app
- Select "Other (Custom name)" and enter "Digital Dudes Backend"
- Click "Generate"
- Copy the 16-character password (this is your `EMAIL_PASSWORD`)

### 3. Update Environment Variables
Replace these placeholders in your `.env` file:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com          # Your Gmail address
EMAIL_PASSWORD=your_16_char_app_password # The app password you just generated
EMAIL_FROM=no-reply@digitaldudes.com
```

### 4. For Production (Alternative SMTP Services)

#### Option A: Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_email@outlook.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=no-reply@digitaldudes.com
```

#### Option B: SendGrid (Recommended for production)
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=no-reply@digitaldudes.com
```

#### Option C: Mailgun
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your_domain.com
EMAIL_PASSWORD=your_mailgun_password
EMAIL_FROM=no-reply@digitaldudes.com
```

## 🧪 Testing Your Configuration

After setting up your credentials:

```bash
# Restart your backend
npm run dev

# Test email service
curl -X POST http://localhost:5000/api/test/email \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your_email@gmail.com",
    "subject": "Test Email",
    "message": "This is a test email from Digital Dudes"
  }'
```

## 📧 Email Functions Available

✅ **Order Confirmation** - Sent when user places an order
✅ **Admin Notification** - Sent to admin when new order received  
✅ **Order Status Updates** - Sent when order status changes
✅ **Subscription Delivery** - Sent when subscription credentials are delivered
✅ **Password Reset** - Sent when user requests password reset
✅ **Welcome Email** - Sent when user registers
✅ **Subscription Expiry** - Sent when subscription is about to expire

## 🔍 Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Make sure you're using an App Password, not your regular password
   - Check that 2FA is enabled on your Google account

2. **"Connection timeout"**
   - Verify EMAIL_HOST and EMAIL_PORT are correct
   - Check firewall settings

3. **"535-5.7.8 Username and Password not accepted"**
   - Use App Password, not regular password
   - Make sure EMAIL_USER matches your Gmail address exactly

### Debug Mode:
Add this to your `.env` to see detailed SMTP logs:
```bash
DEBUG=nodemailer
```

## 🚀 Production Recommendations

For production, consider using:
- **SendGrid** (more reliable, higher limits)
- **Mailgun** (good for transactional emails)
- **AWS SES** (most cost-effective at scale)

## 📝 Current Configuration Status

✅ SMTP service configured in backend
✅ Fallback mechanism disabled (SMTP only)
✅ Error handling and logging enabled
✅ Professional email templates ready

**Next Step:** Add your Gmail credentials and restart your backend!
