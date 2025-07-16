import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LightControl from './components/LightControl';
import Scheduling from './components/Scheduling';
import ActivityLog from './components/ActivityLog';
import Profile from './components/Profile';
import Statistics from './components/Statistics';
import HardwareDemo from './components/HardwareDemo';
import PresentationMode from './components/PresentationMode';
import Weather from './components/Weather';
import Login from './components/Login';
import './App.css';

function App() {
  const [lights, setLights] = useState({});
  const [schedules, setSchedules] = useState({});
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('demoUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLights();
      fetchSchedules();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchLights = async () => {
    try {
      const response = await fetch('/api/lights');
      if (response.ok) {
        const data = await response.json();
        setLights(data);
      }
    } catch (error) {
      console.error('Error fetching lights:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules');
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('demoUser');
  };

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('demoUser', JSON.stringify(updatedUser));
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className={darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}>
        {/* Presentation Mode Banner */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-2 text-center text-sm font-medium">
          🎬 <span className="hidden sm:inline">Presentation Mode Available</span> - Click "Presentation" in sidebar for automated demo
        </div>
        
        <div className="flex h-screen">
          <Sidebar user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard lights={lights} schedules={schedules} />} />
              <Route path="/lights" element={<LightControl lights={lights} setLights={setLights} />} />
              <Route path="/scheduling" element={<Scheduling schedules={schedules} setSchedules={setSchedules} />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/hardware" element={<HardwareDemo />} />
              <Route path="/presentation" element={<PresentationMode />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/profile" element={<Profile user={user} onUpdateProfile={handleUpdateProfile} />} />
              <Route path="/activity" element={<ActivityLog />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App; 