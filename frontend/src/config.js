// API Configuration
// Default to Render backend URL for production, localhost for development
const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
const DEFAULT_API_URL = isProduction 
  ? 'https://ai-smart-automated-swight.onrender.com'
  : 'http://localhost:5000';

const API_URL = process.env.REACT_APP_API_URL || DEFAULT_API_URL;
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || DEFAULT_API_URL;

// #region agent log
console.log('🔍 [DEBUG] Config loaded:', {
  API_URL,
  SOCKET_URL,
  isProduction,
  hasEnvAPI: !!process.env.REACT_APP_API_URL,
  hasEnvSocket: !!process.env.REACT_APP_SOCKET_URL,
  currentOrigin: window.location.origin
});
// #endregion

export { API_URL, SOCKET_URL };












