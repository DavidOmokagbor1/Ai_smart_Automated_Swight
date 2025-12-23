# 🔗 Connect Vercel Frontend to Render Backend - Step by Step

## ✅ Your Backend is Live!
**Render Backend URL:** `https://ai-smart-automated-swight.onrender.com`

Now let's connect your Vercel frontend to it.

---

## 🎯 Step 1: Go to Vercel Dashboard

1. Open: **https://vercel.com/dashboard**
2. Click on your project (the frontend)

---

## 🎯 Step 2: Set Environment Variables

1. Click **"Settings"** tab (left sidebar)
2. Click **"Environment Variables"** (under Settings)

### Add Variable 1: REACT_APP_API_URL

1. Click **"Add New"** button
2. Fill in:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://ai-smart-automated-swight.onrender.com`
   - **Environments:** ✅ Check ALL THREE:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
3. Click **"Save"**

### Add Variable 2: REACT_APP_SOCKET_URL

1. Click **"Add New"** button again
2. Fill in:
   - **Key:** `REACT_APP_SOCKET_URL`
   - **Value:** `https://ai-smart-automated-swight.onrender.com`
   - **Environments:** ✅ Check ALL THREE:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
3. Click **"Save"**

---

## 🎯 Step 3: Redeploy Frontend

**IMPORTANT:** Environment variables only take effect after redeployment!

1. Go to **"Deployments"** tab
2. Find your latest deployment
3. Click the **"..."** (three dots) menu
4. Click **"Redeploy"**
5. Click **"Redeploy"** to confirm
6. Wait 2-3 minutes for deployment to complete

---

## 🎯 Step 4: Test the Connection

1. Open your Vercel frontend URL in a browser
2. Open **Browser Console** (Press F12)
3. Go to **"Console"** tab
4. Look for:
   - ✅ No CORS errors
   - ✅ API calls going to Render URL
   - ✅ WebSocket connection established

### Test API Connection:
1. In browser console, type:
   ```javascript
   fetch('https://ai-smart-automated-swight.onrender.com/api/status')
     .then(r => r.json())
     .then(console.log)
   ```
2. Should return JSON with lights and energy data

---

## ✅ Success Indicators

Your connection is working if:
- ✅ No CORS errors in console
- ✅ Dashboard loads with data
- ✅ Lights can be toggled
- ✅ Real-time updates work
- ✅ Weather data loads

---

## 🚨 Troubleshooting

### CORS Errors?

**Error:** `Access to fetch at '...' has been blocked by CORS policy`

**Fix:**
1. Go to Render dashboard
2. Service → **Environment** tab
3. Check `ALLOWED_ORIGINS` includes your Vercel URL
4. Should include: `https://your-vercel-url.vercel.app`
5. Restart Render service

### API Not Found (404)?

**Check:**
1. Render backend is "Live" (not sleeping)
2. Test backend directly: `https://ai-smart-automated-swight.onrender.com/api/status`
3. Should return JSON data

### WebSocket Not Connecting?

**Check:**
1. Both `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` are set
2. Both point to same Render URL
3. Render service supports WebSocket (it does with eventlet)

### Environment Variables Not Working?

**Verify:**
1. Variables are set in Vercel dashboard (not just vercel.json)
2. All three environments are checked (Production, Preview, Development)
3. Frontend was **redeployed** after adding variables
4. Check build logs show variables are being used

---

## 📋 Quick Checklist

- [ ] Render backend is "Live"
- [ ] `REACT_APP_API_URL` set in Vercel dashboard
- [ ] `REACT_APP_SOCKET_URL` set in Vercel dashboard
- [ ] Both variables enabled for all environments
- [ ] Frontend redeployed after adding variables
- [ ] No CORS errors in browser console
- [ ] API calls work
- [ ] WebSocket connects

---

## 🎉 That's It!

Once you've set the environment variables and redeployed, your frontend will automatically connect to your Render backend!

**Need Help?** Check the browser console for specific error messages.




