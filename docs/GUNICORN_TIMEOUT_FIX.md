# Gunicorn Worker Timeout Fix

## Problem
The backend deployment was experiencing worker timeout errors:
```
[2025-12-24 18:24:33 +0000] [56] [CRITICAL] WORKER TIMEOUT (pid:71)
[2025-12-24 18:24:34 +0000] [56] [ERROR] Worker (pid:71) was sent code 134!
```

## Root Cause
The application was performing blocking operations at module import time:
1. **Database initialization** (`init_db()`) was called at module level
2. **AI model loading** (`get_ai_models()`) was called at module level
3. These operations blocked Gunicorn workers during startup, causing timeouts

When Gunicorn imports the app module, all module-level code executes immediately. If this code takes too long (e.g., loading large AI models), the worker never becomes ready and Gunicorn kills it.

## Solution

### 1. Lazy Initialization
Changed from eager initialization to lazy initialization:
- Database and AI models are only initialized when first needed
- Added `ensure_db_initialized()` and `ensure_ai_models_initialized()` functions
- All functions that use models now check if they're initialized first

### 2. Background Initialization
Created `initialize_app_background()` function that:
- Initializes database (fast operation)
- Starts background threads for AI models, scheduling, weather updates
- Runs in a non-blocking manner

### 3. Gunicorn Configuration
Created `gunicorn_config.py` with:
- Increased timeout from 30s to 120s
- `post_fork` hook to initialize app after worker is forked
- Initialization runs in background thread to avoid blocking

### 4. Updated Render Configuration
Updated `render.yaml` to:
- Use the new Gunicorn config file
- Set timeout to 120 seconds

## Files Changed

1. **`backend/app.py`**
   - Removed module-level `init_db()` and `get_ai_models()` calls
   - Added lazy initialization functions
   - Added `initialize_app_background()` function
   - Updated all model usage to check initialization first

2. **`backend/gunicorn_config.py`** (NEW)
   - Gunicorn configuration with proper hooks
   - Increased timeout settings
   - Background initialization in `post_fork` hook

3. **`render.yaml`**
   - Updated start command to use Gunicorn config file
   - Increased timeout to 120 seconds

## How It Works Now

1. **Module Import**: App module imports without blocking operations
2. **Worker Fork**: Gunicorn forks worker process
3. **Post-Fork Hook**: `post_fork` hook runs `initialize_app_background()` in background thread
4. **Lazy Loading**: Database and models initialize on first use if not already initialized
5. **Worker Ready**: Worker becomes ready immediately, initialization happens in background

## Testing

After deployment, verify:
1. Worker starts without timeout errors
2. `/api/status` endpoint responds quickly
3. AI features work after models finish loading
4. Background threads are running (check logs)

## Monitoring

Watch for these in logs:
- `✅ Database initialized`
- `✅ AI models initialization started`
- `✅ Schedule execution loop started`
- `✅ AI control loop started`
- `✅ Weather update loop started`

If you see warnings like "AI models not available", the models are still loading - this is normal and the app will use fallback behavior until models are ready.

