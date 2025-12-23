# 🔧 Expo Connection Troubleshooting

## ❌ Error: "Could not connect to development server"

This happens when your phone can't reach the Expo dev server. Here are the fixes:

---

## ✅ Fix 1: Use Tunnel Mode (Easiest)

**This works even if WiFi networks are different!**

1. **Stop the current Expo server** (Ctrl+C)

2. **Start with tunnel:**
   ```bash
   cd mobile
   npx expo start --tunnel
   ```

3. **Scan the new QR code** with Expo Go

4. **Works on any network!** ✅

---

## ✅ Fix 2: Check Same WiFi Network

1. **On your computer:**
   - Check WiFi network name
   - Make sure it's connected

2. **On your phone:**
   - Go to Settings → WiFi
   - Make sure connected to **same network** as computer

3. **Restart Expo:**
   ```bash
   cd mobile
   npm start
   ```

---

## ✅ Fix 3: Check Firewall

**Mac:**
1. System Settings → Network → Firewall
2. Make sure Expo/Node is allowed
3. Or temporarily disable firewall to test

**Windows:**
1. Windows Defender → Firewall
2. Allow Expo through firewall

---

## ✅ Fix 4: Use LAN Mode Explicitly

```bash
cd mobile
npx expo start --lan
```

This forces LAN connection.

---

## ✅ Fix 5: Manual Connection

If QR code doesn't work:

1. **Get your computer's IP:**
   ```bash
   # Mac
   ipconfig getifaddr en0
   
   # Or check in Expo output
   ```

2. **In Expo Go app:**
   - Tap "Enter URL manually"
   - Type: `exp://YOUR_IP:8081`
   - Example: `exp://192.168.1.160:8081`

---

## ✅ Fix 6: Clear Cache and Restart

```bash
cd mobile
npx expo start -c
```

The `-c` flag clears cache.

---

## 🎯 Recommended Solution

**Use Tunnel Mode** - It's the most reliable:

```bash
cd mobile
npx expo start --tunnel
```

Then scan the QR code again. Tunnel mode works even if:
- Different WiFi networks
- Firewall issues
- Network restrictions

---

## 📱 After Connecting

Once connected, you'll see:
- ✅ App loads on phone
- ✅ Can interact with all screens
- ✅ Changes reload automatically
- ✅ Connected to Render backend

---

## 🆘 Still Not Working?

1. **Check Expo Go version:**
   - Update Expo Go app to latest version

2. **Check Node/Expo version:**
   ```bash
   node --version  # Should be 18+
   npx expo --version
   ```

3. **Try web preview:**
   ```bash
   npx expo start --web
   ```
   Opens in browser (for testing)

4. **Check backend connection:**
   - Make sure Render backend is "Live"
   - Test: `https://ai-smart-automated-swight.onrender.com/api/status`

---

**Most Common Fix:** Use `--tunnel` mode! 🚇




