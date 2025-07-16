import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CpuChipIcon, 
  WifiIcon, 
  CogIcon
} from '@heroicons/react/24/outline';

const HardwareDemo = () => {
  const [sensors, setSensors] = useState({
    motion: {
      living_room: { active: false, battery: 85, signal: 95 },
      kitchen: { active: false, battery: 92, signal: 98 },
      bedroom: { active: false, battery: 78, signal: 87 },
      bathroom: { active: false, battery: 88, signal: 92 },
      office: { active: false, battery: 90, signal: 96 }
    },
    light: {
      living_room: { level: 45, battery: 82 },
      kitchen: { level: 78, battery: 89 },
      bedroom: { level: 23, battery: 85 },
      bathroom: { level: 65, battery: 91 },
      office: { level: 89, battery: 87 }
    },
    temperature: {
      living_room: { temp: 22.5, humidity: 45 },
      kitchen: { temp: 24.1, humidity: 52 },
      bedroom: { temp: 21.8, humidity: 43 },
      bathroom: { temp: 23.2, humidity: 58 },
      office: { temp: 22.9, humidity: 47 }
    }
  });

  const [smartBulbs] = useState({
    living_room: { connected: true, firmware: 'v2.1.4', lastSeen: '2 min ago' },
    kitchen: { connected: true, firmware: 'v2.1.4', lastSeen: '1 min ago' },
    bedroom: { connected: true, firmware: 'v2.1.4', lastSeen: '3 min ago' },
    bathroom: { connected: true, firmware: 'v2.1.4', lastSeen: '1 min ago' },
    office: { connected: true, firmware: 'v2.1.4', lastSeen: '2 min ago' }
  });

  const [systemHealth] = useState({
    network: { status: 'excellent', latency: 12, uptime: '99.8%' },
    hub: { status: 'online', cpu: 23, memory: 45 },
    security: { status: 'secure', lastScan: '2 hours ago' }
  });

  useEffect(() => {
    // Simulate sensor data updates
    const interval = setInterval(() => {
      setSensors(prev => {
        const newSensors = { ...prev };
        
        // Simulate motion detection
        Object.keys(newSensors.motion).forEach(room => {
          if (Math.random() < 0.1) { // 10% chance of motion
            newSensors.motion[room].active = true;
            setTimeout(() => {
              setSensors(current => ({
                ...current,
                motion: {
                  ...current.motion,
                  [room]: { ...current.motion[room], active: false }
                }
              }));
            }, 3000);
          }
        });

        // Simulate light level changes
        Object.keys(newSensors.light).forEach(room => {
          newSensors.light[room].level += (Math.random() - 0.5) * 2;
          newSensors.light[room].level = Math.max(0, Math.min(100, newSensors.light[room].level));
        });

        // Simulate temperature changes
        Object.keys(newSensors.temperature).forEach(room => {
          newSensors.temperature[room].temp += (Math.random() - 0.5) * 0.2;
          newSensors.temperature[room].temp = Math.max(18, Math.min(28, newSensors.temperature[room].temp));
        });

        return newSensors;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSignalStrength = (signal) => {
    if (signal >= 90) return 'Excellent';
    if (signal >= 80) return 'Good';
    if (signal >= 70) return 'Fair';
    return 'Poor';
  };

  const getBatteryStatus = (battery) => {
    if (battery >= 80) return 'text-green-400';
    if (battery >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-6 bg-[#23272f] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">🔧 Hardware Demo</h1>
        <p className="text-[#e5e7eb] mt-2">
          Real-time monitoring of IoT sensors and smart devices
        </p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2d3340] border border-[#363b47] shadow-xl rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Network Status</p>
              <p className="text-2xl font-bold text-green-400">
                {systemHealth.network.status}
              </p>
              <p className="text-sm text-[#a1a1aa]">
                Latency: {systemHealth.network.latency}ms
              </p>
            </div>
            <WifiIcon className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#2d3340] border border-[#363b47] shadow-xl rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Hub Status</p>
              <p className="text-2xl font-bold text-blue-400">
                {systemHealth.hub.status}
              </p>
              <p className="text-sm text-[#a1a1aa]">
                CPU: {systemHealth.hub.cpu}% | RAM: {systemHealth.hub.memory}%
              </p>
            </div>
            <CpuChipIcon className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#2d3340] border border-[#363b47] shadow-xl rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Security</p>
              <p className="text-2xl font-bold text-green-400">
                {systemHealth.security.status}
              </p>
              <p className="text-sm text-[#a1a1aa]">
                Last scan: {systemHealth.security.lastScan}
              </p>
            </div>
            <CogIcon className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
      </div>

      {/* Motion Sensors */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">📡 Motion Sensors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(sensors.motion).map(([room, sensor], index) => (
            <motion.div
              key={room}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-[#2d3340] border border-[#363b47] shadow-xl rounded-2xl p-4 ${
                sensor.active ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white capitalize">
                  {room.replace('_', ' ')}
                </h3>
                <div className={`w-3 h-3 rounded-full ${sensor.active ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Signal:</span>
                  <span className="text-white">{getSignalStrength(sensor.signal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Battery:</span>
                  <span className={getBatteryStatus(sensor.battery)}>{sensor.battery}%</span>
                </div>
                <div className="w-full bg-[#363b47] rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sensor.signal}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Smart Bulbs */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">💡 Smart Bulbs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(smartBulbs).map(([room, bulb], index) => (
            <motion.div
              key={room}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#2d3340] border border-[#363b47] shadow-xl rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white capitalize">
                  {room.replace('_', ' ')}
                </h3>
                <div className={`w-3 h-3 rounded-full ${bulb.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Status:</span>
                  <span className={bulb.connected ? 'text-green-400' : 'text-red-400'}>
                    {bulb.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Firmware:</span>
                  <span className="text-white">{bulb.firmware}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Last Seen:</span>
                  <span className="text-white">{bulb.lastSeen}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HardwareDemo; 