# Digital Dudes - Deployment Guide

## 🚀 Quick Deployment Steps

### Prerequisites
- GitHub account (for connecting to hosting services)
- MongoDB Atlas account (free tier) - https://www.mongodb.com/cloud/atlas
- Render.com account (free tier) - https://render.com
- Vercel account (free tier) - https://vercel.com

---

## Step 1: Setup MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/digital-dudes`)
6. Replace `<password>` with your actual password
7. Save this connection string - you'll need it for backend deployment

---

## Step 2: Deploy Backend to Render.com

### Option A: Using render.yaml (Automatic)

1. Go to https://render.com and sign up
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository or upload the `/backend` folder
4. Render will detect the `render.yaml` file and auto-configure
5. Add these environment variables in Render dashboard:
   ```
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=create-a-random-secret-key-here
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

### Option B: Manual Setup

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub or upload `/backend` folder
4. Configure:
   - **Name:** digital-dudes-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     NODE_ENV=production
     PORT=5001
     MONGODB_URI=your-mongodb-atlas-connection-string
     JWT_SECRET=your-random-secret-key
     JWT_EXPIRE=7d
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```

5. Click "Create Web Service"
6. Wait for deployment (5-10 minutes)
7. **Copy your backend URL** (e.g., `https://digital-dudes-backend.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend folder
cd /Users/prajjwal/Desktop/digital-ims/frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and deploy to production
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com and sign up
2. Click "Add New Project"
3. Import your GitHub repository or upload `/frontend` folder
4. Vercel will auto-detect Vite configuration
5. Add Environment Variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.onrender.com/api`
6. Click "Deploy"
7. Your site will be live at: `https://your-project.vercel.app`

---

## Step 4: Update Backend CORS Settings

After deploying frontend, update the backend environment variable:

In Render dashboard:
- Go to your backend service
- Environment → Add/Edit:
  ```
  FRONTEND_URL=https://your-actual-frontend-url.vercel.app
  ```
- Save and redeploy

---

## Step 5: Test Your Deployment

1. Visit your frontend URL: `https://your-project.vercel.app`
2. Test registration and login
3. Test product browsing
4. Test cart and checkout
5. Test admin panel

---

## Custom Domain (Optional)

### For Frontend (Vercel):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### For Backend (Render):
1. Go to Service Settings → Custom Domain
2. Add your custom domain
3. Update DNS records as instructed

---

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/digital-dudes
JWT_SECRET=your-super-secret-random-key
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend (Vercel Environment Variables)
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## Troubleshooting

### Backend Issues:
- **500 Error:** Check MongoDB connection string
- **CORS Error:** Verify FRONTEND_URL is set correctly
- **Build Failed:** Check Node.js version (use Node 18+)

### Frontend Issues:
- **API Not Connecting:** Verify VITE_API_URL is correct
- **Build Failed:** Run `npm install` and `npm run build` locally first
- **404 on Refresh:** Vercel should handle this automatically with vercel.json

### Database Issues:
- **Connection Timeout:** Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas Network Access
- **Authentication Failed:** Check username/password in connection string

---

## Cost Estimate

- **MongoDB Atlas:** FREE (M0 tier - 512MB storage)
- **Render.com:** FREE (750 hours/month, sleeps after 15 min inactivity)
- **Vercel:** FREE (100GB bandwidth/month)

**Total Monthly Cost: $0** (Free tier)

---

## Upgrade Options (When You Grow)

- **Render:** $7/month for always-on backend
- **MongoDB Atlas:** $9/month for M2 tier (2GB storage)
- **Vercel:** $20/month for Pro (unlimited bandwidth)

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Logs
3. Check MongoDB Atlas: Metrics & Logs

---

## Security Checklist Before Going Live

- [ ] Change JWT_SECRET to a strong random string
- [ ] Update admin credentials in database
- [ ] Enable MongoDB Atlas IP whitelist (or use 0.0.0.0/0 for cloud services)
- [ ] Add your domain to CORS whitelist
- [ ] Review and update .env.example files
- [ ] Never commit .env files to Git
- [ ] Enable HTTPS (automatic on Vercel and Render)
- [ ] Set up database backups in MongoDB Atlas

---

## Next Steps After Deployment

1. Set up custom domain
2. Configure email service for notifications
3. Set up payment gateway (Khalti/Bank Transfer already configured)
4. Monitor usage and performance
5. Set up analytics (Google Analytics, etc.)
6. Create backup strategy

---

**Your website is now live! 🎉**

Frontend: https://your-project.vercel.app
Backend: https://your-backend.onrender.com
Admin Panel: https://your-project.vercel.app/admin
