import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  SunIcon,
  PlayIcon,
  ShieldCheckIcon,
  ClockIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const Scheduling = () => {
  const [schedules, setSchedules] = useState({});
  const [selectedRoom, setSelectedRoom] = useState('living_room');
  const [selectedDay, setSelectedDay] = useState('monday');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState(null);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Schedule templates for quick setup
  const scheduleTemplates = {
    'workday': {
      name: 'Workday Schedule',
      description: 'Standard 9-5 work schedule',
      schedule: {
        'monday': [{'time': '07:00', 'action': 'on', 'brightness': 80}, {'time': '18:00', 'action': 'off'}],
        'tuesday': [{'time': '07:00', 'action': 'on', 'brightness': 80}, {'time': '18:00', 'action': 'off'}],
        'wednesday': [{'time': '07:00', 'action': 'on', 'brightness': 80}, {'time': '18:00', 'action': 'off'}],
        'thursday': [{'time': '07:00', 'action': 'on', 'brightness': 80}, {'time': '18:00', 'action': 'off'}],
        'friday': [{'time': '07:00', 'action': 'on', 'brightness': 80}, {'time': '18:00', 'action': 'off'}],
        'saturday': [{'time': '09:00', 'action': 'on', 'brightness': 60}, {'time': '22:00', 'action': 'off'}],
        'sunday': [{'time': '09:00', 'action': 'on', 'brightness': 60}, {'time': '22:00', 'action': 'off'}]
      }
    },
    'weekend': {
      name: 'Weekend Schedule',
      description: 'Relaxed weekend lighting',
      schedule: {
        'monday': [{'time': '08:00', 'action': 'on', 'brightness': 60}, {'time': '22:00', 'action': 'off'}],
        'tuesday': [{'time': '08:00', 'action': 'on', 'brightness': 60}, {'time': '22:00', 'action': 'off'}],
        'wednesday': [{'time': '08:00', 'action': 'on', 'brightness': 60}, {'time': '22:00', 'action': 'off'}],
        'thursday': [{'time': '08:00', 'action': 'on', 'brightness': 60}, {'time': '22:00', 'action': 'off'}],
        'friday': [{'time': '08:00', 'action': 'on', 'brightness': 60}, {'time': '22:00', 'action': 'off'}],
        'saturday': [{'time': '10:00', 'action': 'on', 'brightness': 40}, {'time': '23:00', 'action': 'off'}],
        'sunday': [{'time': '10:00', 'action': 'on', 'brightness': 40}, {'time': '23:00', 'action': 'off'}]
      }
    },
    'energy_saver': {
      name: 'Energy Saver',
      description: 'Minimal lighting for energy efficiency',
      schedule: {
        'monday': [{'time': '06:30', 'action': 'on', 'brightness': 50}, {'time': '21:00', 'action': 'off'}],
        'tuesday': [{'time': '06:30', 'action': 'on', 'brightness': 50}, {'time': '21:00', 'action': 'off'}],
        'wednesday': [{'time': '06:30', 'action': 'on', 'brightness': 50}, {'time': '21:00', 'action': 'off'}],
        'thursday': [{'time': '06:30', 'action': 'on', 'brightness': 50}, {'time': '21:00', 'action': 'off'}],
        'friday': [{'time': '06:30', 'action': 'on', 'brightness': 50}, {'time': '21:00', 'action': 'off'}],
        'saturday': [{'time': '08:00', 'action': 'on', 'brightness': 30}, {'time': '20:00', 'action': 'off'}],
        'sunday': [{'time': '08:00', 'action': 'on', 'brightness': 50}, {'time': '20:00', 'action': 'off'}]
      }
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchScheduleStatus();
    
    // Set up interval to fetch schedule status every 30 seconds
    const interval = setInterval(fetchScheduleStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/schedules`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
      // Set default schedules if API fails
      setSchedules({
        'living_room': {
          'enabled': true,
          'vacation_mode': false,
          'sunrise_sunset': true,
          'daily_schedule': {}
        },
        'kitchen': {
          'enabled': false,
          'vacation_mode': false,
          'sunrise_sunset': false,
          'daily_schedule': {}
        },
        'bedroom': {
          'enabled': false,
          'vacation_mode': false,
          'sunrise_sunset': false,
          'daily_schedule': {}
        },
        'bathroom': {
          'enabled': false,
          'vacation_mode': false,
          'sunrise_sunset': false,
          'daily_schedule': {}
        },
        'office': {
          'enabled': false,
          'vacation_mode': false,
          'sunrise_sunset': false,
          'daily_schedule': {}
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/schedules/status`);
      if (response.ok) {
        const data = await response.json();
        setScheduleStatus(data);
      }
    } catch (error) {
      console.error('Error fetching schedule status:', error);
    }
  };

  const toggleSchedule = async (room, enabled) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/schedules/${room}/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });
      
      if (response.ok) {
        setSchedules(prev => ({
          ...prev,
          [room]: { ...prev[room], enabled }
        }));
        toast.success(`Schedule ${enabled ? 'enabled' : 'disabled'} for ${getRoomDisplayName(room)}`);
      } else {
        throw new Error('Failed to update schedule');
      }
    } catch (error) {
      toast.error('Error toggling schedule');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleVacationMode = async (room, vacationMode) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/schedules/${room}/vacation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vacation_mode: vacationMode }),
      });
      
      if (response.ok) {
        setSchedules(prev => ({
          ...prev,
          [room]: { ...prev[room], vacation_mode: vacationMode }
        }));
        toast.success(`Vacation mode ${vacationMode ? 'enabled' : 'disabled'} for ${getRoomDisplayName(room)}`);
      } else {
        throw new Error('Failed to update vacation mode');
      }
    } catch (error) {
      toast.error('Error toggling vacation mode');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSunriseSunset = async (room, sunriseSunset) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/schedules/${room}/sunrise-sunset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sunrise_sunset: sunriseSunset }),
      });
      
      if (response.ok) {
        setSchedules(prev => ({
          ...prev,
          [room]: { ...prev[room], sunrise_sunset: sunriseSunset }
        }));
        toast.success(`Sunrise/sunset mode ${sunriseSunset ? 'enabled' : 'disabled'} for ${getRoomDisplayName(room)}`);
      } else {
        throw new Error('Failed to update sunrise/sunset mode');
      }
    } catch (error) {
      toast.error('Error toggling sunrise/sunset mode');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateScheduleTimes = async (room, day, times) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/schedules/${room}/times`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ day, times }),
      });
      
      if (response.ok) {
        setSchedules(prev => ({
          ...prev,
          [room]: {
            ...prev[room],
            daily_schedule: {
              ...prev[room].daily_schedule,
              [day]: times
            }
          }
        }));
        toast.success('Schedule times updated');
      } else {
        throw new Error('Failed to update schedule times');
      }
    } catch (error) {
      toast.error('Error updating schedule times');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (templateKey) => {
    const template = scheduleTemplates[templateKey];
    if (!template) return;

    const updatedSchedules = { ...schedules };
    Object.keys(schedules).forEach(room => {
      updatedSchedules[room] = {
        ...updatedSchedules[room],
        daily_schedule: template.schedule
      };
    });
    setSchedules(updatedSchedules);
    toast.success(`Applied ${template.name} to all rooms`);
    setShowTemplates(false);
  };

  const getRoomDisplayName = (room) => {
    return room.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getDayDisplayName = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const addScheduleEvent = (room, day) => {
    const currentSchedule = schedules[room]?.daily_schedule?.[day] || [];
    const newEvent = {
      time: '12:00',
      action: 'on',
      brightness: 100
    };
    
    const updatedTimes = [...currentSchedule, newEvent];
    updateScheduleTimes(room, day, updatedTimes);
  };

  const removeScheduleEvent = (room, day, index) => {
    const currentSchedule = schedules[room]?.daily_schedule?.[day] || [];
    const updatedTimes = currentSchedule.filter((_, i) => i !== index);
    updateScheduleTimes(room, day, updatedTimes);
  };

  const updateScheduleEvent = (room, day, index, field, value) => {
    const currentSchedule = schedules[room]?.daily_schedule?.[day] || [];
    const updatedTimes = currentSchedule.map((event, i) => 
      i === index ? { ...event, [field]: value } : event
    );
    updateScheduleTimes(room, day, updatedTimes);
  };

  const copyScheduleToAllDays = (room, sourceDay) => {
    const sourceSchedule = schedules[room]?.daily_schedule?.[sourceDay] || [];
    const updatedSchedules = { ...schedules };
    
    days.forEach(day => {
      if (day !== sourceDay) {
        updatedSchedules[room] = {
          ...updatedSchedules[room],
          daily_schedule: {
            ...updatedSchedules[room].daily_schedule,
            [day]: [...sourceSchedule]
          }
        };
      }
    });
    
    setSchedules(updatedSchedules);
    toast.success(`Copied ${getDayDisplayName(sourceDay)} schedule to all other days`);
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0a0a0f]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Smart Scheduling</h1>
        <p className="text-gray-600 dark:text-[#e5e7eb] mt-2">
          Set up automated lighting schedules for energy efficiency and convenience
        </p>
      </div>

      {/* Schedule Status */}
      {scheduleStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Schedule Status</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {scheduleStatus.current_time} • {scheduleStatus.current_day}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Schedules */}
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Active Schedules</h3>
              {scheduleStatus.active_schedules.length > 0 ? (
                <div className="space-y-2">
                  {scheduleStatus.active_schedules.map((room) => (
                    <div key={room} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-700">{getRoomDisplayName(room)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-600 text-sm">No active schedules</p>
              )}
            </div>
            
            {/* Next Events */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Next Events</h3>
              {scheduleStatus.next_events.length > 0 ? (
                <div className="space-y-2">
                  {scheduleStatus.next_events.slice(0, 3).map((event, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700 text-sm">{event.time}</span>
                      </div>
                      <div className="text-xs text-blue-600">
                        {getRoomDisplayName(event.room)} • {event.action === 'on' ? 'ON' : 'OFF'}
                        {event.action === 'on' && ` (${event.brightness}%)`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-600 text-sm">No upcoming events</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-300 to-blue-300 text-white rounded-2xl hover:from-indigo-400 hover:to-blue-400 transition-colors shadow-xl border border-[#444857]"
          >
            <CalendarIcon className="w-5 h-5" />
            <span>Templates</span>
          </button>
        </div>
        
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {Object.entries(scheduleTemplates).map(([key, template]) => (
              <div key={key} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
                <button
                  onClick={() => applyTemplate(key)}
                  className="w-full px-3 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-2xl hover:from-indigo-600 hover:to-blue-600 transition-colors text-sm shadow-xl"
                >
                  Apply Template
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Room Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6 mb-8"
      >
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Select Room</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {Object.keys(schedules).map((room) => (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`p-4 rounded-2xl border-2 transition-all shadow-xl font-semibold flex flex-col items-center justify-center space-y-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
                ${selectedRoom === room
                  ? 'border-indigo-400 bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg scale-105'
                  : 'border-gray-200 dark:border-[#444857] bg-white dark:bg-[#2d3340] hover:bg-gray-100 dark:hover:bg-[#363b47] text-gray-700 dark:text-gray-300'}
              `}
            >
              <div>{getRoomDisplayName(room)}</div>
              <div className={`text-xs mt-1 ${
                schedules[room]?.enabled ? 'text-green-400' : 'text-gray-500'
              }`}>
                {schedules[room]?.enabled ? 'Active' : 'Inactive'}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {selectedRoom && schedules[selectedRoom] && (
        <>
          {/* Schedule Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              {getRoomDisplayName(selectedRoom)} Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Enable/Disable Schedule */}
              <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center">
                  <PlayIcon className="w-6 h-6 text-green-400 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Schedule Active</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable automated scheduling</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedules[selectedRoom]?.enabled || false}
                    onChange={(e) => toggleSchedule(selectedRoom, e.target.checked)}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-400"></div>
                </label>
              </div>
              {/* Vacation Mode */}
              <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center">
                  <ShieldCheckIcon className="w-6 h-6 text-purple-400 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Vacation Mode</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Random patterns for security</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedules[selectedRoom]?.vacation_mode || false}
                    onChange={(e) => toggleVacationMode(selectedRoom, e.target.checked)}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-300"></div>
                </label>
              </div>
              {/* Sunrise/Sunset */}
              <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center">
                  <SunIcon className="w-6 h-6 text-orange-400 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Sunrise/Sunset</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Natural light integration</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedules[selectedRoom]?.sunrise_sunset || false}
                    onChange={(e) => toggleSunriseSunset(selectedRoom, e.target.checked)}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-300"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Daily Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#353a45] border border-gray-200 dark:border-[#444857] shadow-xl rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Daily Schedule</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => copyScheduleToAllDays(selectedRoom, selectedDay)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm shadow-xl border border-gray-200 dark:border-gray-600"
                >
                  <CogIcon className="w-4 h-4" />
                  <span>Copy to All Days</span>
                </button>
                <div className="flex space-x-2">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all shadow-xl
                        ${selectedDay === day
                          ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-indigo-400'
                          : 'bg-white dark:bg-[#2d3340] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#363b47] border border-gray-200 dark:border-[#444857]'}
                      `}
                    >
                      {getDayDisplayName(day).slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              {schedules[selectedRoom]?.daily_schedule?.[selectedDay]?.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-5 p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="time"
                      value={event.time}
                      onChange={(e) => updateScheduleEvent(selectedRoom, selectedDay, index, 'time', e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm"
                    />
                  </div>
                  
                  <select
                    value={event.action}
                    onChange={(e) => updateScheduleEvent(selectedRoom, selectedDay, index, 'action', e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm"
                  >
                    <option value="on">Turn On</option>
                    <option value="off">Turn Off</option>
                  </select>
                  
                  {event.action === 'on' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Brightness:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={event.brightness || 100}
                        onChange={(e) => updateScheduleEvent(selectedRoom, selectedDay, index, 'brightness', parseInt(e.target.value))}
                        className="w-24 accent-indigo-500"
                      />
                      <span className="text-sm text-indigo-500 dark:text-indigo-400 w-10">{event.brightness || 100}%</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeScheduleEvent(selectedRoom, selectedDay, index)}
                    className="text-red-500 hover:text-red-700 font-bold ml-auto p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
              
              <motion.button
                onClick={() => addScheduleEvent(selectedRoom, selectedDay)}
                className="w-full p-4 border-2 border-dashed border-indigo-400 dark:border-indigo-500 rounded-2xl text-indigo-500 dark:text-indigo-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all bg-white dark:bg-gray-800 font-semibold flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusIcon className="w-6 h-6" />
                <span>Add Schedule Event</span>
              </motion.button>
            </div>
            
            {saving && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span>Saving changes...</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Scheduling; 