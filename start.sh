#!/bin/bash

echo "🤖 Starting AI Smart Light Control System..."

# Function to check if a port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $port is in use. Cleaning up..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
        sleep 2
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for service at $url..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo "✅ Service is ready!"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    echo "❌ Service failed to start after $max_attempts attempts"
    return 1
}

# Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "react-scripts" 2>/dev/null
pkill -f "python3 app.py" 2>/dev/null
pkill -f "node.*start" 2>/dev/null

# Check and free ports
echo "🔍 Checking port availability..."
check_port 3000
check_port 5001

# Wait for ports to be freed
sleep 3

# Start backend server with error handling
echo "🔧 Starting backend server..."
cd backend

# Check if Python dependencies are installed
if ! python3 -c "import flask, socketio" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
fi

# Start backend with automatic restart on failure
python3 app.py &
BACKEND_PID=$!

# Wait for backend to be ready
if wait_for_service "http://localhost:5001/api/status"; then
    echo "✅ Backend server is running (PID: $BACKEND_PID)"
else
    echo "❌ Backend failed to start properly"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend development server
echo "🌐 Starting frontend server..."
cd ../frontend

# Check if Node dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

npm start &
FRONTEND_PID=$!

# Wait for frontend to be ready
if wait_for_service "http://localhost:3000"; then
    echo "✅ Frontend server is running (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend failed to start properly"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 AI Smart Light Control System is ready!"
echo "📊 Backend: http://localhost:5001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "💡 Tips:"
echo "   - Use Ctrl+C to stop all services"
echo "   - Run './restart_app.sh' to restart the system"
echo "   - Check logs in the terminal for debugging"
echo ""
echo "🤖 AI Mode Status:"
curl -s http://localhost:5001/api/ai/status | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'   AI Mode: {\"ON\" if data[\"ai_mode_enabled\"] else \"OFF\"}')
    print(f'   Time of Day: {data[\"time_of_day\"]}')
except:
    print('   Status: Checking...')
"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    pkill -f "react-scripts" 2>/dev/null
    pkill -f "python3 app.py" 2>/dev/null
    echo "✅ System stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
echo ""
echo "Press Ctrl+C to stop all services"
wait
