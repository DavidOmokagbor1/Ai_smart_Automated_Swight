import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  LockClosedIcon,
  KeyIcon,
  EyeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CameraIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Security = () => {
  const [securitySettings, setSecuritySettings] = useState({
    vacationMode: false,
    motionDetection: true,
    autoLock: true,
    notifications: true,
    twoFactor: false
  });
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecuritySettings();
    fetchSecurityLogs();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/settings');
      if (response.ok) {
        const data = await response.json();
        setSecuritySettings(data);
      }
    } catch (error) {
      console.error('Error fetching security settings:', error);
      toast.error('Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityLogs = async () => {
    try {
      const response = await fetch('/api/security/logs');
      if (response.ok) {
        const data = await response.json();
        setSecurityLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching security logs:', error);
    }
  };

  const toggleSetting = async (setting) => {
    try {
      const newValue = !securitySettings[setting];
      const response = await fetch('/api/security/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [setting]: newValue }),
      });
      
      if (response.ok) {
        setSecuritySettings(prev => ({
          ...prev,
          [setting]: newValue
        }));
        toast.success(`${setting} ${newValue ? 'enabled' : 'disabled'}`);
      } else {
        throw new Error('Failed to update setting');
      }
    } catch (error) {
      toast.error('Error updating security setting');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading security settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0a0a0f]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security & Privacy</h1>
        <p className="text-gray-600 dark:text-[#e5e7eb] mt-2">
          Manage your home security settings and monitor activity
        </p>
      </div>

      {/* Security Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Status</h2>
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-6 h-6 text-green-500" />
            <span className="text-green-500 font-semibold">All Systems Active</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">System Secure</p>
                <p className="text-xs text-green-600 dark:text-green-400">No threats detected</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <CameraIcon className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Motion Sensors</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {securitySettings.motionDetection ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3">
              <LockClosedIcon className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Auto Lock</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {securitySettings.autoLock ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6 mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h2>
        
        <div className="space-y-4">
          {/* Vacation Mode */}
          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Vacation Mode</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Random light patterns to simulate presence</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.vacationMode}
                onChange={() => toggleSetting('vacationMode')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-400"></div>
            </label>
          </div>

          {/* Motion Detection */}
          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <EyeIcon className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Motion Detection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatically detect movement in rooms</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.motionDetection}
                onChange={() => toggleSetting('motionDetection')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-400"></div>
            </label>
          </div>

          {/* Auto Lock */}
          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <LockClosedIcon className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Auto Lock</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatically secure system when away</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.autoLock}
                onChange={() => toggleSetting('autoLock')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-400"></div>
            </label>
          </div>

          {/* Security Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <BellAlertIcon className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Security Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive alerts for security events</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.notifications}
                onChange={() => toggleSetting('notifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
            </label>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <KeyIcon className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add extra layer of security to login</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.twoFactor}
                onChange={() => toggleSetting('twoFactor')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-400"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Security Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Security Activity</h2>
        
        <div className="space-y-3">
          {securityLogs.length > 0 ? (
            securityLogs.slice(0, 10).map((log, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
              >
                <div className={`p-2 rounded-full ${
                  log.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
                  log.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' : 
                  'bg-green-100 dark:bg-green-900/30'
                }`}>
                  {log.type === 'warning' ? (
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  ) : log.type === 'error' ? (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{log.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">{log.timestamp}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No security events recorded</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your system is secure</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Security;

