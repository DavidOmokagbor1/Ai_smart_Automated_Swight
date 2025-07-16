import os
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import json
import sqlite3
from datetime import datetime, timedelta
import random
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle
import logging
from dotenv import load_dotenv
import requests
import threading
import time

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

# Configure CORS for production
CORS(app, origins=os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(','))

socketio = SocketIO(app, cors_allowed_origins=os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001').split(','))

# Production configuration
if os.getenv('FLASK_ENV') == 'production':
    app.config['DEBUG'] = False
    app.config['TESTING'] = False
else:
    app.config['DEBUG'] = True

# Weather API Configuration
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', 'demo_key')
WEATHER_CITY = os.getenv('WEATHER_CITY', 'London')
WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

# Weather cache to avoid too many API calls
weather_cache = {
    'data': None,
    'last_update': None,
    'cache_duration': 300  # 5 minutes
}

# Schedule execution tracking
schedule_execution_tracker = {}

# Initialize with some sample activity logs
def init_sample_logs():
    """Initialize with sample activity logs for demonstration"""
    if not hasattr(app, 'activity_logs'):
        app.activity_logs = []
        
        # Add sample logs
        sample_logs = [
            {
                'id': 1,
                'timestamp': (datetime.now() - timedelta(minutes=2)).isoformat(),
                'action': 'light_toggle',
                'room': 'living_room',
                'user': 'admin',
                'details': {
                    'previous_status': 'off',
                    'new_status': 'on',
                    'brightness': 80,
                    'method': 'manual_control'
                },
                'ip_address': '192.168.1.100'
            },
            {
                'id': 2,
                'timestamp': (datetime.now() - timedelta(minutes=5)).isoformat(),
                'action': 'brightness_adjust',
                'room': 'kitchen',
                'user': 'admin',
                'details': {
                    'previous_brightness': 60,
                    'new_brightness': 90,
                    'status': 'on',
                    'method': 'manual_control'
                },
                'ip_address': '192.168.1.100'
            },
            {
                'id': 3,
                'timestamp': (datetime.now() - timedelta(minutes=10)).isoformat(),
                'action': 'ai_mode_toggle',
                'room': None,
                'user': 'admin',
                'details': {
                    'previous_state': False,
                    'new_state': True,
                    'method': 'manual_control'
                },
                'ip_address': '192.168.1.100'
            },
            {
                'id': 4,
                'timestamp': (datetime.now() - timedelta(minutes=15)).isoformat(),
                'action': 'bulk_light_control',
                'room': None,
                'user': 'admin',
                'details': {
                    'action': 'on',
                    'brightness': 100,
                    'affected_rooms': ['living_room', 'kitchen', 'bedroom', 'bathroom', 'office'],
                    'total_rooms': 5,
                    'method': 'bulk_control'
                },
                'ip_address': '192.168.1.100'
            },
            {
                'id': 5,
                'timestamp': (datetime.now() - timedelta(minutes=20)).isoformat(),
                'action': 'color_temperature_change',
                'room': 'bedroom',
                'user': 'admin',
                'details': {
                    'previous_temperature': 'warm',
                    'new_temperature': 'cool',
                    'method': 'manual_control'
                },
                'ip_address': '192.168.1.100'
            }
        ]
        
        app.activity_logs = sample_logs

def log_activity(action, room=None, details=None, user_id=1, ip_address=None):
    """Log user activity to database"""
    try:
        if ip_address is None:
            ip_address = request.remote_addr if request else 'unknown'
        
        # Create activity log entry
        activity_log = {
            'id': random.randint(1000, 9999),
            'timestamp': datetime.now().isoformat(),
            'action': action,
            'room': room,
            'user': 'admin',
            'details': details,
            'ip_address': ip_address
        }
        
        # Store in memory for now (in production, use database)
        if not hasattr(app, 'activity_logs'):
            app.activity_logs = []
        
        app.activity_logs.insert(0, activity_log)
        
        # Keep only last 1000 logs
        if len(app.activity_logs) > 1000:
            app.activity_logs = app.activity_logs[:1000]
        
        # Emit real-time update
        socketio.emit('activity_logged', activity_log)
        
        logger.info(f"Activity logged: {action} in {room} - {details}")
        
    except Exception as e:
        logger.error(f"Error logging activity: {e}")

def get_weather_data():
    """Get current weather data with caching"""
    current_time = datetime.now()
    
    # Return cached data if still valid
    if (weather_cache['data'] and weather_cache['last_update'] and 
        (current_time - weather_cache['last_update']).seconds < weather_cache['cache_duration']):
        return weather_cache['data']
    
    try:
        # Use demo data if no API key
        if WEATHER_API_KEY == 'demo_key':
            weather_data = {
                'main': {
                    'temp': 20,
                    'humidity': 65,
                    'pressure': 1013
                },
                'weather': [{
                    'main': 'Clouds',
                    'description': 'scattered clouds',
                    'icon': '03d'
                }],
                'clouds': {'all': 40},
                'visibility': 10000,
                'wind': {'speed': 5, 'deg': 180},
                'sys': {'sunrise': 1640995200, 'sunset': 1641038400}
            }
        else:
            # Real API call
            params = {
                'q': WEATHER_CITY,
                'appid': WEATHER_API_KEY,
                'units': 'metric'
            }
            response = requests.get(WEATHER_BASE_URL, params=params, timeout=5)
            weather_data = response.json()
        
        # Cache the data
        weather_cache['data'] = weather_data
        weather_cache['last_update'] = current_time
        
        return weather_data
    except Exception as e:
        logger.error(f"Error fetching weather data: {e}")
        return None

def get_weather_lighting_adjustment():
    """Calculate lighting adjustment based on weather"""
    weather_data = get_weather_data()
    if not weather_data:
        return 1.0  # No adjustment if weather data unavailable
    
    weather_main = weather_data['weather'][0]['main'].lower()
    weather_desc = weather_data['weather'][0]['description'].lower()
    clouds = weather_data.get('clouds', {}).get('all', 0)
    visibility = weather_data.get('visibility', 10000)
    
    # Base adjustment factor
    adjustment = 1.0
    
    # Weather condition adjustments
    if 'rain' in weather_desc or 'drizzle' in weather_desc:
        adjustment = 1.3  # 30% brighter for rain
    elif 'snow' in weather_desc:
        adjustment = 1.4  # 40% brighter for snow
    elif 'thunderstorm' in weather_desc:
        adjustment = 1.5  # 50% brighter for storms
    elif 'fog' in weather_desc or 'mist' in weather_desc:
        adjustment = 1.2  # 20% brighter for fog
    elif 'clear' in weather_desc and clouds < 20:
        adjustment = 0.7  # 30% dimmer for clear skies
    elif clouds > 80:
        adjustment = 1.2  # 20% brighter for cloudy skies
    
    # Visibility adjustments
    if visibility < 5000:  # Poor visibility
        adjustment *= 1.2
    
    # Time of day adjustments
    current_hour = datetime.now().hour
    if 6 <= current_hour <= 18:  # Daytime
        if weather_main == 'clear':
            adjustment *= 0.8  # Even dimmer during clear daytime
    
    return max(0.5, min(1.5, adjustment))  # Clamp between 0.5 and 1.5

def get_natural_light_factor():
    """Get natural light factor based on weather and time"""
    weather_data = get_weather_data()
    if not weather_data:
        return 0.5  # Default factor
    
    current_hour = datetime.now().hour
    weather_main = weather_data['weather'][0]['main'].lower()
    clouds = weather_data.get('clouds', {}).get('all', 0)
    
    # Base natural light factor by time of day
    if 6 <= current_hour <= 10:  # Early morning
        base_factor = 0.6
    elif 10 <= current_hour <= 16:  # Midday
        base_factor = 0.9
    elif 16 <= current_hour <= 20:  # Late afternoon
        base_factor = 0.4
    else:  # Night
        base_factor = 0.1
    
    # Weather adjustments
    if weather_main == 'clear' and clouds < 30:
        weather_multiplier = 1.2
    elif weather_main == 'clouds' and clouds > 70:
        weather_multiplier = 0.6
    elif 'rain' in weather_data['weather'][0]['description'].lower():
        weather_multiplier = 0.3
    else:
        weather_multiplier = 0.8
    
    return min(1.0, base_factor * weather_multiplier)

def execute_schedule_event(room, event):
    """Execute a scheduled event for a room"""
    try:
        if event['action'] == 'on':
            # Apply weather adjustments for brightness
            base_brightness = event.get('brightness', 100)
            weather_adjustment = get_weather_lighting_adjustment()
            adjusted_brightness = int(base_brightness * weather_adjustment)
            
            # Update light state
            if room in lights_state:
                lights_state[room]['status'] = 'on'
                lights_state[room]['brightness'] = min(100, max(0, adjusted_brightness))
                
                # Emit socket event
                socketio.emit('light_update', {
                    'room': room,
                    'state': lights_state[room],
                    'source': 'schedule'
                })
                
                logger.info(f"Schedule executed: {room} lights turned ON at {adjusted_brightness}% brightness")
                
        elif event['action'] == 'off':
            if room in lights_state:
                lights_state[room]['status'] = 'off'
                lights_state[room]['brightness'] = 0
                
                # Emit socket event
                socketio.emit('light_update', {
                    'room': room,
                    'state': lights_state[room],
                    'source': 'schedule'
                })
                
                logger.info(f"Schedule executed: {room} lights turned OFF")
                
    except Exception as e:
        logger.error(f"Error executing schedule event for {room}: {e}")

def check_and_execute_schedules():
    """Check current time against schedules and execute events"""
    try:
        current_time = datetime.now()
        current_day = current_time.strftime('%A').lower()
        current_time_str = current_time.strftime('%H:%M')
        
        # Check each room's schedule
        for room, schedule in schedules.items():
            if not schedule.get('enabled', False):
                continue
                
            daily_schedule = schedule.get('daily_schedule', {}).get(current_day, [])
            
            for event in daily_schedule:
                event_time = event.get('time', '')
                event_key = f"{room}_{current_day}_{event_time}"
                
                # Check if this event should be executed now
                if event_time == current_time_str:
                    # Check if we haven't already executed this event today
                    if event_key not in schedule_execution_tracker:
                        execute_schedule_event(room, event)
                        schedule_execution_tracker[event_key] = current_time
                        
                        # Clean up old tracker entries (older than 1 day)
                        for key, timestamp in list(schedule_execution_tracker.items()):
                            if (current_time - timestamp).days > 0:
                                del schedule_execution_tracker[key]
                                
    except Exception as e:
        logger.error(f"Error in schedule execution check: {e}")

def schedule_execution_loop():
    """Background loop for schedule execution"""
    while True:
        try:
            check_and_execute_schedules()
            time.sleep(60)  # Check every minute
        except Exception as e:
            logger.error(f"Error in schedule execution loop: {e}")
            time.sleep(60)  # Continue after error

# Database setup
def init_db():
    conn = sqlite3.connect('instance/smart_lights.db')
    c = conn.cursor()
    
    # Create tables if they don't exist
    c.execute('''CREATE TABLE IF NOT EXISTS lights
                 (room TEXT PRIMARY KEY, status TEXT, brightness INTEGER, 
                  color_temperature TEXT, motion_detected BOOLEAN)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS energy_usage
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, 
                  daily_consumption REAL, cost_saved REAL, usage_history TEXT)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS schedules
                 (room TEXT PRIMARY KEY, enabled BOOLEAN, vacation_mode BOOLEAN,
                  sunrise_sunset BOOLEAN, daily_schedule TEXT)''')
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

# AI Models
def load_ai_models():
    try:
        # Load pre-trained models if they exist
        if os.path.exists('occupancy_model.pkl'):
            with open('occupancy_model.pkl', 'rb') as f:
                return pickle.load(f)
        else:
            # Create a simple model for demo
            model = RandomForestClassifier(n_estimators=10, random_state=42)
            # Train with dummy data
            X = np.random.rand(100, 5)  # 5 features
            y = np.random.randint(0, 2, 100)  # Binary occupancy
            model.fit(X, y)
            return model
    except Exception as e:
        logger.error(f"Error loading AI models: {e}")
        return None

# Load AI models
ai_model = load_ai_models()

# AI Mode state
ai_mode_enabled = False


user_patterns = {
    'living_room': {'morning': 0.8, 'afternoon': 0.3, 'evening': 0.9, 'night': 0.1},
    'kitchen': {'morning': 0.9, 'afternoon': 0.4, 'evening': 0.7, 'night': 0.2},
    'bedroom': {'morning': 0.6, 'afternoon': 0.1, 'evening': 0.8, 'night': 0.9},
    'bathroom': {'morning': 0.8, 'afternoon': 0.2, 'evening': 0.3, 'night': 0.4},
    'office': {'morning': 0.7, 'afternoon': 0.9, 'evening': 0.5, 'night': 0.1}
}

def get_time_of_day():
    """Get current time of day category"""
    hour = datetime.now().hour
    if 6 <= hour < 12:
        return 'morning'
    elif 12 <= hour < 17:
        return 'afternoon'
    elif 17 <= hour < 22:
        return 'evening'
    else:
        return 'night'

def predict_occupancy(room):
    """Predict if a room will be occupied based on time and patterns"""
    try:
        time_of_day = get_time_of_day()
        base_probability = user_patterns[room][time_of_day]
        
        # Add some randomness for demo, but make it more predictable
        noise = np.random.normal(0, 0.05)  # Reduced noise for more consistent behavior
        probability = max(0, min(1, base_probability + noise))
        
        # Log the prediction for debugging
        logger.info(f"AI Prediction for {room}: {probability:.2f} (base: {base_probability:.2f}, time: {time_of_day})")
        
        return probability > 0.5
    except Exception as e:
        logger.error(f"Error in predict_occupancy for {room}: {e}")
        return False  # Default to not occupied if there's an error

def optimize_brightness(room, current_brightness):
    """Optimize brightness based on natural light, weather, and occupancy"""
    try:
        time_of_day = get_time_of_day()
        
        # Get weather-based adjustments
        weather_adjustment = get_weather_lighting_adjustment()
        natural_light_factor = get_natural_light_factor()
        
        # Base natural light factor by time of day
        natural_light_factor_time = {
            'morning': 0.8,
            'afternoon': 0.9,
            'evening': 0.3,
            'night': 0.1
        }
        
        # Combine time and weather factors
        combined_natural_light = natural_light_factor * natural_light_factor_time[time_of_day]
        
        # Calculate optimized brightness
        base_brightness = current_brightness if current_brightness > 0 else 80
        weather_optimized = int(base_brightness * weather_adjustment)
        natural_light_optimized = int(weather_optimized * (1 - combined_natural_light * 0.4))
        
        # Room-specific adjustments
        room_adjustments = {
            'living_room': 1.0,  # Standard
            'kitchen': 1.1,      # Slightly brighter for cooking
            'bedroom': 0.8,      # Dimmer for comfort
            'bathroom': 1.2,     # Brighter for safety
            'office': 1.0        # Standard
        }
        
        final_brightness = int(natural_light_optimized * room_adjustments.get(room, 1.0))
        
        # Ensure minimum and maximum brightness
        optimized = max(20, min(100, final_brightness))
        
        logger.info(f"AI Brightness optimization for {room}: {current_brightness} -> {optimized}")
        return optimized
    except Exception as e:
        logger.error(f"Error in optimize_brightness for {room}: {e}")
        return 80  # Default brightness if there's an error

def ai_control_lights():
    """AI-powered light control"""
    if not ai_mode_enabled:
        return
    
    try:
        current_time = datetime.now()
        time_of_day = get_time_of_day()
        
        logger.info(f"AI Control running at {current_time.strftime('%H:%M:%S')} ({time_of_day})")
        
        for room in lights_state:
            try:
                # Predict occupancy
                will_be_occupied = predict_occupancy(room)
                
                if will_be_occupied:
                    # Turn on lights with optimized brightness
                    current_brightness = lights_state[room]['brightness']
                    optimized_brightness = optimize_brightness(room, current_brightness)
                    
                    if lights_state[room]['status'] == 'off':
                        lights_state[room]['status'] = 'on'
                        lights_state[room]['brightness'] = optimized_brightness
                        
                        logger.info(f"AI turned ON lights in {room} (brightness: {optimized_brightness})")
                        
                        # Emit socket event with error handling
                        try:
                            socketio.emit('light_update', {
                                'room': room,
                                'state': lights_state[room]
                            })
                        except Exception as socket_error:
                            logger.warning(f"Socket emit failed for light update: {socket_error}")
                        
                        # Emit AI prediction event with error handling
                        try:
                            socketio.emit('ai_prediction', {
                                'room': room,
                                'prediction': 'occupied',
                                'confidence': user_patterns[room][time_of_day]
                            })
                        except Exception as socket_error:
                            logger.warning(f"Socket emit failed for AI prediction: {socket_error}")
                else:
                    # Turn off lights if not occupied
                    if lights_state[room]['status'] == 'on':
                        lights_state[room]['status'] = 'off'
                        lights_state[room]['brightness'] = 0
                        
                        logger.info(f"AI turned OFF lights in {room} (no occupancy predicted)")
                        
                        # Emit socket event with error handling
                        try:
                            socketio.emit('light_update', {
                                'room': room,
                                'state': lights_state[room]
                            })
                        except Exception as socket_error:
                            logger.warning(f"Socket emit failed for light update: {socket_error}")
                        
                        try:
                            socketio.emit('auto_off', {
                                'room': room,
                                'reason': 'AI detected no occupancy'
                            })
                        except Exception as socket_error:
                            logger.warning(f"Socket emit failed for auto_off: {socket_error}")
            except Exception as room_error:
                logger.error(f"Error processing room {room} in AI control: {room_error}")
                continue
    except Exception as e:
        logger.error(f"Error in AI control lights: {e}")

def ai_control_loop():
    """Background thread for AI control"""
    logger.info("AI Control loop started")
    while True:
        try:
            if ai_mode_enabled:
                ai_control_lights()
            time.sleep(30)  # Check every 30 seconds
        except Exception as e:
            logger.error(f"Error in AI control loop: {e}")
            time.sleep(30)  # Continue loop even if there's an error



# Global state - Define these before functions that use them
lights_state = {
    'living_room': {'status': 'off', 'brightness': 0, 'color_temperature': 'warm', 'motion_detected': False},
    'kitchen': {'status': 'off', 'brightness': 0, 'color_temperature': 'warm', 'motion_detected': False},
    'bedroom': {'status': 'off', 'brightness': 0, 'color_temperature': 'warm', 'motion_detected': False},
    'bathroom': {'status': 'off', 'brightness': 0, 'color_temperature': 'warm', 'motion_detected': False},
    'office': {'status': 'off', 'brightness': 0, 'color_temperature': 'warm', 'motion_detected': False}
}

energy_data = {
    'daily_consumption': 12.5,
    'cost_saved': 3.75,
    'usage_history': [
        {'consumption': 0.8, 'cost': 0.24, 'timestamp': '2024-01-01T00:00:00'},
        {'consumption': 0.6, 'cost': 0.18, 'timestamp': '2024-01-01T01:00:00'},
        # Add more historical data...
    ]
}

schedules = {
    'living_room': {
        'enabled': True,
        'vacation_mode': False,
        'sunrise_sunset': True,
        'daily_schedule': {
            'monday': [{'time': '07:00', 'action': 'on', 'brightness': 80}, {'time': '22:00', 'action': 'off'}],
            'tuesday': [{'time': '07:00', 'action': 'on', 'brightness': 80}, {'time': '22:00', 'action': 'off'}],
            'wednesday': [{'time': '07:00', 'action': 'on', 'brightness': 80}, {'time': '22:00', 'action': 'off'}],
            'thursday': [{'time': '07:00', 'action': 'on', 'brightness': 80}, {'time': '22:00', 'action': 'off'}],
            'friday': [{'time': '07:00', 'action': 'on', 'brightness': 80}, {'time': '22:00', 'action': 'off'}],
            'saturday': [{'time': '08:00', 'action': 'on', 'brightness': 60}, {'time': '23:00', 'action': 'off'}],
            'sunday': [{'time': '08:00', 'action': 'on', 'brightness': 60}, {'time': '22:00', 'action': 'off'}]
        }
    },
    'kitchen': {
        'enabled': False,
        'vacation_mode': False,
        'sunrise_sunset': False,
        'daily_schedule': {
            'monday': [{'time': '06:30', 'action': 'on', 'brightness': 100}, {'time': '23:00', 'action': 'off'}],
            'tuesday': [{'time': '06:30', 'action': 'on', 'brightness': 100}, {'time': '23:00', 'action': 'off'}],
            'wednesday': [{'time': '06:30', 'action': 'on', 'brightness': 100}, {'time': '23:00', 'action': 'off'}],
            'thursday': [{'time': '06:30', 'action': 'on', 'brightness': 100}, {'time': '23:00', 'action': 'off'}],
            'friday': [{'time': '06:30', 'action': 'on', 'brightness': 100}, {'time': '23:00', 'action': 'off'}],
            'saturday': [{'time': '08:00', 'action': 'on', 'brightness': 80}, {'time': '00:00', 'action': 'off'}],
            'sunday': [{'time': '08:00', 'action': 'on', 'brightness': 80}, {'time': '00:00', 'action': 'off'}]
        }
    },
    'bedroom': {
        'enabled': False,
        'vacation_mode': False,
        'sunrise_sunset': False,
        'daily_schedule': {
            'monday': [{'time': '06:00', 'action': 'on', 'brightness': 60}, {'time': '23:30', 'action': 'off'}],
            'tuesday': [{'time': '06:00', 'action': 'on', 'brightness': 60}, {'time': '23:30', 'action': 'off'}],
            'wednesday': [{'time': '06:00', 'action': 'on', 'brightness': 60}, {'time': '23:30', 'action': 'off'}],
            'thursday': [{'time': '06:00', 'action': 'on', 'brightness': 60}, {'time': '23:30', 'action': 'off'}],
            'friday': [{'time': '06:00', 'action': 'on', 'brightness': 60}, {'time': '23:30', 'action': 'off'}],
            'saturday': [{'time': '08:00', 'action': 'on', 'brightness': 40}, {'time': '01:00', 'action': 'off'}],
            'sunday': [{'time': '08:00', 'action': 'on', 'brightness': 40}, {'time': '01:00', 'action': 'off'}]
        }
    },
    'bathroom': {
        'enabled': False,
        'vacation_mode': False,
        'sunrise_sunset': False,
        'daily_schedule': {
            'monday': [{'time': '06:00', 'action': 'on', 'brightness': 100}, {'time': '23:00', 'action': 'off'}],
            'tuesday': [{'time': '06:00', 'action': 'on', 'brightness': 100}, {'time': '23:00', 'action': 'off'}],
            'wednesday': [{'time': '06:00', 'action': 'on', 'brightness': 100}, {'time': '23:00', 'action': 'off'}],
            'thursday': [{'time': '06:00', 'action': 'on', 'brightness': 100}, {'time': '23:00', 'action': 'off'}],
            'friday': [{'time': '06:00', 'action': 'on', 'brightness': 100}, {'time': '23:00', 'action': 'off'}],
            'saturday': [{'time': '08:00', 'action': 'on', 'brightness': 80}, {'time': '00:00', 'action': 'off'}],
            'sunday': [{'time': '08:00', 'action': 'on', 'brightness': 80}, {'time': '00:00', 'action': 'off'}]
        }
    },
    'office': {
        'enabled': False,
        'vacation_mode': False,
        'sunrise_sunset': False,
        'daily_schedule': {
            'monday': [{'time': '08:00', 'action': 'on', 'brightness': 90}, {'time': '18:00', 'action': 'off'}],
            'tuesday': [{'time': '08:00', 'action': 'on', 'brightness': 90}, {'time': '18:00', 'action': 'off'}],
            'wednesday': [{'time': '08:00', 'action': 'on', 'brightness': 90}, {'time': '18:00', 'action': 'off'}],
            'thursday': [{'time': '08:00', 'action': 'on', 'brightness': 90}, {'time': '18:00', 'action': 'off'}],
            'friday': [{'time': '08:00', 'action': 'on', 'brightness': 90}, {'time': '18:00', 'action': 'off'}],
            'saturday': [{'time': '10:00', 'action': 'on', 'brightness': 70}, {'time': '16:00', 'action': 'off'}],
            'sunday': [{'time': '10:00', 'action': 'on', 'brightness': 70}, {'time': '16:00', 'action': 'off'}]
        }
    }
}

@app.route('/api/status')
def get_status():
    """Get current system status"""
    try:
        return jsonify({
            'lights': lights_state,
            'energy': energy_data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/lights/<room>/control', methods=['POST'])
def control_light(room):
    """Control individual light"""
    try:
        data = request.get_json()
        action = data.get('action')
        brightness = data.get('brightness', 100)
        
        if room not in lights_state:
            return jsonify({'error': 'Room not found'}), 404
        
        if action == 'on':
            lights_state[room]['status'] = 'on'
            lights_state[room]['brightness'] = brightness
        elif action == 'off':
            lights_state[room]['status'] = 'off'
            lights_state[room]['brightness'] = 0
        elif action == 'dim':
            lights_state[room]['status'] = 'on'
            lights_state[room]['brightness'] = brightness
        
        # Emit socket event
        socketio.emit('light_update', {
            'room': room,
            'state': lights_state[room]
        })
        
        return jsonify(lights_state[room])
    except Exception as e:
        logger.error(f"Error controlling light: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/lights/<room>/toggle', methods=['POST'])
def toggle_light(room):
    """Toggle light on/off"""
    try:
        if room not in lights_state:
            return jsonify({'error': 'Room not found'}), 404
        
        current_status = lights_state[room]['status']
        new_status = 'off' if current_status == 'on' else 'on'
        
        lights_state[room]['status'] = new_status
        if new_status == 'off':
            lights_state[room]['brightness'] = 0
        
        # Log the activity
        log_activity(
            action='light_toggle',
            room=room,
            details={
                'previous_status': current_status,
                'new_status': new_status,
                'brightness': lights_state[room]['brightness'],
                'method': 'manual_control'
            }
        )
        
        # Emit socket event
        socketio.emit('light_update', {
            'room': room,
            'state': lights_state[room]
        })
        
        return jsonify({'status': new_status})
    except Exception as e:
        logger.error(f"Error toggling light: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/lights/<room>/brightness', methods=['POST'])
def set_brightness(room):
    """Set brightness for a room"""
    try:
        data = request.get_json()
        brightness = data.get('brightness', 0)
        
        if room not in lights_state:
            return jsonify({'error': 'Room not found'}), 404
        
        previous_brightness = lights_state[room]['brightness']
        lights_state[room]['brightness'] = brightness
        if brightness > 0:
            lights_state[room]['status'] = 'on'
        else:
            lights_state[room]['status'] = 'off'
        
        # Log the activity
        log_activity(
            action='brightness_adjust',
            room=room,
            details={
                'previous_brightness': previous_brightness,
                'new_brightness': brightness,
                'status': lights_state[room]['status'],
                'method': 'manual_control'
            }
        )
        
        # Emit socket event
        socketio.emit('light_update', {
            'room': room,
            'state': lights_state[room]
        })
        
        return jsonify({'brightness': brightness})
    except Exception as e:
        logger.error(f"Error setting brightness: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/lights/<room>/color', methods=['POST'])
def set_color_temperature(room):
    """Set color temperature for a room"""
    try:
        data = request.get_json()
        temperature = data.get('temperature', 'warm')
        
        if room not in lights_state:
            return jsonify({'error': 'Room not found'}), 404
        
        previous_temperature = lights_state[room].get('color_temperature', 'warm')
        lights_state[room]['color_temperature'] = temperature
        
        # Log the activity
        log_activity(
            action='color_temperature_change',
            room=room,
            details={
                'previous_temperature': previous_temperature,
                'new_temperature': temperature,
                'method': 'manual_control'
            }
        )
        
        # Emit socket event
        socketio.emit('light_update', {
            'room': room,
            'state': lights_state[room]
        })
        
        return jsonify({'temperature': temperature})
    except Exception as e:
        logger.error(f"Error setting color temperature: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/lights/bulk', methods=['POST'])
def bulk_control_lights():
    """Control all lights at once"""
    try:
        data = request.get_json()
        action = data.get('action')
        brightness = data.get('brightness', 100)
        
        results = {}
        affected_rooms = []
        
        for room in lights_state:
            previous_state = lights_state[room].copy()
            
            if action == 'on':
                lights_state[room]['status'] = 'on'
                lights_state[room]['brightness'] = brightness
            elif action == 'off':
                lights_state[room]['status'] = 'off'
                lights_state[room]['brightness'] = 0
            elif action == 'dim':
                lights_state[room]['status'] = 'on'
                lights_state[room]['brightness'] = brightness
            
            results[room] = lights_state[room]
            affected_rooms.append(room)
            
            # Emit socket event for each room
            socketio.emit('light_update', {
                'room': room,
                'state': lights_state[room]
            })
        
        # Log the bulk activity
        log_activity(
            action='bulk_light_control',
            room=None,
            details={
                'action': action,
                'brightness': brightness,
                'affected_rooms': affected_rooms,
                'total_rooms': len(affected_rooms),
                'method': 'bulk_control'
            }
        )
        
        return jsonify({'results': results})
    except Exception as e:
        logger.error(f"Error bulk controlling lights: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/lights')
def get_lights():
    """Get all lights status"""
    try:
        return jsonify(lights_state)
    except Exception as e:
        logger.error(f"Error getting lights: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/ai/mode', methods=['POST'])
def toggle_ai_mode():
    """Toggle AI Mode on/off"""
    try:
        global ai_mode_enabled
        
        # Validate request data
        if not request.is_json:
            return jsonify({'error': 'Invalid request format'}), 400
            
        data = request.get_json()
        if data is None:
            return jsonify({'error': 'No data provided'}), 400
            
        enabled = data.get('enabled')
        if enabled is None:
            enabled = not ai_mode_enabled
        
        previous_state = ai_mode_enabled
        ai_mode_enabled = enabled
        
        logger.info(f"AI Mode toggle: {previous_state} -> {enabled}")
        
        # Log the activity
        log_activity(
            action='ai_mode_toggle',
            room=None,
            details={
                'previous_state': previous_state,
                'new_state': enabled,
                'method': 'manual_control'
            }
        )
        
        # Emit socket event with error handling
        try:
            socketio.emit('ai_mode_update', {
                'enabled': ai_mode_enabled,
                'timestamp': datetime.now().isoformat()
            })
            logger.info("AI mode update socket event emitted successfully")
        except Exception as socket_error:
            logger.warning(f"Socket emit failed for AI mode update: {socket_error}")
        
        if ai_mode_enabled:
            # Trigger initial AI control with error handling
            try:
                logger.info("Triggering initial AI control...")
                ai_control_lights()
                logger.info("AI Mode enabled successfully")
            except Exception as ai_error:
                logger.error(f"Error in initial AI control: {ai_error}")
                # Don't fail the request if AI control fails
        else:
            logger.info("AI Mode disabled successfully")
        
        return jsonify({
            'ai_mode_enabled': ai_mode_enabled,
            'message': f"AI Mode {'enabled' if ai_mode_enabled else 'disabled'}",
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error toggling AI mode: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/ai/status')
def get_ai_status():
    """Get AI Mode status and predictions"""
    try:
        current_time = datetime.now()
        time_of_day = get_time_of_day()
        
        # Get weather data
        weather_data = get_weather_data()
        weather_adjustment = get_weather_lighting_adjustment()
        natural_light_factor = get_natural_light_factor()
        
        # Get current predictions for all rooms
        predictions = {}
        for room in lights_state:
            try:
                occupancy_prob = user_patterns[room][time_of_day]
                predictions[room] = {
                    'occupancy_probability': round(occupancy_prob * 100, 1),
                    'predicted_occupied': occupancy_prob > 0.5,
                    'optimized_brightness': optimize_brightness(room, lights_state[room]['brightness']),
                    'weather_adjustment': round(weather_adjustment, 2),
                    'natural_light_factor': round(natural_light_factor, 2)
                }
            except Exception as room_error:
                logger.error(f"Error processing room {room} in AI status: {room_error}")
                predictions[room] = {
                    'occupancy_probability': 0,
                    'predicted_occupied': False,
                    'optimized_brightness': 80,
                    'weather_adjustment': 1.0,
                    'natural_light_factor': 0.5
                }
        
        logger.info(f"AI Status requested - Mode: {ai_mode_enabled}, Time: {time_of_day}")
        
        return jsonify({
            'ai_mode_enabled': ai_mode_enabled,
            'current_time': current_time.isoformat(),
            'time_of_day': time_of_day,
            'predictions': predictions,
            'user_patterns': user_patterns,
            'weather': {
                'data': weather_data,
                'lighting_adjustment': round(weather_adjustment, 2),
                'natural_light_factor': round(natural_light_factor, 2)
            }
        })
    except Exception as e:
        logger.error(f"Error getting AI status: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/ai/test')
def test_ai_mode():
    """Test AI mode functionality"""
    try:
        current_time = datetime.now()
        time_of_day = get_time_of_day()
        
        # Test predictions for each room
        test_results = {}
        for room in lights_state:
            try:
                will_be_occupied = predict_occupancy(room)
                current_brightness = lights_state[room]['brightness']
                optimized_brightness = optimize_brightness(room, current_brightness)
                
                test_results[room] = {
                    'prediction': 'occupied' if will_be_occupied else 'not_occupied',
                    'current_brightness': current_brightness,
                    'optimized_brightness': optimized_brightness,
                    'time_of_day': time_of_day,
                    'base_probability': user_patterns[room][time_of_day]
                }
            except Exception as room_error:
                logger.error(f"Error testing AI for room {room}: {room_error}")
                test_results[room] = {
                    'error': str(room_error),
                    'prediction': 'error',
                    'current_brightness': 0,
                    'optimized_brightness': 80
                }
        
        return jsonify({
            'ai_mode_enabled': ai_mode_enabled,
            'test_time': current_time.isoformat(),
            'time_of_day': time_of_day,
            'test_results': test_results,
            'message': 'AI test completed successfully'
        })
    except Exception as e:
        logger.error(f"Error in AI test: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/weather')
def get_weather():
    """Get current weather data"""
    try:
        weather_data = get_weather_data()
        if not weather_data:
            return jsonify({'error': 'Weather data unavailable'}), 500
        
        weather_adjustment = get_weather_lighting_adjustment()
        natural_light_factor = get_natural_light_factor()
        
        return jsonify({
            'weather': weather_data,
            'lighting_adjustment': round(weather_adjustment, 2),
            'natural_light_factor': round(natural_light_factor, 2),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting weather: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/weather/optimize', methods=['POST'])
def apply_weather_optimization():
    """Apply weather-based optimization to all lights"""
    try:
        data = request.get_json()
        apply_optimization = data.get('apply', False)
        
        if not apply_optimization:
            return jsonify({'message': 'Weather optimization not applied'})
        
        weather_adjustment = get_weather_lighting_adjustment()
        natural_light_factor = get_natural_light_factor()
        
        optimized_rooms = {}
        
        for room in lights_state:
            current_brightness = lights_state[room]['brightness']
            
            # Calculate weather-optimized brightness
            if lights_state[room]['status'] == 'on':
                # Apply weather adjustment
                weather_optimized = int(current_brightness * weather_adjustment)
                
                # Consider natural light factor
                if natural_light_factor > 0.7:  # High natural light
                    weather_optimized = max(20, int(weather_optimized * 0.8))
                elif natural_light_factor < 0.3:  # Low natural light
                    weather_optimized = min(100, int(weather_optimized * 1.2))
                
                # Room-specific adjustments
                if room == 'bedroom':
                    weather_optimized = min(weather_optimized, 80)  # Cap bedroom brightness
                elif room == 'bathroom':
                    weather_optimized = max(weather_optimized, 60)  # Minimum bathroom brightness
                elif room == 'kitchen':
                    weather_optimized = max(weather_optimized, 70)  # Minimum kitchen brightness
                
                # Update light state
                lights_state[room]['brightness'] = max(0, min(100, weather_optimized))
                
                # Emit socket event
                socketio.emit('light_update', {
                    'room': room,
                    'state': lights_state[room],
                    'source': 'weather_optimization',
                    'weather_adjustment': round(weather_adjustment, 2),
                    'natural_light_factor': round(natural_light_factor, 2)
                })
                
                optimized_rooms[room] = {
                    'previous_brightness': current_brightness,
                    'new_brightness': lights_state[room]['brightness'],
                    'adjustment': weather_adjustment,
                    'natural_light_factor': natural_light_factor
                }
        
        # Log the weather optimization activity
        log_activity(
            'weather_optimization_applied',
            room=None,
            details={
                'weather_adjustment': round(weather_adjustment, 2),
                'natural_light_factor': round(natural_light_factor, 2),
                'optimized_rooms': list(optimized_rooms.keys()),
                'total_rooms': len(optimized_rooms)
            }
        )
        
        return jsonify({
            'message': 'Weather optimization applied successfully',
            'weather_adjustment': round(weather_adjustment, 2),
            'natural_light_factor': round(natural_light_factor, 2),
            'optimized_rooms': optimized_rooms,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error applying weather optimization: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/weather/forecast')
def get_weather_forecast():
    """Get weather forecast for the next few hours"""
    try:
        weather_data = get_weather_data()
        if not weather_data:
            return jsonify({'error': 'Weather data unavailable'}), 500
        
        # Generate forecast data (in real implementation, this would come from API)
        current_hour = datetime.now().hour
        forecast = []
        
        for i in range(1, 7):  # Next 6 hours
            forecast_hour = (current_hour + i) % 24
            forecast_time = datetime.now() + timedelta(hours=i)
            
            # Simulate forecast based on current conditions
            forecast_conditions = {
                'time': forecast_time.isoformat(),
                'hour': forecast_hour,
                'temperature': weather_data['main']['temp'] + random.uniform(-2, 2),
                'weather_main': weather_data['weather'][0]['main'],
                'weather_description': weather_data['weather'][0]['description'],
                'clouds': weather_data['clouds']['all'] + random.uniform(-10, 10),
                'lighting_adjustment': get_weather_lighting_adjustment() + random.uniform(-0.1, 0.1),
                'natural_light_factor': get_natural_light_factor() + random.uniform(-0.05, 0.05)
            }
            
            forecast.append(forecast_conditions)
        
        return jsonify({
            'current_weather': weather_data,
            'forecast': forecast,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting weather forecast: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/weather/impact')
def get_weather_impact():
    """Get weather impact on lighting for all rooms"""
    try:
        weather_data = get_weather_data()
        weather_adjustment = get_weather_lighting_adjustment()
        natural_light_factor = get_natural_light_factor()
        
        # Calculate impact for each room
        room_impacts = {}
        for room in lights_state:
            current_brightness = lights_state[room]['brightness']
            optimized_brightness = optimize_brightness(room, current_brightness)
            
            room_impacts[room] = {
                'current_brightness': current_brightness,
                'weather_optimized_brightness': optimized_brightness,
                'adjustment_factor': round(weather_adjustment, 2),
                'natural_light_factor': round(natural_light_factor, 2),
                'brightness_change': optimized_brightness - current_brightness
            }
        
        return jsonify({
            'weather': weather_data,
            'overall_adjustment': round(weather_adjustment, 2),
            'natural_light_factor': round(natural_light_factor, 2),
            'room_impacts': room_impacts,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting weather impact: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/lights/all', methods=['POST'])
def control_all_lights():
    """Control all lights"""
    try:
        data = request.get_json()
        action = data.get('action')
        brightness = data.get('brightness', 100)
        
        for room in lights_state:
            if action == 'on':
                lights_state[room]['status'] = 'on'
                lights_state[room]['brightness'] = brightness
            elif action == 'off':
                lights_state[room]['status'] = 'off'
                lights_state[room]['brightness'] = 0
            elif action == 'dim':
                lights_state[room]['brightness'] = max(0, min(100, brightness))
                if lights_state[room]['brightness'] > 0:
                    lights_state[room]['status'] = 'on'
                else:
                    lights_state[room]['status'] = 'off'
            
            # Emit socket event for each room
            socketio.emit('light_update', {
                'room': room,
                'state': lights_state[room]
            })
        
        return jsonify({'message': f'All lights {action}'})
    except Exception as e:
        logger.error(f"Error controlling all lights: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/schedules')
def get_schedules():
    """Get all schedules"""
    try:
        return jsonify(schedules)
    except Exception as e:
        logger.error(f"Error getting schedules: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/schedules/<room>/enable', methods=['POST'])
def toggle_schedule(room):
    """Toggle schedule for a room"""
    try:
        data = request.get_json()
        enabled = data.get('enabled', False)
        
        if room not in schedules:
            schedules[room] = {
                'enabled': enabled,
                'vacation_mode': False,
                'sunrise_sunset': False,
                'daily_schedule': {}
            }
        else:
            schedules[room]['enabled'] = enabled
        
        return jsonify({'schedule': schedules[room]})
    except Exception as e:
        logger.error(f"Error toggling schedule: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/schedules/<room>/vacation', methods=['POST'])
def toggle_vacation_mode(room):
    """Toggle vacation mode for a room"""
    try:
        data = request.get_json()
        vacation_mode = data.get('vacation_mode', False)
        
        if room not in schedules:
            schedules[room] = {
                'enabled': False,
                'vacation_mode': vacation_mode,
                'sunrise_sunset': False,
                'daily_schedule': {}
            }
        else:
            schedules[room]['vacation_mode'] = vacation_mode
        
        return jsonify({'schedule': schedules[room]})
    except Exception as e:
        logger.error(f"Error toggling vacation mode: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/schedules/<room>/sunrise-sunset', methods=['POST'])
def toggle_sunrise_sunset(room):
    """Toggle sunrise/sunset mode for a room"""
    try:
        data = request.get_json()
        sunrise_sunset = data.get('sunrise_sunset', False)
        
        if room not in schedules:
            schedules[room] = {
                'enabled': False,
                'vacation_mode': False,
                'sunrise_sunset': sunrise_sunset,
                'daily_schedule': {}
            }
        else:
            schedules[room]['sunrise_sunset'] = sunrise_sunset
        
        return jsonify({'schedule': schedules[room]})
    except Exception as e:
        logger.error(f"Error toggling sunrise/sunset mode: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/schedules/<room>/times', methods=['POST'])
def update_schedule_times(room):
    """Update schedule times for a room"""
    try:
        data = request.get_json()
        day = data.get('day')
        times = data.get('times', [])
        
        if room not in schedules:
            schedules[room] = {
                'enabled': False,
                'vacation_mode': False,
                'sunrise_sunset': False,
                'daily_schedule': {}
            }
        
        schedules[room]['daily_schedule'][day] = times
        
        return jsonify({'schedule': schedules[room]})
    except Exception as e:
        logger.error(f"Error updating schedule times: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/schedules/status')
def get_schedule_status():
    """Get current schedule execution status"""
    try:
        current_time = datetime.now()
        current_day = current_time.strftime('%A').lower()
        current_time_str = current_time.strftime('%H:%M')
        
        status = {
            'current_time': current_time_str,
            'current_day': current_day,
            'active_schedules': [],
            'next_events': []
        }
        
        # Check for active schedules
        for room, schedule in schedules.items():
            if schedule.get('enabled', False):
                status['active_schedules'].append(room)
                
                # Find next events for this room
                daily_schedule = schedule.get('daily_schedule', {}).get(current_day, [])
                for event in daily_schedule:
                    event_time = event.get('time', '')
                    if event_time > current_time_str:
                        status['next_events'].append({
                            'room': room,
                            'time': event_time,
                            'action': event['action'],
                            'brightness': event.get('brightness', 100)
                        })
        
        # Sort next events by time
        status['next_events'].sort(key=lambda x: x['time'])
        
        return jsonify(status)
    except Exception as e:
        logger.error(f"Error getting schedule status: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/activity/logs')
def get_activity_logs():
    """Get activity logs"""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        search = request.args.get('search', '')
        action_filter = request.args.get('action', '')
        
        # Get logs from memory
        logs = getattr(app, 'activity_logs', [])
        
        # Apply filters
        filtered_logs = logs
        if search:
            filtered_logs = [log for log in logs if 
                           search.lower() in log.get('action', '').lower() or
                           search.lower() in log.get('room', '').lower() or
                           search.lower() in str(log.get('details', '')).lower()]
        
        if action_filter:
            filtered_logs = [log for log in filtered_logs if log.get('action') == action_filter]
        
        # Calculate pagination
        total_logs = len(filtered_logs)
        total_pages = (total_logs + per_page - 1) // per_page
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        # Get page of logs
        page_logs = filtered_logs[start_idx:end_idx]
        
        return jsonify({
            'logs': page_logs,
            'pages': total_pages,
            'total': total_logs,
            'current_page': page
        })
    except Exception as e:
        logger.error(f"Error getting activity logs: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/statistics')
def get_statistics():
    """Get energy statistics"""
    try:
        stats = {
            'current_month': {
                'energy_used': 45.2,
                'energy_saved': 12.8,
                'cost_saved': 3.84,
                'carbon_reduced': 8.5,
                'lights_optimized': 15
            },
            'yearly': {
                'total_saved': 156.80,
                'energy_reduction': 28.5,
                'cost_reduction': 47.04,
                'carbon_footprint': 102.3
            },
            'comparison': {
                'before': 158.7,
                'after': 111.9,
                'percentage': 29.5
            }
        }
        
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Socket.IO events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info('Client connected')
    emit('connected', {'data': 'Connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info('Client disconnected')

@socketio.on('motion_detected')
def handle_motion(data):
    """Handle motion detection"""
    room = data.get('room')
    if room in lights_state:
        lights_state[room]['motion_detected'] = True
        socketio.emit('motion_update', {'room': room})
        logger.info(f'Motion detected in {room}')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info("🚀 Starting AI Smart Light Control System...")
    logger.info("📊 Energy monitoring active")
    logger.info("🤖 AI prediction models loaded")
    logger.info("💡 Smart automation enabled")
    
    # Initialize sample activity logs
    init_sample_logs()
    
    # Start background threads
    schedule_thread = threading.Thread(target=schedule_execution_loop, daemon=True)
    schedule_thread.start()
    
    ai_thread = threading.Thread(target=ai_control_loop, daemon=True)
    ai_thread.start()
    
    # Use environment variable for port or default to 5000
    port = int(os.getenv('PORT', 5000))
    
    if os.getenv('FLASK_ENV') == 'production':
        # Production: Use Gunicorn or similar WSGI server
        socketio.run(app, host='0.0.0.0', port=port, debug=False, allow_unsafe_werkzeug=True)
    else:
        # Development
        socketio.run(app, host='0.0.0.0', port=port, debug=True, allow_unsafe_werkzeug=True) 