# 🚀 Quick Fix for Expo Connection

## If Tunnel Mode Fails

### Option 1: Use LAN Mode (Same WiFi)

```bash
cd mobile
npx expo start --lan
```

**Requirements:**
- Phone and computer on **same WiFi network**
- Scan QR code with Expo Go

---

### Option 2: Manual Connection

1. **Get your computer's IP address:**
   ```bash
   # Mac
   ipconfig getifaddr en0
   ```

2. **In Expo Go app:**
   - Tap "Enter URL manually"
   - Type: `exp://YOUR_IP:8081`
   - Example: `exp://192.168.1.160:8081`

---

### Option 3: Use Web Preview (Testing)

```bash
cd mobile
npx expo start --web
```

Opens in browser - good for quick testing!

---

### Option 4: Fix ngrok Installation

If tunnel mode needed:

```bash
# Install ngrok globally
npm install -g @expo/ngrok

# Then try tunnel again
npx expo start --tunnel
```

---

## ✅ Recommended: LAN Mode

**Easiest and fastest:**

```bash
cd mobile
npx expo start --lan
```

Make sure phone and computer are on same WiFi! 📶




