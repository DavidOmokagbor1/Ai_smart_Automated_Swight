import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, mean_squared_error, classification_report
import joblib
import os
from datetime import datetime, timedelta
import json
import logging
from collections import defaultdict, deque
import threading
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedOccupancyPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.is_trained = False
        self.model_path = 'advanced_occupancy_model.pkl'
        self.scaler_path = 'occupancy_scaler.pkl'
        self.encoder_path = 'occupancy_encoder.pkl'
        self.training_history = []
        self.feature_importance = {}
        self.load_model()
        
        # Real-time learning
        self.online_learning_buffer = deque(maxlen=10)
        self.learning_lock = threading.Lock()
        self.last_retrain = datetime.now()
        self.retrain_interval = timedelta(hours=24)  # Retrain daily
    
    def load_model(self):
        try:
            if (os.path.exists(self.model_path) and 
                os.path.exists(self.scaler_path) and 
                os.path.exists(self.encoder_path)):
                
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.label_encoder = joblib.load(self.encoder_path)
                self.is_trained = True
                logger.info("Advanced occupancy model loaded successfully")
            else:
                logger.info("No pre-trained model found, will train with sample data")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
    
    def save_model(self):
        try:
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            joblib.dump(self.label_encoder, self.encoder_path)
            logger.info("Model saved successfully")
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    def prepare_advanced_features(self, timestamp, room, weather_data=None, user_activity=None):
        """Extract advanced features from timestamp for occupancy prediction"""
        dt = pd.to_datetime(timestamp)
        
        # Basic time features
        features = {
            'hour': dt.hour,
            'minute': dt.minute,
            'day_of_week': dt.dayofweek,
            'day_of_month': dt.day,
            'month': dt.month,
            'is_weekend': 1 if dt.dayofweek >= 5 else 0,
            'is_holiday': self._is_holiday(dt),
            'is_workday': 1 if 10 <= dt.dayofweek <= 4 else 0,
        }
        
        # Time of day categories
        time_categories = {
            'early_morning': 1 if 5 <= dt.hour <= 8 else 0,
            'morning': 1 if 9 <= dt.hour <= 11 else 0,
            'lunch': 1 if 12 <= dt.hour <= 13 else 0,
            'afternoon': 1 if 14 <= dt.hour <= 17 else 0,
            'dinner': 1 if 18 <= dt.hour <= 20 else 0,
            'evening': 1 if 21 <= dt.hour <= 23 else 0,
            'night': 1 if 0 <= dt.hour <= 4 else 0,
        }
        features.update(time_categories)
        
        # Room-specific features
        room_encodings = {
            'living_room': [1, 0, 0, 0, 0],
            'kitchen': [0, 1, 0, 0, 0],
            'bedroom': [0, 0, 1, 0, 0],
            'bathroom': [0, 0, 0, 1, 0],
            'office': [0, 0, 0, 0, 1]
        }
        # Add each room encoding as a separate feature
        for i in range(5):
            features[f'room_{i}'] = room_encodings.get(room, [0, 0, 0, 0, 0])[i]
        
        # Weather features (if available)
        if weather_data:
            features.update({
                'temperature': weather_data.get('main', {}).get('temp', 20),
                'humidity': weather_data.get('main', {}).get('humidity', 50),
                'weather_condition': self._encode_weather(weather_data.get('weather', [{}])[0].get('main', 'Clear')),
                'is_rainy': 1 if 'Rain' in str(weather_data.get('weather', [])) else 0,
                'is_cloudy': 1 if 'Clouds' in str(weather_data.get('weather', [])) else 0
            })
        
        # User activity features (if available)
        if user_activity:
            features.update({
                'recent_activity': user_activity.get('recent_activity', 0),
                'user_preference': user_activity.get('preference', 0.5),
                'last_occupancy_duration': user_activity.get('last_duration', 0),
            })
        
        # Cyclical features for better time representation
        features['hour_sin'] = np.sin(2 * np.pi * dt.hour / 24)
        features['hour_cos'] = np.cos(2 * np.pi * dt.hour / 24)
        features['day_sin'] = np.sin(2 * np.pi * dt.dayofweek / 7)
        features['day_cos'] = np.cos(2 * np.pi * dt.dayofweek / 7)
        
        return np.array(list(features.values())).reshape(1, -1)
    
    def _is_holiday(self, dt):
        """Check if date is a holiday (simplified)"""
        # Add major holidays - this is a simplified version
        holidays = [
            (1, 1),  # New Year's Day
            (7, 4),   # Independence Day
            (12, 25)  # Christmas Day
        ]
        return 1 if (dt.month, dt.day) in holidays else 0
    
    def _encode_weather(self, weather_condition):
        """Encode weather conditions"""
        weather_encodings = {
            'Clear': 0, 'Clouds': 1, 'Rain': 2, 'Snow': 3, 'Thunderstorm': 4
        }
        return weather_encodings.get(weather_condition, 0)
    
    def train(self, historical_data, weather_data=None):
        """Train the model with historical occupancy data"""
        try:
            features = []
            labels = []
            
            for entry in historical_data:
                weather_entry = None
                if weather_data and entry.get('timestamp'):
                    # Find matching weather data
                    entry_time = pd.to_datetime(entry['timestamp'])
                    for weather in weather_data:
                        if abs((pd.to_datetime(weather['timestamp']) - entry_time).total_seconds()) < 3600:
                            weather_entry = weather
                            break
                
                feature_vector = self.prepare_advanced_features(
                    entry['timestamp'], 
                    entry['room'], 
                    weather_entry,
                    entry.get('user_activity')
                )
                features.append(feature_vector.flatten())
                labels.append(1 if entry['occupied'] else 0)
            
            if len(features) < 10:
                logger.warning("Insufficient training data for training.")
                return 0.0
            X = np.array(features)
            y = np.array(labels)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = self.model.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Store feature importance
            feature_names = [f'feature_{i}' for i in range(X.shape[1])]
            self.feature_importance = dict(zip(feature_names, self.model.feature_importances_))
            
            self.is_trained = True
            self.save_model()
            
            # Store training history
            self.training_history.append({
                'timestamp': datetime.now().isoformat(),
                'accuracy': accuracy,
                'samples': len(X),
                'model_type': 'AdvancedOccupancyPredictor'
            })
            
            logger.info(f"Model trained with {len(X)} samples. Accuracy: {accuracy:.3f}")
            return accuracy
            
        except Exception as e:
            logger.error(f"Error training model: {e}")
            return 0.0
    
    def predict(self, timestamp, room, weather_data=None, user_activity=None):
        """Predict occupancy for a given time and room"""
        if not self.is_trained:
            return 0.5  # Default confidence if not trained
        
        try:
            features = self.prepare_advanced_features(timestamp, room, weather_data, user_activity)
            features_scaled = self.scaler.transform(features)
            
            # Get prediction probability
            prob = self.model.predict_proba(features_scaled)[0][1]
            
            # Store for online learning
            with self.learning_lock:
                self.online_learning_buffer.append({
                    'features': features_scaled[0],
                    'timestamp': timestamp,
                    'room': room,
                    'weather_data': weather_data,
                    'user_activity': user_activity
                })
            
            return prob
            
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            return 0.5
    
    def online_learn(self, actual_occupancy, timestamp, room, weather_data=None, user_activity=None):
        """Learn from real-world feedback"""
        try:
            with self.learning_lock:
                # Add to buffer
                self.online_learning_buffer.append({
                    'features': self.prepare_advanced_features(timestamp, room, weather_data, user_activity)[0],
                    'actual_occupancy': actual_occupancy,
                    'timestamp': timestamp,
                    'room': room
                })
                
                # Retrain if enough new data or time has passed
                if (len(self.online_learning_buffer) >= 100 or 
                    datetime.now() - self.last_retrain > self.retrain_interval):
                    self._retrain_from_buffer()
                    
        except Exception as e:
            logger.error(f"Error in online learning: {e}")
    
    def _retrain_from_buffer(self):
        """Retrain model from online learning buffer"""
        try:
            if len(self.online_learning_buffer) < 50:
                return
            
            # Prepare training data from buffer
            features = []
            labels = []
            
            for entry in self.online_learning_buffer:
                if 'actual_occupancy' in entry:
                    features.append(entry['features'])
                    labels.append(entry['actual_occupancy'])
            
            if len(features) < 10:
                return
            
            X = np.array(features)
            y = np.array(labels)
            
            # Retrain with new data
            X_scaled = self.scaler.transform(X)
            self.model.fit(X_scaled, y)
            
            self.last_retrain = datetime.now()
            self.save_model()
            
            logger.info(f"Model retrained with {len(X)} new samples")
            
        except Exception as e:
            logger.error(f"Error in retraining: {e}")

