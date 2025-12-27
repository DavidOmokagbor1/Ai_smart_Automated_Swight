"""
Gunicorn configuration for production deployment
This ensures proper initialization and prevents worker timeouts
"""

import os
import logging

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
    logger.info(f"🔄 Worker {worker.pid} forked - starting background initialization")
    # Initialize app components after worker is forked (non-blocking)
    # CRITICAL: Don't block here - worker must become ready quickly for health checks
    import threading
    import time
    
    def delayed_init():
        # Longer delay to ensure worker is fully ready and can respond to health checks
        time.sleep(1.0)  # Increased delay to let worker become ready first
        try:
            from app import initialize_app_background
            initialize_app_background()
        except Exception as e:
            logger.error(f"Error initializing app in worker: {e}", exc_info=True)
            # Don't fail worker - app can run with minimal initialization
    
    # Run in background thread to avoid blocking worker
    # Worker must be able to respond to health checks immediately
    init_thread = threading.Thread(target=delayed_init, daemon=True)
    init_thread.start()
    logger.info(f"✅ Background initialization thread started for worker {worker.pid} - worker ready to accept requests")

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
timeout = int(os.getenv('TIMEOUT', '300'))  # Increased timeout for Render health checks (5 minutes)
graceful_timeout = int(os.getenv('GRACEFUL_TIMEOUT', '120'))  # Time to wait for graceful shutdown
keepalive = 5
max_requests = 1000
max_requests_jitter = 50
preload_app = False  # Set to False to allow per-worker initialization
accesslog = '-'
errorlog = '-'
loglevel = os.getenv('LOG_LEVEL', 'info').lower()

