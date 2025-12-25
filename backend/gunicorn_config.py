"""
Gunicorn configuration for production deployment
This ensures proper initialization and prevents worker timeouts
"""

import os
import logging
import time as time_module

# #region agent log
_debug_log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.cursor', 'debug.log') if '__file__' in globals() else '/tmp/debug.log'
try:
    os.makedirs(os.path.dirname(_debug_log_path), exist_ok=True)
    with open(_debug_log_path, 'a') as f:
        f.write(f'{{"timestamp":{int(time_module.time()*1000)},"location":"gunicorn_config.py:10","message":"Gunicorn config loaded","hypothesisId":"D","sessionId":"debug-session","runId":"run1","data":{{"timeout":{int(os.getenv("TIMEOUT", "180"))}}}}}\n')
except: pass
# #endregion

# Get logger
logger = logging.getLogger(__name__)

def on_starting(server):
    """Called just before the master process is initialized"""
    logger.info("🚀 Gunicorn master process starting...")

def when_ready(server):
    """Called just after the server is started"""
    logger.info("✅ Gunicorn server is ready")

def post_fork(server, worker):
    """Called just after a worker has been forked"""
    # #region agent log
    _fork_time = time_module.time()
    try:
        with open(_debug_log_path, 'a') as f:
            f.write(f'{{"timestamp":{int(time_module.time()*1000)},"location":"gunicorn_config.py:20","message":"post_fork called","hypothesisId":"E","sessionId":"debug-session","runId":"run1","data":{{"worker_pid":{worker.pid}}}}}\n')
    except: pass
    # #endregion
    logger.info(f"🔄 Worker {worker.pid} forked - starting background initialization")
    # Initialize app components after worker is forked (non-blocking)
    # Use a small delay to ensure worker is fully ready before starting init
    import threading
    import time
    
    def delayed_init():
        # #region agent log
        try:
            with open(_debug_log_path, 'a') as f:
                f.write(f'{{"timestamp":{int(time_module.time()*1000)},"location":"gunicorn_config.py:28","message":"delayed_init started","hypothesisId":"E","sessionId":"debug-session","runId":"run1"}}\n')
        except: pass
        # #endregion
        # Small delay to ensure worker is ready
        time.sleep(0.2)
        try:
            # #region agent log
            _import_start = time_module.time()
            try:
                with open(_debug_log_path, 'a') as f:
                    f.write(f'{{"timestamp":{int(time_module.time()*1000)},"location":"gunicorn_config.py:32","message":"Importing initialize_app_background","hypothesisId":"E","sessionId":"debug-session","runId":"run1"}}\n')
            except: pass
            # #endregion
            from app import initialize_app_background
            # #region agent log
            _import_time = time_module.time() - _import_start
            try:
                with open(_debug_log_path, 'a') as f:
                    f.write(f'{{"timestamp":{int(time_module.time()*1000)},"location":"gunicorn_config.py:33","message":"Import complete","data":{{"import_time_ms":{_import_time*1000:.2f}}},"hypothesisId":"E","sessionId":"debug-session","runId":"run1"}}\n')
            except: pass
            # #endregion
            initialize_app_background()
        except Exception as e:
            logger.error(f"Error initializing app in worker: {e}")
            # #region agent log
            try:
                with open(_debug_log_path, 'a') as f:
                    f.write(f'{{"timestamp":{int(time_module.time()*1000)},"location":"gunicorn_config.py:35","message":"Initialization error","data":{{"error":str(e)}},"hypothesisId":"E","sessionId":"debug-session","runId":"run1"}}\n')
            except: pass
            # #endregion
    
    # Run in background thread to avoid blocking worker
    init_thread = threading.Thread(target=delayed_init, daemon=True)
    init_thread.start()
    # #region agent log
    _fork_complete_time = time_module.time() - _fork_time
    try:
        with open(_debug_log_path, 'a') as f:
            f.write(f'{{"timestamp":{int(time_module.time()*1000)},"location":"gunicorn_config.py:40","message":"post_fork complete","data":{{"fork_time_ms":{_fork_complete_time*1000:.2f}}},"hypothesisId":"E","sessionId":"debug-session","runId":"run1"}}\n')
    except: pass
    # #endregion
    logger.info(f"✅ Background initialization thread started for worker {worker.pid}")

def pre_fork(server, worker):
    """Called just before a worker is forked"""
    pass

def worker_int(worker):
    """Called when a worker receives INT or QUIT signal"""
    logger.info(f"Worker {worker.pid} received INT/QUIT signal")

def worker_abort(worker):
    """Called when a worker receives the ABRT signal"""
    logger.warning(f"Worker {worker.pid} received ABRT signal")

# Gunicorn settings
bind = f"0.0.0.0:{os.getenv('PORT', '5000')}"
workers = int(os.getenv('WORKERS', '1'))
worker_class = 'eventlet'
worker_connections = 1000
timeout = int(os.getenv('TIMEOUT', '180'))  # Increased timeout for initialization
keepalive = 5
max_requests = 1000
max_requests_jitter = 50
preload_app = False  # Set to False to allow per-worker initialization
accesslog = '-'
errorlog = '-'
loglevel = os.getenv('LOG_LEVEL', 'info').lower()