class AdvancedEnergyOptimizer:
    def __init__(self):
        self.optimization_rules = {
            'natural_light_threshold': 0.7,  # 70% natural light
            'min_brightness': 15,
            'max_brightness': 100,
            'energy_saving_mode': True,
            'comfort_threshold': 0.8,
            'safety_threshold': 0.3
        }
        
        # Energy consumption tracking
        self.energy_consumption = defaultdict(list)
        self.cost_per_kwh = 0.12  # Default electricity cost
        self.led_efficiency = 0.9  # LED efficiency factor
        
        # Optimization models
        self.brightness_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.is_brightness_model_trained = False
        
    def optimize_brightness_advanced(self, room, current_time, natural_light_level, 
                                   occupancy_probability, weather_data=None, user_preferences=None):
        """Advanced brightness optimization with ML"""
        try:
            # Base optimization
            base_brightness = self._calculate_base_brightness(room, current_time, natural_light_level)
            
            # Weather adjustments
            weather_adjustment = self._calculate_weather_adjustment(weather_data)
            
            # Occupancy adjustments
            occupancy_adjustment = self._calculate_occupancy_adjustment(occupancy_probability)
            
            # User preference adjustments
            preference_adjustment = self._calculate_preference_adjustment(user_preferences, room)
            
            # Room-specific adjustments
            room_adjustment = self._get_room_adjustment(room)
            
            # Combine all factors
            optimized_brightness = base_brightness * weather_adjustment * occupancy_adjustment * preference_adjustment * room_adjustment
            
            # Apply ML model if available
            if self.is_brightness_model_trained:
                ml_prediction = self._predict_optimal_brightness(room, current_time, natural_light_level, occupancy_probability)
                # Blend ML prediction with rule-based optimization
                optimized_brightness = 0.7 * optimized_brightness + 0.3 * ml_prediction
            
            # Ensure within bounds
            final_brightness = max(self.optimization_rules['min_brightness'], 
                                 min(self.optimization_rules['max_brightness'], optimized_brightness))
            
            # Track energy consumption
            self._track_energy_consumption(room, final_brightness)
            
            return int(final_brightness)
            
        except Exception as e:
            logger.error(f"Error in advanced brightness optimization: {e}")
            return 80
    
    def _calculate_base_brightness(self, room, current_time, natural_light_level):
        """Calculate base brightness based on time and natural light"""
        hour = current_time.hour
        
        # Time-based base brightness
        time_brightness = {
            'morning': 80,
            'afternoon': 60,
            'evening': 90,
            'night': 30
        }
        
        if 6 <= hour < 12:
            period = 'morning'
        elif 12 < hour < 17:
            period = 'afternoon'
        elif 17 < hour < 22:
            period = 'evening'
        else:
            period = 'night'
        base = time_brightness[period]
        
        # Natural light adjustment
        if natural_light_level > self.optimization_rules['natural_light_threshold']:
            base *= (1 - natural_light_level * 0.5)
        
        return base
    
    def _calculate_weather_adjustment(self, weather_data):
        """Calculate weather-based brightness adjustment"""
        if not weather_data:
            return 1.0
        adjustment = 1.0        
        # Temperature adjustment
        temp = weather_data.get('main', {}).get('temp', 20)
        if temp < 10:  # Cold weather - brighter lights
            adjustment *= 1.2
        elif temp > 30:  # Hot weather - dimmer lights
            adjustment *= 0.9        
        # Weather condition adjustment
        weather_main = weather_data.get('weather', [{}])[0].get('main', 'Clear')
        if weather_main in ['Rain', 'Snow', 'Thunderstorm']:
            adjustment *= 1.3 # Brighter for bad weather
        elif weather_main == 'Clear':
            adjustment *= 0.9 # Dimmer for clear weather
        
        return adjustment
    
    def _calculate_occupancy_adjustment(self, occupancy_probability):
        """Calculate occupancy-based adjustment"""
        if occupancy_probability < self.optimization_rules['safety_threshold']:
            return 0.3  # Very low brightness for safety
        elif occupancy_probability > self.optimization_rules['comfort_threshold']:
            return 1.2  # Higher brightness for comfort
        else:
            return 0.8 + (occupancy_probability - self.optimization_rules['safety_threshold']) * 0.8
    
    def _calculate_preference_adjustment(self, user_preferences, room):
        """Calculate user preference adjustment"""
        if not user_preferences:
            return 1.0     
        room_pref = user_preferences.get(room, {})
        brightness_pref = room_pref.get('preferred_brightness', 80)
        
        # Normalize preference to adjustment factor
        return brightness_pref / 80
    
    def _get_room_adjustment(self, room):
        """Get room-specific brightness adjustment"""
        room_adjustments = {
            'bedroom': 0.7,  # Dimmer for sleep
            'bathroom': 1.2,  # Brighter for safety
            'kitchen': 1.1,   # Brighter for cooking
            'office': 1.0,    # Standard
            'living_room': 0.9 # Slightly dimmer for comfort
        }
        return room_adjustments.get(room, 1.0)
    
    def _predict_optimal_brightness(self, room, current_time, natural_light_level, occupancy_probability):
        """ML model to predict optimal brightness"""
        try:
            features = [
                current_time.hour,
                current_time.minute,
                current_time.dayofweek,
                natural_light_level,
                occupancy_probability,
                # Room encoding
                1 if room == 'living_room' else 0,
                1 if room == 'kitchen' else 0,
                1 if room == 'bedroom' else 0,
                1 if room == 'bathroom' else 0,
                1 if room == 'office' else 0
            ]
            
            prediction = self.brightness_model.predict([features])[0]
            return max(15, min(100, prediction))
            
        except Exception as e:
            logger.error(f"Error in ML brightness prediction: {e}")
            return 80
    
    def _track_energy_consumption(self, room, brightness):
        """Track energy consumption for analysis"""
        # Simplified energy calculation (watts)
        power_consumption = brightness * 0.6  # 60W max at 100% brightness
        timestamp = datetime.now()
        
        self.energy_consumption[room].append({
            'timestamp': timestamp,
            'brightness': brightness,
            'power_watts': power_consumption,
            'energy_kwh': power_consumption * 0.001  # Convert to kWh (assuming 1 hour)
        })
        
        # Keep only last 1000 entries per room
        if len(self.energy_consumption[room]) > 1000:
            self.energy_consumption[room] = self.energy_consumption[room][-1000:]
    
    def calculate_energy_savings(self, room, time_period='24h'):
        """Calculate energy savings percentage for a room"""
        try:
            if room not in self.energy_consumption:
                return 0
            
            room_data = self.energy_consumption[room]
            if not room_data:
                return 0
            
            # Calculate total energy consumption
            total_energy = sum(entry['energy_kwh'] for entry in room_data)
            total_cost = total_energy * self.cost_per_kwh
            
            # Calculate potential savings (assuming 30% with optimization)
            potential_savings = total_cost * 0.3      
            return {
               'total_energy_kwh': total_energy,
               'total_cost_usd': total_cost,
                'potential_savings_usd': potential_savings,
             'optimization_efficiency': 0.7  # 70% efficiency
            }
            
        except Exception as e:
            logger.error(f"Error calculating energy savings: {e}")
            return 0

