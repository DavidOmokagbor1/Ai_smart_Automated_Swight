#!/usr/bin/env python3
"""
Keep-Alive Service for Render Backend

This script pings the backend every 5 minutes to prevent Render free tier
from spinning down the service. Can be run:
1. Locally as a background process
2. On a free service like PythonAnywhere, Replit, or GitHub Actions
3. Via external monitoring service (UptimeRobot, etc.)

Usage:
    python keep_alive.py
    
Or run continuously:
    nohup python keep_alive.py > keep_alive.log 2>&1 &
"""

import requests
import time
import logging
from datetime import datetime
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('keep_alive.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Backend URL
BACKEND_URL = "https://ai-smart-automated-swight.onrender.com"
HEALTH_ENDPOINT = f"{BACKEND_URL}/api/status"
PING_INTERVAL = 300  # 5 minutes (Render spins down after 15 min, so 5 min is safe)

def ping_backend():
    """Ping the backend to keep it alive"""
    try:
        response = requests.get(HEALTH_ENDPOINT, timeout=10)
        if response.status_code == 200:
            data = response.json()
            logger.info(f"✅ Backend is alive - Status: {data.get('status', 'unknown')}")
            return True
        else:
            logger.warning(f"⚠️ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Failed to ping backend: {e}")
        return False

def main():
    """Main keep-alive loop"""
    logger.info("🚀 Starting Keep-Alive Service")
    logger.info(f"📍 Backend URL: {BACKEND_URL}")
    logger.info(f"⏰ Ping interval: {PING_INTERVAL} seconds (5 minutes)")
    logger.info("=" * 60)
    
    consecutive_failures = 0
    max_failures = 3
    
    while True:
        try:
            success = ping_backend()
            
            if success:
                consecutive_failures = 0
            else:
                consecutive_failures += 1
                if consecutive_failures >= max_failures:
                    logger.error(f"❌ {max_failures} consecutive failures. Backend may be down!")
            
            # Wait before next ping
            logger.info(f"⏳ Next ping in {PING_INTERVAL} seconds...")
            time.sleep(PING_INTERVAL)
            
        except KeyboardInterrupt:
            logger.info("🛑 Keep-Alive service stopped by user")
            break
        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}", exc_info=True)
            time.sleep(PING_INTERVAL)

if __name__ == "__main__":
    main()


