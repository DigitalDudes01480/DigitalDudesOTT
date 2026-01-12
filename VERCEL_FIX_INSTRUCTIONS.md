# Fix Vercel Deployment Error

## Problem
Vercel is looking for `package.json` in `/vercel/path0/` but your repository has this structure:
```
digital-ims/
├── frontend/     <- package.json is here
│   ├── package.json
│   ├── src/
│   └── ...
└── backend/
    ├── package.json
    └── ...
```

## Solution: Configure Root Directory in Vercel

### Step 1: Go to Vercel Project Settings
1. Visit: https://vercel.com/dashboard
2. Click on project: `frontend-virid-nu-28`
3. Click **"Settings"** tab

### Step 2: Set Root Directory
1. In Settings, find **"Root Directory"** section
2. Click **"Edit"**
3. Set to: `frontend`
4. Click **"Save"**

### Step 3: Redeploy
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Or wait for automatic deployment

## Alternative: Use vercel.json in Root

If you can't change settings, add this file to `/Users/prajjwal/Desktop/digital-ims/vercel.json`:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "devCommand": "cd frontend && npm run dev"
}
```

## What This Fixes
- Vercel will now look in the `frontend/` directory for `package.json`
- Build will work correctly
- Deployment will succeed