class UserBehaviorLearner:
    def __init__(self):
        self.user_patterns = defaultdict(lambda: defaultdict(list))
        self.preferences = defaultdict(dict)
        self.learning_rate = 0.1
        self.pattern_window = 30  # days
        
    def learn_from_activity(self, room, action, timestamp, brightness=None, user_id=None):
        """Learn from user activity patterns"""
        try:
            dt = pd.to_datetime(timestamp)
            time_of_day = self._get_time_category(dt.hour)
            day_of_week = dt.dayofweek
            
            # Store activity pattern
            pattern_key = f"{room}_{time_of_day}_{day_of_week}"
            self.user_patterns[user_id or 'default'][pattern_key].append({
                'timestamp': timestamp,
                'action': action,
                'brightness': brightness,
                'hour': dt.hour,
                'minute': dt.minute
            })
            
            # Update preferences
            if brightness is not None:
                self._update_preferences(user_id or 'default', room, time_of_day, brightness)
            
            # Clean old patterns
            self._clean_old_patterns()
            
        except Exception as e:
            logger.error(f"Error learning from activity: {e}")
    
    def _get_time_category(self, hour):
        """Categorize time of day"""
        if 6 <= hour < 12:
            return 'morning'
        elif 12 < hour < 17:
            return 'afternoon'
        elif 17 < hour < 22:
            return 'evening'
        else:
            return 'night'
    
    def _update_preferences(self, user_id, room, time_of_day, brightness):
        """Update user preferences based on activity"""
        key = f"{room}_{time_of_day}"
        if key not in self.preferences[user_id]:
            self.preferences[user_id][key] = {
                'brightness': brightness,
                'count': 1,
                'last_updated': datetime.now()
            }
        else:
            # Update with exponential moving average
            current = self.preferences[user_id][key]
            current['brightness'] = (1 - self.learning_rate) * current['brightness'] + self.learning_rate * brightness
            current['count'] += 1
            current['last_updated'] = datetime.now()
    
    def _clean_old_patterns(self):
        """Remove old pattern data"""
        cutoff_date = datetime.now() - timedelta(days=self.pattern_window)
        
        for user_id in self.user_patterns:
            for pattern_key in list(self.user_patterns[user_id].keys()):
                self.user_patterns[user_id][pattern_key] = [
                    entry for entry in self.user_patterns[user_id][pattern_key]
                    if pd.to_datetime(entry['timestamp']) > cutoff_date
                ]
    
    def get_user_preferences(self, user_id, room, time_of_day):
        """Get user preferences"""
        key = f"{room}_{time_of_day}"
        return self.preferences.get(user_id, {}).get(key, {}).get('brightness', 80)
    
    def predict_user_behavior(self, user_id, room, timestamp):
        """Predict user behavior based on learned patterns"""
        try:
            dt = pd.to_datetime(timestamp)
            time_of_day = self._get_time_category(dt.hour)
            day_of_week = dt.dayofweek
            
            pattern_key = f"{room}_{time_of_day}_{day_of_week}"
            patterns = self.user_patterns.get(user_id, {}).get(pattern_key, [])
            
            if not patterns:
                return 0.5  # Default probability
            
            # Calculate probability based on historical patterns
            recent_patterns = [p for p in patterns if 
                             (dt - pd.to_datetime(p['timestamp'])).days < 7]
            
            if recent_patterns:
                # Higher probability if recent activity
                return min(0.9, 0.5 + len(recent_patterns) * 0.1)
            else:
                return 0.3  # Lower probability if no recent activity
                
        except Exception as e:
            logger.error(f"Error predicting user behavior: {e}")
            return 0.5

