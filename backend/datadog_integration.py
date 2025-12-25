"""
Datadog Integration for AI Smart Light Control System

This module provides Datadog APM, logging, and custom metrics integration.
It automatically tracks:
- API endpoint performance
- Database queries
- External API calls
- Custom business metrics (lights, energy, AI predictions)
"""

import os
import logging
from functools import wraps
from datetime import datetime

logger = logging.getLogger(__name__)

# #region agent log - Debug log path setup
# Use relative path that works across environments
try:
    _debug_log_path = '/tmp/debug.log'  # Simple fallback that always works
    if '__file__' in globals():
        try:
            _debug_log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.cursor', 'debug.log')
            os.makedirs(os.path.dirname(_debug_log_path), exist_ok=True)
        except:
            _debug_log_path = '/tmp/debug.log'
except Exception:
    _debug_log_path = '/tmp/debug.log'  # Ensure it's set even if setup fails
# #endregion

# LAZY IMPORT: Don't import Datadog libraries at module level - they're heavy
# Import them only when needed to avoid blocking module import
DATADOG_AVAILABLE = None  # Will be checked on first use
_patch = None
_tracer = None
_config = None
_initialize = None
_statsd = None
_api = None

def _ensure_datadog_imported():
    """Lazy import of Datadog libraries - only when actually needed"""
    global DATADOG_AVAILABLE, _patch, _tracer, _config, _initialize, _statsd, _api
    if DATADOG_AVAILABLE is not None:
        return DATADOG_AVAILABLE
    
    try:
        from ddtrace import patch as _patch, tracer as _tracer, config as _config
        from datadog import initialize as _initialize, statsd as _statsd, api as _api
        DATADOG_AVAILABLE = True
        return True
    except ImportError:
        DATADOG_AVAILABLE = False
        # Create dummy functions
        class DummyTracer:
            def trace(self, *args, **kwargs):
                class DummyContext:
                    def __enter__(self):
                        return self
                    def __exit__(self, *args):
                        pass
                return DummyContext()
            def set_tags(self, *args, **kwargs):
                pass
        
        class DummyStatsd:
            def increment(self, *args, **kwargs):
                pass
            def gauge(self, *args, **kwargs):
                pass
            def histogram(self, *args, **kwargs):
                pass
            def timing(self, *args, **kwargs):
                pass
        
        _tracer = DummyTracer()
        _statsd = DummyStatsd()
        _patch = lambda *args, **kwargs: None
        _initialize = lambda *args, **kwargs: None
        _config = type('obj', (object,), {'flask': {}})()
        return False

# Create module-level aliases that will be set on first use
def _get_tracer():
    _ensure_datadog_imported()
    return _tracer

def _get_statsd():
    _ensure_datadog_imported()
    return _statsd

def _get_patch():
    _ensure_datadog_imported()
    return _patch

def _get_config():
    _ensure_datadog_imported()
    return _config

def _get_initialize():
    _ensure_datadog_imported()
    return _initialize

