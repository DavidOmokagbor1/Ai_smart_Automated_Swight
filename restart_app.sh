#!/bin/bash

echo "🔄 Restarting AI Smart Light Control System..."

# Kill any existing processes
echo "Stopping existing processes..."
pkill -f "react-scripts" 2>/dev/null
pkill -f "python3 app.py" 2>/dev/null
pkill -f "node.*start" 2>/dev/null

# Wait a moment for processes to stop
sleep 2

# Check if ports are free
echo "Checking port availability..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is still in use. Killing processes on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
fi

if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5000 is still in use. Killing processes on port 5000..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null
fi

# Wait for ports to be freed
sleep 3

echo "🚀 Starting backend server..."
cd backend
python3 app.py &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 5

echo "🚀 Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ Application restarted successfully!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "To stop the application, run: pkill -f 'react-scripts' && pkill -f 'python3 app.py'"
echo ""
echo "Process IDs:"
echo "Backend: $BACKEND_PID"
echo "Frontend: $FRONTEND_PID" 