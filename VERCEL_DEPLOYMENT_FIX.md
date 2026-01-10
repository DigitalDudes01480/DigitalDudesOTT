# Fix Own Account Feature on Live Website

## Problem
The `requiresOwnAccount` checkbox is not working on the live website because:
1. Existing products in the production database don't have the `requiresOwnAccount` field
2. Vercel environment variables may not be properly configured

## Solution - Step by Step

### Step 1: Configure Vercel Environment Variables

#### For Frontend (https://frontend-virid-nu-28.vercel.app)

1. Go to https://vercel.com/dashboard
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Add this variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://backend-tau-blush-82.vercel.app/api`
   - **Environment:** Production, Preview, Development (check all)
5. Click **Save**
6. Go to **Deployments** tab
7. Click the **...** menu on the latest deployment
8. Click **Redeploy** → **Redeploy**

#### For Backend (https://backend-tau-blush-82.vercel.app)

1. Go to https://vercel.com/dashboard
2. Select your backend project
3. Verify these environment variables exist:
   - `MONGODB_URI` - Your production MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `NODE_ENV` - Set to `production`
   - All other variables from `.env.example`

### Step 2: Run Database Migration

You need to add the `requiresOwnAccount` field to all existing products in your production database.

#### Option A: Run Migration Locally (Recommended)

1. **Update your local `.env` to point to production database:**
   ```bash
   cd /Users/prajjwal/Desktop/digital-ims/backend
   ```

2. **Temporarily change MONGODB_URI in `.env` to your production database**
   ```
   MONGODB_URI=your_production_mongodb_uri_here
   ```

3. **Run the migration:**
   ```bash
   node seeders/addRequiresOwnAccountField.js
   ```

4. **Change `.env` back to local database**

#### Option B: Update Products Manually via Admin Panel

1. Go to https://frontend-virid-nu-28.vercel.app
2. Login as admin
3. Go to Product Management
4. Edit each product one by one
5. Check or uncheck "Own Account" as needed
6. Save each product

### Step 3: Verify the Fix

1. Go to https://frontend-virid-nu-28.vercel.app
2. Login with: `admin@digitaldudes.com` / `Admin@123`
3. Go to **Admin Panel** → **Product Management**
4. Click **Edit** on any product
5. Scroll to Profile Types section
6. Check the **"Own Account"** checkbox
7. You should see a green **"✓ Enabled"** badge
8. Click **Save**
9. Refresh the page and edit the same product
10. The checkbox should remain checked ✅

### Step 4: Test on Product Detail Page

1. Go to the shop page
2. Click on a product that has "Own Account" enabled
3. Select the profile type with "Own Account"
4. You should see an email input field appear
5. The field should say "Your Email Address *"

## Quick Fix Commands

```bash
# Navigate to project
cd /Users/prajjwal/Desktop/digital-ims

# Commit and push migration script
git add backend/seeders/addRequiresOwnAccountField.js
git commit -m "Add migration script for requiresOwnAccount field"
git push origin main

# Run migration (after updating .env to production DB)
cd backend
node seeders/addRequiresOwnAccountField.js
```

## What Was Fixed in the Code

1. ✅ **State Management** - All `setFormData` calls now use callback pattern
2. ✅ **Backend Controllers** - Properly handle `requiresOwnAccount` field
3. ✅ **Product Model** - Has `requiresOwnAccount` field with default `false`
4. ✅ **Frontend UI** - Shows green badge when enabled
5. ✅ **Email Input** - Appears on product detail, cart, and checkout pages

## If Still Not Working

1. **Check Browser Console** for errors
2. **Check Network Tab** to see API requests
3. **Verify Backend Response** includes `requiresOwnAccount` field:
   ```bash
   curl https://backend-tau-blush-82.vercel.app/api/products | jq '.products[0].profileTypes[0]'
   ```
4. **Clear Browser Cache** and hard refresh (Cmd+Shift+R)
5. **Check Vercel Deployment Logs** for build errors

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Ensure MongoDB connection is working
4. Run the migration script on production database
