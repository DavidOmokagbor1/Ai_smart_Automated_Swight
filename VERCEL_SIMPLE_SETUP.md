# Simple Vercel Deployment Setup

## The Problem
Having `vercel.json` in both root and `frontend/` causes conflicts and makes deployment complicated.

## The Solution
**Use only `frontend/vercel.json` and set Root Directory in Vercel Dashboard.**

## Step-by-Step Setup

### 1. Configure Vercel Project Settings

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **General**
4. Scroll to **Root Directory**
5. Click **Edit**
6. Set Root Directory to: `frontend`
7. Click **Save**

### 2. Set Environment Variables

1. Still in Vercel Dashboard → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

**Variable 1:**
- Key: `REACT_APP_API_URL`
- Value: `https://ai-smart-automated-swight.onrender.com`
- Environments: ✅ Production, ✅ Preview, ✅ Development

**Variable 2:**
- Key: `REACT_APP_SOCKET_URL`
- Value: `https://ai-smart-automated-swight.onrender.com`
- Environments: ✅ Production, ✅ Preview, ✅ Development

### 3. Deploy

- Vercel will auto-detect it's a React app
- It will use `frontend/package.json` automatically
- Build will run from `frontend/` directory
- No need for custom build commands!

## Why This Works

- **Root Directory = `frontend`**: Vercel runs all commands from `frontend/`
- **Auto-detection**: Vercel detects `create-react-app` from `package.json`
- **Simple config**: `frontend/vercel.json` only handles routing (SPA)
- **No conflicts**: Only one `vercel.json` file

## File Structure

```
project-root/
├── backend/          (ignored by Vercel)
├── frontend/
│   ├── vercel.json   (only this one!)
│   ├── package.json
│   └── src/
└── .vercelignore     (excludes backend, etc.)
```

## That's It!

After setting Root Directory to `frontend` in Vercel dashboard, deployments will work automatically. No complicated build commands needed!

