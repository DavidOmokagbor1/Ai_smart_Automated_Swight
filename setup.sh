#!/bin/bash

echo "🚀 Setting up AI Smart Light Control System..."
echo "================================================"

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p backend/models
mkdir -p frontend/src/components
mkdir -p hardware
mkdir -p docs

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd backend

# Check for Python and pip
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PIP_CMD="pip3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    PIP_CMD="pip"
else
    echo "❌ Error: Python not found. Please install Python 3.8+"
    echo "💡 You can install Python using Homebrew: brew install python"
    exit 1
fi

echo "🐍 Using Python: $PYTHON_CMD"
echo "📦 Using pip: $PIP_CMD"

# Install dependencies
$PIP_CMD install -r requirements.txt
cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install
cd ..

# Create environment file
echo "🔧 Creating environment configuration..."
cat > backend/.env << EOF
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///smart_lights.db
EOF

# Create startup script
echo "⚡ Creating startup script..."
cat > start.sh << 'EOF'
#!/bin/bash

echo "🤖 Starting AI Smart Light Control System..."

# Start backend server
echo "🔧 Starting backend server..."
cd backend
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend development server
echo "🌐 Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ System is starting up!"
echo "📊 Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait

# Cleanup
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
echo "🛑 System stopped"
EOF

chmod +x start.sh

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 To start the system:"
echo "   ./start.sh"
echo ""
echo "📚 Available features:"
echo "   • AI-powered occupancy prediction"
echo "   • Smart energy optimization"
echo "   • Real-time light control"
echo "   • Energy cost tracking"
echo "   • Motion detection automation"
echo ""
echo "💡 Expected energy savings: 30-50%"
echo "💰 Cost reduction through intelligent automation" 