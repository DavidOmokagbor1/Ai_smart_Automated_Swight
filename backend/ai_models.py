import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
from datetime import datetime, timedelta
import json

class OccupancyPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = 'occupancy_model.pkl'
        self.load_model()
    
    def load_model(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            self.is_trained = True
    
    def save_model(self):
        joblib.dump(self.model, self.model_path)
    
    def prepare_features(self, timestamp, room):
        """Extract features from timestamp for occupancy prediction"""
        dt = pd.to_datetime(timestamp)
        
        features = {
            'hour': dt.hour,
            'day_of_week': dt.dayofweek,
            'is_weekend': 1 if dt.dayofweek >= 5 else 0,
            'is_morning': 1 if 6 <= dt.hour <= 9 else 0,
            'is_evening': 1 if 18 <= dt.hour <= 22 else 0,
            'is_night': 1 if 22 <= dt.hour or dt.hour <= 6 else 0,
            'room_living_room': 1 if room == 'living_room' else 0,
            'room_kitchen': 1 if room == 'kitchen' else 0,
            'room_bedroom': 1 if room == 'bedroom' else 0,
            'room_bathroom': 1 if room == 'bathroom' else 0,
            'room_office': 1 if room == 'office' else 0
        }
        
        return np.array(list(features.values())).reshape(1, -1)
    
    def train(self, historical_data):
        """Train the model with historical occupancy data"""
        features = []
        labels = []
        
        for entry in historical_data:
            feature_vector = self.prepare_features(entry['timestamp'], entry['room'])
            features.append(feature_vector.flatten())
            labels.append(1 if entry['occupied'] else 0)
        
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
        accuracy = self.model.score(X_test_scaled, y_test)
        self.is_trained = True
        self.save_model()
        
        return accuracy
    
    def predict(self, timestamp, room):
        """Predict occupancy for a given time and room"""
        if not self.is_trained:
            return 0.5  # Default confidence if not trained
        
        features = self.prepare_features(timestamp, room)
        features_scaled = self.scaler.transform(features)
        
        # Get prediction probability
        prob = self.model.predict_proba(features_scaled)[0][1]
        return prob

class EnergyOptimizer:
    def __init__(self):
        self.optimization_rules = {
            'natural_light_threshold': 0.7,  # 70% natural light
            'min_brightness': 20,
            'max_brightness': 100,
            'energy_saving_mode': True
        }
    
    def optimize_brightness(self, room, current_time, natural_light_level, occupancy_probability):
        """Optimize brightness based on multiple factors"""
        base_brightness = 80
        
        # Adjust for natural light
        if natural_light_level > self.optimization_rules['natural_light_threshold']:
            base_brightness *= 0.6  # Reduce artificial light
        
        # Adjust for occupancy probability
        if occupancy_probability < 0.3:
            base_brightness *= 0.5  # Lower brightness if low occupancy
        elif occupancy_probability > 0.8:
            base_brightness *= 1.1  # Higher brightness if high occupancy
        
        # Adjust for time of day
        hour = current_time.hour
        if 22 <= hour or hour <= 6:  # Night time
            base_brightness *= 0.4
        elif 6 <= hour <= 9:  # Morning
            base_brightness *= 1.2
        elif 18 <= hour <= 22:  # Evening
            base_brightness *= 1.1
        
        # Room-specific adjustments
        room_adjustments = {
            'bedroom': 0.7,  # Lower brightness for bedrooms
            'bathroom': 1.0,  # Full brightness for bathrooms
            'kitchen': 1.1,   # Higher brightness for kitchens
            'office': 1.0,    # Standard brightness for office
            'living_room': 0.9 # Slightly lower for living room
        }
        
        base_brightness *= room_adjustments.get(room, 1.0)
        
        # Ensure within bounds
        brightness = max(self.optimization_rules['min_brightness'], 
                        min(self.optimization_rules['max_brightness'], base_brightness))
        
        return int(brightness)
    
    def calculate_energy_savings(self, current_consumption, optimized_consumption):
        """Calculate energy savings percentage"""
        if current_consumption == 0:
            return 0
        return ((current_consumption - optimized_consumption) / current_consumption) * 100

class ScheduleOptimizer:
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
    
    def generate_optimal_schedule(self, room, usage_patterns):
        """Generate optimal schedule based on usage patterns"""
        # Analyze usage patterns to determine optimal times
        # This is a simplified version - in reality, you'd analyze historical data
        
        schedule = {
            'enabled': True,
            'daily_schedule': {},
            'vacation_mode': False,
            'sunrise_sunset': True
        }
        
        # Generate schedule for each day
        for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
            if day in ['saturday', 'sunday']:
                template = self.schedule_templates['weekend']
            else:
                template = self.schedule_templates['weekday']
            
            schedule['daily_schedule'][day] = []
            
            for period, settings in template.items():
                schedule['daily_schedule'][day].extend([
                    {'time': settings['start'], 'action': 'on', 'brightness': settings['brightness']},
                    {'time': settings['end'], 'action': 'off'}
                ])
        
        return schedule

# Initialize AI models
occupancy_predictor = OccupancyPredictor()
energy_optimizer = EnergyOptimizer()
schedule_optimizer = ScheduleOptimizer()

# Generate some sample training data for demonstration
def generate_sample_training_data():
    """Generate sample training data for the AI models"""
    sample_data = []
    
    # Generate a month of sample data
    start_date = datetime.now() - timedelta(days=30)
    
    for day in range(30):
        current_date = start_date + timedelta(days=day)
        
        # Generate data for each room
        for room in ['living_room', 'kitchen', 'bedroom', 'bathroom', 'office']:
            for hour in range(24):
                timestamp = current_date.replace(hour=hour, minute=0, second=0, microsecond=0)
                
                # Simulate realistic occupancy patterns
                if room == 'bedroom':
                    occupied = 6 <= hour <= 8 or 22 <= hour <= 23
                elif room == 'kitchen':
                    occupied = 6 <= hour <= 9 or 12 <= hour <= 13 or 18 <= hour <= 20
                elif room == 'living_room':
                    occupied = 18 <= hour <= 23
                elif room == 'bathroom':
                    occupied = 6 <= hour <= 8 or 22 <= hour <= 23
                elif room == 'office':
                    occupied = 8 <= hour <= 18
                else:
                    occupied = False
                
                # Add some randomness
                if np.random.random() < 0.1:  # 10% chance of random occupancy
                    occupied = not occupied
                
                sample_data.append({
                    'timestamp': timestamp.isoformat(),
                    'room': room,
                    'occupied': occupied
                })
    
    return sample_data

# Train the model with sample data (for demonstration)
if not occupancy_predictor.is_trained:
    sample_data = generate_sample_training_data()
    accuracy = occupancy_predictor.train(sample_data)
    print(f"AI Model trained with {len(sample_data)} samples. Accuracy: {accuracy:.2f}") 