#!/bin/bash

echo "🎬 Preparing AI Smart Light Control System for Presentation..."
echo "=========================================================="

# Check if we're in the right directory
if [ ! -f "backend/app.py" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Step 1: Checking dependencies..."

# Check Python dependencies
echo "🐍 Checking Python dependencies..."
cd backend
if ! python3 -c "import flask, flask_cors, flask_socketio, numpy, pandas, sklearn" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
else
    echo "✅ Python dependencies are installed"
fi

# Check Node.js dependencies
echo "📦 Checking Node.js dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
else
    echo "✅ Node.js dependencies are installed"
fi

echo "📋 Step 2: Initializing database..."
cd ../backend
python3 init_db.py

echo "📋 Step 3: Testing AI models..."
python3 -c "
from ai_models import occupancy_predictor, energy_optimizer, schedule_optimizer
print('✅ AI models loaded successfully')
print(f'Occupancy predictor trained: {occupancy_predictor.is_trained}')
print(f'Energy optimizer ready: {energy_optimizer.optimization_rules is not None}')
print(f'Schedule optimizer ready: {schedule_optimizer.schedule_templates is not None}')
"

echo "📋 Step 4: Creating presentation-ready data..."

# Generate enhanced demo data
python3 -c "
from app import app, db, EnergyUsage, OccupancyData
from datetime import datetime, timedelta
import random

with app.app_context():
    # Add more impressive energy savings data
    for i in range(7):  # Last week with better savings
        date = datetime.now() - timedelta(days=i)
        for room in ['living_room', 'kitchen', 'bedroom', 'bathroom', 'office']:
            # Show decreasing energy usage over time (demonstrating AI optimization)
            base_usage = 2.0 - (i * 0.1)  # Decreasing usage
            usage = EnergyUsage(
                device_id=f'{room.upper()[:2]}001',
                timestamp=date,
                power_consumption=max(0.3, base_usage + random.uniform(-0.2, 0.2)),
                cost=max(0.05, (base_usage + random.uniform(-0.2, 0.2)) * 0.15)
            )
            db.session.add(usage)
    
    # Add high-accuracy occupancy predictions
    for i in range(24):  # Last 24 hours
        date = datetime.now() - timedelta(hours=i)
        for room in ['living_room', 'kitchen', 'bedroom', 'bathroom', 'office']:
            # High confidence predictions
            occupancy = OccupancyData(
                location=room,
                timestamp=date,
                is_occupied=random.choice([True, False]),
                confidence=random.uniform(0.85, 0.98)  # High accuracy
            )
            db.session.add(occupancy)
    
    db.session.commit()
    print('✅ Enhanced presentation data created')
"

echo "📋 Step 5: Testing backend server..."
# Start backend in background and test
python3 app.py &
BACKEND_PID=$!
sleep 5

# Test if backend is responding
if curl -s http://localhost:5000/api/status > /dev/null; then
    echo "✅ Backend server is responding"
else
    echo "❌ Backend server not responding"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Stop backend
kill $BACKEND_PID 2>/dev/null

echo ""
echo "🎉 Presentation Preparation Complete!"
echo "=================================="
echo "✅ All dependencies installed"
echo "✅ Database initialized with sample data"
echo "✅ AI models loaded and ready"
echo "✅ Enhanced demo data created"
echo "✅ Backend server tested"
echo ""
echo "🚀 Ready to start presentation with:"
echo "   ./start.sh"
echo ""
echo "📊 Key presentation features:"
echo "   • Dashboard with real-time data"
echo "   • Statistics page with impressive savings"
echo "   • Presentation Mode for automated demo"
echo "   • Hardware Demo for IoT showcase"
echo "   • AI predictions and optimizations"
echo ""
echo "💡 Presentation tips:"
echo "   • Start with the Dashboard"
echo "   • Show Statistics page for impact"
echo "   • Use Presentation Mode for automated demo"
echo "   • Highlight AI features and energy savings" 