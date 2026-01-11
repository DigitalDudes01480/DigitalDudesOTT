# 🚂 Railway.app Deployment Guide

## Quick Setup (5 Minutes)

### Step 1: Create Railway Account
1. Go to: https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose: **DigitalDudesOTT**
4. Railway will ask which service to deploy
5. Click "Add variables" before deploying

### Step 3: Configure Service
**IMPORTANT:** Set these BEFORE first deployment:

**Root Directory:** `backend`

**Environment Variables (Add all 9):**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://digitaldudes18_db_user:4jeyXrAXrqXTMizs@cluster0.zgql3hs.mongodb.net/digital-dudes?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=DigitalDudes2026SecretKey!@#$%
JWT_EXPIRE=7d
PORT=5000
ADMIN_EMAIL=digitaldudes18@gmail.com
ADMIN_PASSWORD=Prajjwal@123
FRONTEND_URL=https://www.digitaldudesott.shop
EMAIL_FROM=no-reply@digitaldudes.com
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Railway will auto-detect Node.js and deploy

### Step 5: Get Your URL
1. Click on your service
2. Go to "Settings" → "Networking"
3. Click "Generate Domain"
4. Copy the URL (e.g., `digital-dudes-backend-production.up.railway.app`)

### Step 6: Send Me the URL
**Paste your Railway URL here** and I'll update the frontend!

---

## Why Railway is Better:

✅ **Better rate limits** - More generous than Render
✅ **$5 free credit/month** - Should cover low-medium traffic
✅ **Fast deployment** - Auto-detects everything
✅ **No cold starts** (while credit lasts)
✅ **Good for production** (small scale)

---

**Start here:** https://railway.app

Follow the steps and send me your Railway URL!
