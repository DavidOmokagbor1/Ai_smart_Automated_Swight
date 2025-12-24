#!/bin/bash

# Simple script to start the backend server
# This ensures clean startup without blocking

echo "🚀 Starting Flask Backend Server..."

cd "$(dirname "$0")"

# Kill any existing processes on port 5000
echo "🧹 Cleaning up port 5000..."
lsof -ti :5000 | xargs kill -9 2>/dev/null
sleep 1

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Copy from env.example if needed."
fi

# Start the Flask app
echo "🔧 Starting Flask app..."
python3 app.py