def init_datadog_early():
    """
    Initialize Datadog patching EARLY - before Flask is imported.
    
    This MUST be called before importing Flask for proper instrumentation.
    """
    if not _ensure_datadog_imported():
        return False
    
    patch = _get_patch()
    tracer = _get_tracer()
    config = _get_config()
    initialize = _get_initialize()
    
    # Load environment variables if not already loaded
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check if Datadog is enabled
    dd_api_key = os.getenv('DD_API_KEY')
    if not dd_api_key or dd_api_key == 'your-datadog-api-key-here':
        return False
    
    try:
        # Configure Datadog
        dd_service = os.getenv('DD_SERVICE', 'ai-smart-lights')
        dd_env = os.getenv('DD_ENV', 'production')
        dd_version = os.getenv('DD_VERSION', '1.1.0')
        
        # Configure Flask tracing BEFORE Flask is imported
        config.flask['service'] = dd_service
        config.flask['analytics_enabled'] = True
        config.flask['analytics_sample_rate'] = 1.0  # 100% sampling
        
        # CRITICAL: Patch Flask BEFORE it's imported
        # #region agent log
        import time as time_module
        _patch_start = time_module.time()
        try:
            with open(_debug_log_path, 'a') as f:
                f.write(f'{{"timestamp":{int(time_module.time()*1000)},"location":"datadog_integration.py:81","message":"Starting patch calls","hypothesisId":"B","sessionId":"debug-session","runId":"run1"}}\n')
        except: pass
        # #endregion
        patch(flask=True)
        # #region agent log
        _patch_flask_time = time_module.time() - _patch_start
        try:
            with open(_debug_log_path, 'a') as f:
                f.write(f'{{"timestamp":{int(time_module.time()*1000)},"location":"datadog_integration.py:81","message":"Flask patch complete","data":{{"patch_time_ms":{_patch_flask_time*1000:.2f}}},"hypothesisId":"B","sessionId":"debug-session","runId":"run1"}}\n')
        except: pass
        # #endregion
        patch(requests=True)
        patch(sqlite3=True)
        # #region agent log
        _patch_total_time = time_module.time() - _patch_start
        try:
            with open(_debug_log_path, 'a') as f:
                f.write(f'{{"timestamp":{int(time_module.time()*1000)},"location":"datadog_integration.py:83","message":"All patches complete","data":{{"total_patch_time_ms":{_patch_total_time*1000:.2f}}},"hypothesisId":"B","sessionId":"debug-session","runId":"run1"}}\n')
        except: pass
        # #endregion
        
        # Set global tags (after tracer is available)
        tracer_obj = _get_tracer()
        tracer_obj.set_tags({
            'environment': dd_env,
            'service': dd_service,
            'version': dd_version,
            'deployment': os.getenv('FLASK_ENV', 'production')
        })
        
        # Initialize Datadog StatsD client (non-blocking, optional)
        # Note: APM (ddtrace) works independently - StatsD is only for custom metrics
        # We initialize it in a way that won't block app startup
        try:
            # Only initialize if we have the API key - but don't block on connection
            # The datadog library will buffer metrics locally if connection fails
            # Run in background thread to avoid any blocking during import
            import threading
            def init_statsd():
                try:
                    init_func = _get_initialize()
                    init_func(
                        api_key=dd_api_key,
                        app_key=os.getenv('DD_APP_KEY', ''),  # Optional
                    )
                except Exception:
                    pass  # Don't fail if StatsD init fails
            
            # Start in background thread to avoid blocking
            statsd_thread = threading.Thread(target=init_statsd, daemon=True)
            statsd_thread.start()
        except Exception as init_error:
            # Don't fail if StatsD init fails - APM tracing will still work
            # Custom metrics might not work, but the app will function
            pass
        
        return True
        
    except Exception as e:
        # Don't log here as logger might not be set up yet
        return False

def init_datadog(app=None):
    """
    Initialize Datadog APM and monitoring (after Flask is imported).
    
    This is called after Flask app is created to complete setup.
    """
    if not _ensure_datadog_imported():
        logger.info("Datadog not available - skipping initialization")
        return False
    
    tracer = _get_tracer()
    
    # Check if Datadog is enabled
    dd_api_key = os.getenv('DD_API_KEY')
    if not dd_api_key or dd_api_key == 'your-datadog-api-key-here':
        logger.info("Datadog API key not configured - skipping initialization")
        return False
    
    try:
        # Configure Datadog
        dd_service = os.getenv('DD_SERVICE', 'ai-smart-lights')
        dd_env = os.getenv('DD_ENV', 'production')
        dd_version = os.getenv('DD_VERSION', '1.1.0')
        
        # Set global tags
        tracer_obj = _get_tracer()
        tracer_obj.set_tags({
            'environment': dd_env,
            'service': dd_service,
            'version': dd_version,
            'deployment': os.getenv('FLASK_ENV', 'production')
        })
        
        logger.info(f"✅ Datadog initialized: service={dd_service}, env={dd_env}, version={dd_version}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize Datadog: {e}")
        return False

def setup_datadog_flask(app):
    """
    Set up Datadog tracing for Flask app.
    
    Note: In newer versions of ddtrace, Flask is automatically patched
    when patch(flask=True) is called before Flask import. This function
    just verifies configuration and logs status.
    
    Args:
        app: Flask application instance
    """
    if not _ensure_datadog_imported():
        return False
    
    config = _get_config()
    
    dd_api_key = os.getenv('DD_API_KEY')
    if not dd_api_key or dd_api_key == 'your-datadog-api-key-here':
        return False
    
    try:
        # Verify Flask app is patched (it should be from init_datadog_early)
        # In ddtrace 2.x, Flask is automatically instrumented when patched
        dd_service = os.getenv('DD_SERVICE', 'ai-smart-lights')
        
        # Ensure service name is set in config
        config.flask['service'] = dd_service
        
        logger.info("✅ Datadog Flask tracing enabled (automatic patching)")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to setup Datadog Flask tracing: {e}")
        return False

