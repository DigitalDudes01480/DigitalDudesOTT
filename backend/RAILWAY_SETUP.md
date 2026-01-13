# Railway Deployment Setup

## Required Environment Variables

Make sure these are set in your Railway project:

### Database
- `MONGODB_URI` - Your MongoDB connection string

### Server
- `PORT` - Railway will set this automatically
- `NODE_ENV` - Set to `production`
- `JWT_SECRET` - Your JWT secret key

### Email (Choose one method)
**Option 1: AWS SES**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (default: us-east-1)
- `EMAIL_FROM` (e.g., no-reply@digitaldudes.com)

**Option 2: Resend**
- `RESEND_API_KEY`
- `EMAIL_FROM`

**Option 3: SMTP**
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `EMAIL_FROM`

### OAuth (Optional)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `BACKEND_URL` - Your Railway backend URL
- `FRONTEND_URL` - Your frontend URL

### Payment (Optional)
- `STRIPE_SECRET_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

## Deployment Commands

Railway will automatically:
1. Install dependencies: `npm install`
2. Start server: `node server.js`

## Health Check

Once deployed, verify the server is running:
```
curl https://your-railway-url.railway.app/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T...",
  "uptime": 123.45
}
```

## Troubleshooting

### Server keeps crashing
1. Check Railway logs for error messages
2. Verify `MONGODB_URI` is correct and accessible
3. Ensure all required environment variables are set
4. Check that MongoDB allows connections from Railway's IP

### Database connection fails
1. Whitelist Railway's IP in MongoDB Atlas
2. Or use `0.0.0.0/0` to allow all IPs (less secure)
3. Verify connection string format

### Port binding issues
- Railway automatically sets `PORT` environment variable
- Don't hardcode port 5000, use `process.env.PORT || 5000`
