import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  CogIcon, 
  LightBulbIcon, 
  ClockIcon, 
  BoltIcon, 
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

const Profile = ({ user, onUpdateProfile }) => {
  const [preferences, setPreferences] = useState(user?.preferences || {});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: preferences
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        if (onUpdateProfile) {
          onUpdateProfile({ ...user, preferences });
        }
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (!user) {
    return (
      <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No user data</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0a0a0f]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Profile</h1>
        <p className="text-gray-600 dark:text-[#e5e7eb] mt-2">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="h-20 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl">
              <UserIcon className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username || 'Guest User'}</h2>
            <div className="flex items-center space-x-4 mt-2">
              {user.email && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <IdentificationIcon className="w-4 h-4 text-indigo-500" />
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  {user.role || 'Home Owner'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preferences Sections */}
      <div className="space-y-6">
        {/* Light Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6"
        >
          <div className="flex items-center mb-6">
            <LightBulbIcon className="h-6 w-6 text-yellow-500 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Light Preferences</h3>
          </div>
              
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Brightness
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={preferences.light_preferences?.default_brightness || 80}
                onChange={(e) => handlePreferenceChange('light_preferences', 'default_brightness', parseInt(e.target.value))}
                disabled={!isEditing}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0%</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{preferences.light_preferences?.default_brightness || 80}%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color Temperature
              </label>
              <select
                value={preferences.light_preferences?.favorite_color_temperature || 'warm'}
                onChange={(e) => handlePreferenceChange('light_preferences', 'favorite_color_temperature', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
              >
                <option value="warm">Warm</option>
                <option value="neutral">Neutral</option>
                <option value="cool">Cool</option>
              </select>
            </div>

            <div className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl">
              <input
                type="checkbox"
                id="auto_dim"
                checked={preferences.light_preferences?.auto_dim_enabled || false}
                onChange={(e) => handlePreferenceChange('light_preferences', 'auto_dim_enabled', e.target.checked)}
                disabled={!isEditing}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded accent-indigo-500"
              />
              <label htmlFor="auto_dim" className="ml-3 block text-sm font-medium text-gray-900 dark:text-white">
                Auto-dim enabled
              </label>
            </div>
          </div>
        </motion.div>

        {/* Schedule Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6"
        >
          <div className="flex items-center mb-6">
            <ClockIcon className="h-6 w-6 text-blue-500 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Schedule Preferences</h3>
          </div>
              
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wake Up Time
              </label>
              <input
                type="time"
                value={preferences.schedule_preferences?.wake_up_time || '07:00'}
                onChange={(e) => handlePreferenceChange('schedule_preferences', 'wake_up_time', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bed Time
              </label>
              <input
                type="time"
                value={preferences.schedule_preferences?.bed_time || '22:00'}
                onChange={(e) => handlePreferenceChange('schedule_preferences', 'bed_time', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Work Start
              </label>
              <input
                type="time"
                value={preferences.schedule_preferences?.work_start || '09:00'}
                onChange={(e) => handlePreferenceChange('schedule_preferences', 'work_start', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Work End
              </label>
              <input
                type="time"
                value={preferences.schedule_preferences?.work_end || '17:00'}
                onChange={(e) => handlePreferenceChange('schedule_preferences', 'work_end', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
              />
            </div>
          </div>
        </motion.div>

        {/* Energy Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6"
        >
          <div className="flex items-center mb-6">
            <BoltIcon className="h-6 w-6 text-yellow-500 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Energy Preferences</h3>
          </div>
              
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl">
              <input
                type="checkbox"
                id="energy_saving"
                checked={preferences.energy_preferences?.energy_saving_mode || false}
                onChange={(e) => handlePreferenceChange('energy_preferences', 'energy_saving_mode', e.target.checked)}
                disabled={!isEditing}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded accent-indigo-500"
              />
              <label htmlFor="energy_saving" className="ml-3 block text-sm font-medium text-gray-900 dark:text-white">
                Energy saving mode
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Daily Consumption (kWh)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={preferences.energy_preferences?.max_daily_consumption || 10}
                onChange={(e) => handlePreferenceChange('energy_preferences', 'max_daily_consumption', parseInt(e.target.value))}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
              />
            </div>

            <div className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl">
              <input
                type="checkbox"
                id="notifications"
                checked={preferences.energy_preferences?.notifications_enabled || false}
                onChange={(e) => handlePreferenceChange('energy_preferences', 'notifications_enabled', e.target.checked)}
                disabled={!isEditing}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded accent-indigo-500"
              />
              <label htmlFor="notifications" className="ml-3 block text-sm font-medium text-gray-900 dark:text-white">
                Energy notifications
              </label>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex justify-end space-x-3"
      >
        {isEditing ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-xl"
            >
              <XMarkIcon className="h-5 w-5 mr-2 inline" />
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-3 border border-transparent rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 shadow-xl"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
              ) : (
                <CheckIcon className="h-5 w-5 mr-2 inline" />
              )}
              Save Changes
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 border border-transparent rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-xl"
          >
            <CogIcon className="h-5 w-5 mr-2 inline" />
            Edit Preferences
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default Profile; 