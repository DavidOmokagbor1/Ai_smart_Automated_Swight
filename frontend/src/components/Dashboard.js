import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LightBulbIcon, 
  BoltIcon, 
  ChartBarIcon, 
  SunIcon,
  MoonIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const Dashboard = ({ lights, schedules }) => {
  const [systemStatus, setSystemStatus] = useState({
    lights: {},
    energy: {},
    timestamp: new Date().toISOString()
  });
  const [isConnected, setIsConnected] = useState(false);
  const [aiPredictions, setAiPredictions] = useState({
    occupancy: {},
    energyOptimization: {},
    nextActions: []
  });
  const [demoMode, setDemoMode] = useState(false);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added for loading state


  useEffect(() => {
    if (demoMode) {
      // setEnergyData(demoData); // Removed as per edit hint
    }
  }, [demoMode]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });
    // setSocket(newSocket); // Removed as per edit hint

    newSocket.on('connect', () => {
      setIsConnected(true);
      toast.success('Connected to AI Light Control System');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from system');
    });

    newSocket.on('light_update', (data) => {
      setSystemStatus(prev => ({
        ...prev,
        lights: {
          ...prev.lights,
          [data.room]: data.state
        }
      }));
    });

    newSocket.on('motion_update', (data) => {
      toast.success(`Motion detected in ${data.room}!`);
    });

    newSocket.on('auto_off', (data) => {
      toast(`Lights automatically turned off in ${data.room}`);
    });

    newSocket.on('ai_prediction', (data) => {
      setAiPredictions(prev => ({
        ...prev,
        occupancy: {
          ...prev.occupancy,
          [data.room]: data.prediction
        }
      }));
    });

    newSocket.on('ai_mode_update', (data) => {
      setAiModeEnabled(data.enabled);
      if (data.enabled) {
        toast.success('AI Mode activated! 🤖');
      } else {
        toast('AI Mode deactivated');
      }
    });

    newSocket.on('energy_optimization', (data) => {
      setAiPredictions(prev => ({
        ...prev,
        energyOptimization: {
          ...prev.energyOptimization,
          [data.room]: data.optimization
        }
      }));
    });

    // Fetch initial status
    fetchSystemStatus();
    fetchAiStatus();

    return () => {
      // newSocket.close(); // Removed as per edit hint
    };
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const fetchAiStatus = async () => {
    try {
      const response = await fetch('/api/ai/status');
      const data = await response.json();
      setAiModeEnabled(data.ai_mode_enabled);
    } catch (error) {
      console.error('Error fetching AI status:', error);
    }
  };

  const toggleAiMode = async () => {
    try {
      // Prevent multiple rapid clicks
      if (isLoading) return;
      
      const response = await fetch('/api/ai/mode', {
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
    }
  };

  const controlLight = async (room, action, brightness = 100) => {
    try {
      const response = await fetch(`/api/lights/${room}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, brightness }),
      });
      
      if (response.ok) {
        toast.success(`${action} ${room} lights`);
      }
    } catch (error) {
      toast.error('Error controlling lights');
    }
  };

  const controlAllLights = async (action, brightness = 100) => {
    try {
      const response = await fetch('/api/lights/all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, brightness }),
      });
      
      if (response.ok) {
        toast.success(`${action} all lights`);
      }
    } catch (error) {
      toast.error('Error controlling all lights');
    }
  };

  const getEnergyData = () => {
    const energy = systemStatus.energy || {};
    return [
      { name: 'Used', value: energy.daily_consumption || 0, color: '#ef4444' },
      { name: 'Saved', value: energy.cost_saved || 0, color: '#10b981' }
    ];
  };

  const getRoomStatus = () => {
    const lights = systemStatus.lights || {};
    return Object.entries(lights).map(([room, state]) => ({
      room,
      status: state.status || 'off',
      brightness: state.brightness || 0,
      motion: state.motion_detected || false
    }));
  };

  const getUsageHistory = () => {
    const energy = systemStatus.energy || {};
    const history = energy.usage_history || [];
    return history.slice(-24).map((entry, index) => ({
      time: index,
      consumption: entry.consumption || 0,
      cost: entry.cost || 0
    }));
  };

  const getAiInsights = () => {
    const insights = [];
    
    // Occupancy predictions
    Object.entries(aiPredictions.occupancy).forEach(([room, prediction]) => {
      if (prediction > 0.7) {
        insights.push({
          type: 'occupancy',
          room,
          message: `High occupancy predicted in ${room.replace('_', ' ')}`,
          confidence: Math.round(prediction * 100),
          priority: 'high'
        });
      }
    });
    
    // Energy optimization suggestions
    Object.entries(aiPredictions.energyOptimization).forEach(([room, optimization]) => {
      if (optimization.savings > 20) {
        insights.push({
          type: 'energy',
          room,
          message: `Save ${optimization.savings.toFixed(1)}% energy in ${room.replace('_', ' ')}`,
          confidence: Math.round(optimization.confidence * 100),
          priority: 'medium'
        });
      }
    });
    
    return insights;
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#23272f]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Smart Light Control</h1>
        <p className="text-gray-600 dark:text-[#e5e7eb] mt-2">
          Intelligent lighting system saving energy and reducing costs
        </p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-500 dark:text-[#a1a1aa]">
              {isConnected ? 'System Connected' : 'System Disconnected'}
            </span>
          </div>
          
          {/* Demo Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDemoMode(!demoMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              demoMode 
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {demoMode ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            <span>{demoMode ? 'Demo Mode ON' : 'Demo Mode'}</span>
          </motion.button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => controlAllLights('on')}
          className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-4 rounded-2xl flex items-center justify-center shadow-xl hover:from-indigo-600 hover:to-blue-600 border border-[#363b47] dark:border-[#363b47]"
        >
          <SunIcon className="w-6 h-6 mr-2" />
          Turn All On
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => controlAllLights('off')}
          className="bg-[#2d3340] text-white p-4 rounded-2xl flex items-center justify-center shadow-xl hover:bg-[#363b47] border border-[#363b47]"
        >
          <MoonIcon className="w-6 h-6 mr-2" />
          Turn All Off
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => controlAllLights('dim', 50)}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-4 rounded-2xl flex items-center justify-center shadow-xl hover:from-yellow-500 hover:to-yellow-600 border border-[#363b47]"
        >
          <LightBulbIcon className="w-6 h-6 mr-2" />
          Dim All
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleAiMode}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            aiModeEnabled 
              ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          {aiModeEnabled ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
          <span>{aiModeEnabled ? 'AI Mode ON' : 'AI Mode'}</span>
        </motion.button>
      </div>

      {/* Energy Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#2d3340] border border-gray-200 dark:border-[#363b47] shadow-xl rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Daily Consumption</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {systemStatus.energy?.daily_consumption?.toFixed(2) || '0'} kWh
              </p>
            </div>
            <BoltIcon className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#2d3340] border border-gray-200 dark:border-[#363b47] shadow-xl rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Cost Saved</p>
              <p className="text-2xl font-bold text-green-400">
                ${systemStatus.energy?.cost_saved?.toFixed(2) || '0.00'}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#2d3340] border border-gray-200 dark:border-[#363b47] shadow-xl rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Active Lights</p>
              <p className="text-2xl font-bold text-blue-400">
                {getRoomStatus().filter(room => room.status === 'on').length}
              </p>
            </div>
            <LightBulbIcon className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>
      </div>

      {/* Room Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {getRoomStatus().map((room, index) => (
          <motion.div
            key={room.room}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#2d3340] border border-gray-200 dark:border-[#363b47] shadow-xl rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {room.room.replace('_', ' ')}
              </h3>
              <div className={`w-3 h-3 rounded-full ${room.motion ? 'bg-green-500' : 'bg-gray-700'}`}></div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a1a1aa]">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  room.status === 'on' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'
                }`}>
                  {room.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a1a1aa]">Brightness:</span>
                <span className="text-sm font-medium text-[#e5e7eb]">{room.brightness}%</span>
              </div>
              
              <div className="w-full bg-[#363b47] rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${room.brightness}%` }}
                ></div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => controlLight(room.room, 'on')}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 px-3 rounded-lg text-sm hover:from-indigo-600 hover:to-blue-600 border border-[#363b47]"
                >
                  On
                </button>
                <button
                  onClick={() => controlLight(room.room, 'off')}
                  className="flex-1 bg-[#2d3340] text-white py-2 px-3 rounded-lg text-sm hover:bg-[#363b47] border border-[#363b47]"
                >
                  Off
                </button>
                <button
                  onClick={() => controlLight(room.room, 'dim', Math.max(0, room.brightness - 20))}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-2 px-3 rounded-lg text-sm hover:from-yellow-500 hover:to-yellow-600 border border-[#363b47]"
                >
                  Dim
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Insights Panel */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🤖 AI Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Always show these summary cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-2xl shadow-xl border border-[#363b47] dark:border-gray-700"
          >
            <div className="flex items-center mb-2">
              <BoltIcon className="w-6 h-6 mr-2 text-yellow-300" />
              <span className="font-semibold">Today's Energy Usage</span>
            </div>
            <p className="text-2xl font-bold">{systemStatus.energy?.daily_consumption?.toFixed(2) || '0'} kWh</p>
            <p className="text-xs text-[#e5e7eb] mt-1">Total energy consumed today</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-2xl shadow-xl border border-[#363b47] dark:border-gray-700"
          >
            <div className="flex items-center mb-2">
              <ChartBarIcon className="w-6 h-6 mr-2 text-green-300" />
              <span className="font-semibold">Efficiency Rating</span>
            </div>
            {(() => {
              const usage = systemStatus.energy?.daily_consumption || 0;
              let rating = 'A+';
              if (usage >= 30) rating = 'F';
              else if (usage >= 25) rating = 'E';
              else if (usage >= 20) rating = 'D';
              else if (usage >= 15) rating = 'C';
              else if (usage >= 10) rating = 'B';
              else if (usage >= 5) rating = 'A';
              return <span className="text-2xl font-bold">{rating}</span>;
            })()}
            <p className="text-xs text-[#e5e7eb] mt-1">Based on today's usage</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl shadow-xl border border-[#363b47] dark:border-gray-700"
          >
            <div className="flex items-center mb-2">
              <CurrencyDollarIcon className="w-6 h-6 mr-2 text-green-200" />
              <span className="font-semibold">Cost Saved</span>
            </div>
            <p className="text-2xl font-bold">${systemStatus.energy?.cost_saved?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-[#e5e7eb] mt-1">Total cost saved today</p>
          </motion.div>
          {/* Show AI insights if available */}
          {getAiInsights().map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-r ${
                insight.priority === 'high' 
                  ? 'from-red-500 to-pink-500' 
                  : 'from-blue-500 to-purple-500'
              } text-white p-4 rounded-2xl shadow-xl border border-[#363b47] dark:border-gray-700`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{insight.message}</p>
                  <p className="text-xs opacity-80 mt-1">
                    Confidence: {insight.confidence}%
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  insight.priority === 'high' ? 'bg-red-300' : 'bg-blue-300'
                }`}></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#2d3340] border border-[#363b47] shadow-xl rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Energy Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getUsageHistory()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#2d3340] border border-[#363b47] shadow-xl rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Energy Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getEnergyData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getEnergyData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Energy Efficiency Box */}
      <div className="mt-8 grid grid-cols-1 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2d3340] border border-[#363b47] shadow-xl rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between"
        >
          <div className="mb-4 md:mb-0 md:mr-8 flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-white mr-2">Energy Efficiency Rating</h3>
              <div className="relative group">
                <InformationCircleIcon className="w-5 h-5 text-blue-400 cursor-pointer" />
                <div className="absolute left-6 top-0 z-10 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg w-64">
                  Rating is based on daily energy consumption:<br/>
                  <b>A+</b>: &lt;5kWh, <b>A</b>: &lt;10kWh, <b>B</b>: &lt;15kWh, <b>C</b>: &lt;20kWh, <b>D</b>: &lt;25kWh, <b>E</b>: &lt;30kWh, <b>F</b>: &ge;30kWh
                </div>
              </div>
            </div>
            {/* Granular rating logic */}
            {(() => {
              const usage = systemStatus.energy?.daily_consumption || 0;
              let rating = 'A+';
              if (usage >= 30) rating = 'F';
              else if (usage >= 25) rating = 'E';
              else if (usage >= 20) rating = 'D';
              else if (usage >= 15) rating = 'C';
              else if (usage >= 10) rating = 'B';
              else if (usage >= 5) rating = 'A';
              // Color for each rating
              const color = {
                'A+': 'text-green-400',
                'A': 'text-green-300',
                'B': 'text-yellow-300',
                'C': 'text-yellow-400',
                'D': 'text-orange-400',
                'E': 'text-red-400',
                'F': 'text-red-600',
              }[rating];
              // Progress bar (0-40kWh scale)
              const percent = Math.min(usage / 40, 1) * 100;
              return (
                <>
                  <span className={`text-4xl font-bold ${color}`}>{rating}</span>
                  <div className="w-full bg-gray-700 rounded-full h-3 mt-3 mb-1">
                    <div className={`h-3 rounded-full transition-all duration-300 ${color}`} style={{ width: `${percent}%` }}></div>
                  </div>
                  <span className="text-xs text-[#a1a1aa]">{usage.toFixed(2)} kWh / 40 kWh</span>
                </>
              );
            })()}
            <p className="text-[#a1a1aa] mt-2">Lower is better. Based on daily consumption.</p>
          </div>
          <div className="flex-1">
            <h4 className="text-md font-semibold text-white mb-2">Today's Usage</h4>
            <p className="text-2xl font-bold text-blue-400 mb-2">{systemStatus.energy?.daily_consumption?.toFixed(2) || '0'} kWh</p>
            {/* Weekly average and improvement */}
            {(() => {
              const history = systemStatus.energy?.usage_history || [];
              const last7 = history.slice(-7);
              const prev7 = history.slice(-14, -7);
              const avg = last7.length ? last7.reduce((a, b) => a + (b.consumption || 0), 0) / last7.length : 0;
              const prevAvg = prev7.length ? prev7.reduce((a, b) => a + (b.consumption || 0), 0) / prev7.length : 0;
              const diff = avg - prevAvg;
              const percent = prevAvg ? (diff / prevAvg) * 100 : 0;
              return (
                <div className="mb-2">
                  <span className="block text-sm text-[#a1a1aa]">Weekly Avg: <span className="font-bold text-green-300">{avg.toFixed(2)} kWh</span></span>
                  {prev7.length > 0 && (
                    <span className={`block text-xs mt-1 ${percent < 0 ? 'text-green-400' : 'text-red-400'}`}>{percent < 0 ? 'Improved' : 'Worse'} {Math.abs(percent).toFixed(1)}% vs last week</span>
                  )}
                </div>
              );
            })()}
            <h4 className="text-md font-semibold text-white mb-2">Distribution</h4>
            <div className="flex space-x-6">
              <div>
                <span className="block text-sm text-[#a1a1aa]">Used</span>
                <span className="text-lg font-bold text-red-400">{systemStatus.energy?.daily_consumption?.toFixed(2) || '0'} kWh</span>
              </div>
              <div>
                <span className="block text-sm text-[#a1a1aa]">Saved</span>
                <span className="text-lg font-bold text-green-400">${systemStatus.energy?.cost_saved?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 