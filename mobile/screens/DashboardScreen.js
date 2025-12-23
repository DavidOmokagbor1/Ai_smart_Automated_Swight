import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL, SOCKET_URL } from '../config';
import io from 'socket.io-client';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [energyData, setEnergyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [socket, setSocket] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Initialize socket connection with React Native compatible settings
    let newSocket;
    
    try {
      newSocket = io(SOCKET_URL, {
        transports: ['polling', 'websocket'], // Try polling first (more reliable on mobile)
        timeout: 20000,
        forceNew: false, // Allow connection reuse
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        autoConnect: true,
        // React Native specific options
        jsonp: false,
        // Add path if needed
        path: '/socket.io/',
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('✅ Socket.IO connected successfully');
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log('❌ Socket.IO disconnected:', reason);
        // Don't show error for normal disconnects
        if (reason !== 'io client disconnect') {
          setConnectionError(null); // Will be handled by API connection
        }
      });

      newSocket.on('connect_error', (error) => {
        console.log('⚠️ Socket.IO connection error:', error.message);
        setIsConnected(false);
        // Don't show error banner - API connection is more important
        // WebSocket is optional for real-time updates
      });

      newSocket.on('reconnect_attempt', () => {
        console.log('🔄 Attempting to reconnect Socket.IO...');
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('✅ Socket.IO reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on('reconnect_error', (error) => {
        console.log('⚠️ Socket.IO reconnection error:', error.message);
      });

      newSocket.on('reconnect_failed', () => {
        console.log('❌ Socket.IO reconnection failed - will keep trying');
      });

      newSocket.on('light_update', (data) => {
        console.log('💡 Light update received:', data);
        setSystemStatus(prev => ({
          ...prev,
          lights: {
            ...prev.lights,
            [data.room]: data.state
          }
        }));
      });

      newSocket.on('ai_mode_update', (data) => {
        console.log('🤖 AI mode update:', data);
        setAiModeEnabled(data.enabled);
      });

      newSocket.on('weather_update', (data) => {
        console.log('🌤️ Weather update received');
      });

    } catch (error) {
      console.error('❌ Failed to initialize Socket.IO:', error);
      // Continue without WebSocket - app will work with polling
    }

    // Initial fetch
    fetchSystemStatus();
    fetchAiStatus();
    
    // Polling interval - check API connection every 5 seconds
    const interval = setInterval(() => {
      fetchSystemStatus();
    }, 5000);

    return () => {
      clearInterval(interval);
      if (newSocket) {
        newSocket.disconnect();
        newSocket.close();
      }
    };
  }, []);

  const fetchSystemStatus = async () => {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const response = await Promise.race([
        fetch(`${API_URL}/api/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        timeoutPromise,
      ]);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSystemStatus(data);
      setEnergyData(data.energy);
      setApiConnected(true);
      setConnectionError(null);
    } catch (error) {
      console.error('Error fetching status:', error);
      setApiConnected(false);
      setConnectionError(error.message || 'Failed to connect to server');
      
      // Set default data if connection fails
      if (!systemStatus) {
        setSystemStatus({
          lights: {
            living_room: { status: 'off', brightness: 0 },
            kitchen: { status: 'off', brightness: 0 },
            bedroom: { status: 'off', brightness: 0 },
            bathroom: { status: 'off', brightness: 0 },
            office: { status: 'off', brightness: 0 },
          },
          energy: {
            daily_consumption: 0,
            cost_saved: 0,
            usage_history: [],
          },
        });
        setEnergyData({
          daily_consumption: 0,
          cost_saved: 0,
          usage_history: [],
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAiStatus = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 5000) // Shorter timeout
      );
      
      const response = await Promise.race([
        fetch(`${API_URL}/api/ai/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        timeoutPromise,
      ]);
      
      if (response.ok) {
        const data = await response.json();
        setAiModeEnabled(data.ai_mode_enabled || false);
      } else {
        setAiModeEnabled(false);
      }
    } catch (error) {
      // Silently fail - don't log or show error
      // AI mode is optional feature, don't block app
      setAiModeEnabled(false);
    }
  };

  const toggleAiMode = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ai/mode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !aiModeEnabled }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setAiModeEnabled(result.ai_mode_enabled);
        setTimeout(() => {
          fetchAiStatus();
        }, 500);
      }
    } catch (error) {
      console.error('AI mode toggle error:', error);
    }
  };

  const controlAllLights = async (action, brightness = 100) => {
    try {
      const response = await fetch(`${API_URL}/api/lights/all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, brightness }),
      });
      
      if (response.ok) {
        fetchSystemStatus();
      }
    } catch (error) {
      console.error('Error controlling all lights:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSystemStatus();
    fetchAiStatus();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading system status...</Text>
      </View>
    );
  }

  const lights = systemStatus?.lights || {};
  const rooms = Object.keys(lights);
  const activeLights = rooms.filter(room => lights[room]?.status === 'on').length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Smart Light Control</Text>
        <Text style={styles.headerSubtitle}>
          Intelligent lighting system saving energy and reducing costs
        </Text>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, (apiConnected || isConnected) && styles.statusDotConnected]} />
          <Text style={styles.statusText}>
            {(apiConnected || isConnected) ? 'System Connected' : 'System Disconnected'}
          </Text>
        </View>
        {connectionError && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{connectionError}</Text>
            <Text style={styles.errorSubtext}>Trying to reconnect...</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={[styles.quickActionButton, styles.primaryButton]}
          onPress={() => controlAllLights('on')}
        >
          <Ionicons name="sunny" size={20} color="#FFFFFF" />
          <Text style={styles.quickActionText}>Turn All On</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickActionButton, styles.secondaryButton]}
          onPress={() => controlAllLights('off')}
        >
          <Ionicons name="moon" size={20} color="#FFFFFF" />
          <Text style={styles.quickActionText}>Turn All Off</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickActionButton, styles.dimButton]}
          onPress={() => controlAllLights('dim', 50)}
        >
          <Ionicons name="bulb" size={20} color="#FFFFFF" />
          <Text style={styles.quickActionText}>Dim All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickActionButton, aiModeEnabled ? styles.aiButtonActive : styles.aiButton]}
          onPress={toggleAiMode}
        >
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          <Text style={styles.quickActionText}>
            {aiModeEnabled ? 'AI ON' : 'AI Mode'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Room Status Grid - Clean and Focused */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Room Status</Text>
          <Text style={styles.sectionSubtitle}>{activeLights} of {rooms.length} lights active</Text>
        </View>
        <View style={styles.roomGrid}>
          {rooms.map((room) => {
            const light = lights[room];
            const isOn = light?.status === 'on';
            const brightness = light?.brightness || 0;
            
            return (
              <View key={room} style={[styles.roomCard, isOn && styles.roomCardActive]}>
                <View style={styles.roomHeader}>
                  <View style={styles.roomHeaderLeft}>
                    <View style={[styles.roomIconContainer, isOn && styles.roomIconContainerActive]}>
                      <Ionicons 
                        name={isOn ? 'bulb' : 'bulb-outline'} 
                        size={24} 
                        color={isOn ? '#FCD34D' : '#6B7280'} 
                      />
                    </View>
                    <View>
                      <Text style={styles.roomName}>
                        {room.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                      <Text style={styles.roomStatusText}>
                        {isOn ? 'ON' : 'OFF'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusIndicator, isOn && styles.statusIndicatorOn]} />
                </View>
                
                {isOn && (
                  <View style={styles.roomDetails}>
                    <View style={styles.brightnessInfo}>
                      <Text style={styles.brightnessLabel}>Brightness</Text>
                      <Text style={styles.brightnessValue}>{brightness}%</Text>
                    </View>
                    <View style={styles.brightnessBar}>
                      <View 
                        style={[
                          styles.brightnessFill,
                          { width: `${brightness}%` }
                        ]} 
                      />
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fafafa',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#a3a3a3',
    marginBottom: 16,
    lineHeight: 20,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  statusDotConnected: {
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
    flex: 1,
  },
  errorSubtext: {
    fontSize: 10,
    color: '#6B7280',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
  },
  secondaryButton: {
    backgroundColor: '#2d3340',
  },
  dimButton: {
    backgroundColor: '#f59e0b',
  },
  aiButton: {
    backgroundColor: '#2d3340',
  },
  aiButtonActive: {
    backgroundColor: '#10b981',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  roomGrid: {
    gap: 12,
  },
  roomCard: {
    backgroundColor: '#111118',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  roomCardActive: {
    borderColor: 'rgba(99, 102, 241, 0.3)',
    backgroundColor: '#111118',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  roomIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomIconContainerActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  roomName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fafafa',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B7280',
  },
  statusIndicatorOn: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  roomDetails: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  brightnessInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brightnessLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  brightnessValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366f1',
  },
  roomStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  brightnessBar: {
    height: 6,
    backgroundColor: '#2d3340',
    borderRadius: 3,
    overflow: 'hidden',
  },
  brightnessFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#6366f1',
  },
});

export default DashboardScreen;




