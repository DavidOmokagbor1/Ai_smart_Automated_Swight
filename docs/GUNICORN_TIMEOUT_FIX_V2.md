# Gunicorn Worker Timeout Fix - Version 2

## Problem
Workers are still timing out even after initial fixes. The issue is that module imports and initialization are still blocking worker startup.

## Additional Fixes Applied

### 1. Lazy AI Models Import
- **Before**: `from ai_models import get_ai_models, init_models` at module level
- **After**: Removed module-level import, import only when needed
- **Impact**: Prevents AI model loading from blocking module import

### 2. Non-Blocking Datadog StatsD
- **Before**: `initialize()` called synchronously during import
- **After**: StatsD initialization runs in background thread
- **Impact**: Datadog initialization no longer blocks startup

### 3. Increased Timeout
- **Before**: 120 seconds
- **After**: 180 seconds
- **Impact**: More time for worker to become ready

### 4. Delayed Initialization
- **Before**: Immediate initialization in `post_fork`
- **After**: Small delay (0.2s) before starting initialization
- **Impact**: Ensures worker is fully ready before starting heavy operations

### 5. Better Error Handling
- All initialization steps are now wrapped in try/except
- App can start even if some components fail to initialize
- Logs warnings instead of crashing

## Key Changes

### `backend/app.py`
- Removed `from ai_models import get_ai_models, init_models` at module level
- Made all AI model imports lazy (only when needed)
- Added delay in `initialize_app_background()` to ensure worker is ready

### `backend/datadog_integration.py`
- StatsD initialization now runs in background thread
- Prevents any blocking during Datadog setup

### `backend/gunicorn_config.py`
- Added delayed initialization in `post_fork` hook
- Better logging for initialization status

### `render.yaml`
- Increased timeout to 180 seconds
- Uses Gunicorn config file for proper initialization

## How It Works Now

1. **Module Import**: 
   - No blocking operations
   - AI models not imported
   - Datadog StatsD initialization deferred

2. **Worker Fork**: 
   - Gunicorn forks worker process
   - Worker becomes ready immediately

3. **Post-Fork Hook**: 
   - Small delay (0.2s) to ensure worker is ready
   - Starts background initialization thread

4. **Background Initialization**: 
   - Database initialization (fast)
   - AI models loading (in background thread)
   - Background threads for scheduling, AI control, weather

5. **Worker Ready**: 
   - Worker responds to requests immediately
   - Features become available as they initialize

## Expected Behavior

After deployment, you should see:
1. Worker starts without timeout
2. Logs show: `🔄 Worker X forked - starting background initialization`
3. Logs show: `✅ Background initialization thread started`
4. `/api/status` responds immediately
5. AI features work after models finish loading

## Monitoring

Watch for these log messages:
- `🔄 Worker X forked` - Worker started
- `✅ Background initialization thread started` - Init started
- `✅ Database initialized` - DB ready
- `✅ AI models initialization started` - Models loading
- `✅ Schedule execution loop started` - Background threads running

If you see warnings, the app is still functional - those features just aren't available yet.

