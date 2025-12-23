#!/bin/bash

# Expo Start Script with Multiple Options
# Usage: ./start_expo.sh [mode]
# Modes: tunnel, lan, web, default

MODE=${1:-tunnel}
MOBILE_DIR="/Volumes/2-2-22/BEATZBYJAVA PRODUCTIONS WEB/Ai_smart_Automated_Swight/mobile"

cd "$MOBILE_DIR" || exit 1

# Kill any existing Expo processes
echo "🛑 Stopping any existing Expo processes..."
pkill -f "expo start" 2>/dev/null
sleep 2

# Get local IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "unknown")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting Expo in $MODE mode"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Your local IP: $LOCAL_IP"
echo ""

case $MODE in
  tunnel)
    echo "🌐 Tunnel Mode - Works on any network!"
    echo "   Scan QR code with Expo Go app"
    echo ""
    npx expo start --tunnel --clear
    ;;
  lan)
    echo "📶 LAN Mode - Same WiFi required"
    echo "   Make sure phone and computer are on same WiFi"
    echo "   Manual URL: exp://$LOCAL_IP:8081"
    echo ""
    npx expo start --lan --clear
    ;;
  web)
    echo "🌍 Web Mode - Opens in browser"
    echo ""
    npx expo start --web --clear
    ;;
  *)
    echo "📱 Default Mode"
    echo "   Manual URL: exp://$LOCAL_IP:8081"
    echo ""
    npx expo start --clear
    ;;
esac