class AdvancedScheduleOptimizer:
    def __init__(self):
        self.schedule_templates = {
            'weekday': {
                'morning': {'start': '06:00', 'end': '09:00', 'brightness': 80},
                'day': {'start': '09:00', 'end': '18:00', 'brightness': 60},
                'evening': {'start': '18:00', 'end': '22:00', 'brightness': 90},
                'night': {'start': '22:00', 'end': '06:00', 'brightness': 20}
            },
            'weekend': {
                'morning': {'start': '08:00', 'end': '10:00', 'brightness': 70},
                'day': {'start': '10:00', 'end': '18:00', 'brightness': 50},
                'evening': {'start': '18:00', 'end': '23:00', 'brightness': 85},
                'night': {'start': '23:00', 'end': '08:00', 'brightness': 15}
            }
        }
        
        # Advanced scheduling features
        self.sunrise_sunset_enabled = True
        self.vacation_mode = False
        self.adaptive_scheduling = True
        self.schedule_performance = defaultdict(list)
    
    def generate_optimal_schedule(self, room, usage_patterns, user_preferences=None):
        """Generate optimal schedule based on usage patterns and preferences"""
        try:
            schedule = {
                'enabled': True,
                'daily_schedule': {},
                'vacation_mode': self.vacation_mode,
                'sunrise_sunset': self.sunrise_sunset_enabled,
                'adaptive': self.adaptive_scheduling,
                'last_updated': datetime.now().isoformat()
            }
            
            # Analyze usage patterns to determine optimal times
            optimal_times = self._analyze_usage_patterns(usage_patterns)
            
            # Generate schedule for each day
            for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
                if day in ['saturday', 'sunday']:
                    template = self.schedule_templates['weekend']
                else:
                    template = self.schedule_templates['weekday']
                
                # Apply user preferences if available
                if user_preferences and room in user_preferences:
                    template = self._apply_user_preferences(template, user_preferences[room])
                
                schedule['daily_schedule'][day] = []
                
                for period, settings in template.items():
                    # Adjust times based on optimal usage patterns
                    adjusted_start, adjusted_end = self._adjust_times_for_room(
                        settings['start'], settings['end'], room, optimal_times
                    )
                    
                    schedule['daily_schedule'][day].extend([
                        {'time': adjusted_start, 'action': 'on', 'brightness': settings['brightness']},
                        {'time': adjusted_end, 'action': 'off'}
                    ])
            
            return schedule
            
        except Exception as e:
            logger.error(f"Error generating optimal schedule: {e}")
            return self._get_default_schedule()
    
    def _analyze_usage_patterns(self, usage_patterns):
        """Analyze usage patterns to find optimal times"""
        if not usage_patterns:
            return {}
        
        optimal_times = {}
        
        for room, patterns in usage_patterns.items():
            if not patterns:
                continue
            
            # Find most common usage times
            usage_hours = [p.get('hour', 0) for p in patterns if 'hour' in p]
            if usage_hours:
                optimal_times[room] = {
                    'peak_start': min(usage_hours),
                    'peak_end': max(usage_hours),
                    'usage_frequency': len(usage_hours)
                }
        
        return optimal_times
    
    def _apply_user_preferences(self, template, preferences):
        """Apply user preferences to schedule template"""
        adjusted_template = template.copy()
        
        for period, settings in adjusted_template.items():
            if period in preferences:
                adjusted_template[period]['brightness'] = preferences[period].get('brightness', settings['brightness'])
        
        return adjusted_template
    
    def _adjust_times_for_room(self, start_time, end_time, room, optimal_times):
        """Adjust schedule times based on room usage patterns"""
        if room not in optimal_times:
            return start_time, end_time
        
        # Simple adjustment based on peak usage
        peak_start = optimal_times[room]['peak_start']
        peak_end = optimal_times[room]['peak_end']
        
        # Adjust start time to be 1 before peak usage
        adjusted_start_hour = max(0, peak_start - 1)
        adjusted_start = f"{adjusted_start_hour:02d}:00"
        # Adjust end time to be 1 after peak usage
        adjusted_end_hour = min(23, peak_end + 1)
        adjusted_end = f"{adjusted_end_hour:02d}:00"
        return adjusted_start, adjusted_end
    
    def _get_default_schedule(self):
        """Get default schedule if optimization fails"""
        return {
            'enabled': True,
            'daily_schedule': self.schedule_templates['weekday'],
            'vacation_mode': False,
            'sunrise_sunset': True,
            'adaptive': False
        }
    
    def track_schedule_performance(self, room, schedule_id, actual_usage, expected_usage):
        """How well schedules are performing"""
        performance = {
            'schedule_id': schedule_id,
            'room': room,
            'timestamp': datetime.now().isoformat(),
            'actual_usage': actual_usage,
            'expected_usage': expected_usage,
            'accuracy': 1 - abs(actual_usage - expected_usage) / max(expected_usage, 1)
        }
        
        self.schedule_performance[room].append(performance)
        
        # Keep only last 100 performance records
        if len(self.schedule_performance[room]) > 100:
            self.schedule_performance[room] = self.schedule_performance[room][-100:]

