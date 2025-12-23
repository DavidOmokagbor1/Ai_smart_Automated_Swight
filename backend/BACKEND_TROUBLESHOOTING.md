# 🔧 Backend Troubleshooting Guide

## Common Backend Issues on Render

### Issue 1: Health Check Failing
**Symptoms:** Render shows "Unhealthy" status
**Fix:** 
- Check `/api/status` endpoint returns 200 OK
- Verify health check path in `render.yaml` matches actual endpoint

### Issue 2: Import Errors
**Symptoms:** `ModuleNotFoundError` in logs
**Fix:**
- Check `requirements.txt` has all dependencies
- Verify Python version matches (3.11.9)
- Check `ai_models.py` imports correctly

### Issue 3: Database Initialization Errors
**Symptoms:** `sqlite3.OperationalError` or database errors
**Fix:**
- Ensure `instance/` directory is writable
- Check `init_db()` function runs successfully
- Verify database path is correct

### Issue 4: Port Binding Issues
**Symptoms:** "Address already in use" or connection refused
**Fix:**
- Use `$PORT` environment variable (Render sets this automatically)
- Verify `gunicorn` command uses `0.0.0.0:$PORT`

### Issue 5: CORS Errors
**Symptoms:** Frontend can't connect, CORS errors in browser
**Fix:**
- Check `ALLOWED_ORIGINS` includes your Vercel domain
- Verify CORS configuration in `app.py`

### Issue 6: Weather API Errors
**Symptoms:** Weather endpoints fail
**Fix:**
- Check `WEATHER_API_KEY` is set (optional - uses demo data if not)
- Verify API key is valid if using real weather data

## Quick Diagnostic Steps

### 1. Check Backend Status
```bash
curl https://ai-smart-automated-swight.onrender.com/api/status
```
Should return JSON with lights and energy data.

### 2. Check Render Logs
1. Go to Render Dashboard
2. Select your backend service
3. Click "Logs" tab
4. Look for errors or warnings

### 3. Verify Environment Variables
In Render Dashboard → Environment:
- `FLASK_ENV` = `production`
- `SECRET_KEY` = (set a random string)
- `ALLOWED_ORIGINS` = (your Vercel URLs)
- `PORT` = (auto-set by Render)

### 4. Test Local Backend
```bash
cd backend
python app.py
```
Should start on `http://localhost:5000`

## Common Error Messages

### "ModuleNotFoundError: No module named 'ai_models'"
**Fix:** Ensure `ai_models.py` is in the `backend/` directory

### "sqlite3.OperationalError: unable to open database file"
**Fix:** Check `instance/` directory permissions, ensure it's writable

### "Address already in use"
**Fix:** Use `$PORT` environment variable, don't hardcode port

### "CORS: No 'Access-Control-Allow-Origin' header"
**Fix:** Add your frontend URL to `ALLOWED_ORIGINS`

## Need More Help?

1. Check Render logs for specific error messages
2. Test backend locally: `python backend/app.py`
3. Verify all environment variables are set
4. Check `requirements.txt` dependencies are installed

---

**Most common issue:** Missing environment variables or health check failing. Check Render logs first!
