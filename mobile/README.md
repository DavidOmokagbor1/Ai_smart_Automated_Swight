# 📱 AI Smart Light Control - Mobile App

Native mobile app built with React Native and Expo, connecting to the same Render backend as the web app.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Expo Go app on your phone (iOS/Android)
- Backend running on Render: `https://ai-smart-automated-swight.onrender.com`

### Installation

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Expo:**
   ```bash
   npm start
   ```
   or
   ```bash
   npx expo start
   ```

### Preview on Your Phone

#### Option 1: Expo Go App (Easiest)
1. Install **Expo Go** from App Store (iOS) or Google Play (Android)
2. Run `npm start` in the mobile directory
3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app
4. App opens automatically! 🎉

#### Option 2: Development Build
```bash
# iOS
npm run ios

# Android
npm run android
```

## 📱 Features

- ✅ **Dashboard**: Real-time system status and energy savings
- ✅ **Light Control**: Toggle lights, adjust brightness per room
- ✅ **Statistics**: Energy usage and savings data
- ✅ **Weather**: Current weather and lighting adjustments
- ✅ **Real-time Updates**: Connects to Render backend via REST API

## 🔧 Configuration

The app connects to your Render backend automatically. To change the backend URL:

1. Create `.env` file in `mobile/` directory:
   ```
   EXPO_PUBLIC_API_URL=https://ai-smart-automated-swight.onrender.com
   EXPO_PUBLIC_SOCKET_URL=https://ai-smart-automated-swight.onrender.com
   ```

2. Or edit `mobile/config.js` directly

## 📂 Project Structure

```
mobile/
├── App.js                 # Main app with navigation
├── config.js              # API configuration
├── screens/               # App screens
│   ├── DashboardScreen.js
│   ├── LightControlScreen.js
│   ├── StatisticsScreen.js
│   └── WeatherScreen.js
├── components/            # Reusable components
└── utils/                 # Utility functions
```

## 🎨 Design

- Modern, clean UI
- Native feel with React Native
- Touch-optimized controls
- Dark/light theme support
- Responsive layouts

## 🔗 Backend Connection

The mobile app uses the **same Render backend** as the web app:
- API: `https://ai-smart-automated-swight.onrender.com`
- All endpoints work the same
- Real-time updates via REST API polling

## 🚨 Troubleshooting

### Can't connect to backend?
- Check Render backend is "Live"
- Verify API URL in `config.js`
- Test backend: `https://ai-smart-automated-swight.onrender.com/api/status`

### Expo Go not working?
- Make sure phone and computer are on same WiFi
- Try tunnel mode: `npx expo start --tunnel`
- Check firewall settings

### Build errors?
- Clear cache: `npx expo start -c`
- Reinstall: `rm -rf node_modules && npm install`

## 📝 Notes

- This is a **separate mobile app** - doesn't affect web app
- Uses same backend API as web version
- Built with Expo for easy development and testing
- Can be built for iOS/Android app stores later

---

**Ready to test?** Run `npm start` and scan the QR code! 📱