# Initialize advanced AI models
advanced_occupancy_predictor = AdvancedOccupancyPredictor()
advanced_energy_optimizer = AdvancedEnergyOptimizer()
user_behavior_learner = UserBehaviorLearner()
advanced_schedule_optimizer = AdvancedScheduleOptimizer()

# Generate enhanced sample training data
def generate_enhanced_training_data():
    """Generate enhanced training data with more realistic patterns"""
    sample_data = []
    
    # Generate 3 months of sample data
    start_date = datetime.now() - timedelta(days=90)
    
    for day in range(90):
        current_date = start_date + timedelta(days=day)
        
        # Generate data for each room with realistic patterns
        for room in ['living_room', 'kitchen', 'bedroom', 'bathroom', 'office']:
            for hour in range(24):
                timestamp = current_date.replace(hour=hour, minute=0, second=0, microsecond=0)
                
                # More sophisticated occupancy patterns
                if room == 'bedroom':
                    occupied = (6 <= hour <= 8 or (22 <= hour <= 23) or (0 <= hour <= 6))
                elif room == 'kitchen':
                    occupied = (6 <= hour <= 9 or (12 <= hour <= 13) or (18 <= hour <= 20))
                elif room == 'living_room':
                    occupied = (18 <= hour <= 23) or (9 <= hour <= 11)
                elif room == 'bathroom':
                    occupied = (6 <= hour <= 8 or (22 <= hour <= 23) or (hour % 4 == 0))
                elif room == 'office':
                    occupied = (8 <= hour <= 18) and (current_date.weekday() < 5)  # Weekdays only
                else:
                    occupied = False
                
                # Add weekend variations
                if current_date.weekday() >= 5:  # Weekend
                    if room == 'office':
                        occupied = False  # No office use on weekends
                    elif room == 'living_room':
                        occupied = (10 <= hour <= 23) # More living room use on weekends
                
                # Add some realistic randomness
                if np.random.random() < 0.05:  # 5% chance of random occupancy
                    occupied = not occupied
                
                # Add weather influence (simplified)
                weather_factor = 1.0
                if hour >= 18 or hour <= 6:  # Evening/night
                    weather_factor = 1.2  # More likely to be home in bad weather
                
                # Final occupancy decision
                final_occupied = occupied and (np.random.random() < weather_factor)
                
                sample_data.append({
                    'timestamp': timestamp.isoformat(),
                    'room': room,
                    'occupied': final_occupied,
                    'weather_data': {
                        'main': {'temp': 20 + np.random.normal(0, 5)},
                        'weather': [{'main': 'Clear' if np.random.random() > 0.3 else 'Clouds'}]
                    },
                    'user_activity': {
                        'recent_activity': np.random.randint(0, 10),
                        'preference': 0.5 + np.random.normal(0, 0.2)
                    }
                })
    
    return sample_data

# Train the advanced model with enhanced data
if not advanced_occupancy_predictor.is_trained:
    enhanced_data = generate_enhanced_training_data()
    accuracy = advanced_occupancy_predictor.train(enhanced_data)
    logger.info(f"Advanced AI Model trained with {len(enhanced_data)} samples. Accuracy: {accuracy:.3f}")

# Export models for use in main application
def get_ai_models():
    """Get all AI models for use in main application"""
    return {
        'occupancy_predictor': advanced_occupancy_predictor,
        'energy_optimizer': advanced_energy_optimizer,
        'behavior_learner': user_behavior_learner,
        'schedule_optimizer': advanced_schedule_optimizer
    } 