# 🔐 Environment Variables Setup Guide

Complete guide for configuring environment variables for both Vercel (Frontend) and Render (Backend).

---

## 🌐 Vercel Environment Variables (Frontend)

### **Where to Set:**
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**

### **Required Variables:**

#### 1. **REACT_APP_API_URL**
```
Key: REACT_APP_API_URL
Value: https://ai-smart-automated-swight.onrender.com
Environments: ✅ Production, ✅ Preview, ✅ Development
```
**Purpose**: Backend API endpoint for REST requests

#### 2. **REACT_APP_SOCKET_URL**
```
Key: REACT_APP_SOCKET_URL
Value: https://ai-smart-automated-swight.onrender.com
Environments: ✅ Production, ✅ Preview, ✅ Development
```
**Purpose**: WebSocket endpoint for real-time communication

### **After Adding Variables:**
- **Redeploy** your frontend for changes to take effect
- Go to **Deployments** → Click **"..."** → **Redeploy**

---

## 🖥️ Render Environment Variables (Backend)

### **Where to Set:**
1. Go to: https://dashboard.render.com
2. Select your web service
3. Go to **Environment** tab

### **Required Variables:**

#### 1. **FLASK_ENV**
```
Key: FLASK_ENV
Value: production
```
**Purpose**: Sets Flask to production mode (disables debug, optimizes performance)

#### 2. **SECRET_KEY**
```
Key: SECRET_KEY
Value: [Generate a secure random string - see below]
```
**Purpose**: Flask session encryption key

**Generate Secret Key:**
```python
# Python
import secrets
print(secrets.token_hex(32))
```

Or use online generator: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" - 256-bit

**Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

#### 3. **ALLOWED_ORIGINS**
```
Key: ALLOWED_ORIGINS
Value: https://energy-savings-system.vercel.app,https://energy-savings-system-git-main-davidomokagbor1s-projects.vercel.app,https://ai-smart-automated-swight.vercel.app,https://ai-smart-automated-swight-git-main-davidomokagbor1s-projects.vercel.app,http://localhost:3000
```
**Purpose**: CORS whitelist - allows frontend to make API requests

**Important**: 
- Replace with your actual Vercel URLs
- Include all Vercel preview URLs (git-main, git-*, etc.)
- Keep `http://localhost:3000` for local development
- No spaces after commas
- No trailing slashes

**How to Find Your Vercel URLs:**
1. Go to Vercel Dashboard → Your Project
2. Check **Deployments** tab
3. Copy the URLs from successful deployments
4. Include both production and preview URLs

#### 4. **PYTHON_VERSION** (Optional - already in render.yaml)
```
Key: PYTHON_VERSION
Value: 3.10.12
```
**Purpose**: Specifies Python version for Render

### **Optional Variables:**

#### 5. **WEATHER_API_KEY** (Optional)
```
Key: WEATHER_API_KEY
Value: [Your OpenWeatherMap API key]
```
**Purpose**: Enables real weather data (otherwise uses demo data)

**Get API Key:**
1. Sign up at: https://openweathermap.org/api
2. Free tier: 1,000 calls/day
3. Copy API key from dashboard

#### 6. **WEATHER_CITY** (Optional)
```
Key: WEATHER_CITY
Value: New York
```
**Purpose**: Default city for weather data

---

## 🔄 Local Development Variables

### **Backend (.env file)**
Create `backend/.env`:
```env
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000
WEATHER_API_KEY=your-api-key-here
WEATHER_CITY=New York
```

### **Frontend (.env.development)**
Already exists in `frontend/.env.development`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## ✅ Verification Checklist

### **Vercel:**
- [ ] `REACT_APP_API_URL` points to Render backend
- [ ] `REACT_APP_SOCKET_URL` points to Render backend
- [ ] Variables enabled for all environments
- [ ] Frontend redeployed after adding variables

### **Render:**
- [ ] `FLASK_ENV` = `production`
- [ ] `SECRET_KEY` is a strong random string
- [ ] `ALLOWED_ORIGINS` includes all Vercel URLs
- [ ] `ALLOWED_ORIGINS` includes `http://localhost:3000`
- [ ] Service restarted after adding variables

---

## 🧪 Testing Environment Variables

### **Test Backend:**
```bash
# Check if backend is accessible
curl https://ai-smart-automated-swight.onrender.com/api/status

# Should return JSON with lights and energy data
```

### **Test Frontend:**
1. Open browser console (F12)
2. Check Network tab
3. Verify API calls go to Render URL
4. Check for CORS errors

### **Test CORS:**
```bash
# From your local machine
curl -H "Origin: https://energy-savings-system.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://ai-smart-automated-swight.onrender.com/api/status

# Should return CORS headers
```

---

## 🚨 Common Issues

### **CORS Errors**
**Symptom**: `Access to fetch at '...' has been blocked by CORS policy`

**Fix**:
1. Verify `ALLOWED_ORIGINS` includes exact frontend URL
2. Check URL format (no trailing slash, correct protocol)
3. Restart Render service after updating env vars
4. Clear browser cache

### **API Not Found**
**Symptom**: `404 Not Found` or `Network Error`

**Fix**:
1. Verify `REACT_APP_API_URL` is correct
2. Check Render service is "Live"
3. Test backend URL directly in browser
4. Check Render logs for errors

### **WebSocket Not Connecting**
**Symptom**: Real-time updates don't work

**Fix**:
1. Verify `REACT_APP_SOCKET_URL` matches backend URL
2. Check `ALLOWED_ORIGINS` includes frontend URL
3. Verify backend uses `eventlet` worker
4. Check browser console for WebSocket errors

---

## 📝 Quick Reference

### **Vercel URLs:**
- Production: `https://energy-savings-system.vercel.app`
- Preview: `https://energy-savings-system-git-main-davidomokagbor1s-projects.vercel.app`

### **Render URL:**
- Backend: `https://ai-smart-automated-swight.onrender.com`

### **Local Development:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

---

**Last Updated**: December 2024




