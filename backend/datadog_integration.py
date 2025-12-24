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

# Try to import Datadog libraries (optional dependency)
try:
    from ddtrace import patch, tracer, config
    from datadog import initialize, statsd, api
    DATADOG_AVAILABLE = True
except ImportError:
    DATADOG_AVAILABLE = False
    logger.warning("Datadog libraries not installed. Install with: pip install ddtrace datadog")
    # Create dummy functions for when Datadog is not available
    def tracer(*args, **kwargs):
        class DummyTracer:
            def trace(self, *args, **kwargs):
                class DummyContext:
                    def __enter__(self):
                        return self
                    def __exit__(self, *args):
                        pass
                return DummyContext()
        return DummyTracer()
    
    class DummyStatsd:
        def increment(self, *args, **kwargs):
            pass
        def gauge(self, *args, **kwargs):
            pass
        def histogram(self, *args, **kwargs):
            pass
        def timing(self, *args, **kwargs):
            pass
    
    statsd = DummyStatsd()

def init_datadog_early():
    """
    Initialize Datadog patching EARLY - before Flask is imported.
    
    This MUST be called before importing Flask for proper instrumentation.
    """
    if not DATADOG_AVAILABLE:
        return False
    
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
        patch(flask=True)
        patch(requests=True)
        patch(sqlite3=True)
        
        # Set global tags (after tracer is available)
        tracer.set_tags({
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
                    initialize(
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
    if not DATADOG_AVAILABLE:
        logger.info("Datadog not available - skipping initialization")
        return False
    
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
        tracer.set_tags({
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
    if not DATADOG_AVAILABLE:
        return False
    
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
    if not DATADOG_AVAILABLE:
        return
    
    try:
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
    if not DATADOG_AVAILABLE:
        return
    
    try:
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
    if not DATADOG_AVAILABLE:
        return
    
    try:
        if consumption is not None:
            statsd.gauge('energy.consumption', consumption)
        
        if savings is not None:
            statsd.gauge('energy.savings', savings)
            statsd.increment('energy.savings.count')
    except Exception as e:
        logger.debug(f"Failed to track energy metric: {e}")

def track_weather_api_call(success=True, cache_hit=False):
    """Track weather API calls"""
    if not DATADOG_AVAILABLE:
        return
    
    try:
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
    if not DATADOG_AVAILABLE:
        return
    
    try:
        statsd.increment('schedules.executed', tags=[
            f'room:{room}',
            f'action:{action}'
        ])
    except Exception as e:
        logger.debug(f"Failed to track schedule execution metric: {e}")

def track_websocket_event(event_type, room=None):
    """Track WebSocket events"""
    if not DATADOG_AVAILABLE:
        return
    
    try:
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
            if not DATADOG_AVAILABLE:
                return func(*args, **kwargs)
            
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
        if DATADOG_AVAILABLE:
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
    if not DATADOG_AVAILABLE:
        return False
    
    dd_api_key = os.getenv('DD_API_KEY')
    return dd_api_key and dd_api_key != 'your-datadog-api-key-here'

