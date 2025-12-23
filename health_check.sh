#!/bin/bash

echo "🏥 AI Smart Light Control System Health Check"

# Function to check if a service is running
check_service() {
    local service_name=$1
    local port=$2
    local url=$3
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        if curl -s "$url" >/dev/null 2>&1; then
            echo "✅ $service_name is running (Port: $port)"
            return 0
        else
            echo "⚠️  $service_name is running but not responding (Port: $port)"
            return 1
        fi
    else
        echo "❌ $service_name is not running (Port: $port)"
        return 1
    fi
}

# Function to restart a service
restart_service() {
    local service_name=$1
    local script_path=$2
    
    echo "🔄 Restarting $service_name..."
    if [ -f "$script_path" ]; then
        bash "$script_path" &
        sleep 5
    else
        echo "❌ Restart script not found: $script_path"
    fi
}

# Check backend
echo "🔍 Checking Backend..."
if ! check_service "Backend" 5000 "http://localhost:5000/api/status"; then
    echo "🔄 Attempting to restart backend..."
    pkill -f "python3 app.py" 2>/dev/null
    sleep 2
    cd backend && python3 app.py &
    sleep 5
    if check_service "Backend" 5000 "http://localhost:5000/api/status"; then
        echo "✅ Backend restarted successfully"
    else
        echo "❌ Backend restart failed"
    fi
fi

# Check frontend
echo "🔍 Checking Frontend..."
if ! check_service "Frontend" 3000 "http://localhost:3000"; then
    echo "🔄 Attempting to restart frontend..."
    pkill -f "react-scripts" 2>/dev/null
    sleep 2
    cd frontend && npm start &
    sleep 10
    if check_service "Frontend" 3000 "http://localhost:3000"; then
        echo "✅ Frontend restarted successfully"
    else
        echo "❌ Frontend restart failed"
    fi
fi

# Check AI Mode status
echo "🤖 Checking AI Mode..."
if curl -s "http://localhost:5000/api/ai/status" >/dev/null 2>&1; then
    AI_STATUS=$(curl -s "http://localhost:5000/api/ai/status" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('ON' if data['ai_mode_enabled'] else 'OFF')
except:
    print('UNKNOWN')
")
    echo "✅ AI Mode: $AI_STATUS"
else
    echo "❌ Cannot check AI Mode status"
fi

# Check database
echo "🗄️  Checking Database..."
if [ -f "backend/instance/smart_lights.db" ]; then
    echo "✅ Database file exists"
else
    echo "⚠️  Database file not found, initializing..."
    cd backend && python3 init_db.py
fi

# Overall system status
echo ""
echo "📊 System Status Summary:"
BACKEND_OK=$(check_service "Backend" 5000 "http://localhost:5000/api/status" >/dev/null && echo "✅" || echo "❌")
FRONTEND_OK=$(check_service "Frontend" 3000 "http://localhost:3000" >/dev/null && echo "✅" || echo "❌")

echo "   Backend:  $BACKEND_OK"
echo "   Frontend: $FRONTEND_OK"

if [ "$BACKEND_OK" = "✅" ] && [ "$FRONTEND_OK" = "✅" ]; then
    echo ""
    echo "🎉 All systems are operational!"
    echo "🌐 Access your app at: http://localhost:3000"
else
    echo ""
    echo "⚠️  Some services are not running properly"
    echo "💡 Try running: ./restart_app.sh"
fi 