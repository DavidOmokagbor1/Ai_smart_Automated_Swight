import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  UserIcon, 
  LightBulbIcon, 
  CogIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
// import toast from 'react-hot-toast'; // Unused
import io from 'socket.io-client';
import { API_URL, SOCKET_URL } from '../config';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  const actionIcons = {
    'light_control': <LightBulbIcon className="h-4 w-4 text-yellow-500" />,
    'light_toggle': <LightBulbIcon className="h-4 w-4 text-green-500" />,
    'brightness_adjust': <LightBulbIcon className="h-4 w-4 text-blue-500" />,
    'color_temperature_change': <LightBulbIcon className="h-4 w-4 text-purple-500" />,
    'bulk_light_control': <LightBulbIcon className="h-4 w-4 text-orange-500" />,
    'ai_mode_toggle': <SparklesIcon className="h-4 w-4 text-indigo-500" />,
    'user_login': <UserIcon className="h-4 w-4 text-indigo-500" />,
    'user_logout': <UserIcon className="h-4 w-4 text-gray-500" />,
    'profile_updated': <CogIcon className="h-4 w-4 text-purple-500" />,
    'schedule_updated': <ClockIcon className="h-4 w-4 text-orange-500" />
  };

  const actionLabels = {
    'light_control': 'Light Control',
    'light_toggle': 'Light Toggle',
    'brightness_adjust': 'Brightness Adjust',
    'color_temperature_change': 'Color Temperature',
    'bulk_light_control': 'Bulk Control',
    'ai_mode_toggle': 'AI Mode Toggle',
    'user_login': 'User Login',
    'user_logout': 'User Logout',
    'profile_updated': 'Profile Updated',
    'schedule_updated': 'Schedule Updated'
  };



  // Real-time updates
  useEffect(() => {
    const handleActivityLogged = (newLog) => {
      setLogs(prevLogs => [newLog, ...prevLogs]);
    };

    // Listen for real-time activity updates
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });
    
    socket.on('activity_logged', handleActivityLogged);

    return () => {
      socket.off('activity_logged', handleActivityLogged);
      socket.disconnect();
    };
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/activity/logs?page=${currentPage}&per_page=20`;
      if (filter) url += `&search=${filter}`;
      if (selectedAction) url += `&action=${selectedAction}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs);
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter, selectedAction]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getActionColor = (action) => {
    const colors = {
      'light_control': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      'light_toggle': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'brightness_adjust': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      'color_temperature_change': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'bulk_light_control': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      'ai_mode_toggle': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
      'user_login': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
      'user_logout': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      'profile_updated': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'schedule_updated': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
    };
    return colors[action] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  };

  const renderDetails = (details) => {
    if (!details || Object.keys(details).length === 0) {
      return <span className="text-gray-500 dark:text-gray-400 text-sm">No details</span>;
    }

    // Handle string details
    if (typeof details === 'string') {
      return <span className="text-sm text-gray-600 dark:text-gray-400">{details}</span>;
    }

    // Handle object details with better formatting
    return (
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        {Object.entries(details).map(([key, value]) => {
          // Format key names for better readability
          const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          // Format values based on type
          let formattedValue = value;
          if (typeof value === 'boolean') {
            formattedValue = value ? 'Yes' : 'No';
          } else if (typeof value === 'number') {
            if (key.includes('brightness')) {
              formattedValue = `${value}%`;
            } else if (key.includes('percentage') || key.includes('probability')) {
              formattedValue = `${value}%`;
            } else {
              formattedValue = value.toString();
            }
          } else if (Array.isArray(value)) {
            formattedValue = value.join(', ');
          } else if (typeof value === 'object' && value !== null) {
            formattedValue = JSON.stringify(value);
          }
          
          return (
            <div key={key} className="flex justify-between items-start">
              <span className="font-medium text-gray-700 dark:text-gray-300">{formattedKey}:</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">{String(formattedValue)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0a0a0f]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
        <p className="text-gray-600 dark:text-[#e5e7eb] mt-2">
          Track all system activities and user actions in real-time
        </p>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search logs..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
              >
                <option value="">All Actions</option>
                {Object.entries(actionLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No activity logs</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No activity has been recorded yet.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#353a45] divide-y divide-gray-200 dark:divide-gray-600">
                {logs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {actionIcons[log.action] || <CogIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
                        </div>
                        <div className="ml-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {actionLabels[log.action] || log.action}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {log.room ? log.room.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                      {renderDetails(log.details)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 font-mono">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatTimestamp(log.timestamp)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                >
                  Previous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                >
                  Next
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ActivityLog; 