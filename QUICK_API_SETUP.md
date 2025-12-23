# 🚀 Quick API Key Setup Guide

## Step 1: Get Your OpenWeatherMap API Key (5 minutes)

### 1.1 Sign Up
1. Go to: **https://openweathermap.org/api**
2. Click the **"Sign Up"** button (top right)
3. Fill in:
   - Username
   - Email
   - Password
4. Click **"Create Account"**

### 1.2 Verify Email
1. Check your email inbox
2. Click the verification link from OpenWeatherMap
3. You'll be redirected to the dashboard

### 1.3 Get Your API Key
1. Once logged in, you'll see your **API key** on the dashboard
2. It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
3. **Copy this key** - you'll need it in the next step

### 1.4 Activate Your Key (Important!)
1. The API key might need activation (can take 10 minutes to 2 hours)
2. Check your email for activation confirmation
3. Once activated, you're ready!

---

## Step 2: Get Your Location Coordinates (Optional but Recommended)

### Why Coordinates?
- **City Name**: "New York" could match multiple locations
- **Coordinates**: Exact location = More accurate weather

### How to Get Coordinates:
1. Go to: **https://www.latlong.net/**
2. Enter your address (e.g., "123 Main St, New York, NY")
3. Click **"Find"**
4. Copy the **Latitude** and **Longitude** numbers
   - Example: `40.7128` (Latitude), `-74.0060` (Longitude)

---

## Step 3: Set Up in Render (For Production)

### 3.1 Go to Render Dashboard
1. Go to: **https://dashboard.render.com/**
2. Log in to your account
3. Click on your **backend service** (the one running your Flask app)

### 3.2 Add Environment Variables
1. Click on the **"Environment"** tab
2. Click **"Add Environment Variable"** button
3. Add these variables one by one:

#### Required:
```
Name: WEATHER_API_KEY
Value: [paste your API key from Step 1.3]
```

```
Name: WEATHER_CITY
Value: [your city name, e.g., "New York"]
```

#### Optional (for better accuracy):
```
Name: WEATHER_LAT
Value: [your latitude from Step 2]
```

```
Name: WEATHER_LON
Value: [your longitude from Step 2]
```

### 3.3 Save and Restart
1. Click **"Save Changes"**
2. Render will automatically restart your service
3. Wait 1-2 minutes for restart

---

## Step 4: Test It Works

### 4.1 Check Logs
1. In Render dashboard, go to **"Logs"** tab
2. Look for: `"Successfully fetched weather data for [your location]"`
3. If you see this, it's working! ✅

### 4.2 Test API Endpoint
1. Go to: `https://your-backend-url.onrender.com/api/weather`
2. You should see weather data in JSON format
3. If you see real data (not demo data), it's working! ✅

### 4.3 Test in Mobile App
1. Open your mobile app
2. Go to **"Weather"** tab
3. You should see real weather data
4. If weather shows correctly, it's working! ✅

---

## Troubleshooting

### ❌ "Invalid API key" Error
**Solution:**
- Double-check you copied the entire API key (no spaces)
- Make sure the key is activated (check email)
- Wait 10-30 minutes after signup for activation

### ❌ "Location not found" Error
**Solution:**
- Check city name spelling
- Try using coordinates instead (WEATHER_LAT and WEATHER_LON)
- Use a major city name if coordinates don't work

### ❌ Weather data not updating
**Solution:**
- Check Render logs for errors
- Verify API key is set correctly
- Make sure backend restarted after adding variables

### ❌ Still seeing demo/placeholder data
**Solution:**
- Make sure `WEATHER_API_KEY` is NOT set to `demo_key`
- Check Render environment variables are saved
- Restart the backend service manually

---

## Quick Checklist

- [ ] Signed up for OpenWeatherMap
- [ ] Got API key from dashboard
- [ ] Verified email and activated key
- [ ] Got coordinates (optional)
- [ ] Added `WEATHER_API_KEY` to Render
- [ ] Added `WEATHER_CITY` to Render
- [ ] Added `WEATHER_LAT` and `WEATHER_LON` (optional)
- [ ] Backend restarted
- [ ] Tested API endpoint
- [ ] Weather shows in mobile app

---

## Need Help?

If you're stuck:
1. Check Render logs for specific error messages
2. Verify API key is correct in OpenWeatherMap dashboard
3. Make sure all environment variables are saved in Render
4. Wait a few minutes after setup for changes to take effect

**You're all set! Your weather data will now be accurate! 🌤️✨**


