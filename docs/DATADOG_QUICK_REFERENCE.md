# 🚀 Datadog Quick Reference - How to See Your Dashboard

## ✅ Checklist: Before You Can See Data

- [ ] Flask app is running (`python3 app.py` in backend folder)
- [ ] You see "✅ Datadog Flask tracing enabled" in the logs
- [ ] You've made some API calls (use `test_datadog.py` script)
- [ ] You've waited 1-2 minutes after making API calls
- [ ] You're logged into https://app.datadoghq.com/

## 📍 Where to Look in Datadog

### Step 1: Go to APM Services
1. Open: https://app.datadoghq.com/
2. **Left sidebar** → Click **"APM"**
3. Click **"Services"** (in the top navigation)
4. Look for **"ai-smart-lights"**

### Step 2: If You Don't See Your Service

**Generate Traffic First:**
```bash
cd backend
python3 test_datadog.py
```

**Or manually:**
```bash
curl http://localhost:5000/api/status
curl http://localhost:5000/api/lights
curl http://localhost:5000/api/ai/status
```

**Then wait 1-2 minutes and refresh Datadog**

## 🔍 Quick Navigation Guide

| What You Want to See | Where to Go |
|---------------------|-------------|
| **API Traces** | APM → Services → ai-smart-lights |
| **Service Map** | APM → Service Map |
| **Custom Metrics** | Metrics → Explorer → Search `lights.control.count` |
| **Application Logs** | Logs → Search → Filter `service:ai-smart-lights` |
| **Create Dashboard** | Dashboards → New Dashboard |

## 🧪 Test Script

Run this to generate test traffic:
```bash
cd backend
python3 test_datadog.py
```

This will:
- Test all API endpoints
- Generate traces
- Create custom metrics
- Show you what to do next

## ⚠️ Common Issues

**"I don't see my service"**
- Make sure Flask app is running
- Generate API traffic
- Wait 2-3 minutes
- Refresh the page

**"I see the service but no traces"**
- Make more API calls
- Check the time range (should be "Last 15 minutes")
- Try APM → Traces instead of Services

**"Nothing is working"**
- Check `.env` file has `DD_API_KEY` set
- Verify you see "Datadog Flask tracing enabled" in logs
- Run: `python3 -c "from datadog_integration import is_datadog_enabled; print(is_datadog_enabled())"`

## 📞 Direct Links

- **APM Services**: https://app.datadoghq.com/apm/services
- **Service Map**: https://app.datadoghq.com/apm/service-map
- **Metrics Explorer**: https://app.datadoghq.com/metric/explorer
- **Logs**: https://app.datadoghq.com/logs

## 💡 Pro Tip

Bookmark this URL for quick access:
https://app.datadoghq.com/apm/services/ai-smart-lights

