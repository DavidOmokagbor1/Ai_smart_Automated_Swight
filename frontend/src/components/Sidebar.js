import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  LightBulbIcon, 
  ClockIcon, 
  UserIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  MoonIcon,
  SunIcon,
  CogIcon,
  CloudIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ user, onLogout, darkMode, setDarkMode }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Light Control', href: '/lights', icon: LightBulbIcon },
    { name: 'Scheduling', href: '/scheduling', icon: ClockIcon },
    { name: 'Weather', href: '/weather', icon: CloudIcon },
    { name: 'Statistics', href: '/statistics', icon: ChartBarIcon },
    { name: 'Activity Logs', href: '/activity', icon: ChartBarIcon },
    { name: 'Device Management', href: '/devices', icon: DevicePhoneMobileIcon },
    { name: 'Security', href: '/security', icon: ShieldCheckIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
  };

  return (
    <div className={darkMode ? "flex flex-col w-64 bg-gray-900 shadow-lg" : "flex flex-col w-64 bg-white shadow-lg"}>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex items-center">
          <LightBulbIcon className="h-8 w-8 text-white" />
          <span className="ml-2 text-xl font-bold text-white">Smart Home</span>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user.username || user.name || 'User'}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {user.role || 'Home Owner'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                  : darkMode 
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Dark Mode Toggle */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span className={darkMode ? "text-gray-200 text-sm" : "text-gray-700 text-sm"}>Night Mode</span>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={darkMode ? "bg-gray-800 p-2 rounded-full" : "bg-gray-200 p-2 rounded-full"}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <SunIcon className="h-5 w-5 text-yellow-400" /> : <MoonIcon className="h-5 w-5 text-gray-700" />}
        </button>
      </div>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              darkMode 
              ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <ArrowRightOnRectangleIcon className={`mr-3 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400 group-hover:text-gray-500'}`} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 