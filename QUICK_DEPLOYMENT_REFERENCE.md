# ⚡ Quick Deployment Reference

Quick reference for deploying and syncing frontend (Vercel) and backend (Render).

---

## 🎯 Quick Steps

### **1. Deploy Backend to Render** (5 minutes)

1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo: `DavidOmokagbor1/Ai_smart_Automated_Swight`
4. Settings:
   - Name: `ai-smart-automated-swight`
   - Root Directory: `backend` ⚠️
   - Build/Start commands: Auto-detected from `render.yaml`
5. Environment Variables:
   ```
   FLASK_ENV=production
   SECRET_KEY=[generate random 32-char string]
   ALLOWED_ORIGINS=https://your-vercel-url.vercel.app,http://localhost:3000
   ```
6. Click **"Create Web Service"**
7. Wait for deployment (5-10 min)
8. Copy your Render URL: `https://ai-smart-automated-swight.onrender.com`

---

### **2. Update Frontend on Vercel** (2 minutes)

1. Go to: https://vercel.com/dashboard
2. Select your project
3. **Settings** → **Environment Variables**
4. Add/Update:
   ```
   REACT_APP_API_URL=https://ai-smart-automated-swight.onrender.com
   REACT_APP_SOCKET_URL=https://ai-smart-automated-swight.onrender.com
   ```
5. **Deployments** → **Redeploy** latest deployment

---

### **3. Verify Connection** (1 minute)

1. Open frontend: `https://your-vercel-url.vercel.app`
2. Open browser console (F12)
3. Check:
   - ✅ No CORS errors
   - ✅ API calls go to Render URL
   - ✅ WebSocket connects
   - ✅ Features work

---

## 🔗 URLs Reference

**Frontend (Vercel):**
- Production: `https://energy-savings-system.vercel.app`
- Preview: `https://energy-savings-system-git-main-*.vercel.app`

**Backend (Render):**
- API: `https://ai-smart-automated-swight.onrender.com`

**Local:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

---

## 🔐 Environment Variables Cheat Sheet

### **Render (Backend):**
```
FLASK_ENV=production
SECRET_KEY=[random-32-char-string]
ALLOWED_ORIGINS=https://your-vercel-url.vercel.app,http://localhost:3000
```

### **Vercel (Frontend):**
```
REACT_APP_API_URL=https://ai-smart-automated-swight.onrender.com
REACT_APP_SOCKET_URL=https://ai-smart-automated-swight.onrender.com
```

---

## ✅ Success Checklist

- [ ] Render service shows "Live"
- [ ] `https://ai-smart-automated-swight.onrender.com/api/status` returns JSON
- [ ] Vercel environment variables set
- [ ] Frontend redeployed
- [ ] No CORS errors in browser
- [ ] WebSocket connects
- [ ] Lights can be controlled

---

## 🚨 Quick Troubleshooting

**CORS Error?**
→ Update `ALLOWED_ORIGINS` in Render with exact Vercel URL

**API Not Found?**
→ Check Render service is "Live" and URL is correct

**WebSocket Not Working?**
→ Verify both URLs match in Vercel env vars

---

**For detailed guides, see:**
- `RENDER_DEPLOYMENT_GUIDE.md` - Complete Render setup
- `ENVIRONMENT_VARIABLES_SETUP.md` - Detailed env var guide




