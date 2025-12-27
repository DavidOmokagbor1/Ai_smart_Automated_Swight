# Weather API Setup Guide

## Current Status

✅ **Local Development**: Weather API is working with your API key  
✅ **Code**: Weather API implementation is functional and improved  
⚠️ **Production**: Need to add `WEATHER_API_KEY` to Render dashboard

## What Was Fixed

1. **Increased Timeout**: Changed from (3, 8) to (5, 15) seconds for better reliability on Render
2. **Better Error Handling**: API now always returns valid data (falls back to demo if needed)
3. **Improved Response**: Added `using_demo` flag so frontend knows data source
4. **Graceful Degradation**: Returns 200 with error info instead of 500 for better UX

## Setup for Production (Render)

### Step 1: Get Your OpenWeatherMap API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account (1000 calls/day free)
3. Go to API Keys section
4. Copy your API key (32 characters)

### Step 2: Add to Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Navigate to your service: `ai-smart-automated-swight`
3. Click **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `WEATHER_API_KEY`
   - **Value**: Your OpenWeatherMap API key
6. Click **Save Changes**
7. Service will auto-redeploy

### Step 3: Verify It's Working

After deployment, test the endpoint:
```bash
curl https://ai-smart-automated-swight.onrender.com/api/weather
```

You should see:
- Real weather data (not demo)
- `"api_key_set": true`
- `"using_demo": false`
- Actual temperature and conditions

## Optional: Use Coordinates (More Accurate)

For more accurate weather, you can use coordinates instead of city name:

1. Get coordinates from [latlong.net](https://www.latlong.net/)
2. Add to Render dashboard:
   - `WEATHER_LAT=40.7128` (your latitude)
   - `WEATHER_LON=-74.0060` (your longitude)

## API Endpoints

- **GET `/api/weather`** - Current weather data
- **GET `/api/weather/forecast`** - 24-hour forecast
- **GET `/api/weather/impact`** - Weather impact on lighting
- **POST `/api/weather/optimize`** - Apply weather-based optimization

## Response Format

```json
{
  "weather": {
    "main": {
      "temp": 72,
      "humidity": 65,
      "pressure": 1013
    },
    "weather": [{
      "main": "Clouds",
      "description": "scattered clouds",
      "icon": "03d"
    }],
    "name": "New York"
  },
  "lighting_adjustment": 1.2,
  "natural_light_factor": 0.8,
  "timestamp": "2025-12-27T00:00:00",
  "api_key_set": true,
  "using_demo": false,
  "location": "New York"
}
```

## Troubleshooting

### If you see `"using_demo": true`:
- Check `WEATHER_API_KEY` is set in Render dashboard
- Verify the API key is valid (32 characters)
- Check Render logs for API errors

### If API calls fail:
- The API will automatically fall back to demo data
- Check your OpenWeatherMap account status
- Verify you haven't exceeded the free tier limit (1000 calls/day)

## Current Configuration

- **API Provider**: OpenWeatherMap
- **Cache Duration**: 5 minutes
- **Timeout**: 5 seconds connect, 15 seconds read
- **Retry Strategy**: 2 retries on connection errors
- **Fallback**: Demo data if API unavailable
