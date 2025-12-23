# 🚀 SIMPLE START - Follow These Steps

## ⚠️ What's NOT Working?

Please tell me:
- [ ] Can't see QR code?
- [ ] QR code doesn't scan?
- [ ] "Could not connect" error?
- [ ] App loads but shows errors?
- [ ] Something else?

---

## ✅ SOLUTION 1: Manual Connection (ALWAYS WORKS)

### Step 1: Start Expo
```bash
cd mobile
npx expo start
```

### Step 2: Wait for this to appear:
```
Metro waiting on exp://192.168.1.160:8081
```

### Step 3: On Your Phone
1. Open **Expo Go** app
2. Tap **"Enter URL manually"** (at the bottom)
3. Type: `exp://192.168.1.160:8081`
4. Tap **"Connect"**

**This should work!** ✅

---

## ✅ SOLUTION 2: Tunnel Mode

```bash
cd mobile
npx expo start --tunnel
```

**Wait 60 seconds** for tunnel to establish, then scan QR code.

---

## ✅ SOLUTION 3: Test in Browser First

```bash
cd mobile
npx expo start --web
```

If this works, the app is fine - it's just a phone connection issue.

---

## 🔍 Check These Things:

1. **Expo Go installed?**
   - iOS: App Store → "Expo Go"
   - Android: Play Store → "Expo Go"

2. **Same WiFi?** (for LAN mode)
   - Computer WiFi: _______________
   - Phone WiFi: _______________

3. **Backend running?**
   - Check: https://ai-smart-automated-swight.onrender.com/api/status
   - Should show JSON data

---

## 📱 Your Connection Info:

- **IP Address:** `192.168.1.160`
- **Port:** `8081`
- **Manual URL:** `exp://192.168.1.160:8081`

---

**Try Solution 1 first - it's the most reliable!** 🎯




