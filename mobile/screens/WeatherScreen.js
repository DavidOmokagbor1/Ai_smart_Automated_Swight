import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL, SOCKET_URL } from '../config';
import io from 'socket.io-client';

const WeatherScreen = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [weatherImpact, setWeatherImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoWeatherMode, setAutoWeatherMode] = useState(true);

  useEffect(() => {
    fetchWeatherData();
    fetchWeatherImpact();
    
    // Listen for real-time weather updates (optional - graceful degradation)
    let socket;
    try {
      socket = io(SOCKET_URL, {
        transports: ['polling', 'websocket'], // Polling first for mobile
        timeout: 20000,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
        path: '/socket.io/',
      });
      
      socket.on('connect', () => {
        console.log('✅ Weather Socket.IO connected');
      });
      
      socket.on('connect_error', (error) => {
        console.log('⚠️ Weather Socket.IO error:', error.message);
        // Continue without WebSocket - polling will work
      });
      
      socket.on('weather_update', (data) => {
        console.log('🌤️ Weather update received via WebSocket');
        if (data && data.weather) {
          setWeatherData(data);
        }
      });
    } catch (error) {
      console.error('❌ Failed to initialize Weather Socket.IO:', error);
      // Continue without WebSocket
    }

    const interval = setInterval(() => {
      fetchWeatherData();
      fetchWeatherImpact();
    }, 300000); // Update every 5 minutes
    
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/weather`);
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchWeatherImpact = async () => {
    try {
      const response = await fetch(`${API_URL}/api/weather/impact`);
      const data = await response.json();
      setWeatherImpact(data);
    } catch (error) {
      console.error('Error fetching weather impact:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeatherData();
    fetchWeatherImpact();
  };

  const toggleAutoWeatherMode = async () => {
    try {
      setAutoWeatherMode(!autoWeatherMode);
      // You can add API call here if backend supports it
      // const response = await fetch(`${API_URL}/api/weather/auto-mode`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ enabled: !autoWeatherMode }),
      // });
    } catch (error) {
      console.error('Error toggling weather mode:', error);
      Alert.alert('Error', 'Failed to toggle weather mode');
    }
  };

  const applyWeatherOptimization = async () => {
    try {
      const response = await fetch(`${API_URL}/api/weather/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apply: true }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Weather optimization applied to all lights');
        fetchWeatherImpact(); // Refresh impact data
      } else {
        Alert.alert('Error', 'Failed to apply weather optimization');
      }
    } catch (error) {
      console.error('Error applying weather optimization:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    }
  };

  const getWeatherIcon = (weatherMain, weatherDesc) => {
    const desc = (weatherDesc || '').toLowerCase();
    const main = (weatherMain || '').toLowerCase();
    
    if (desc.includes('thunderstorm') || main.includes('thunderstorm')) {
      return { name: 'thunderstorm', color: '#F59E0B' };
    }
    if (desc.includes('rain') || desc.includes('drizzle') || main.includes('rain')) {
      return { name: 'rainy', color: '#3b82f6' };
    }
    if (desc.includes('snow') || main.includes('snow')) {
      return { name: 'snow', color: '#8b5cf6' };
    }
    if (desc.includes('cloud') || main.includes('cloud')) {
      return { name: 'cloudy', color: '#6B7280' };
    }
    if (desc.includes('clear') || main.includes('clear')) {
      return { name: 'sunny', color: '#F59E0B' };
    }
    
    return { name: 'partly-sunny', color: '#6B7280' };
  };

  const getAdjustmentColor = (adjustment) => {
    if (adjustment > 1.1) return '#ef4444';
    if (adjustment < 0.9) return '#10b981';
    return '#f59e0b';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading weather...</Text>
      </View>
    );
  }

  const weather = weatherData?.weather || {};
  const main = weather?.main || {};
  const weatherMain = weather?.weather?.[0] || {};
  const adjustment = weatherData?.lighting_adjustment || 1.0;
  const naturalLightFactor = weatherData?.natural_light_factor || 0;
  const iconInfo = getWeatherIcon(weatherMain.main, weatherMain.description);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header with Controls */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Weather Integration</Text>
          <Text style={styles.headerSubtitle}>
            Smart lighting adjustments based on weather conditions
          </Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.controlButton, autoWeatherMode && styles.controlButtonActive]}
          onPress={toggleAutoWeatherMode}
        >
          <Ionicons 
            name={autoWeatherMode ? 'checkmark-circle' : 'close-circle'} 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.controlButtonText}>
            {autoWeatherMode ? 'Auto Mode ON' : 'Auto Mode OFF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.optimizeButton]}
          onPress={applyWeatherOptimization}
        >
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          <Text style={styles.controlButtonText}>Apply Optimization</Text>
        </TouchableOpacity>
      </View>

      {/* Current Weather Card */}
      <View style={styles.weatherCard}>
        <View style={styles.weatherHeader}>
          <View style={[styles.weatherIconContainer, { backgroundColor: `rgba(${iconInfo.color === '#F59E0B' ? '245, 158, 11' : iconInfo.color === '#3b82f6' ? '59, 130, 246' : '107, 114, 128'}, 0.2)` }]}>
            <Ionicons name={iconInfo.name} size={64} color={iconInfo.color} />
          </View>
          <View style={styles.weatherInfo}>
            <Text style={styles.temperature}>
              {main.temp ? Math.round(main.temp) : '--'}°F
            </Text>
            <Text style={styles.weatherDescription}>
              {weatherMain.description ? weatherMain.description.charAt(0).toUpperCase() + weatherMain.description.slice(1) : 'N/A'}
            </Text>
            <Text style={styles.location}>
              {weatherData?.name || 'Current Location'}
            </Text>
          </View>
        </View>
      </View>

      {/* Weather Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weather Details</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <View style={[styles.detailIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Ionicons name="water" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.detailValue}>{main.humidity || '--'}%</Text>
            <Text style={styles.detailLabel}>Humidity</Text>
          </View>
          <View style={styles.detailItem}>
            <View style={[styles.detailIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
              <Ionicons name="speedometer" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.detailValue}>{main.pressure || '--'}</Text>
            <Text style={styles.detailLabel}>Pressure</Text>
          </View>
          <View style={styles.detailItem}>
            <View style={[styles.detailIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Ionicons name="eye" size={24} color="#10b981" />
            </View>
            <Text style={styles.detailValue}>
              {weather?.visibility ? (weather.visibility / 1000).toFixed(1) : '--'} km
            </Text>
            <Text style={styles.detailLabel}>Visibility</Text>
          </View>
          <View style={styles.detailItem}>
            <View style={[styles.detailIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Ionicons name="leaf" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.detailValue}>
              {weatherData?.wind?.speed ? weatherData.wind.speed.toFixed(1) : '--'} m/s
            </Text>
            <Text style={styles.detailLabel}>Wind Speed</Text>
          </View>
        </View>
      </View>

      {/* Lighting Impact */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
            <Ionicons name="bulb" size={24} color="#8b5cf6" />
          </View>
          <Text style={styles.cardTitle}>Lighting Impact</Text>
        </View>
        <View style={styles.adjustmentContainer}>
          <View style={styles.adjustmentRow}>
            <Text style={styles.adjustmentLabel}>Weather Adjustment</Text>
            <Text style={[styles.adjustmentValue, { color: getAdjustmentColor(adjustment) }]}>
              {adjustment > 1 ? '+' : ''}{((adjustment - 1) * 100).toFixed(0)}%
            </Text>
          </View>
          
          {naturalLightFactor > 0 && (
            <>
              <View style={styles.adjustmentRow}>
                <Text style={styles.adjustmentLabel}>Natural Light Factor</Text>
                <Text style={styles.adjustmentValue}>
                  {Math.round(naturalLightFactor * 100)}%
                </Text>
              </View>
              <View style={styles.naturalLightBar}>
                <View 
                  style={[
                    styles.naturalLightFill,
                    { width: `${naturalLightFactor * 100}%` }
                  ]} 
                />
              </View>
            </>
          )}
          
          <Text style={styles.adjustmentDescription}>
            {adjustment > 1.2
              ? 'Significantly Brighter - Poor weather detected'
              : adjustment > 1.0
              ? 'Slightly Brighter - Cloudy conditions'
              : adjustment < 0.8
              ? 'Dimmer - Clear weather, saving energy'
              : 'Normal - Optimal lighting conditions'}
          </Text>
        </View>
      </View>

      {/* Room-by-Room Impact */}
      {weatherImpact && weatherImpact.room_impacts && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Room Lighting Adjustments</Text>
          <View style={styles.roomImpactsGrid}>
            {Object.entries(weatherImpact.room_impacts).map(([room, impact]) => (
              <View key={room} style={styles.roomImpactCard}>
                <View style={styles.roomImpactHeader}>
                  <Text style={styles.roomImpactName}>
                    {room.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Ionicons name="settings" size={20} color="#6366f1" />
                </View>
                <View style={styles.roomImpactDetails}>
                  <View style={styles.roomImpactRow}>
                    <Text style={styles.roomImpactLabel}>Current</Text>
                    <Text style={styles.roomImpactValue}>
                      {impact.current_brightness || '--'}%
                    </Text>
                  </View>
                  <View style={styles.roomImpactRow}>
                    <Text style={styles.roomImpactLabel}>Optimized</Text>
                    <Text style={[
                      styles.roomImpactValue,
                      { color: impact.brightness_change > 0 ? '#10b981' : '#ef4444' }
                    ]}>
                      {impact.weather_optimized_brightness || '--'}%
                    </Text>
                  </View>
                  <View style={styles.roomImpactRow}>
                    <Text style={styles.roomImpactLabel}>Change</Text>
                    <Text style={[
                      styles.roomImpactValue,
                      { color: impact.brightness_change > 0 ? '#10b981' : '#ef4444' }
                    ]}>
                      {impact.brightness_change > 0 ? '+' : ''}{impact.brightness_change || 0}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Weather Tips */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Smart Lighting Tips</Text>
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <Ionicons name="sunny" size={24} color="#F59E0B" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Clear Weather</Text>
              <Text style={styles.tipDescription}>
                Natural light is abundant. Lights are dimmed to save energy.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <Ionicons name="rainy" size={24} color="#3b82f6" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Rainy Weather</Text>
              <Text style={styles.tipDescription}>
                Increased brightness for safety and mood improvement.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <Ionicons name="thunderstorm" size={24} color="#F59E0B" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Stormy Weather</Text>
              <Text style={styles.tipDescription}>
                Maximum brightness for safety during severe weather.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <Ionicons name="eye" size={24} color="#6B7280" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Poor Visibility</Text>
              <Text style={styles.tipDescription}>
                Enhanced lighting when visibility is reduced.
              </Text>
            </View>
          </View>
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  controlsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2d3340',
    gap: 8,
  },
  controlButtonActive: {
    backgroundColor: '#10b981',
  },
  optimizeButton: {
    backgroundColor: '#6366f1',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  weatherCard: {
    backgroundColor: '#111118',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  weatherInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 8,
  },
  weatherDescription: {
    fontSize: 18,
    color: '#a3a3a3',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#111118',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fafafa',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 16,
    gap: 12,
  },
  detailItem: {
    alignItems: 'center',
    width: '45%',
    marginBottom: 8,
  },
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  adjustmentContainer: {
    padding: 16,
  },
  adjustmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  adjustmentValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  adjustmentLabel: {
    fontSize: 14,
    color: '#a3a3a3',
    fontWeight: '500',
  },
  adjustmentDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  naturalLightBar: {
    height: 8,
    backgroundColor: '#2d3340',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 12,
  },
  naturalLightFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
  },
  impactContent: {
    marginLeft: 12,
    flex: 1,
  },
  impactTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fafafa',
  },
  roomImpactsGrid: {
    gap: 12,
    marginTop: 12,
  },
  roomImpactCard: {
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  roomImpactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomImpactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fafafa',
    textTransform: 'capitalize',
  },
  roomImpactDetails: {
    gap: 8,
  },
  roomImpactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomImpactLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  roomImpactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fafafa',
  },
  tipsContainer: {
    gap: 16,
    marginTop: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fafafa',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6366f1',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WeatherScreen;






