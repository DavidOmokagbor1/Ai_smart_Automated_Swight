import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LightBulbIcon, 
  ClockIcon, 
  CalendarIcon,
  CogIcon,
  SunIcon,
  MoonIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const LightControl = () => {
  const [lights, setLights] = useState({
    living_room: { status: 'off', brightness: 0, color_temperature: 'warm' },
    kitchen: { status: 'off', brightness: 0, color_temperature: 'warm' },
    bedroom: { status: 'off', brightness: 0, color_temperature: 'warm' },
    bathroom: { status: 'off', brightness: 0, color_temperature: 'warm' },
    office: { status: 'off', brightness: 0, color_temperature: 'warm' }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    fetchLightStatus();
    fetchAiStatus();
    
    // Add debug info
    const debugInterval = setInterval(() => {
      const info = {
        timestamp: new Date().toISOString(),
        aiModeEnabled,
        isLoading,
        lightsCount: Object.keys(lights).length
      };
      setDebugInfo(info);
      // Log debug info in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Debug Info:', info);
      }
    }, 5000);
    
    return () => clearInterval(debugInterval);
  }, [aiModeEnabled, isLoading, lights]);

  const fetchLightStatus = async () => {
    const url = `${API_URL}/api/status`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (response.ok) {
        const data = await response.json();
        setLights(data.lights || {});
      }
    } catch (error) {
      console.error('Error fetching light status:', error);
    }
  };

  const fetchAiStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ai/status`);
      const data = await response.json();
      setAiModeEnabled(data.ai_mode_enabled);
    } catch (error) {
      console.error('Error fetching AI status:', error);
    }
  };

  const toggleAiMode = async () => {
    try {
      setIsLoading(true);
      
      // Prevent multiple rapid clicks
      if (isLoading) return;
      
      const response = await fetch(`${API_URL}/api/ai/mode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !aiModeEnabled }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setAiModeEnabled(result.ai_mode_enabled);
        toast.success(result.message);
        
        // Refresh AI status after a short delay to ensure backend state is updated
        setTimeout(() => {
          fetchAiStatus();
        }, 500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Error toggling AI mode');
      }
    } catch (error) {
      console.error('AI mode toggle error:', error);
      toast.error('Network error: Unable to toggle AI mode');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLight = async (room) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/lights/${room}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setLights(prev => ({
          ...prev,
          [room]: { ...prev[room], status: result.status }
        }));
        toast.success(`${result.status} ${room} lights`);
      }
    } catch (error) {
      toast.error('Error toggling lights');
    } finally {
      setIsLoading(false);
    }
  };

  const setBrightness = async (room, brightness) => {
    try {
      const response = await fetch(`${API_URL}/api/lights/${room}/brightness`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brightness }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setLights(prev => ({
          ...prev,
          [room]: { ...prev[room], brightness: result.brightness }
        }));
      }
    } catch (error) {
      toast.error('Error adjusting brightness');
    }
  };

  const setColorTemperature = async (room, temperature) => {
    try {
      const response = await fetch(`/api/lights/${room}/color`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ temperature }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setLights(prev => ({
          ...prev,
          [room]: { ...prev[room], color_temperature: result.temperature }
        }));
        toast.success(`Set ${room} to ${temperature} lighting`);
      }
    } catch (error) {
      toast.error('Error setting color temperature');
    }
  };

  const bulkControl = async (action, brightness = 100) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/lights/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, brightness }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setLights(prev => ({
          ...prev,
          ...result.results
        }));
        toast.success(`${action} all lights`);
      }
    } catch (error) {
      toast.error('Error controlling all lights');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoomDisplayName = (room) => {
    return room.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusColor = (status) => {
    return status === 'on' ? 'text-green-600' : 'text-gray-400';
  };

  const getBrightnessColor = (brightness) => {
    if (brightness === 0) return 'text-gray-400';
    if (brightness <= 30) return 'text-yellow-400';
    if (brightness <= 70) return 'text-yellow-500';
    return 'text-yellow-600';
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0a0a0f]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Light Control</h1>
        <p className="text-gray-600 dark:text-[#e5e7eb] mt-2">
          Real-time control of your smart lighting system
        </p>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="luxury-card mb-8 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => bulkControl('on')}
            disabled={isLoading}
            className="btn-luxury-primary py-3 px-6 flex items-center justify-center disabled:opacity-50"
          >
            <SunIcon className="w-5 h-5 mr-2" />
            All On
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => bulkControl('off')}
            disabled={isLoading}
            className="btn-luxury-secondary text-white dark:text-white py-3 px-6 flex items-center justify-center disabled:opacity-50"
          >
            <MoonIcon className="w-5 h-5 mr-2" />
            All Off
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => bulkControl('dim', 50)}
            disabled={isLoading}
            className="btn-luxury-primary py-3 px-6 flex items-center justify-center disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}
          >
            <LightBulbIcon className="w-5 h-5 mr-2" />
            Dim All
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleAiMode}
            disabled={isLoading}
            className={`btn-luxury-primary py-3 px-6 flex items-center justify-center disabled:opacity-50 ${aiModeEnabled ? 'ai-mode-gradient' : ''}`}
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            AI Mode
            {isLoading ? (
              <CogIcon className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <span className={`ml-2 ${aiModeEnabled ? 'text-green-300' : 'text-gray-400'}`}>
                {aiModeEnabled ? 'ON' : 'OFF'}
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Room Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(lights).map(([room, light]) => (
          <motion.div
            key={room}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="luxury-light-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getRoomDisplayName(room)}
              </h3>
              <div className={`w-3 h-3 rounded-full ${light.status === 'on' ? 'bg-green-500' : 'bg-gray-700'}`}></div>
            </div>

            {/* Status and Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-medium ${getStatusColor(light.status)} text-gray-600 dark:text-gray-400`}>
                {light.status === 'on' ? 'ON' : 'OFF'}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleLight(room)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-2xl text-sm font-medium border border-gray-200 dark:border-gray-700 shadow-xl ${
                  light.status === 'on' 
                    ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                    : 'bg-green-900 text-green-300 hover:bg-green-800'
                } disabled:opacity-50`}
              >
                {light.status === 'on' ? 'Turn Off' : 'Turn On'}
              </motion.button>
            </div>

            {/* Brightness Control */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-500">Brightness</span>
                <span className={`text-sm font-bold ${getBrightnessColor(light.brightness)} text-gray-900 dark:text-gray-100`}>
                  {light.brightness}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={light.brightness}
                onChange={(e) => setBrightness(room, parseInt(e.target.value))}
                className="range-luxury w-full cursor-pointer"
                disabled={isLoading}
              />
            </div>

            {/* Color Temperature */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-500">Color Temperature</span>
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-500 dark:text-gray-500" />
              </div>
              <div className="flex space-x-2">
                {['warm', 'neutral', 'cool'].map((temp) => (
                  <button
                    key={temp}
                    onClick={() => setColorTemperature(room, temp)}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded-2xl text-xs font-medium border border-gray-200 dark:border-gray-700 shadow-xl capitalize ${
                      light.color_temperature === temp
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600'
                    } disabled:opacity-50`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => setBrightness(room, 100)}
                disabled={isLoading}
                className="flex-1 px-3 py-2 btn-luxury-primary text-sm disabled:opacity-50"
              >
                Full
              </button>
              <button
                onClick={() => setBrightness(room, 50)}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-yellow-200 to-yellow-300 text-white rounded-2xl text-sm font-medium hover:from-yellow-300 hover:to-yellow-400 border border-gray-200 dark:border-gray-700 shadow-xl disabled:opacity-50"
              >
                Half
              </button>
              <button
                onClick={() => setBrightness(room, 25)}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-200 to-orange-300 text-white rounded-2xl text-sm font-medium hover:from-orange-300 hover:to-orange-400 border border-gray-200 dark:border-gray-700 shadow-xl disabled:opacity-50"
              >
                Low
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="luxury-card mt-8 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Smart Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Motion Detection</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-2xl border border-gray-300 dark:border-gray-600">
                <div className="flex items-center mb-2">
                  <CogIcon className="w-5 h-5 text-indigo-400 mr-2" />
                  <span className="font-medium text-indigo-200">Auto On/Off</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lights automatically turn on when motion is detected and off after 5 minutes of inactivity.
                </p>
              </div>
              
              <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-2xl border border-gray-300 dark:border-gray-600">
                <div className="flex items-center mb-2">
                  <SunIcon className="w-5 h-5 text-green-400 mr-2" />
                  <span className="font-medium text-green-200">Natural Light Integration</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Brightness automatically adjusts based on available natural light.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Smart Scheduling</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-2xl border border-gray-300 dark:border-gray-600">
                <div className="flex items-center mb-2">
                  <CalendarIcon className="w-5 h-5 text-purple-400 mr-2" />
                  <span className="font-medium text-purple-200">Daily Schedules</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set different lighting patterns for different times of day.
                </p>
              </div>
              
              <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-2xl border border-gray-300 dark:border-gray-600">
                <div className="flex items-center mb-2">
                  <ClockIcon className="w-5 h-5 text-indigo-400 mr-2" />
                  <span className="font-medium text-indigo-200">Usage Learning</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI learns your patterns and optimizes lighting schedules accordingly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LightControl; 