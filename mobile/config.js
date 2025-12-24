// API Configuration for Mobile App
// Connects to the same Render backend as the web app

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://ai-smart-automated-swight.onrender.com';
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://ai-smart-automated-swight.onrender.com';

// Log configuration for debugging
if (__DEV__) {
  console.log('🔗 Mobile App API Configuration:');
  console.log('API_URL:', API_URL);
  console.log('SOCKET_URL:', SOCKET_URL);
}

export { API_URL, SOCKET_URL };






