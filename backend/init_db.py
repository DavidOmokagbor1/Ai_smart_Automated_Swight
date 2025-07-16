#!/usr/bin/env python3
"""
Database initialization script for AI Smart Light Control System
Ensures all tables are created and sample data is loaded for presentation
"""

from app import app, db, LightDevice, EnergyUsage, OccupancyData, User, ActivityLog
from datetime import datetime, timedelta
import random

def init_database():
    """Initialize database with tables and sample data"""
    with app.app_context():
        # Create all tables
        db.create_all()
        print("✅ Database tables created successfully")
        
        # Check if sample data already exists
        if LightDevice.query.first():
            print("✅ Sample data already exists")
            return
        
        # Create sample light devices
        devices = [
            LightDevice(name="Living Room Light", location="living_room", device_id="LR001", is_on=False, brightness=0),
            LightDevice(name="Kitchen Light", location="kitchen", device_id="KT001", is_on=False, brightness=0),
            LightDevice(name="Bedroom Light", location="bedroom", device_id="BR001", is_on=False, brightness=0),
            LightDevice(name="Bathroom Light", location="bathroom", device_id="BT001", is_on=False, brightness=0),
            LightDevice(name="Office Light", location="office", device_id="OF001", is_on=False, brightness=0)
        ]
        
        for device in devices:
            db.session.add(device)
        
        # Create sample energy usage data
        for i in range(30):  # Last 30 days
            date = datetime.now() - timedelta(days=i)
            for device in devices:
                usage = EnergyUsage(
                    device_id=device.device_id,
                    timestamp=date,
                    power_consumption=random.uniform(0.5, 2.5),
                    cost=random.uniform(0.1, 0.5)
                )
                db.session.add(usage)
        
        # Create sample occupancy data
        rooms = ['living_room', 'kitchen', 'bedroom', 'bathroom', 'office']
        for i in range(100):  # Last 100 occupancy records
            date = datetime.now() - timedelta(hours=i)
            room = random.choice(rooms)
            occupancy = OccupancyData(
                location=room,
                timestamp=date,
                is_occupied=random.choice([True, False]),
                confidence=random.uniform(0.7, 0.95)
            )
            db.session.add(occupancy)
        
        # Create sample user
        user = User(
            username="demo_user",
            email="demo@smartlights.com",
            password_hash="demo_hash",
            role="user",
            preferences='{"light_preferences": {"default_brightness": 80, "favorite_color_temperature": "warm"}}'
        )
        db.session.add(user)
        
        # Create sample activity logs
        activities = [
            "Light turned on",
            "Light turned off", 
            "Brightness adjusted",
            "Motion detected",
            "Schedule activated",
            "AI optimization applied"
        ]
        
        for i in range(50):  # Last 50 activities
            date = datetime.now() - timedelta(hours=i)
            activity = ActivityLog(
                user_id=1,
                action=random.choice(activities),
                room=random.choice(rooms),
                details='{"brightness": 80, "ai_optimized": true}',
                timestamp=date,
                ip_address="192.168.1.100"
            )
            db.session.add(activity)
        
        # Commit all changes
        db.session.commit()
        print("✅ Sample data loaded successfully")
        print(f"📊 Created {len(devices)} devices, 30 days of energy data, 100 occupancy records, and 50 activity logs")

if __name__ == "__main__":
    init_database() 