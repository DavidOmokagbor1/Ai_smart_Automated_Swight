# 🚀 Complete Render Backend Deployment Guide

## 📋 Overview

This guide will walk you through deploying your Flask backend to Render and syncing it with your Vercel frontend deployment.

**Architecture:**
- **Frontend**: Vercel (React App) → `https://energy-savings-system.vercel.app`
- **Backend**: Render (Flask API) → `https://ai-smart-automated-swight.onrender.com`
- **Communication**: REST API + WebSocket (Socket.IO)

---

## 🎯 Step-by-Step Deployment Process

### **Step 1: Prepare Your Repository**

✅ **Verify these files exist in your repo:**
- `render.yaml` (in project root)
- `backend/app.py` (main Flask application)
- `backend/requirements.txt` (Python dependencies)
- `backend/ai_models.py` (AI models)

✅ **Ensure your code is pushed to GitHub:**
```bash
git status
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

### **Step 2: Create Render Account & Service**

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign up or log in with GitHub

2. **Create New Web Service**
   - Click **"New +"** button (top right)
   - Select **"Web Service"**

3. **Connect Your Repository**
   - Click **"Connect account"** if not already connected
   - Select your GitHub account
   - Find and select: `DavidOmokagbor1/Ai_smart_Automated_Swight`
   - Click **"Connect"**

---

### **Step 3: Configure Service Settings**

Render will auto-detect `render.yaml`, but verify these settings:

#### **Basic Settings:**
- **Name**: `ai-smart-automated-swight` (or your preferred name)
- **Region**: `Oregon (US West)` (or closest to your users)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **IMPORTANT**
- **Runtime**: `Python 3`
- **Build Command**: (Auto-detected from render.yaml)
  ```
  pip install --upgrade pip setuptools wheel && pip install --only-binary=:all: scikit-learn numpy pandas && pip install -r requirements.txt
  ```
- **Start Command**: (Auto-detected from render.yaml)
  ```
  gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT app:app
  ```

#### **Plan Selection:**
- **Free Plan**: Good for development/testing
- **Starter Plan**: Better for production ($7/month)
- Select based on your needs

---

### **Step 4: Configure Environment Variables**

Click on **"Environment"** tab and add these variables:

#### **Required Variables:**

1. **FLASK_ENV**
   - Key: `FLASK_ENV`
   - Value: `production`
   - ✅ Add to all environments

2. **SECRET_KEY**
   - Key: `SECRET_KEY`
   - Value: Generate a secure random string (see below)
   - ✅ Add to all environments
   
   **Generate Secret Key:**
   ```python
   import secrets
   print(secrets.token_hex(32))
   ```
   Or use: https://randomkeygen.com/

3. **ALLOWED_ORIGINS**
   - Key: `ALLOWED_ORIGINS`
   - Value: `https://energy-savings-system.vercel.app,https://energy-savings-system-git-main-davidomokagbor1s-projects.vercel.app,http://localhost:3000`
   - ✅ Add to all environments
   - **Note**: Replace with your actual Vercel URLs

4. **PYTHON_VERSION** (Optional - already in render.yaml)
   - Key: `PYTHON_VERSION`
   - Value: `3.10.12`

#### **Optional Variables:**

5. **WEATHER_API_KEY** (Optional)
   - Key: `WEATHER_API_KEY`
   - Value: Your OpenWeatherMap API key
   - Get one at: https://openweathermap.org/api
   - ✅ Add to all environments

6. **WEATHER_CITY** (Optional)
   - Key: `WEATHER_CITY`
   - Value: `New York` (or your preferred city)
   - ✅ Add to all environments

---

### **Step 5: Deploy**

1. **Review Settings**
   - Double-check all environment variables
   - Verify root directory is `backend`
   - Confirm build and start commands

2. **Click "Create Web Service"**
   - Render will start building your service
   - This takes 5-10 minutes for first deployment

3. **Monitor Build Logs**
   - Watch the build process in real-time
   - Look for any errors or warnings
   - Common issues are addressed in Troubleshooting section

---

### **Step 6: Verify Deployment**

Once deployment completes:

1. **Check Service Status**
   - Service should show "Live" status
   - URL will be: `https://ai-smart-automated-swight.onrender.com`

2. **Test Health Endpoint**
   ```bash
   curl https://ai-smart-automated-swight.onrender.com/api/status
   ```
   Should return JSON with lights and energy data.

3. **Test from Browser**
   - Visit: `https://ai-smart-automated-swight.onrender.com/api/status`
   - Should see JSON response

---

### **Step 7: Update Frontend to Use Render Backend**

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Update Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Update or add:
     - `REACT_APP_API_URL` = `https://ai-smart-automated-swight.onrender.com`
     - `REACT_APP_SOCKET_URL` = `https://ai-smart-automated-swight.onrender.com`
   - ✅ Enable for Production, Preview, and Development

3. **Redeploy Frontend**
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Select **"Redeploy"**
   - Or push a new commit to trigger auto-deploy

---

### **Step 8: Test Full Integration**

1. **Open Frontend**
   - Visit your Vercel URL: `https://energy-savings-system.vercel.app`

