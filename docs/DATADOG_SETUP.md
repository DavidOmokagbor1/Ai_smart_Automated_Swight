# 📊 Datadog Integration Guide

This guide will help you set up Datadog monitoring for your AI Smart Light Control System. Datadog provides comprehensive observability including APM (Application Performance Monitoring), logging, metrics, and real-time dashboards.

## 🎯 What is Datadog?

Datadog is a monitoring and analytics platform that provides:
- **APM (Application Performance Monitoring)**: Track request performance, trace requests through your application
- **Logs**: Centralized logging with search and analysis
- **Metrics**: Custom metrics for your application (lights, energy, AI predictions)
- **Dashboards**: Real-time visualizations of your system health
- **Alerts**: Get notified when issues occur

## 🚀 Quick Start

### Step 1: Create a Datadog Account

1. Go to [https://www.datadoghq.com/](https://www.datadoghq.com/)
2. Sign up for a free account (14-day trial, then free tier available)
3. Navigate to **APM** → **Setup Instructions**

### Step 2: Get Your API Keys

1. Go to **Organization Settings** → **API Keys**
2. Copy your **API Key** (starts with something like `abc123...`)
3. Copy your **Application Key** (optional, for some features)

### Step 3: Install Datadog Agent (Optional - for Infrastructure Monitoring)

For local development, you can skip this. For production on Render, you'll use the Datadog Python library directly.

**For Local Development (macOS):**
```bash
# Install via Homebrew
brew install datadog-agent

# Or download from Datadog website
```

**For Production (Render):**
- Datadog Python library works without the agent for APM and logging
- Agent is optional but recommended for infrastructure metrics

### Step 4: Configure Environment Variables

Add these to your `.env` file:

```bash
# Datadog Configuration
DD_API_KEY=your-api-key-here
DD_SERVICE=ai-smart-lights
DD_ENV=production  # or development
DD_VERSION=1.1.0
DD_LOGS_INJECTION=true
DD_TRACE_ENABLED=true
DD_PROFILING_ENABLED=true
```

### Step 5: Install Dependencies

The Datadog libraries are already added to `requirements.txt`. Install them:

```bash
cd backend
pip install -r requirements.txt
```

### Step 6: Start Your Application

```bash
python3 app.py
```

You should see these messages when Datadog initializes:
```
✅ Datadog initialized: service=ai-smart-lights, env=development, version=1.1.0
✅ Datadog Flask tracing enabled
```

### Step 7: Generate API Traffic (IMPORTANT!)

**Datadog only shows data when you make API calls.** After starting your app, generate some traffic:

**Option 1: Use the test script (Recommended)**
```bash
cd backend
python3 test_datadog.py
```

**Option 2: Manual API calls**
```bash
curl http://localhost:5000/api/status
curl http://localhost:5000/api/lights
curl http://localhost:5000/api/ai/status
curl -X POST http://localhost:5000/api/lights/living_room/control \
  -H "Content-Type: application/json" \
  -d '{"action": "on", "brightness": 80}'
```

### Step 8: View Your Data in Datadog

1. **Wait 1-2 minutes** for traces to appear
2. Go to: https://app.datadoghq.com/apm/services
3. Look for **"ai-smart-lights"** service
4. Click on it to see traces and metrics

Datadog will automatically track:
- All Flask routes (response times, errors)
- Database queries
- External API calls (weather API)
- Custom metrics (lights, energy, AI predictions)

## 📈 What Gets Monitored

### Automatic Monitoring

1. **API Endpoints**
   - Request count, latency, error rate
   - Response time percentiles (p50, p95, p99)
   - Status codes (200, 400, 500, etc.)

2. **Database Operations**
   - SQLite query performance
   - Query execution time

3. **External API Calls**
   - Weather API calls
   - Response times and errors

4. **WebSocket Connections**
   - Connection count
   - Message throughput

### Custom Metrics

The integration tracks custom metrics:

- `lights.control.count` - Number of light control actions
- `lights.brightness` - Current brightness levels per room
- `ai.predictions.count` - AI prediction requests
- `ai.accuracy` - Prediction accuracy
- `energy.consumption` - Energy usage
- `energy.savings` - Cost savings
- `weather.api.calls` - Weather API call count
- `weather.cache.hits` - Weather cache hit rate

## 🔍 Viewing Your Data in Datadog

### IMPORTANT: First Steps Before Viewing Dashboard

**Before you can see data, you need to:**

1. **Make sure your Flask app is running** (backend server on port 5000)
2. **Generate some API traffic** - Make some API calls to create traces:
   ```bash
   curl http://localhost:5000/api/status
   curl http://localhost:5000/api/lights
   curl http://localhost:5000/api/ai/status
   curl -X POST http://localhost:5000/api/lights/living_room/control \
     -H "Content-Type: application/json" \
     -d '{"action": "on", "brightness": 80}'
   ```
3. **Wait 1-3 minutes** - Traces take a few minutes to appear in Datadog
4. **Refresh your Datadog dashboard** - Click refresh or wait for auto-update

### Step-by-Step: View APM Services Dashboard

1. **Go to Datadog Dashboard**
   - Open: https://app.datadoghq.com/
   - Make sure you're logged in

2. **Navigate to APM**
   - Look at the **left sidebar** (not the Software Catalog section)
   - Find and click **"APM"** (it has a network/graph icon)
   - If you don't see APM, click the menu icon (☰) in the top left

3. **View Services**
   - In the APM section, click **"Services"** (should be in the top navigation or left submenu)
   - You should see a list of services
   - Look for **"ai-smart-lights"** in the list

4. **If you see "ai-smart-lights" service:**
   - Click on it to see detailed information
   - You'll see:
     - **Overview**: Request count, latency, error rate
     - **Traces**: Individual request traces
     - **Metrics**: Performance metrics over time
     - **Errors**: Any errors that occurred

5. **If you DON'T see "ai-smart-lights":**
   - Make sure your app is running
   - Generate some API traffic (see commands above)
   - Wait 2-3 minutes
   - Refresh the page
   - Check the troubleshooting section below

### View Service Map

1. In APM section, click **"Service Map"** (in the navigation)
2. You'll see a visual map showing:
   - Your Flask service (`ai-smart-lights`)
   - Database connections (SQLite)
   - External API calls (Weather API)
   - How they connect to each other

### View Logs

1. In the **left sidebar**, click **"Logs"**
2. Click **"Search"** (default view)
3. In the search box, type: `service:ai-smart-lights`
4. Press Enter
5. You should see all application logs with Datadog context

### View Custom Metrics

1. In the **left sidebar**, click **"Metrics"**
2. Click **"Explorer"**
3. In the search box, type one of these:
   - `lights.control.count` - Light control actions
   - `ai.predictions.count` - AI predictions
   - `energy.savings` - Energy savings
   - `weather.api.calls` - Weather API calls
4. Press Enter
5. You'll see a graph of the metric over time

### Create Custom Dashboard

1. In the **left sidebar**, click **"Dashboards"**
2. Click **"New Dashboard"** (top right)
3. Give it a name: "AI Smart Lights Overview"
4. Click **"Add Widgets"**
5. Choose **"Timeseries"** widget
6. Configure:
   - **Metric**: `lights.control.count`
   - **Aggregation**: `sum`
   - **Title**: "Light Control Actions"
7. Click **"Save"**
8. Add more widgets:
   - `ai.predictions.count` - AI Predictions
   - `trace.flask.request.duration` - API Response Time
   - `energy.savings` - Energy Savings
9. Click **"Save Dashboard"**

## 🎨 Example Dashboard Queries

### Light Control Activity
```
sum:lights.control.count{*}.as_count()
```

### Average Brightness by Room
```
avg:lights.brightness{room:*} by {room}
```

### AI Prediction Accuracy
```
avg:ai.accuracy{*}
```

### Energy Savings
```
sum:energy.savings{*}.as_count()
```

### API Response Time (p95)
```
p95:trace.flask.request.duration{service:ai-smart-lights}
```

## 🚨 Setting Up Alerts

### Example Alert: High Error Rate

1. Go to **Monitors** → **New Monitor**
2. Choose **Metric**
3. Set:
   - Metric: `trace.flask.request.errors`
   - Alert when: `> 10 errors in 5 minutes`
   - Notify: Your email/Slack

### Example Alert: Slow API Response

1. Create **APM** monitor
2. Set:
   - Service: `ai-smart-lights`
   - Alert when: `p95 latency > 1 second`
   - Notify: Your team

## 🔧 Advanced Configuration

### Custom Tags

Add custom tags to all traces:

```python
from ddtrace import tracer

tracer.set_tags({
    'environment': 'production',
    'deployment': 'render',
    'version': '1.1.0'
})
```

### Sampling Rate

Control trace sampling (useful for high-traffic):

```python
# In app.py, after importing ddtrace
from ddtrace import config

config.flask['analytics_enabled'] = True
config.flask['analytics_sample_rate'] = 1.0  # 100% sampling
```

### Filtering Sensitive Data

```python
from ddtrace import config

# Don't trace health checks
config.flask['ignore'] = ['/api/status']
```

## 📊 Cost Considerations

### Free Tier
- 1-day metric retention
- 1 million log events/month
- 100K APM traces/month
- 1 custom dashboard

### Paid Plans
- Longer retention
- More traces/logs
- Advanced features

**Tip**: Start with free tier, upgrade if needed!

## 🐛 Troubleshooting

### I Can't See My Service in Datadog Dashboard

**Step 1: Verify Your App is Running**
```bash
# Check if backend is running
curl http://localhost:5000/api/status

# If you get 404, start your app:
cd backend
python3 app.py
```

**Step 2: Generate API Traffic**
You need to make API calls for traces to appear:
```bash
# Make several API calls
curl http://localhost:5000/api/status
curl http://localhost:5000/api/lights
curl http://localhost:5000/api/ai/status
curl http://localhost:5000/api/weather

# Control a light (generates custom metrics)
curl -X POST http://localhost:5000/api/lights/living_room/control \
  -H "Content-Type: application/json" \
  -d '{"action": "on", "brightness": 80}'
```

**Step 3: Wait and Refresh**
- Traces take **1-3 minutes** to appear in Datadog
- After making API calls, wait 2-3 minutes
- Refresh your Datadog dashboard (F5 or Cmd+R)
- Check APM → Services again

**Step 4: Verify Configuration**
```bash
cd backend
python3 -c "
from dotenv import load_dotenv
import os
load_dotenv()
print('DD_API_KEY:', 'Set' if os.getenv('DD_API_KEY') else 'NOT SET')
print('DD_TRACE_ENABLED:', os.getenv('DD_TRACE_ENABLED'))
"
```

**Step 5: Check Application Logs**
When you start your app, you should see:
```
✅ Datadog initialized: service=ai-smart-lights, env=development, version=1.1.0
✅ Datadog Flask tracing enabled
```

If you don't see these messages, Datadog isn't initializing properly.

### No Traces Appearing After 5 Minutes

1. **Check API Key is Valid**
   - Go to Datadog → Organization Settings → API Keys
   - Verify your API key matches what's in `.env`
   - Make sure there are no extra spaces or quotes

2. **Check Environment Variables**
   ```bash
   cd backend
   cat .env | grep DD_
   ```
   Should show:
   ```
   DD_API_KEY=your-actual-key-here
   DD_SERVICE=ai-smart-lights
   DD_TRACE_ENABLED=true
   ```

3. **Verify Datadog Libraries**
   ```bash
   pip3 list | grep -E "ddtrace|datadog"
   ```
   Should show:
   ```
   datadog    0.47.0
   ddtrace    2.9.0
   ```

4. **Check Application Startup Logs**
   - Look for any error messages when starting the app
   - Check if "Datadog Flask tracing enabled" appears

5. **Test Datadog Connection**
   ```bash
   cd backend
   python3 -c "
   from datadog_integration import init_datadog_early, DATADOG_AVAILABLE
   print('DATADOG_AVAILABLE:', DATADOG_AVAILABLE)
   result = init_datadog_early()
   print('init_datadog_early():', result)
   "
   ```
   Both should be `True`

### Service Appears But No Traces

1. **Make sure you're generating traffic**
   - Traces only appear when you make API calls
   - Use the curl commands above

2. **Check the time range**
   - In Datadog, make sure the time range includes "Last 15 minutes" or "Last hour"
   - Click the time selector in the top right

3. **Check different views**
   - Try APM → Traces (instead of Services)
   - Try APM → Service Map
   - Try Metrics → Explorer

### High Costs

1. Reduce sampling rate
2. Filter out noisy endpoints
3. Use log sampling
4. Review which metrics you actually need

### Performance Impact

Datadog has minimal overhead (< 1% typically):
- Traces are sent asynchronously
- Metrics are batched
- Logs are buffered

## 📚 Additional Resources

- [Datadog Python Documentation](https://docs.datadoghq.com/tracing/setup_overview/setup/python/)
- [Flask APM Guide](https://docs.datadoghq.com/tracing/setup_overview/setup/python/?tab=flask)
- [Custom Metrics Guide](https://docs.datadoghq.com/metrics/custom_metrics/)
- [Log Collection](https://docs.datadoghq.com/logs/log_collection/python/)

## 🎯 Next Steps

1. Set up your Datadog account
2. Add API keys to environment variables
3. Start your application
4. Explore the Datadog dashboard
5. Create custom alerts
6. Build custom dashboards

Happy Monitoring! 🚀

