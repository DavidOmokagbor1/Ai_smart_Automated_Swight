# 🔧 Web App Connection Fix Guide

## 🎯 Most Likely Issue

**Environment variables are NOT set in Vercel**, so the frontend is trying to connect to `http://localhost:5000` which doesn't exist in production.

## ✅ Quick Fix Steps

### Step 1: Check Current Configuration

1. Open your web app: `https://energy-savings-system.vercel.app` (or your Vercel URL)
2. Open Browser Console (F12 → Console tab)
3. Look for this log message:
   ```
   🔍 [DEBUG] Config loaded: { API_URL: "...", SOCKET_URL: "..." }
   ```

**If you see:**
- `API_URL: "http://localhost:5000"` → ❌ **Environment variables NOT set**
- `API_URL: "https://ai-smart-automated-swight.onrender.com"` → ✅ **Environment variables ARE set**

### Step 2: Set Environment Variables in Vercel

1. Go to: **https://vercel.com/dashboard**
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

#### Variable 1: REACT_APP_API_URL
```
Key: REACT_APP_API_URL
Value: https://ai-smart-automated-swight.onrender.com
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 2: REACT_APP_SOCKET_URL
```
Key: REACT_APP_SOCKET_URL
Value: https://ai-smart-automated-swight.onrender.com
Environments: ✅ Production ✅ Preview ✅ Development
```

### Step 3: Redeploy Frontend

**IMPORTANT:** Environment variables only take effect after redeployment!

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

### Step 4: Verify Connection

1. Open your web app again
2. Open Browser Console (F12)
3. Check for:
   - ✅ `API_URL: "https://ai-smart-automated-swight.onrender.com"`
   - ✅ `✅ [DEBUG] System status success`
   - ✅ `✅ Socket.IO connected successfully`
   - ❌ No CORS errors
   - ❌ No network errors

## 🔍 Debug Information

The app now logs detailed connection information to the browser console:

- **Config loaded**: Shows API_URL and SOCKET_URL values
- **Fetch attempts**: Shows which URLs are being called
- **Response status**: Shows HTTP status codes
- **Socket.IO events**: Shows connection/disconnection events
- **Errors**: Shows detailed error messages

## 🚨 Common Issues

### Issue 1: "API_URL is localhost:5000"
**Cause:** Environment variables not set in Vercel
**Fix:** Follow Step 2 above

### Issue 2: "CORS error"
**Cause:** Backend CORS not allowing your Vercel domain
**Fix:** Add your Vercel URL to `ALLOWED_ORIGINS` in Render environment variables

### Issue 3: "Network error" or "Failed to fetch"
**Cause:** Backend not running or wrong URL
**Fix:** 
1. Check backend is running: `https://ai-smart-automated-swight.onrender.com/api/status`
2. Verify environment variables are correct

### Issue 4: "Socket.IO connection error"
**Cause:** WebSocket connection failing
**Fix:** Check backend supports WebSocket (should work with Eventlet)

## 📋 Checklist

- [ ] Environment variables set in Vercel
- [ ] Frontend redeployed after setting variables
- [ ] Browser console shows correct API_URL
- [ ] No CORS errors in console
- [ ] API calls succeed (check Network tab)
- [ ] Socket.IO connects successfully
- [ ] Dashboard loads with data

---

**After fixing, the web app should connect successfully!** 🎉

