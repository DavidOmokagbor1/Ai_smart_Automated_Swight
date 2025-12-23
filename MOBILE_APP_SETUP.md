# 📱 Mobile App Setup Guide - Expo/React Native

Complete guide to set up and preview the mobile app on your phone using Expo.

---

## ✅ What We Built

A **native mobile app** (separate from web app) that:
- ✅ Connects to your Render backend
- ✅ Works on iOS and Android
- ✅ Can preview instantly with Expo Go
- ✅ Doesn't affect your web app files

---

## 🚀 Quick Start (5 minutes)

### Step 1: Install Expo Go on Your Phone

**iOS:**
- Open App Store
- Search "Expo Go"
- Install the app

**Android:**
- Open Google Play Store
- Search "Expo Go"
- Install the app

### Step 2: Start the Mobile App

1. **Open terminal** in your project
2. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

3. **Install dependencies** (if not done):
   ```bash
   npm install
   ```

4. **Start Expo:**
   ```bash
   npm start
   ```
   
   You'll see a QR code in the terminal!

### Step 3: Scan QR Code

**On iPhone:**
1. Open **Camera app**
2. Point at the QR code
3. Tap the notification that appears
4. Opens in Expo Go automatically! 🎉

**On Android:**
1. Open **Expo Go app**
2. Tap "Scan QR code"
3. Point camera at QR code
4. App loads! 🎉

---

## 📱 What You'll See

The mobile app has 4 main screens:

1. **Dashboard** 📊
   - System status
   - Energy savings
   - Room overview

2. **Lights** 💡
   - Control each room
   - Adjust brightness
   - Quick actions (All On/Off)

3. **Statistics** 📈
   - Monthly savings
   - Yearly impact
   - Energy usage

4. **Weather** 🌤️
   - Current weather
   - Lighting adjustments
   - Weather details

---

## 🔧 Configuration

### Backend URL

The app connects to: `https://ai-smart-automated-swight.onrender.com`

To change it, edit `mobile/config.js`:
```javascript
const API_URL = 'https://your-backend-url.onrender.com';
```

### Environment Variables (Optional)

Create `mobile/.env`:
```
EXPO_PUBLIC_API_URL=https://ai-smart-automated-swight.onrender.com
EXPO_PUBLIC_SOCKET_URL=https://ai-smart-automated-swight.onrender.com
```

---

## 🎯 Testing Checklist

- [ ] Expo Go installed on phone
- [ ] `npm start` runs successfully
- [ ] QR code appears in terminal
- [ ] Can scan QR code with phone
- [ ] App loads on phone
- [ ] Dashboard shows data
- [ ] Can toggle lights
- [ ] Statistics load
- [ ] Weather data displays

---

## 🚨 Troubleshooting

### "Unable to connect to Expo"

**Fix:**
```bash
# Try tunnel mode
npx expo start --tunnel
```

### "Network request failed"

**Check:**
1. Render backend is "Live"
2. Test backend URL in browser
3. Check `mobile/config.js` has correct URL

### QR Code not scanning?

**Options:**
1. Make sure phone and computer on same WiFi
2. Try tunnel mode: `npx expo start --tunnel`
3. Type URL manually in Expo Go app

### App crashes on load?

**Fix:**
```bash
cd mobile
rm -rf node_modules
npm install
npx expo start -c
```

---

## 📂 File Structure

```
mobile/
├── App.js                    # Main app (navigation)
├── config.js                 # API configuration
├── screens/                  # App screens
│   ├── DashboardScreen.js
│   ├── LightControlScreen.js
│   ├── StatisticsScreen.js
│   └── WeatherScreen.js
├── package.json
└── app.json                  # Expo configuration
```

**Note:** All web app files in `frontend/` are untouched! ✅

---

## 🎨 Features

- ✅ Native mobile UI
- ✅ Touch-optimized controls
- ✅ Real-time data updates
- ✅ Pull-to-refresh
- ✅ Beautiful, modern design
- ✅ Works offline (cached data)

---

## 🔄 Updates

When you make changes:
1. Save the file
2. Expo automatically reloads on your phone
3. See changes instantly!

---

## 📦 Building for App Stores (Future)

When ready to publish:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build
eas build --platform ios
eas build --platform android
```

---

## ✅ Success!

Once you see the app on your phone:
- ✅ Mobile app is working
- ✅ Connected to Render backend
- ✅ All features functional
- ✅ Ready for testing!

---

**Need Help?** Check `mobile/README.md` for more details.




