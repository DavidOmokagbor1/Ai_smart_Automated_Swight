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
      const response = await fetch('/api/schedules');
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
      const response = await fetch('/api/schedules/status');
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
      <div className="p-8 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Smart Scheduling</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Set up automated lighting schedules for energy efficiency and convenience
        </p>
      </div>

      {/* Schedule Status */}
      {scheduleStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl mb-8 border border-slate-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-700">Schedule Status</h2>
            <div className="text-sm text-slate-500">
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
        className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl mb-8 border border-slate-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-700">Quick Actions</h2>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
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
              <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-1">{template.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                <button
                  onClick={() => applyTemplate(key)}
                  className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
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
        className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl mb-10 border border-slate-200"
      >
        <h2 className="text-2xl font-bold mb-6 text-slate-700">Select Room</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {Object.keys(schedules).map((room) => (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`p-5 rounded-2xl border-2 transition-all shadow-md font-semibold text-lg flex flex-col items-center justify-center space-y-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
                ${selectedRoom === room
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-900 shadow-lg scale-105'
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'}
              `}
            >
              <div>{getRoomDisplayName(room)}</div>
              <div className={`text-xs mt-1 ${
                schedules[room]?.enabled ? 'text-green-500' : 'text-slate-400'
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
            className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl mb-10 border border-slate-200"
          >
            <h2 className="text-2xl font-bold mb-6 text-slate-700">
              {getRoomDisplayName(selectedRoom)} Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Enable/Disable Schedule */}
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl shadow border border-slate-100">
                <div className="flex items-center">
                  <PlayIcon className="w-6 h-6 text-green-400 mr-3" />
                  <div>
                    <h3 className="font-semibold">Schedule Active</h3>
                    <p className="text-sm text-slate-500">Enable automated scheduling</p>
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
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl shadow border border-slate-100">
                <div className="flex items-center">
                  <ShieldCheckIcon className="w-6 h-6 text-purple-300 mr-3" />
                  <div>
                    <h3 className="font-semibold">Vacation Mode</h3>
                    <p className="text-sm text-slate-500">Random patterns for security</p>
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
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl shadow border border-slate-100">
                <div className="flex items-center">
                  <SunIcon className="w-6 h-6 text-orange-300 mr-3" />
                  <div>
                    <h3 className="font-semibold">Sunrise/Sunset</h3>
                    <p className="text-sm text-slate-500">Natural light integration</p>
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
            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-slate-200"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-700">Daily Schedule</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => copyScheduleToAllDays(selectedRoom, selectedDay)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                >
                  <CogIcon className="w-4 h-4" />
                  <span>Copy to All Days</span>
                </button>
                <div className="flex space-x-2">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-1 rounded-lg text-base font-medium transition-all
                        ${selectedDay === day
                          ? 'bg-indigo-200 text-indigo-900 shadow'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}
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
                  className="flex items-center space-x-5 p-5 bg-slate-50 rounded-2xl shadow border border-slate-100"
                >
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-slate-400" />
                    <input
                      type="time"
                      value={event.time}
                      onChange={(e) => updateScheduleEvent(selectedRoom, selectedDay, index, 'time', e.target.value)}
                      className="border border-slate-300 rounded px-4 py-2 bg-white text-slate-800 shadow-sm"
                    />
                  </div>
                  
                  <select
                    value={event.action}
                    onChange={(e) => updateScheduleEvent(selectedRoom, selectedDay, index, 'action', e.target.value)}
                    className="border border-slate-300 rounded px-4 py-2 bg-white text-slate-800 shadow-sm"
                  >
                    <option value="on">Turn On</option>
                    <option value="off">Turn Off</option>
                  </select>
                  
                  {event.action === 'on' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-500">Brightness:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={event.brightness || 100}
                        onChange={(e) => updateScheduleEvent(selectedRoom, selectedDay, index, 'brightness', parseInt(e.target.value))}
                        className="w-24 accent-indigo-400"
                      />
                      <span className="text-sm text-indigo-600 w-10">{event.brightness || 100}%</span>
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
                className="w-full p-5 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-400 hover:border-indigo-400 hover:text-indigo-700 transition-all bg-white font-semibold text-lg flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusIcon className="w-6 h-6" />
                <span>Add Schedule Event</span>
              </motion.button>
            </div>
            
            {saving && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 text-slate-600">
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