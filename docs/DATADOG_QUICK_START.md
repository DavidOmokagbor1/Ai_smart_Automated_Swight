# 🚀 Datadog Quick Start Guide

Get started with Datadog monitoring in 5 minutes!

## Step 1: Sign Up for Datadog (2 minutes)

1. Go to [https://www.datadoghq.com/](https://www.datadoghq.com/)
2. Click "Get Started Free"
3. Fill in your email and create a password
4. Verify your email

## Step 2: Get Your API Key (1 minute)

1. Once logged in, click on your profile (bottom left)
2. Go to **Organization Settings** → **API Keys**
3. Click **New Key**
4. Name it "AI Smart Lights" (or anything you like)
5. **Copy the API key** (starts with something like `abc123...`)

## Step 3: Configure Your App (1 minute)

1. Open `backend/.env` (or create it from `env.example`)
2. Add your Datadog API key:

```bash
DD_API_KEY=your-api-key-here
DD_SERVICE=ai-smart-lights
DD_ENV=development
DD_VERSION=1.1.0
DD_LOGS_INJECTION=true
DD_TRACE_ENABLED=true
```

## Step 4: Install Dependencies (1 minute)

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- `ddtrace` - For APM (Application Performance Monitoring)
- `datadog` - For custom metrics and logging

## Step 5: Start Your App

```bash
python3 app.py
```

You should see:
```
✅ Datadog initialized: service=ai-smart-lights, env=development, version=1.1.0
✅ Datadog Flask tracing enabled
```

## Step 6: View Your Data in Datadog

1. Go to [https://app.datadoghq.com/](https://app.datadoghq.com/)
2. Navigate to **APM** → **Services**
3. You should see `ai-smart-lights` service
4. Click on it to see:
   - Request traces
   - Performance metrics
   - Error rates

## What Gets Tracked Automatically?

✅ **All API endpoints** - Response times, errors, status codes  
✅ **Database queries** - SQLite query performance  
✅ **External API calls** - Weather API response times  
✅ **WebSocket connections** - Connection count and events  
✅ **Custom metrics** - Light controls, AI predictions, energy usage  

## Try It Out!

1. Make some API calls to your app:
   ```bash
   curl http://localhost:5000/api/status
   curl http://localhost:5000/api/lights
   ```

2. Control some lights:
   ```bash
   curl -X POST http://localhost:5000/api/lights/living_room/control \
     -H "Content-Type: application/json" \
     -d '{"action": "on", "brightness": 80}'
   ```

3. Go back to Datadog and refresh - you should see traces appearing!

## View Custom Metrics

1. Go to **Metrics** → **Explorer**
2. Search for:
   - `lights.control.count` - Light control actions
   - `ai.predictions.count` - AI predictions
   - `energy.savings` - Energy savings
   - `weather.api.calls` - Weather API calls

## Create Your First Dashboard

1. Go to **Dashboards** → **New Dashboard**
2. Click **Add Widgets**
3. Choose **Timeseries**
4. Select metric: `lights.control.count`
5. Click **Save**

## Next Steps

- Read the full [Datadog Setup Guide](DATADOG_SETUP.md) for advanced features
- Set up alerts for errors or slow responses
- Create custom dashboards for your metrics
- Explore the APM service map to see how your app connects

## Troubleshooting

**No traces appearing?**
- Check `DD_API_KEY` is set correctly
- Verify `DD_TRACE_ENABLED=true`
- Check application logs for Datadog errors

**Can't see custom metrics?**
- Make sure you're making API calls
- Wait a few minutes for metrics to appear
- Check the Metrics Explorer

**Need help?**
- Check [Datadog Setup Guide](DATADOG_SETUP.md)
- Visit [Datadog Documentation](https://docs.datadoghq.com/)

Happy Monitoring! 🎉

