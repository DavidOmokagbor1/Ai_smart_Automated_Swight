import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Loading from './components/Loading';
import './App.css';
import { Toaster } from 'react-hot-toast';
// import { API_URL } from './config'; // Unused - authentication bypassed

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const LightControl = lazy(() => import('./components/LightControl'));
const Scheduling = lazy(() => import('./components/Scheduling'));
const Weather = lazy(() => import('./components/Weather'));
const Statistics = lazy(() => import('./components/Statistics'));
const ActivityLog = lazy(() => import('./components/ActivityLog'));
const Profile = lazy(() => import('./components/Profile'));
const Security = lazy(() => import('./components/Security'));
const Settings = lazy(() => import('./components/Settings'));
const DeviceManagement = lazy(() => import('./components/DeviceManagement'));
// const Login = lazy(() => import('./components/Login')); // Unused - authentication bypassed

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState({ username: 'Guest User', role: 'Home Owner' });
  // const [isAuthenticated, setIsAuthenticated] = useState(true); // Unused - authentication bypassed
  const [isLoading] = useState(false); // Skip loading since no auth check needed

  useEffect(() => {
    // Authentication bypassed for easy deployment
    // Original auth check commented out for reference
    /*
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
    */

    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // const handleLogin = async (credentials) => { // Unused - authentication bypassed
  //   try {
  //     const response = await fetch(`${API_URL}/api/auth/login`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(credentials)
  //     });
  //     
  //     if (response.ok) {
  //       const data = await response.json();
  //       localStorage.setItem('token', data.token);
  //       setUser(data.user);
  //       setIsAuthenticated(true);
  //       return true;
  //     } else {
  //       throw new Error('Login failed');
  //     }
  //   } catch (error) {
  //     console.error('Login error:', error);
  //     throw error;
  //   }
  // };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // setIsAuthenticated(false); // Unused - authentication bypassed
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router>
      <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
        <Toaster position="top-right" />
        
        {/* Sidebar always visible - authentication bypassed */}
        <Sidebar 
          user={user} 
          onLogout={handleLogout} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
        />
        
        <div className="flex-1 overflow-auto">
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Login route removed - authentication bypassed for deployment */}
              
              <Route path="/" element={<Dashboard />} />
              <Route path="/lights" element={<LightControl />} />
              <Route path="/scheduling" element={<Scheduling />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/activity" element={<ActivityLog />} />
              <Route path="/profile" element={<Profile user={user} />} />
              <Route path="/security" element={<Security />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/devices" element={<DeviceManagement />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
}

export default App;
