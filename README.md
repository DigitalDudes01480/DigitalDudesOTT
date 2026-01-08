# Digital Dudes - OTT Subscription eCommerce Platform

A complete, production-ready full-stack eCommerce platform for selling digital OTT subscriptions (Netflix, Prime Video, Disney+, Spotify, YouTube Premium, etc.) with instant or admin-managed delivery.

## 🚀 Features

### Customer Features
- **Modern Landing Page** with hero section, trust badges, and testimonials
- **Product Catalog** with filtering and search
- **Shopping Cart** with quantity management
- **Secure Checkout** with Stripe and PayPal integration
- **Customer Dashboard** with:
  - Active subscriptions with expiry tracking
  - Order history
  - Transaction records
  - Profile management
- **Real-time Subscription Status** showing days remaining
- **Instant Email Notifications** for orders and deliveries

### Admin Features
- **Comprehensive Admin Panel** with:
  - Dashboard with analytics and statistics
  - Product management (CRUD operations)
  - Order management and delivery system
  - Subscription monitoring
  - Transaction tracking
  - Customer management
- **Order Delivery System** to assign credentials or activation keys
- **Revenue Analytics** and top products tracking
- **Customer Account Management** (block/unblock)

### Technical Features
- **JWT Authentication** with role-based access control
- **Secure Payment Processing** (Stripe & PayPal)
- **Automated Subscription Expiry** tracking
- **Email Notifications** for orders and deliveries
- **Responsive Design** (mobile + desktop)
- **Dark Mode Support**
- **RESTful API** architecture
- **MongoDB** with optimized schemas and indexes

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Stripe & PayPal** SDKs
- **Axios** for API calls
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Stripe & PayPal** APIs
- **Nodemailer** for emails
- **Helmet** for security
- **Rate Limiting** for API protection

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Stripe Account (for payment processing)
- PayPal Developer Account (for PayPal payments)
- Gmail Account (for email notifications)

## 🔧 Installation

### 1. Clone the Repository
```bash
cd digital-ims
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/digital-dudes

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

ADMIN_EMAIL=admin@digitaldudes.com
ADMIN_PASSWORD=Admin@123

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@digitaldudes.com

FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

### 4. Database Setup

Make sure MongoDB is running, then seed the database with admin user and sample products:

```bash
cd backend
npm run seed
```

This will create:
- Admin user (admin@digitaldudes.com / Admin@123)
- Sample OTT subscription products

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:5173

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 👤 Default Credentials

### Admin Login
- **Email:** admin@digitaldudes.com
- **Password:** Admin@123

### Test Customer
Register a new account through the signup page.

## 📁 Project Structure

```
digital-ims/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── subscriptionController.js
│   │   ├── transactionController.js
│   │   ├── adminController.js
│   │   └── paymentController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Subscription.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── adminRoutes.js
│   │   └── paymentRoutes.js
│   ├── seeders/
│   │   └── adminSeeder.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── emailService.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── admin/
│   │   │       ├── AdminLayout.jsx
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── ProductManagement.jsx
│   │   │       ├── OrderManagement.jsx
│   │   │       ├── SubscriptionManagement.jsx
│   │   │       ├── TransactionManagement.jsx
│   │   │       └── CustomerManagement.jsx
│   │   ├── store/
│   │   │   ├── useAuthStore.js
│   │   │   └── useCartStore.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   ├── cn.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/all` - Get all orders (Admin)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/deliver` - Deliver order (Admin)

### Subscriptions
- `GET /api/subscriptions/my-subscriptions` - Get user subscriptions
- `GET /api/subscriptions/all` - Get all subscriptions (Admin)
- `GET /api/subscriptions/:id` - Get subscription by ID
- `PUT /api/subscriptions/:id` - Update subscription (Admin)

### Transactions
- `GET /api/transactions/my-transactions` - Get user transactions
- `GET /api/transactions/all` - Get all transactions (Admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/customers` - Get all customers
- `PUT /api/admin/customers/:id/toggle-status` - Block/Unblock customer

### Payment
- `POST /api/payment/stripe/create-intent` - Create Stripe payment intent
- `POST /api/payment/stripe/confirm` - Confirm Stripe payment
- `POST /api/payment/paypal/create-order` - Create PayPal order
- `POST /api/payment/paypal/capture-order` - Capture PayPal payment

## 🎨 Key Features Implementation

### Subscription Expiry Tracking
- Automatic daily check for expired subscriptions
- Real-time days remaining calculation
- Visual indicators for expiring subscriptions

### Order Delivery System
Admin can deliver orders by providing:
- Login credentials (email/password)
- Activation keys
- Custom instructions
- Start date for subscription

### Payment Integration
- **Stripe**: Credit/Debit card payments
- **PayPal**: PayPal account payments
- Automatic order status updates
- Transaction recording

### Email Notifications
- Order confirmation emails
- Subscription delivery emails with credentials
- Welcome emails for new users

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes
- Role-based access control
- Rate limiting on API endpoints
- Helmet.js security headers
- Input validation
- CORS configuration

## 🌐 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables
2. Deploy backend code
3. Run database seeder

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Set environment variables
3. Deploy the `dist` folder

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Update `MONGODB_URI` in backend `.env`
3. Whitelist deployment server IP

## 📝 Environment Variables

### Required Backend Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `STRIPE_SECRET_KEY` - Stripe secret key
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PAYPAL_CLIENT_SECRET` - PayPal secret
- `EMAIL_USER` - Email account for notifications
- `EMAIL_PASSWORD` - Email password/app password

### Required Frontend Variables
- `VITE_API_URL` - Backend API URL
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `VITE_PAYPAL_CLIENT_ID` - PayPal client ID

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string format
- Verify network access (for Atlas)

### Payment Integration Issues
- Verify API keys are correct
- Check Stripe/PayPal dashboard for errors
- Ensure webhook endpoints are configured (for production)

### Email Not Sending
- Use app-specific password for Gmail
- Enable "Less secure app access" or use OAuth2
- Check email service configuration

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

Digital Dudes Team

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!
