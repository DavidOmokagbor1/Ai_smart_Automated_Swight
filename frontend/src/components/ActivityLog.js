import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClockIcon, 
  UserIcon, 
  LightBulbIcon, 
  CogIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import io from 'socket.io-client';

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
    const socket = io('http://localhost:5000', {
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
      let url = `/api/activity/logs?page=${currentPage}&per_page=20`;
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
      'light_control': 'bg-yellow-100 text-yellow-800',
      'light_toggle': 'bg-green-100 text-green-800',
      'brightness_adjust': 'bg-blue-100 text-blue-800',
      'color_temperature_change': 'bg-purple-100 text-purple-800',
      'bulk_light_control': 'bg-orange-100 text-orange-800',
      'ai_mode_toggle': 'bg-indigo-100 text-indigo-800',
      'user_login': 'bg-indigo-100 text-indigo-800',
      'user_logout': 'bg-gray-100 text-gray-800',
      'profile_updated': 'bg-purple-100 text-purple-800',
      'schedule_updated': 'bg-orange-100 text-orange-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const renderDetails = (details) => {
    if (!details || Object.keys(details).length === 0) {
      return <span className="text-gray-500 text-sm">No details</span>;
    }

    // Handle string details
    if (typeof details === 'string') {
      return <span className="text-sm text-gray-600">{details}</span>;
    }

    // Handle object details with better formatting
    return (
      <div className="text-sm text-gray-600 space-y-1">
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
              <span className="font-medium text-gray-700">{formattedKey}:</span>
              <span className="text-gray-600 ml-2">{String(formattedValue)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
              <p className="text-indigo-100">Track all system activities and user actions</p>
            </div>
            <ClockIcon className="h-8 w-8 text-white opacity-80" />
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FunnelIcon className="h-4 w-4 text-gray-400 mr-2" />
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Actions</option>
                  {Object.entries(actionLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activity logs</h3>
              <p className="mt-1 text-sm text-gray-500">No activity has been recorded yet.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {actionIcons[log.action] || <CogIcon className="h-4 w-4 text-gray-500" />}
                        </div>
                        <div className="ml-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {actionLabels[log.action] || log.action}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.room || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {renderDetails(log.details)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.ip_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog; 