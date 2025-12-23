import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CloudIcon, 
  SunIcon, 
  BoltIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { API_URL, SOCKET_URL } from '../config';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [weatherImpact, setWeatherImpact] = useState(null);
  const [autoWeatherMode, setAutoWeatherMode] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
    fetchWeatherImpact();
    
    // Refresh weather data every 5 minutes
    const interval = setInterval(() => {
      fetchWeatherData();
      fetchWeatherImpact();
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);

  // Listen for real-time weather updates via WebSocket
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });
    
    socket.on('weather_update', (data) => {
      // Defensive: log the data and set only the expected part
      console.log('Received weather_update:', data);
      if (data && data.weather) {
        setWeatherData(data);
        toast.success(`Weather updated: ${data.weather.weather && data.weather.weather[0] ? data.weather.weather[0].description : 'N/A'}`);
      } else {
        toast.error('Malformed weather update received');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/weather`);
      const data = await response.json();
      console.log('Fetched weather data:', data);
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherImpact = async () => {
    try {
      const response = await fetch(`${API_URL}/api/weather/impact`);
      const data = await response.json();
      setWeatherImpact(data);
    } catch (error) {
      console.error('Error fetching weather impact:', error);
    }
  };

  const getWeatherIcon = (weatherMain, weatherDesc) => {
    const desc = weatherDesc.toLowerCase();
    
    if (desc.includes('thunderstorm')) return <BoltIcon className="w-8 h-8 text-yellow-400" />;
    if (desc.includes('rain') || desc.includes('drizzle')) return <CloudArrowDownIcon className="w-8 h-8 text-blue-400" />;
    if (desc.includes('snow')) return <CloudIcon className="w-8 h-8 text-blue-200" />;
    if (desc.includes('clouds')) return <CloudIcon className="w-8 h-8 text-gray-400" />;
    if (desc.includes('clear')) return <SunIcon className="w-8 h-8 text-yellow-400" />;
    
    return <CloudIcon className="w-8 h-8 text-gray-400" />;
  };



  const getAdjustmentColor = (adjustment) => {
    if (adjustment > 1.1) return 'text-red-500';
    if (adjustment < 0.9) return 'text-green-500';
    return 'text-yellow-500';
  };

  const toggleAutoWeatherMode = async () => {
    try {
      setAutoWeatherMode(!autoWeatherMode);
      toast.success(`Weather auto-mode ${!autoWeatherMode ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle weather mode');
    }
  };

  const applyWeatherOptimization = async () => {
    try {
      const response = await fetch(`${API_URL}/api/weather/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apply: true }),
      });

      if (response.ok) {
        toast.success('Weather optimization applied to all lights');
      }
    } catch (error) {
      toast.error('Failed to apply weather optimization');
    }
  };

  // Defensive: check for weatherData and nested properties before rendering
  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0a0a0f]">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!weatherData || !weatherData.weather || !Array.isArray(weatherData.weather.weather) || !weatherData.weather.weather[0]) {
    return (
      <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0a0a0f]">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Weather data unavailable
        </div>
      </div>
    );
  }

  const { weather, lighting_adjustment, natural_light_factor } = weatherData;
  const currentWeather = weather.weather[0];

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0a0a0f]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weather Integration</h1>
            <p className="text-gray-600 dark:text-[#e5e7eb] mt-2">
              Smart lighting adjustments based on weather conditions
            </p>
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleAutoWeatherMode}
              className={`px-4 py-2 rounded-lg font-medium ${
                autoWeatherMode 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {autoWeatherMode ? 'Auto Mode ON' : 'Auto Mode OFF'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={applyWeatherOptimization}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              Apply Weather Optimization
            </motion.button>
          </div>
        </div>
      </div>

      {/* Current Weather */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl mb-8 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Weather</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weather Info */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">{weather.main.temp}°F</h3>
                <p className="text-blue-100">{currentWeather.description}</p>
              </div>
              {getWeatherIcon(currentWeather.main, currentWeather.description)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-200">Humidity</span>
                <p className="font-semibold">{weather.main.humidity}%</p>
              </div>
              <div>
                <span className="text-blue-200">Pressure</span>
                <p className="font-semibold">{weather.main.pressure} hPa</p>
              </div>
              <div>
                <span className="text-blue-200">Visibility</span>
                <p className="font-semibold">{weather.visibility / 1000} km</p>
              </div>
              <div>
                <span className="text-blue-200">Wind</span>
                <p className="font-semibold">{weather.wind.speed} m/s</p>
              </div>
            </div>
          </div>

          {/* Lighting Impact */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Lighting Impact</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-purple-200">Weather Adjustment</span>
                <span className={`font-bold ${getAdjustmentColor(lighting_adjustment)}`}>
                  {lighting_adjustment > 1 ? '+' : ''}{Math.round((lighting_adjustment - 1) * 100)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-purple-200">Natural Light Factor</span>
                <span className="font-bold">{Math.round(natural_light_factor * 100)}%</span>
              </div>
              
              <div className="w-full bg-purple-300 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${natural_light_factor * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Room-by-Room Impact */}
      {weatherImpact && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl mb-8 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Room Lighting Adjustments</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(weatherImpact.room_impacts).map(([room, impact]) => (
              <div key={room} className="bg-gray-50 dark:bg-[#2d3340] rounded-xl p-4 border border-gray-200 dark:border-[#444857]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                    {room.replace('_', ' ')}
                  </h3>
                  <AdjustmentsHorizontalIcon className="w-5 h-5 text-blue-500" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current</span>
                    <span className="font-medium">{impact.current_brightness}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Optimized</span>
                    <span className={`font-medium ${impact.brightness_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {impact.weather_optimized_brightness}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Change</span>
                    <span className={`font-medium ${impact.brightness_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {impact.brightness_change > 0 ? '+' : ''}{impact.brightness_change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Weather Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Smart Lighting Tips</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <SunIcon className="w-6 h-6 text-yellow-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Clear Weather</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Natural light is abundant. Lights are dimmed to save energy.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CloudArrowDownIcon className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Rainy Weather</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Increased brightness for safety and mood improvement.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <BoltIcon className="w-6 h-6 text-yellow-400 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Stormy Weather</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Maximum brightness for safety during severe weather.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <EyeIcon className="w-6 h-6 text-gray-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Poor Visibility</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enhanced lighting when visibility is reduced.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Weather; 