# Custom Metrics Functions

def track_light_control(room, action, brightness=None):
    """Track light control actions"""
    if not _ensure_datadog_imported():
        return
    
    try:
        statsd = _get_statsd()
        statsd.increment('lights.control.count', tags=[
            f'room:{room}',
            f'action:{action}'
        ])
        
        if brightness is not None:
            statsd.gauge('lights.brightness', brightness, tags=[
                f'room:{room}',
                f'status:{"on" if brightness > 0 else "off"}'
            ])
    except Exception as e:
        logger.debug(f"Failed to track light control metric: {e}")

def track_ai_prediction(room, prediction, confidence=None):
    """Track AI predictions"""
    if not _ensure_datadog_imported():
        return
    
    try:
        statsd = _get_statsd()
        statsd.increment('ai.predictions.count', tags=[
            f'room:{room}',
            f'prediction:{"occupied" if prediction else "unoccupied"}'
        ])
        
        if confidence is not None:
            statsd.gauge('ai.confidence', confidence, tags=[f'room:{room}'])
    except Exception as e:
        logger.debug(f"Failed to track AI prediction metric: {e}")

def track_energy_metrics(consumption=None, savings=None):
    """Track energy consumption and savings"""
    if not _ensure_datadog_imported():
        return
    
    try:
        statsd = _get_statsd()
        if consumption is not None:
            statsd.gauge('energy.consumption', consumption)
        
        if savings is not None:
            statsd.gauge('energy.savings', savings)
            statsd.increment('energy.savings.count')
    except Exception as e:
        logger.debug(f"Failed to track energy metric: {e}")

def track_weather_api_call(success=True, cache_hit=False):
    """Track weather API calls"""
    if not _ensure_datadog_imported():
        return
    
    try:
        statsd = _get_statsd()
        statsd.increment('weather.api.calls', tags=[
            f'success:{str(success).lower()}',
            f'cache_hit:{str(cache_hit).lower()}'
        ])
        
        if cache_hit:
            statsd.increment('weather.cache.hits')
    except Exception as e:
        logger.debug(f"Failed to track weather API metric: {e}")

def track_schedule_execution(room, action):
    """Track schedule executions"""
    if not _ensure_datadog_imported():
        return
    
    try:
        statsd = _get_statsd()
        statsd.increment('schedules.executed', tags=[
            f'room:{room}',
            f'action:{action}'
        ])
    except Exception as e:
        logger.debug(f"Failed to track schedule execution metric: {e}")

def track_websocket_event(event_type, room=None):
    """Track WebSocket events"""
    if not _ensure_datadog_imported():
        return
    
    try:
        statsd = _get_statsd()
        tags = [f'event_type:{event_type}']
        if room:
            tags.append(f'room:{room}')
        
        statsd.increment('websocket.events', tags=tags)
    except Exception as e:
        logger.debug(f"Failed to track WebSocket metric: {e}")

# Decorator for tracking function execution time
def datadog_trace(operation_name, service=None, resource=None):
    """
    Decorator to trace function execution with Datadog.
    
    Usage:
        @datadog_trace('ai.predict_occupancy', service='ai-models')
        def predict_occupancy(room):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not _ensure_datadog_imported():
                return func(*args, **kwargs)
            
            tracer = _get_tracer()
            with tracer.trace(operation_name, service=service, resource=resource):
                return func(*args, **kwargs)
        return wrapper
    return decorator

# Context manager for custom spans
class DatadogSpan:
    """Context manager for custom Datadog spans"""
    
    def __init__(self, operation_name, service=None, resource=None):
        self.operation_name = operation_name
        self.service = service
        self.resource = resource
        self.span = None
    
    def __enter__(self):
        if _ensure_datadog_imported():
            tracer = _get_tracer()
            self.span = tracer.trace(
                self.operation_name,
                service=self.service,
                resource=self.resource
            )
            return self.span
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.span:
            if exc_type:
                self.span.set_error(exc_type, exc_val)
            self.span.finish()
        return False

# Helper to check if Datadog is enabled
def is_datadog_enabled():
    """Check if Datadog is properly configured and enabled"""
    if not _ensure_datadog_imported():
        return False
    
    dd_api_key = os.getenv('DD_API_KEY')
    return dd_api_key and dd_api_key != 'your-datadog-api-key-here'

