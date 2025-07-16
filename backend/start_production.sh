#!/bin/bash

# Production startup script for AI Smart Light Control System
# This script starts the application using Gunicorn for production deployment

echo "🚀 Starting AI Smart Light Control System in Production Mode..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Using default configuration."
    echo "   Copy env.example to .env and configure your settings."
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Set environment variables
export FLASK_ENV=production
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Install dependencies if requirements.txt is newer than last install
if [ ! -f .installed ] || [ requirements.txt -nt .installed ]; then
    echo "📦 Installing/updating dependencies..."
    pip3 install -r requirements.txt
    touch .installed
fi

# Initialize database
echo "🗄️  Initializing database..."
python3 init_db.py

# Start the application with Gunicorn
echo "🌟 Starting Gunicorn server..."
gunicorn --bind 0.0.0.0:5000 \
         --workers 4 \
         --timeout 30 \
         --access-logfile logs/access.log \
         --error-logfile logs/error.log \
         --log-level info \
         --preload \
         app:app 