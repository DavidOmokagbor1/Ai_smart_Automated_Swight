# 🔧 Step-by-Step Fix for Expo Connection

## Your Computer IP: `192.168.1.160`

---

## ✅ Method 1: Tunnel Mode (RECOMMENDED - Works Everywhere)

**This works even if phone and computer are on different WiFi networks!**

### Steps:

1. **Open Terminal** in the `mobile` folder

2. **Run this command:**
   ```bash
   npx expo start --tunnel --clear
   ```

3. **Wait for QR code** to appear (may take 30-60 seconds)

4. **On your phone:**
   - Open **Expo Go** app
   - Tap **"Scan QR code"**
   - Point camera at the QR code in terminal
   - Wait for app to load

5. **If it says "Could not connect":**
   - Wait 10 more seconds
   - Try scanning QR code again
   - Tunnel mode sometimes takes time to establish

---

## ✅ Method 2: LAN Mode (Same WiFi Required)

**Only works if phone and computer are on the SAME WiFi network**

### Steps:

1. **Check WiFi:**
   - Computer WiFi name: _______________
   - Phone WiFi name: _______________
   - **Must be the same!**

2. **Run this command:**
   ```bash
   npx expo start --lan --clear
   ```

3. **Scan QR code** with Expo Go

4. **If QR doesn't work, use manual connection:**
   - In Expo Go app, tap **"Enter URL manually"**
   - Type: `exp://192.168.1.160:8081`
   - Tap **"Connect"**

---

## ✅ Method 3: Manual Connection (Most Reliable)

**If QR codes don't work, connect manually:**

1. **Start Expo:**
   ```bash
   cd mobile
   npx expo start
   ```

2. **On your phone:**
   - Open **Expo Go** app
   - Tap **"Enter URL manually"** (at bottom)
   - Type exactly: `exp://192.168.1.160:8081`
   - Tap **"Connect"**

---

## ✅ Method 4: Test in Browser First

**Verify the app works before trying phone:**

```bash
cd mobile
npx expo start --web
```

This opens the app in your browser. If this works, the app is fine - it's just a connection issue.

---

## 🚨 Common Issues & Fixes

### Issue 1: "Could not connect to development server"

**Fix:**
- Use tunnel mode: `npx expo start --tunnel`
- Or check firewall settings
- Or try manual connection with IP

### Issue 2: QR code doesn't scan

**Fix:**
- Use manual connection (Method 3)
- Make sure terminal window is large enough
- Try refreshing QR code (press `r` in Expo terminal)

### Issue 3: App loads but shows errors

**Fix:**
- Check backend is running: https://ai-smart-automated-swight.onrender.com/api/status
- Check `mobile/config.js` has correct backend URL

### Issue 4: "Network request failed"

**Fix:**
- Backend might be sleeping (Render free tier)
- Wait 30 seconds and try again
- Or check Render dashboard to wake it up

---

## 🎯 Quick Commands

```bash
# Tunnel mode (works everywhere)
npx expo start --tunnel

# LAN mode (same WiFi)
npx expo start --lan

# Web mode (browser)
npx expo start --web

# Manual connection URL
exp://192.168.1.160:8081
```

---

## 📱 After Connecting Successfully

You should see:
- ✅ App loads on phone
- ✅ Dashboard shows data
- ✅ Can navigate between tabs
- ✅ Can control lights

---

## 🆘 Still Not Working?

1. **Check Expo Go version** - Update to latest
2. **Check Node version** - Should be 18+
3. **Try different network** - Switch WiFi
4. **Restart everything:**
   ```bash
   pkill -f expo
   cd mobile
   rm -rf .expo
   npx expo start --tunnel --clear
   ```

---

**Most reliable: Use tunnel mode and wait 60 seconds for connection!** 🚇




