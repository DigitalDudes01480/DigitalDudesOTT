# 🔑 Google AI Studio API Key Setup Guide

## Step-by-Step Instructions

### Step 1: Visit Google AI Studio
1. Go to: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account

### Step 2: Create API Key
1. Click **"Get API Key"** or **"Create API Key"** button
2. You'll see options:
   - **Create API key in new project** (recommended for new users)
   - **Create API key in existing project** (if you have a Google Cloud project)

3. Click **"Create API key in new project"**
4. Wait a few seconds while Google creates your key

### Step 3: Copy Your API Key
1. Your API key will be displayed (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
2. **IMPORTANT:** Copy this key immediately!
3. Click **"Copy"** button or manually select and copy

### Step 4: Add to Your Backend

#### Option A: Using Terminal (Recommended)
```bash
cd /Users/prajjwal/Desktop/digital-ims/backend
echo "GEMINI_API_KEY=your-actual-api-key-here" >> .env
```

#### Option B: Manual Edit
1. Open file: `/Users/prajjwal/Desktop/digital-ims/backend/.env`
2. Add this line at the end:
   ```
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
3. Replace `AIzaSyXXX...` with your actual key
4. Save the file

### Step 5: Restart Backend Server
```bash
cd /Users/prajjwal/Desktop/digital-ims/backend
npm run dev
```

---

## 🎯 Quick Setup (Copy-Paste)

### 1. Get API Key
Visit: https://makersuite.google.com/app/apikey

### 2. Add to .env file
```bash
# Navigate to backend folder
cd /Users/prajjwal/Desktop/digital-ims/backend

# Add API key (replace with your actual key)
echo "GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" >> .env

# Restart server
npm run dev
```

### 3. Verify It's Working
Check backend logs for:
```
✨ AI-powered chatbot enabled with Google Gemini
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep your API key secret
- Add `.env` to `.gitignore` (already done)
- Never commit API keys to GitHub
- Use environment variables
- Rotate keys periodically

### ❌ DON'T:
- Share your API key publicly
- Commit `.env` file to git
- Hardcode keys in source code
- Use same key for multiple projects

---

## 📊 API Key Limits (Free Tier)

Google Gemini Free Tier includes:
- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

This is MORE than enough for your chatbot!

### Estimated Usage:
- Average conversation: 5-10 requests
- Daily capacity: ~150-300 conversations
- Monthly capacity: ~4,500-9,000 conversations

---

## 🧪 Testing Your API Key

### Method 1: Check Backend Logs
```bash
cd backend
npm run dev
```
Look for: `✨ Gemini AI Service initialized`

### Method 2: Test via Chatbot
1. Go to: https://www.digitaldudesott.shop
2. Open chatbot
3. Send message: "Hello"
4. If AI responds naturally → ✅ Working!
5. If pattern-based response → ⚠️ Check API key

### Method 3: Check Console
Open browser console (F12) when using chatbot:
- `✨ AI-powered response` → Working
- No message → Using fallback

---

## 🔧 Troubleshooting

### Issue: "API key not valid"
**Solution:**
1. Check if key is copied correctly (no extra spaces)
2. Ensure key starts with `AIzaSy`
3. Verify key is active in Google AI Studio

### Issue: "Quota exceeded"
**Solution:**
1. Wait 1 minute (rate limit: 60/min)
2. Or wait until next day (daily limit: 1,500)
3. Consider upgrading to paid tier if needed

### Issue: "AI not responding"
**Solution:**
1. Check `.env` file has correct key
2. Restart backend server
3. Check backend logs for errors
4. Verify internet connection

### Issue: "Fallback to pattern matching"
**Solution:**
1. API key might be missing or invalid
2. Check backend logs for error messages
3. Verify `GEMINI_API_KEY` in `.env`

---

## 📁 File Locations

### Backend .env file:
```
/Users/prajjwal/Desktop/digital-ims/backend/.env
```

### AI Service file:
```
/Users/prajjwal/Desktop/digital-ims/backend/services/geminiAIService.js
```

### Chatbot Controller:
```
/Users/prajjwal/Desktop/digital-ims/backend/controllers/chatbotController.js
```

---

## 🚀 Upgrade to Paid (Optional)

If you need more capacity:

### Google AI Studio Pricing:
- **Free:** 60 RPM, 1,500 RPD
- **Pay-as-you-go:** $0.00025 per 1K characters
- **Very affordable** for most use cases

### To Upgrade:
1. Go to: https://console.cloud.google.com/
2. Enable billing for your project
3. Same API key works with higher limits

---

## ✅ Verification Checklist

- [ ] Got API key from Google AI Studio
- [ ] Added `GEMINI_API_KEY` to `.env` file
- [ ] Restarted backend server
- [ ] Tested chatbot with natural language
- [ ] Checked backend logs for AI confirmation
- [ ] Verified no errors in console

---

## 🎯 Expected Behavior

### With API Key (AI Mode):
```
Customer: "I'm looking for something to watch movies"
AI: "Hi! For movies and series, I'd recommend Netflix - 
     it has the largest content library with award-winning 
     originals and 4K quality. We also have Prime Video 
     which offers great value. Which interests you more?"
```
**Natural, contextual, intelligent response**

### Without API Key (Fallback Mode):
```
Customer: "I'm looking for something to watch movies"
Bot: "🎬 Available Products:
     1. Netflix ⭐
     2. Prime Video ⭐
     [Shows list]"
```
**Pattern-based, template response**

---

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify API key in Google AI Studio
3. Check backend server logs
4. Test with simple message like "Hello"

---

## 🎉 Success!

Once configured, your chatbot will:
- ✅ Understand natural language
- ✅ Remember conversation context
- ✅ Provide intelligent responses
- ✅ Handle complex queries
- ✅ Offer personalized recommendations

**Your AI chatbot is ready to serve customers!** 🚀
