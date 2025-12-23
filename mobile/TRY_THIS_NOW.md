# 🎯 TRY THIS RIGHT NOW

## Step-by-Step (Copy & Paste)

### 1. Open Terminal in `mobile` folder

### 2. Run this command:
```bash
npx expo start --tunnel
```

### 3. Wait 60 seconds
- You'll see "Starting tunnel..."
- Then a QR code will appear
- **Be patient - tunnel takes time!**

### 4. On Your Phone:
- Open **Expo Go** app
- Tap **"Scan QR code"**
- Point at the QR code in terminal
- **Wait 30 seconds** for connection

---

## 🔄 If That Doesn't Work:

### Try Manual Connection:

1. **In terminal, run:**
   ```bash
   npx expo start
   ```

2. **Look for this line:**
   ```
   Metro waiting on exp://192.168.1.160:8081
   ```

3. **On phone:**
   - Open Expo Go
   - Tap **"Enter URL manually"**
   - Type: `exp://192.168.1.160:8081`
   - Tap **"Connect"**

---

## ❓ What Error Are You Seeing?

Please tell me:
- Exact error message?
- Does QR code appear?
- Does it scan but not connect?
- Does app load but show errors?

---

## ✅ Quick Test - Browser Version:

```bash
cd mobile
npx expo start --web
```

This opens app in browser. If this works, app is fine - just connection issue.

---

**Start with tunnel mode and wait 60 seconds!** ⏱️




