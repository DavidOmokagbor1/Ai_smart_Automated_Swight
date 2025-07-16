import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CloudIcon, 
  SunIcon, 
  CloudRainIcon, 
  BoltIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const WeatherControl = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [weatherImpact, setWeatherImpact] = useState(null);
  const [autoWeatherMode, setAutoWeatherMode] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const [weatherResponse, impactResponse] = await Promise.all([
        fetch('/api/weather'),
        fetch('/api/weather/impact')
      ]);

      if (weatherResponse.ok && impactResponse.ok) {
        const weather = await weatherResponse.json();
        const impact = await impactResponse.json();
        setWeatherData(weather);
        setWeatherImpact(impact);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast.error('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherMain, iconCode) => {
    const iconMap = {
      'Clear': SunIcon,
      'Clouds': CloudIcon,
      'Rain': CloudRainIcon,
      'Thunderstorm': BoltIcon,
      'Snow': CloudRainIcon,
      'Fog': EyeIcon
    };
    return iconMap[weatherMain] || CloudIcon;
  };

  const getWeatherColor = (weatherMain) => {
    const colorMap = {
      'Clear': 'from-yellow-400 to-orange-500',
      'Clouds': 'from-gray-400 to-gray-600',
      'Rain': 'from-blue-400 to-blue-600',
      'Thunderstorm': 'from-purple-500 to-purple-700',
      'Snow': 'from-blue-200 to-blue-400',
      'Fog': 'from-gray-300 to-gray-500'
    };
    return colorMap[weatherMain] || 'from-gray-400 to-gray-600';
  };

  const getWeatherDescription = (weatherMain, description) => {
    const descriptions = {
      'Clear': 'Clear skies - Natural light available',
      'Clouds': 'Cloudy conditions - Reduced natural light',
      'Rain': 'Rainy weather - Increased artificial lighting needed',
      'Thunderstorm': 'Storm conditions - Maximum lighting required',
      'Snow': 'Snowy weather - Bright lighting for safety',
      'Fog': 'Foggy conditions - Enhanced visibility lighting'
    };
    return descriptions[weatherMain] || description;
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
      const response = await fetch('/api/weather/optimize', {
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

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center text-gray-500">
          <CloudIcon className="w-12 h-12 mx-auto mb-4" />
          <p>Weather data unavailable</p>
        </div>
      </div>
    );
  }

  const WeatherIcon = getWeatherIcon(weatherData.weather.weather[0].main, weatherData.weather.weather[0].icon);
  const weatherColor = getWeatherColor(weatherData.weather.weather[0].main);

  return (
    <div className="space-y-6">
      {/* Weather Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Weather Control</h2>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Weather */}
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-gradient-to-r ${weatherColor}`}>
                <WeatherIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {weatherData.weather.weather[0].main}
                </h3>
                <p className="text-sm text-gray-600">
                  {weatherData.weather.weather[0].description}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(weatherData.weather.main.temp)}°C
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Humidity:</span>
                <span className="ml-2 font-medium">{weatherData.weather.main.humidity}%</span>
              </div>
              <div>
                <span className="text-gray-500">Visibility:</span>
                <span className="ml-2 font-medium">{Math.round(weatherData.weather.visibility / 1000)}km</span>
              </div>
              <div>
                <span className="text-gray-500">Clouds:</span>
                <span className="ml-2 font-medium">{weatherData.weather.clouds.all}%</span>
              </div>
              <div>
                <span className="text-gray-500">Wind:</span>
                <span className="ml-2 font-medium">{weatherData.weather.wind.speed} m/s</span>
              </div>
            </div>
          </div>

          {/* Lighting Impact */}
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Lighting Impact</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Adjustment Factor:</span>
                <span className={`font-bold ${
                  weatherData.lighting_adjustment > 1 ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {weatherData.lighting_adjustment}x
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Natural Light:</span>
                <span className="font-bold text-yellow-600">
                  {Math.round(weatherData.natural_light_factor * 100)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recommendation:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  weatherData.lighting_adjustment > 1.1 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : weatherData.lighting_adjustment < 0.9
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {weatherData.lighting_adjustment > 1.1 ? 'Increase Brightness' :
                   weatherData.lighting_adjustment < 0.9 ? 'Decrease Brightness' :
                   'Optimal Lighting'}
                </span>
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
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Room-by-Room Impact</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={applyWeatherOptimization}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              Apply Weather Optimization
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(weatherImpact.room_impacts).map(([room, impact]) => (
              <div key={room} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 capitalize mb-3">
                  {room.replace('_', ' ')}
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-medium">{impact.current_brightness}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Optimized:</span>
                    <span className={`font-medium ${
                      impact.brightness_change > 0 ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {impact.weather_optimized_brightness}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Change:</span>
                    <span className={`font-medium ${
                      impact.brightness_change > 0 ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {impact.brightness_change > 0 ? '+' : ''}{impact.brightness_change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Weather-based Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Weather Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h4 className="font-semibold text-gray-800 mb-3">Current Conditions</h4>
            <p className="text-gray-600 text-sm mb-3">
              {getWeatherDescription(
                weatherData.weather.weather[0].main, 
                weatherData.weather.weather[0].description
              )}
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Lighting Adjustment:</span>
                <span className={`font-medium ${
                  weatherData.lighting_adjustment > 1 ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {weatherData.lighting_adjustment > 1 ? '+' : ''}{Math.round((weatherData.lighting_adjustment - 1) * 100)}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Energy Impact:</span>
                <span className={`font-medium ${
                  weatherData.lighting_adjustment > 1 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {weatherData.lighting_adjustment > 1 ? 'Higher' : 'Lower'} Usage
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-md">
            <h4 className="font-semibold text-gray-800 mb-3">Smart Actions</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  {weatherData.lighting_adjustment > 1.1 
                    ? 'Automatically increase brightness for better visibility'
                    : weatherData.lighting_adjustment < 0.9
                    ? 'Reduce artificial lighting to save energy'
                    : 'Maintain current lighting levels'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  {weatherData.natural_light_factor > 0.7 
                    ? 'Maximize natural light usage'
                    : 'Optimize artificial lighting'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  {weatherData.weather.weather[0].main === 'Thunderstorm' 
                    ? 'Enable emergency lighting mode'
                    : 'Standard weather-adaptive mode active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WeatherControl; 