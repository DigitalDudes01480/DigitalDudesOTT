# Railway.app Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (recommended) or email
3. Verify your account

### 2. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select the `digital-ims` repository
5. Choose the `backend` folder as root directory

### 3. Configure Environment Variables
In Railway dashboard, add these variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://digitaldudes18_db_user:4jeyXrAXrqXTMizs@cluster0.zgql3hs.mongodb.net/digital-dudes?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=DigitalDudes2026SecretKey!@#$%
JWT_EXPIRE=7d
PORT=5000
ADMIN_EMAIL=digitaldudes18@gmail.com
ADMIN_PASSWORD=Prajjwal@123
BACKEND_URL=https://your-app.railway.app
FRONTEND_URL=https://www.digitaldudesott.shop
EMAIL_FROM=no-reply@digitaldudes.com
```

### 4. Deploy
1. Railway will auto-detect Node.js
2. It will run `npm install` and `npm start`
3. Wait for deployment to complete (2-3 minutes)
4. Copy your Railway app URL (e.g., `https://digital-dudes-backend-production.up.railway.app`)

### 5. Update Frontend
Update `/Users/prajjwal/Desktop/digital-ims/frontend/src/utils/api.js`:
```javascript
const API_URL = 'https://your-railway-url.railway.app/api';
```

### 6. Redeploy Frontend
```bash
cd /Users/prajjwal/Desktop/digital-ims/frontend
npm run build
vercel --prod --yes
```

## ✅ Why Railway is Better

1. **Traditional Node.js hosting** - Not serverless, so no cold starts
2. **Better for Express + MongoDB** - Handles persistent connections properly
3. **Free tier** - $5/month credit, enough for small apps
4. **Easy setup** - Auto-detects and configures everything
5. **Reliable** - No FUNCTION_INVOCATION_FAILED errors

## 🔧 Files Created for Railway

- `.railwayignore` - Excludes unnecessary files
- `railway.json` - Deployment configuration

## 📝 Alternative: Manual CLI Deployment

If you prefer CLI:
```bash
cd /Users/prajjwal/Desktop/digital-ims/backend
railway login
railway init
railway up
railway variables set MONGODB_URI="mongodb+srv://..."
# Add all other variables
railway open
```

## 🎯 Expected Result

After deployment:
- Backend URL: `https://your-app.railway.app`
- All API endpoints working: `/api/products`, `/api/categories`, etc.
- Database loading properly
- Website fully functional

---

**Note:** Railway CLI is installed and ready to use if needed.
