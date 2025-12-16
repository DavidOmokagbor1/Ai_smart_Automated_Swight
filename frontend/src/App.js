import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Loading from './components/Loading';
import './App.css';
import { Toaster } from 'react-hot-toast';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const LightControl = lazy(() => import('./components/LightControl'));
const Scheduling = lazy(() => import('./components/Scheduling'));
const Weather = lazy(() => import('./components/Weather'));
const Statistics = lazy(() => import('./components/Statistics'));
const ActivityLog = lazy(() => import('./components/ActivityLog'));
const Profile = lazy(() => import('./components/Profile'));
const Login = lazy(() => import('./components/Login'));

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/verify', {
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

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router>
      <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
        <Toaster position="top-right" />
        
        {isAuthenticated && (
          <Sidebar 
            user={user} 
            onLogout={handleLogout} 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
          />
        )}
        
        <div className="flex-1 overflow-auto">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={
                !isAuthenticated ? (
                  <Login onLogin={handleLogin} />
                ) : (
                  <Navigate to="/" replace />
                )
              } />
              
              <Route path="/" element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
              } />
              
              <Route path="/lights" element={
                isAuthenticated ? <LightControl /> : <Navigate to="/login" replace />
              } />
              
              <Route path="/scheduling" element={
                isAuthenticated ? <Scheduling /> : <Navigate to="/login" replace />
              } />
              
              <Route path="/weather" element={
                isAuthenticated ? <Weather /> : <Navigate to="/login" replace />
              } />
              
              <Route path="/statistics" element={
                isAuthenticated ? <Statistics /> : <Navigate to="/login" replace />
              } />
              
              <Route path="/activity" element={
                isAuthenticated ? <ActivityLog /> : <Navigate to="/login" replace />
              } />
              
              <Route path="/profile" element={
                isAuthenticated ? <Profile user={user} /> : <Navigate to="/login" replace />
              } />
              
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
