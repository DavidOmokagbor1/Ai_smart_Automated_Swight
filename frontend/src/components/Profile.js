import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  CogIcon, 
  LightBulbIcon, 
  ClockIcon, 
  BoltIcon, 
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Profile = ({ user, onUpdateProfile }) => {
  const [preferences, setPreferences] = useState(user?.preferences || {});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/profile', {
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
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        onUpdateProfile({ ...user, preferences });
      } else {
        setMessage(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No user data</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-white">{user.username}</h1>
              <p className="text-indigo-100">{user.email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Preferences Sections */}
          <div className="space-y-6">
            {/* Light Preferences */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Light Preferences</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Brightness
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.light_preferences?.default_brightness || 80}
                    onChange={(e) => handlePreferenceChange('light_preferences', 'default_brightness', parseInt(e.target.value))}
                    disabled={!isEditing}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>{preferences.light_preferences?.default_brightness || 80}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Temperature
                  </label>
                  <select
                    value={preferences.light_preferences?.favorite_color_temperature || 'warm'}
                    onChange={(e) => handlePreferenceChange('light_preferences', 'favorite_color_temperature', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="warm">Warm</option>
                    <option value="neutral">Neutral</option>
                    <option value="cool">Cool</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto_dim"
                    checked={preferences.light_preferences?.auto_dim_enabled || false}
                    onChange={(e) => handlePreferenceChange('light_preferences', 'auto_dim_enabled', e.target.checked)}
                    disabled={!isEditing}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto_dim" className="ml-2 block text-sm text-gray-900">
                    Auto-dim enabled
                  </label>
                </div>
              </div>
            </div>

            {/* Schedule Preferences */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Schedule Preferences</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wake Up Time
                  </label>
                  <input
                    type="time"
                    value={preferences.schedule_preferences?.wake_up_time || '07:00'}
                    onChange={(e) => handlePreferenceChange('schedule_preferences', 'wake_up_time', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bed Time
                  </label>
                  <input
                    type="time"
                    value={preferences.schedule_preferences?.bed_time || '22:00'}
                    onChange={(e) => handlePreferenceChange('schedule_preferences', 'bed_time', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Start
                  </label>
                  <input
                    type="time"
                    value={preferences.schedule_preferences?.work_start || '09:00'}
                    onChange={(e) => handlePreferenceChange('schedule_preferences', 'work_start', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work End
                  </label>
                  <input
                    type="time"
                    value={preferences.schedule_preferences?.work_end || '17:00'}
                    onChange={(e) => handlePreferenceChange('schedule_preferences', 'work_end', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Energy Preferences */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BoltIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Energy Preferences</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="energy_saving"
                    checked={preferences.energy_preferences?.energy_saving_mode || false}
                    onChange={(e) => handlePreferenceChange('energy_preferences', 'energy_saving_mode', e.target.checked)}
                    disabled={!isEditing}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="energy_saving" className="ml-2 block text-sm text-gray-900">
                    Energy saving mode
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Daily Consumption (kWh)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={preferences.energy_preferences?.max_daily_consumption || 10}
                    onChange={(e) => handlePreferenceChange('energy_preferences', 'max_daily_consumption', parseInt(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={preferences.energy_preferences?.notifications_enabled || false}
                    onChange={(e) => handlePreferenceChange('energy_preferences', 'notifications_enabled', e.target.checked)}
                    disabled={!isEditing}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                    Energy notifications
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-2 inline" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                  ) : (
                    <CheckIcon className="h-4 w-4 mr-2 inline" />
                  )}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CogIcon className="h-4 w-4 mr-2 inline" />
                Edit Preferences
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 