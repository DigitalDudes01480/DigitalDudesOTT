# OAuth Authentication Setup Guide

## Overview
This guide explains how to set up Google and Facebook OAuth authentication for customer login on your Digital Dudes platform.

---

## What's Been Implemented

### Backend Changes
1. ✅ Updated User model to support OAuth providers (Google, Facebook, Local)
2. ✅ Installed Passport.js and OAuth strategies
3. ✅ Created OAuth configuration (`backend/config/passport.js`)
4. ✅ Added OAuth routes and controllers
5. ✅ Initialized Passport in server.js

### Frontend Changes
1. ✅ Created OAuth callback handler (`frontend/src/pages/AuthCallback.jsx`)
2. ✅ Added OAuth callback route in App.jsx
3. ✅ Updated Login page with Google and Facebook buttons

---

## Setup Instructions

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - Application name: Digital Dudes
   - Authorized domains: `digitaldudes.com`, `vercel.app`
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - `https://frontend-virid-nu-28.vercel.app` (production)
   - Authorized redirect URIs:
     - `http://localhost:5001/api/auth/google/callback` (development)
     - `https://backend-tau-blush-82.vercel.app/api/auth/google/callback` (production)
7. Copy **Client ID** and **Client Secret**

### Step 2: Get Facebook OAuth Credentials

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing one
3. Add **Facebook Login** product
4. Go to **Settings** → **Basic**
5. Copy **App ID** and **App Secret**
6. Go to **Facebook Login** → **Settings**
7. Add Valid OAuth Redirect URIs:
   - `http://localhost:5001/api/auth/facebook/callback` (development)
   - `https://backend-tau-blush-82.vercel.app/api/auth/facebook/callback` (production)
8. Save changes

### Step 3: Update Backend Environment Variables

Add these to your `backend/.env` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# URLs
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:5173
```

### Step 4: Update Vercel Environment Variables

#### Backend (https://backend-tau-blush-82.vercel.app)

Add these environment variables in Vercel dashboard:

```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
BACKEND_URL=https://backend-tau-blush-82.vercel.app
FRONTEND_URL=https://frontend-virid-nu-28.vercel.app
```

#### Frontend (https://frontend-virid-nu-28.vercel.app)

The frontend already has `VITE_API_URL` set. No additional changes needed.

---

## How It Works

### User Flow

1. **User clicks "Google" or "Facebook" button** on login page
2. **Redirected to OAuth provider** (Google/Facebook) for authentication
3. **User authorizes** the application
4. **OAuth provider redirects back** to backend callback URL with authorization code
5. **Backend exchanges code** for user profile information
6. **Backend checks if user exists:**
   - If exists: Returns existing user
   - If new: Creates new user account
7. **Backend generates JWT token** and redirects to frontend callback
8. **Frontend receives token**, stores it, fetches user profile, and redirects to home page

### Database Schema

Users created via OAuth have these fields:

```javascript
{
  name: "John Doe",
  email: "john@gmail.com",
  authProvider: "google", // or "facebook" or "local"
  providerId: "1234567890", // OAuth provider's user ID
  isEmailVerified: true, // Auto-verified for OAuth users
  avatar: "https://...", // Profile picture from OAuth provider
  role: "customer",
  // password field is not required for OAuth users
}
```

---

## Testing

### Local Development

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Go to `http://localhost:5173/login`
4. Click "Google" or "Facebook" button
5. Complete OAuth flow
6. Should redirect back to home page logged in

### Production

1. Ensure all environment variables are set in Vercel
2. Deploy backend and frontend
3. Go to `https://frontend-virid-nu-28.vercel.app/login`
4. Click "Google" or "Facebook" button
5. Complete OAuth flow
6. Should redirect back to home page logged in

---

## Security Considerations

1. **Never commit OAuth secrets** to Git
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** in production (already done with Vercel)
4. **Validate redirect URIs** in OAuth provider settings
5. **Use secure JWT tokens** (already implemented)

---

## Troubleshooting

### "Redirect URI mismatch" error

- Check that redirect URIs in Google/Facebook console match exactly
- Include protocol (http/https), domain, and path
- No trailing slashes

### "Authentication failed" error

- Check environment variables are set correctly
- Verify OAuth credentials are valid
- Check backend logs for detailed error messages

### User not redirected after OAuth

- Check FRONTEND_URL environment variable
- Verify callback route exists in frontend
- Check browser console for errors

---

## API Endpoints

### Google OAuth
- **Initiate:** `GET /api/auth/google`
- **Callback:** `GET /api/auth/google/callback`

### Facebook OAuth
- **Initiate:** `GET /api/auth/facebook`
- **Callback:** `GET /api/auth/facebook/callback`

---

## Next Steps

1. Get OAuth credentials from Google and Facebook
2. Add environment variables to backend `.env`
3. Add environment variables to Vercel (both frontend and backend)
4. Test OAuth flow in development
5. Deploy to production
6. Test OAuth flow in production

---

## Support

If you encounter any issues:
1. Check backend logs for errors
2. Verify all environment variables are set
3. Ensure OAuth credentials are valid
4. Check redirect URIs match exactly