2. **Open Browser Console** (F12)
   - Check for any CORS errors
   - Verify API calls are going to Render backend
   - Check WebSocket connection status

3. **Test Features**
   - Try toggling lights
   - Check if real-time updates work
   - Verify weather data loads
   - Test AI mode

---

## 🔧 Configuration Files Reference

### **render.yaml** (Project Root)
```yaml
services:
  - type: web
    name: ai-smart-automated-swight
    env: python
    region: oregon
    plan: free
    rootDir: backend
    buildCommand: "pip install --upgrade pip setuptools wheel && pip install --only-binary=:all: scikit-learn numpy pandas && pip install -r requirements.txt"
    startCommand: "gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT app:app"
    envVars:
      - key: PYTHON_VERSION
        value: 3.10.12
      - key: FLASK_ENV
        value: production
    healthCheckPath: /api/status
```

### **backend/app.py** (CORS Configuration)
```python
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=allowed_origins, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins=allowed_origins, allow_credentials=True, async_mode='eventlet')
```

### **frontend/src/config.js**
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
export { API_URL, SOCKET_URL };
```

---

## 🚨 Troubleshooting

### **Build Fails**

**Issue**: Build command fails
- **Solution**: Check build logs for specific error
- Common causes:
  - Missing dependencies in `requirements.txt`
  - Python version incompatibility
  - Binary wheel issues with scikit-learn

**Fix**:
```bash
# Ensure all dependencies are in requirements.txt
pip freeze > requirements.txt
```

---

### **Service Won't Start**

**Issue**: Service shows "Failed" status
- **Solution**: Check logs for startup errors
- Common causes:
  - Port binding issues (should use `$PORT`)
  - Missing environment variables
  - Import errors

**Fix**:
- Verify `startCommand` uses `$PORT` not hardcoded port
- Check all required env vars are set
- Test locally: `gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 app:app`

---

### **CORS Errors**

**Issue**: Frontend can't connect to backend
- **Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**:
1. Verify `ALLOWED_ORIGINS` includes your Vercel URL
2. Check exact URL (including `https://` and no trailing slash)
3. Restart Render service after updating env vars
4. Clear browser cache

**Fix**:
```bash
# In Render dashboard, update ALLOWED_ORIGINS:
https://energy-savings-system.vercel.app,https://energy-savings-system-git-main-davidomokagbor1s-projects.vercel.app,http://localhost:3000
```

---

### **WebSocket Not Connecting**

**Issue**: Real-time updates don't work
- **Solution**: Verify Socket.IO configuration

**Check**:
1. Backend uses `async_mode='eventlet'`
2. Gunicorn uses `--worker-class eventlet`
3. Frontend connects to correct Socket URL
4. No firewall blocking WebSocket connections

---

### **Database Issues**

**Issue**: SQLite database errors
- **Solution**: Render free tier has ephemeral storage

**Options**:
1. Use Render PostgreSQL (paid plan)
2. Use external database (Supabase, Railway, etc.)
3. For demo: Database resets on each deploy (acceptable for free tier)

---

### **Service Goes to Sleep (Free Tier)**

**Issue**: Service takes 30+ seconds to respond
- **Cause**: Free tier services sleep after 15 minutes of inactivity
- **Solution**: 
  - Upgrade to paid plan (always-on)
  - Use external cron job to ping service every 10 minutes
  - Accept the cold start delay

---

## ✅ Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] `render.yaml` exists in project root
- [ ] Render account created and connected to GitHub
- [ ] Web service created with correct settings
- [ ] Root directory set to `backend`
- [ ] All environment variables configured
- [ ] `ALLOWED_ORIGINS` includes Vercel URL
- [ ] Build completes successfully
- [ ] Service shows "Live" status
- [ ] Health endpoint responds: `/api/status`
- [ ] Frontend environment variables updated
- [ ] Frontend redeployed with new backend URL
- [ ] Full integration tested
- [ ] No CORS errors in browser console
- [ ] WebSocket connection established
- [ ] All features working end-to-end

---

## 📊 Monitoring & Maintenance

### **View Logs**
- Render Dashboard → Your Service → **Logs** tab
- Real-time logs for debugging
- Historical logs available

### **Health Checks**
- Render automatically checks `/api/status` endpoint
- Service restarts if health check fails
- Monitor in **Metrics** tab

### **Updates**
- Push to `main` branch triggers auto-deploy
- Or manually trigger from dashboard
- Build logs show progress

---

## 🔐 Security Best Practices

1. **SECRET_KEY**: Use strong, random secret key
2. **CORS**: Only allow trusted origins
3. **Environment Variables**: Never commit secrets
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Consider adding rate limiting for API

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Render Support**: https://render.com/support
- **Flask Docs**: https://flask.palletsprojects.com/
- **Socket.IO Docs**: https://socket.io/docs/

---

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Service shows "Live" status
- ✅ `/api/status` returns JSON
- ✅ Frontend connects without CORS errors
- ✅ WebSocket establishes connection
- ✅ Lights can be controlled from frontend
- ✅ Real-time updates work
- ✅ No errors in browser console

---

**Last Updated**: December 2024
**Status**: Ready for deployment




