#!/bin/bash

echo "🌤️  Setting up Real-Time Weather Integration"
echo "=============================================="
echo ""

# Check if .env file exists
if [ ! -f backend/.env ]; then
    echo "📝 Creating .env file from template..."
    cp backend/env.example backend/.env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🔑 To get a FREE OpenWeatherMap API key:"
echo "1. Go to: https://openweathermap.org/api"
echo "2. Click 'Get API Key' (free tier)"
echo "3. Sign up for a free account"
echo "4. Copy your API key"
echo ""

# Ask for API key
read -p "Enter your OpenWeatherMap API key (or press Enter to skip): " api_key

if [ ! -z "$api_key" ]; then
    # Update the .env file with the API key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/WEATHER_API_KEY=your-openweathermap-api-key/WEATHER_API_KEY=$api_key/" backend/.env
    else
        # Linux
        sed -i "s/WEATHER_API_KEY=your-openweathermap-api-key/WEATHER_API_KEY=$api_key/" backend/.env
    fi
    echo "✅ API key saved to .env file"
else
    echo "⚠️  No API key provided. Weather will use demo data."
fi

# Ask for city
read -p "Enter your city name (default: London): " city_name
city_name=${city_name:-London}

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/WEATHER_CITY=London/WEATHER_CITY=$city_name/" backend/.env
else
    # Linux
    sed -i "s/WEATHER_CITY=London/WEATHER_CITY=$city_name/" backend/.env
fi

echo "✅ City set to: $city_name"

echo ""
echo "🚀 Weather API Setup Complete!"
echo "=============================="
echo ""
echo "📋 Next steps:"
echo "1. Restart the backend: ./restart_app.sh"
echo "2. Open the web interface: http://localhost:3000"
echo "3. Go to the Weather page to see real-time updates"
echo ""
echo "🌤️  Features enabled:"
echo "   ✅ Real-time weather data (every 5 minutes)"
echo "   ✅ Automatic lighting adjustments based on weather"
echo "   ✅ Weather-based brightness optimization"
echo "   ✅ WebSocket updates for live weather changes"
echo "" 