# Email Service Setup Guide

## Current Issue
Emails are not being sent for:
1. Order confirmation (to customer)
2. Admin order notifications
3. Order status updates
4. Subscription delivery with credentials

## Root Cause
The email service requires environment variables to be configured in production. The code is working correctly, but the email service credentials are missing.

## Solution - Configure Email Service

You have 3 options for email service. Choose ONE:

### Option 1: Resend (Recommended - Easiest)

1. Sign up at https://resend.com (Free tier: 100 emails/day)
2. Get your API key from dashboard
3. Add to production environment variables:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=no-reply@digitaldudes.com
   ADMIN_EMAIL=your-admin-email@gmail.com
   ```

### Option 2: AWS SES (Best for Scale)

1. Set up AWS SES and verify your domain
2. Get AWS credentials
3. Add to production environment variables:
   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   EMAIL_FROM=no-reply@digitaldudes.com
   ADMIN_EMAIL=your-admin-email@gmail.com
   ```

### Option 3: SMTP (Gmail, etc.)

1. Enable 2FA on Gmail
2. Generate App Password
3. Add to production environment variables:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=your_email@gmail.com
   ADMIN_EMAIL=your-admin-email@gmail.com
   ```

## How to Add Environment Variables

### If deployed on Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with its value
4. Redeploy the backend

### If deployed on Railway/Render:
1. Go to your service settings
2. Find "Environment Variables" or "Config Vars"
3. Add each variable
4. Service will auto-redeploy

### If using Docker/VPS:
1. Edit your `.env` file
2. Add the variables
3. Restart the service

## Testing

After configuration, test by:
1. Placing a test order
2. Check console logs for email sending status
3. Verify emails arrive in inbox (check spam folder)

## Current Email Flow

The system sends emails at these points:

1. **Order Placed** → Customer receives order confirmation
2. **Order Placed** → Admin receives new order notification
3. **Order Status Changed** → Customer receives status update
4. **Order Delivered** → Customer receives credentials email
5. **Payment Status Changed** → Customer receives payment update

All email functions are already implemented and working. You just need to configure the credentials.
