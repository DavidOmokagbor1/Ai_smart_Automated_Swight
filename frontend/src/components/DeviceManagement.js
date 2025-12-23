import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DevicePhoneMobileIcon,
  LightBulbIcon,
  WifiIcon,
  SignalIcon,
  // BatteryIcon, // Unused
  CogIcon,
  PlusIcon,
  TrashIcon,
  // PencilIcon, // Unused
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'light',
    room: 'living_room',
    ip_address: '',
    mac_address: ''
  });

  useEffect(() => {
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/devices');
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || getDefaultDevices());
      } else {
        // Use default devices if API fails
        setDevices(getDefaultDevices());
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices(getDefaultDevices());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultDevices = () => {
    return [
      {
        id: 1,
        name: 'Living Room Light',
        type: 'light',
        room: 'living_room',
        status: 'online',
        signal_strength: 85,
        battery: null,
        ip_address: '192.168.1.101',
        mac_address: 'AA:BB:CC:DD:EE:01',
        firmware_version: '2.1.3',
        last_seen: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Kitchen Light',
        type: 'light',
        room: 'kitchen',
        status: 'online',
        signal_strength: 92,
        battery: null,
        ip_address: '192.168.1.102',
        mac_address: 'AA:BB:CC:DD:EE:02',
        firmware_version: '2.1.3',
        last_seen: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Bedroom Light',
        type: 'light',
        room: 'bedroom',
        status: 'online',
        signal_strength: 78,
        battery: null,
        ip_address: '192.168.1.103',
        mac_address: 'AA:BB:CC:DD:EE:03',
        firmware_version: '2.0.9',
        last_seen: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Bathroom Light',
        type: 'light',
        room: 'bathroom',
        status: 'offline',
        signal_strength: 0,
        battery: null,
        ip_address: '192.168.1.104',
        mac_address: 'AA:BB:CC:DD:EE:04',
        firmware_version: '2.1.0',
        last_seen: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 5,
        name: 'Office Light',
        type: 'light',
        room: 'office',
        status: 'online',
        signal_strength: 88,
        battery: null,
        ip_address: '192.168.1.105',
        mac_address: 'AA:BB:CC:DD:EE:05',
        firmware_version: '2.1.3',
        last_seen: new Date().toISOString()
      }
    ];
  };

  const addDevice = async () => {
    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDevice),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDevices([...devices, data.device]);
        setShowAddDevice(false);
        setNewDevice({ name: '', type: 'light', room: 'living_room', ip_address: '', mac_address: '' });
        toast.success('Device added successfully');
      } else {
        throw new Error('Failed to add device');
      }
    } catch (error) {
      toast.error('Error adding device');
      console.error('Error:', error);
    }
  };

  const removeDevice = async (deviceId) => {
    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDevices(devices.filter(d => d.id !== deviceId));
        toast.success('Device removed successfully');
      } else {
        throw new Error('Failed to remove device');
      }
    } catch (error) {
      toast.error('Error removing device');
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    return status === 'online' ? 'text-green-500' : 'text-red-500';
  };

  const getStatusBg = (status) => {
    return status === 'online' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20';
  };

  const getRoomDisplayName = (room) => {
    return room.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getSignalStrengthColor = (strength) => {
    if (strength >= 80) return 'text-green-500';
    if (strength >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0a0a0f]">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Device Management</h1>
          <p className="text-gray-600 dark:text-[#e5e7eb] mt-2">
            Manage and monitor your smart lighting devices
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddDevice(!showAddDevice)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-2xl hover:from-indigo-600 hover:to-blue-600 flex items-center space-x-2 shadow-xl"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Device</span>
        </motion.button>
      </div>

      {/* Add Device Form */}
      {showAddDevice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Device</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Device Name
              </label>
              <input
                type="text"
                value={newDevice.name}
                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
                placeholder="e.g., Living Room Light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room
              </label>
              <select
                value={newDevice.room}
                onChange={(e) => setNewDevice({ ...newDevice, room: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
              >
                <option value="living_room">Living Room</option>
                <option value="kitchen">Kitchen</option>
                <option value="bedroom">Bedroom</option>
                <option value="bathroom">Bathroom</option>
                <option value="office">Office</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                IP Address
              </label>
              <input
                type="text"
                value={newDevice.ip_address}
                onChange={(e) => setNewDevice({ ...newDevice, ip_address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
                placeholder="192.168.1.XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                MAC Address
              </label>
              <input
                type="text"
                value={newDevice.mac_address}
                onChange={(e) => setNewDevice({ ...newDevice, mac_address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
                placeholder="AA:BB:CC:DD:EE:FF"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowAddDevice(false)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xl"
            >
              Cancel
            </button>
            <button
              onClick={addDevice}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-2xl text-sm font-medium hover:from-indigo-600 hover:to-blue-600 shadow-xl"
            >
              Add Device
            </button>
          </div>
        </motion.div>
      )}

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device, index) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6"
          >
            {/* Device Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-2xl ${device.status === 'online' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <LightBulbIcon className={`w-6 h-6 ${device.status === 'online' ? 'text-indigo-500' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{device.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getRoomDisplayName(device.room)}</p>
                </div>
              </div>
              <button
                onClick={() => removeDevice(device.id)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Status */}
            <div className={`flex items-center space-x-2 mb-4 p-3 rounded-2xl ${getStatusBg(device.status)}`}>
              {device.status === 'online' ? (
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              ) : (
                <XCircleIcon className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${getStatusColor(device.status)}`}>
                {device.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Device Info */}
            <div className="space-y-3">
              {/* Signal Strength */}
              {device.signal_strength > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <WifiIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Signal Strength</span>
                  </div>
                  <span className={`text-sm font-semibold ${getSignalStrengthColor(device.signal_strength)}`}>
                    {device.signal_strength}%
                  </span>
                </div>
              )}

              {/* IP Address */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SignalIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">IP Address</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{device.ip_address}</span>
              </div>

              {/* MAC Address */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DevicePhoneMobileIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">MAC Address</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                  {device.mac_address}
                </span>
              </div>

              {/* Firmware Version */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CogIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Firmware</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  v{device.firmware_version}
                </span>
              </div>

              {/* Last Seen */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last seen: {new Date(device.last_seen).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Warning for Offline Device */}
            {device.status === 'offline' && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  Device is offline. Check connection.
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Device Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Total Devices</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{devices.length}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Online</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {devices.filter(d => d.status === 'online').length}
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Offline</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {devices.filter(d => d.status === 'offline').length}
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Avg Signal</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(devices.filter(d => d.signal_strength > 0).reduce((sum, d) => sum + d.signal_strength, 0) / devices.filter(d => d.signal_strength > 0).length) || 0}%
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeviceManagement;

