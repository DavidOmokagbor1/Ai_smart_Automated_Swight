# Render Dashboard - Datadog API Key Setup

## Step-by-Step Instructions

### 1. Log into Render Dashboard
1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Sign in to your account

### 2. Navigate to Your Service
1. Click on **Services** in the left sidebar
2. Find and click on **ai-smart-automated-swight** service

### 3. Add Environment Variables
1. Click on the **Environment** tab (in the service page)
2. Scroll down to the **Environment Variables** section
3. Click **Add Environment Variable** button

### 4. Add Datadog API Key
1. **Key**: `DD_API_KEY`
2. **Value**: Paste your new Datadog API key (the one you created)
3. Click **Save Changes**

### 5. Verify Other Variables
The following variables should already be set from `render.yaml`:
- `DD_SERVICE=ai-smart-lights` ✅
- `DD_ENV=production` ✅
- `DD_VERSION=1.1.0` ✅
- `DD_LOGS_INJECTION=true` ✅
- `DD_TRACE_ENABLED=true` ✅
- `DD_PROFILING_ENABLED=false` ✅

**Important**: Only `DD_API_KEY` needs to be manually added. The others are set automatically from `render.yaml`.

### 6. Redeploy Service
1. After adding `DD_API_KEY`, go to the **Manual Deploy** section
2. Click **Deploy latest commit** (or wait for automatic deploy)
3. Wait for deployment to complete

### 7. Verify Datadog Integration
1. After deployment, check the **Logs** tab
2. Look for: `✅ Datadog initialized: service=ai-smart-lights, env=production, version=1.1.0`
3. If you see this message, Datadog is working!

### 8. Check Datadog Dashboard
1. Go to [https://app.datadoghq.com](https://app.datadoghq.com)
2. Navigate to **APM** → **Services**
3. You should see `ai-smart-lights` service
4. Click on it to see traces and metrics

## Troubleshooting

### If you don't see Datadog initialization in logs:
- Verify `DD_API_KEY` is set correctly in Render dashboard
- Check that the key is not the placeholder value
- Ensure the service has been redeployed after adding the key
- Check logs for any Datadog-related errors

### If APM data is not showing:
- Wait a few minutes for data to appear (can take 2-5 minutes)
- Make some API calls to generate traffic
- Check that `DD_TRACE_ENABLED=true` is set
- Verify the API key has APM permissions in Datadog

## Security Note
- Never commit `DD_API_KEY` to git
- Always use `sync: false` in render.yaml for sensitive keys
- The key should only exist in Render dashboard environment variables
