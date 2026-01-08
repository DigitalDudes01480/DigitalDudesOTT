# Digital Dudes - Complete Setup Guide

This guide will walk you through setting up the Digital Dudes OTT Subscription platform from scratch.

## Prerequisites Installation

### 1. Install Node.js
Download and install Node.js (v16+) from https://nodejs.org/

Verify installation:
```bash
node --version
npm --version
```

### 2. Install MongoDB

**Option A: Local MongoDB**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string

### 3. Get Payment Gateway Credentials

**Stripe Setup:**
1. Sign up at https://stripe.com
2. Go to Developers → API Keys
3. Copy your Publishable Key and Secret Key (use test keys for development)

**PayPal Setup:**
1. Sign up at https://developer.paypal.com
2. Create a Sandbox App
3. Copy Client ID and Secret

### 4. Setup Email Service (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Go to Google Account → Security
   - Select "App passwords"
   - Generate password for "Mail"
   - Copy the 16-character password

## Step-by-Step Setup

### Step 1: Project Setup

```bash
cd digital-ims
```

### Step 2: Backend Configuration

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:
```env
NODE_ENV=development
PORT=5000

# MongoDB - Use one of these:
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/digital-dudes
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/digital-dudes

# JWT Secret - Generate a random string
JWT_SECRET=your_random_secret_key_min_32_characters_long
JWT_EXPIRE=7d

# Admin Credentials
ADMIN_EMAIL=admin@digitaldudes.com
ADMIN_PASSWORD=Admin@123

# Stripe Keys (from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# PayPal Keys (from PayPal Developer)
PAYPAL_CLIENT_ID=xxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=xxxxxxxxxxxxx
PAYPAL_MODE=sandbox

# Gmail Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
EMAIL_FROM=noreply@digitaldudes.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Step 3: Frontend Configuration

```bash
cd ../frontend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
VITE_PAYPAL_CLIENT_ID=xxxxxxxxxxxxx
```

### Step 4: Database Seeding

Seed the database with admin user and sample products:

```bash
cd ../backend
npm run seed
```

You should see:
```
MongoDB Connected: localhost
Admin user created successfully
Sample products created successfully
Seeding completed successfully
```

### Step 5: Start the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 6: Access the Application

1. **Customer Site:** http://localhost:5173
2. **Admin Panel:** http://localhost:5173/admin

**Admin Login:**
- Email: admin@digitaldudes.com
- Password: Admin@123

## Testing the Platform

### 1. Test Customer Flow

1. **Register a Customer Account:**
   - Go to http://localhost:5173/register
   - Fill in the form and register

2. **Browse Products:**
   - Go to Shop page
   - View product details

3. **Add to Cart:**
   - Add products to cart
   - View cart

4. **Test Checkout:**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

### 2. Test Admin Flow

1. **Login as Admin:**
   - Go to http://localhost:5173/login
   - Use admin credentials

2. **Manage Products:**
   - Go to Admin → Products
   - Create/Edit/Delete products

3. **Process Orders:**
   - Go to Admin → Orders
   - View pending orders
   - Deliver orders with credentials

4. **Monitor Subscriptions:**
   - Go to Admin → Subscriptions
   - View active/expired subscriptions

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution:**
- Ensure MongoDB is running: `mongod` or check MongoDB service
- For Atlas: Check connection string and whitelist your IP
- Verify `MONGODB_URI` in `.env`

### Issue: Port Already in Use

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Issue: Stripe Payment Fails

**Solution:**
- Verify Stripe keys in both backend and frontend `.env`
- Use test card numbers from Stripe documentation
- Check Stripe dashboard for errors

### Issue: PayPal Payment Fails

**Solution:**
- Ensure PayPal mode is set to `sandbox`
- Verify Client ID and Secret
- Use PayPal sandbox test accounts

### Issue: Emails Not Sending

**Solution:**
- Verify Gmail app password (not regular password)
- Check EMAIL_USER and EMAIL_PASSWORD in `.env`
- Enable "Less secure app access" if using regular password
- Check spam folder

### Issue: Frontend Can't Connect to Backend

**Solution:**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Clear browser cache
- Check browser console for CORS errors

## Production Deployment Checklist

### Backend (Heroku/Railway/Render)

- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB Atlas cluster
- [ ] Use production Stripe keys
- [ ] Use production PayPal credentials
- [ ] Set strong `JWT_SECRET`
- [ ] Configure production email service
- [ ] Set up environment variables
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain

### Frontend (Vercel/Netlify)

- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Use production Stripe publishable key
- [ ] Use production PayPal client ID
- [ ] Build and test locally: `npm run build`
- [ ] Deploy `dist` folder
- [ ] Configure custom domain
- [ ] Enable HTTPS

### Database (MongoDB Atlas)

- [ ] Create production cluster
- [ ] Set up database user
- [ ] Whitelist deployment server IPs
- [ ] Enable backups
- [ ] Set up monitoring

### Security

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable rate limiting
- [ ] Set up SSL/TLS
- [ ] Configure security headers
- [ ] Enable CORS only for trusted domains
- [ ] Set up logging and monitoring

## Maintenance

### Regular Tasks

1. **Monitor Subscriptions:**
   - Check for expired subscriptions daily
   - The system auto-updates, but verify in admin panel

2. **Backup Database:**
   - Set up automated backups in MongoDB Atlas
   - Or use `mongodump` for local backups

3. **Monitor Transactions:**
   - Check for failed payments
   - Process refunds if needed

4. **Update Products:**
   - Keep product catalog updated
   - Adjust prices as needed

### Updating the Application

```bash
# Backend updates
cd backend
git pull
npm install
npm run seed  # If needed
npm start

# Frontend updates
cd frontend
git pull
npm install
npm run build
```

## Support

For issues or questions:
- Check the main README.md
- Review error logs in console
- Check MongoDB logs
- Review Stripe/PayPal dashboards
- Verify all environment variables

## Next Steps

1. Customize branding and colors
2. Add more OTT platforms
3. Implement email templates
4. Add analytics tracking
5. Set up automated testing
6. Configure CI/CD pipeline
7. Add more payment methods
8. Implement referral system
9. Add customer reviews
10. Set up monitoring and alerts

Happy coding! 🚀
