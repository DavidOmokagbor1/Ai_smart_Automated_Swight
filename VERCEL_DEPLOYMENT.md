# Vercel Deployment Guide

## 🚀 Quick Deploy Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to project root**:
   ```bash
   cd "/Volumes/2-2-22/BEATZBYJAVA PRODUCTIONS WEB/Ai_smart_Automated_Swight"
   ```

4. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   - Follow the prompts:
     - Set up and deploy? **Yes**
     - Which scope? (Select your account)
     - Link to existing project? **No** (first time) or **Yes** (if redeploying)
     - Project name: `ai-smart-light-control` (or your preferred name)
     - Directory: `./frontend` (IMPORTANT!)
     - Override settings? **No** (vercel.json will be used)

5. **For Production Deployment**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Go to**: https://vercel.com
2. **Click**: "Add New Project"
3. **Import your Git repository** (GitHub/GitLab/Bitbucket)
4. **Configure Project**:
   - Framework Preset: **Create React App**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

5. **Environment Variables** (Add these in Vercel Dashboard):
   - `REACT_APP_API_URL` = `https://ai-smart-automated-swight.onrender.com`
   - `REACT_APP_SOCKET_URL` = `https://ai-smart-automated-swight.onrender.com`

6. **Click**: "Deploy"

## 📋 Pre-Deployment Checklist

- ✅ Frontend builds successfully (`npm run build` in frontend directory)
- ✅ All dependencies installed
- ✅ No console errors
- ✅ Environment variables configured
- ✅ Backend API is running and accessible

## 🔧 Configuration

The `vercel.json` file is already configured with:
- ✅ Build command: `cd frontend && npm install && npm run build`
- ✅ Output directory: `frontend/build`
- ✅ SPA routing (all routes redirect to index.html)
- ✅ CORS headers for API calls
- ✅ Environment variables for API URLs

## 🌐 After Deployment

1. **Your app will be live at**: `https://your-project-name.vercel.app`
2. **Custom Domain**: Add in Vercel Dashboard → Settings → Domains
3. **Environment Variables**: Update in Vercel Dashboard if needed

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (Vercel uses Node 18.x by default)
- Verify all dependencies in `package.json`
- Check build logs in Vercel Dashboard

### API Not Connecting
- Verify backend is running on Render
- Check environment variables in Vercel Dashboard
- Ensure CORS is enabled on backend

### Routing Issues
- Verify `vercel.json` rewrites are correct
- Check that React Router is using BrowserRouter

## 📝 Notes

- The backend should be deployed separately (e.g., Render, Railway, Heroku)
- Frontend connects to backend via environment variables
- All API calls will go to: `https://ai-smart-automated-swight.onrender.com`

