import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2; // 2 columns with padding

// Custom Slider Component - Ultra Simple Touch-Based for Mobile
const CustomSlider = ({ value, onValueChange, minimumValue = 0, maximumValue = 100 }) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pan = React.useRef(new Animated.Value((value / (maximumValue - minimumValue)) * 100)).current;
  const containerRef = React.useRef(null);
  const startX = React.useRef(0);

  useEffect(() => {
    if (!isDragging) {
      const newPercent = (value / (maximumValue - minimumValue)) * 100;
      Animated.timing(pan, {
        toValue: newPercent,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [value, maximumValue, minimumValue, isDragging]);

  const calculateValue = (x) => {
    if (sliderWidth <= 0) return value;
    const percent = Math.max(0, Math.min(100, (x / sliderWidth) * 100));
    const actualValue = minimumValue + (percent / 100) * (maximumValue - minimumValue);
    return Math.round(actualValue);
  };

  const handleTouchStart = (evt) => {
    setIsDragging(true);
    if (sliderWidth > 0) {
      // Use locationX which is relative to the view - more reliable on mobile
      const touchX = evt.nativeEvent.locationX || 0;
      startX.current = touchX;
      const clampedX = Math.max(0, Math.min(sliderWidth, touchX));
      const newPercent = (clampedX / sliderWidth) * 100;
      pan.setValue(newPercent);
      const newValue = calculateValue(clampedX);
      if (onValueChange) {
        onValueChange(newValue);
      }
    }
  };

  const handleTouchMove = (evt, gestureState) => {
    if (sliderWidth > 0 && isDragging) {
      // Calculate position: initial touch + movement delta
      const currentX = startX.current + gestureState.dx;
      const clampedX = Math.max(0, Math.min(sliderWidth, currentX));
      const newPercent = (clampedX / sliderWidth) * 100;
      pan.setValue(newPercent);
      const newValue = calculateValue(clampedX);
      if (onValueChange) {
        onValueChange(newValue);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Respond to any horizontal movement
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: handleTouchStart,
      onPanResponderMove: handleTouchMove,
      onPanResponderRelease: handleTouchEnd,
      onPanResponderTerminate: handleTouchEnd,
    })
  ).current;

  return (
    <View
      ref={containerRef}
      style={styles.sliderContainer}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        if (width > 0) {
          setSliderWidth(width);
        }
      }}
    >
      <View 
        style={styles.sliderTouchArea}
        {...panResponder.panHandlers}
        pointerEvents="box-only"
      >
        <View style={styles.sliderTrack} pointerEvents="none">
          <Animated.View
            style={[
              styles.sliderFill,
              {
                width: pan.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.sliderThumb,
              isDragging && styles.sliderThumbActive,
              {
                left: pan.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, Math.max(0, sliderWidth - 32)],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const LightControlScreen = () => {
  const [lights, setLights] = useState({
    living_room: { status: 'off', brightness: 0, color_temperature: 'warm' },
    kitchen: { status: 'off', brightness: 0, color_temperature: 'warm' },
    bedroom: { status: 'off', brightness: 0, color_temperature: 'warm' },
    bathroom: { status: 'off', brightness: 0, color_temperature: 'warm' },
    office: { status: 'off', brightness: 0, color_temperature: 'warm' },
  });
  const [loading, setLoading] = useState(true);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localBrightness, setLocalBrightness] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null); // For detailed control modal

  useEffect(() => {
    fetchLightStatus();
    // Don't block on AI status - fetch it in background
    fetchAiStatus().catch(() => {
      // Silently fail - AI mode is optional
      setAiModeEnabled(false);
    });
    const interval = setInterval(fetchLightStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchLightStatus = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 8000)
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
      if (data.lights) {
        setLights(data.lights);
        // Update local brightness state
        const newLocalBrightness = {};
        Object.keys(data.lights).forEach(room => {
          newLocalBrightness[room] = data.lights[room].brightness || 0;
        });
        setLocalBrightness(newLocalBrightness);
      }
    } catch (error) {
      console.error('Error fetching lights:', error);
      // Don't show alert on every fetch failure
    } finally {
      setLoading(false);
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
      }
    } catch (error) {
      // Silently fail - don't log or show error
      // AI mode is optional feature
      setAiModeEnabled(false);
    }
  };

  const toggleAiMode = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const response = await Promise.race([
        fetch(`${API_URL}/api/ai/mode`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enabled: !aiModeEnabled }),
        }),
        timeoutPromise,
      ]);
      
      if (response.ok) {
        const result = await response.json();
        setAiModeEnabled(result.ai_mode_enabled);
        Alert.alert('Success', result.message || 'AI mode toggled');
        setTimeout(() => {
          fetchAiStatus().catch(() => {}); // Don't block on refresh
        }, 500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', errorData.error || 'Failed to toggle AI mode');
      }
    } catch (error) {
      console.error('AI mode toggle error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLight = async (room) => {
    try {
      setIsLoading(true);
      const currentStatus = lights[room]?.status;
      const newStatus = currentStatus === 'on' ? 'off' : 'on';
      
      // Update local state immediately
      setLights(prev => ({
        ...prev,
        [room]: {
          ...prev[room],
          status: newStatus,
          brightness: newStatus === 'on' ? (prev[room]?.brightness || 100) : 0,
        }
      }));
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const response = await Promise.race([
        fetch(`${API_URL}/api/lights/${room}/control`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: newStatus,
            brightness: newStatus === 'on' ? (lights[room]?.brightness || 100) : 0,
          }),
        }),
        timeoutPromise,
      ]);

      if (response.ok) {
        const result = await response.json();
        // Update with server response
        setLights(prev => ({
          ...prev,
          [room]: {
            ...prev[room],
            status: result.status || newStatus,
            brightness: result.brightness || (newStatus === 'on' ? 100 : 0),
          }
        }));
        // Refresh from server
        setTimeout(() => fetchLightStatus(), 500);
      } else {
        // Revert on error
        fetchLightStatus();
        Alert.alert('Error', 'Failed to toggle light');
      }
    } catch (error) {
      console.error('Error toggling light:', error);
      // Revert on error
      fetchLightStatus();
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce timer for brightness updates
  const brightnessTimers = React.useRef({});

  const setBrightness = async (room, brightness, immediate = false) => {
    try {
      // Update local state immediately for smooth UI
      setLocalBrightness(prev => ({ ...prev, [room]: brightness }));
      setLights(prev => ({
        ...prev,
        [room]: { ...prev[room], brightness }
      }));
      
      // Clear existing timer for this room
      if (brightnessTimers.current[room]) {
        clearTimeout(brightnessTimers.current[room]);
      }
      
      // Debounce API call - only send after user stops dragging (300ms delay)
      if (!immediate) {
        brightnessTimers.current[room] = setTimeout(async () => {
          try {
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Request timeout')), 10000)
            );
            
            const response = await Promise.race([
              fetch(`${API_URL}/api/lights/${room}/brightness`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ brightness }),
              }),
              timeoutPromise,
            ]);

            if (response.ok) {
              const result = await response.json();
              setLights(prev => ({
                ...prev,
                [room]: { ...prev[room], brightness: result.brightness }
              }));
              setLocalBrightness(prev => ({ ...prev, [room]: result.brightness }));
            }
          } catch (error) {
            console.error('Error setting brightness:', error);
            fetchLightStatus();
          }
        }, 300); // 300ms debounce
      } else {
        // Immediate update (for quick buttons)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const response = await Promise.race([
          fetch(`${API_URL}/api/lights/${room}/brightness`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ brightness }),
          }),
          timeoutPromise,
        ]);

        if (response.ok) {
          const result = await response.json();
          setLights(prev => ({
            ...prev,
            [room]: { ...prev[room], brightness: result.brightness }
          }));
          setLocalBrightness(prev => ({ ...prev, [room]: result.brightness }));
        }
      }
    } catch (error) {
      console.error('Error setting brightness:', error);
      fetchLightStatus();
    }
  };

  const setColorTemperature = async (room, temperature) => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const response = await Promise.race([
        fetch(`${API_URL}/api/lights/${room}/color`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ temperature }),
        }),
        timeoutPromise,
      ]);

      if (response.ok) {
        const result = await response.json();
        setLights(prev => ({
          ...prev,
          [room]: { ...prev[room], color_temperature: result.temperature || temperature }
        }));
      }
    } catch (error) {
      console.error('Error setting color temperature:', error);
    }
  };

  const bulkControl = async (action, brightness = 100) => {
    try {
      setIsLoading(true);
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const response = await Promise.race([
        fetch(`${API_URL}/api/lights/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action, brightness }),
        }),
        timeoutPromise,
      ]);
      
      if (response.ok) {
        const result = await response.json();
        if (result.results) {
          setLights(prev => ({
            ...prev,
            ...result.results
          }));
        }
        fetchLightStatus();
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', errorData.error || 'Failed to control all lights');
      }
    } catch (error) {
      console.error('Error controlling all lights:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoomIcon = (room) => {
    const icons = {
      'living_room': 'home',
      'kitchen': 'restaurant',
      'bedroom': 'bed',
      'bathroom': 'water',
      'office': 'briefcase',
    };
    return icons[room] || 'bulb';
  };

  const getRoomColor = (room) => {
    const colors = {
      'living_room': '#F59E0B', // Yellow
      'kitchen': '#FCD34D', // Light Yellow
      'bedroom': '#D97706', // Orange
      'bathroom': '#FBBF24', // Gold
      'office': '#6B7280', // Gray
    };
    return colors[room] || '#6366f1';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading lights...</Text>
      </View>
    );
  }

  const rooms = Object.keys(lights);

  return (
    <ScrollView 
      style={styles.container}
      scrollEnabled={!selectedRoom}
      nestedScrollEnabled={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Quick Actions Bar */}
      <View style={styles.quickActionsBar}>
        <TouchableOpacity
          style={[styles.quickActionBtn, styles.allOnBtn]}
          onPress={() => bulkControl('on')}
          disabled={isLoading}
        >
          <Ionicons name="sunny" size={18} color="#FFFFFF" />
          <Text style={styles.quickActionBtnText}>All On</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickActionBtn, styles.allOffBtn]}
          onPress={() => bulkControl('off')}
          disabled={isLoading}
        >
          <Ionicons name="moon" size={18} color="#FFFFFF" />
          <Text style={styles.quickActionBtnText}>All Off</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickActionBtn, aiModeEnabled ? styles.aiBtnActive : styles.aiBtn]}
          onPress={toggleAiMode}
          disabled={isLoading}
        >
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          <Text style={styles.quickActionBtnText}>
            {aiModeEnabled ? 'AI ON' : 'AI'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Room Grid - Clean 2x2 Layout */}
      <View style={styles.gridContainer}>
        {rooms.map((room) => {
          const light = lights[room];
          const isOn = light?.status === 'on';
          const brightness = localBrightness[room] !== undefined ? localBrightness[room] : (light?.brightness || 0);
          const roomColor = getRoomColor(room);
          const roomIcon = getRoomIcon(room);

          return (
            <TouchableOpacity
              key={room}
              style={[styles.roomCard, { backgroundColor: roomColor }]}
              onPress={() => setSelectedRoom(selectedRoom === room ? null : room)}
              activeOpacity={0.8}
            >
              {/* Room Icon */}
              <View style={styles.roomIconContainer}>
                <Ionicons name={roomIcon} size={32} color="#FFFFFF" />
              </View>
              
              {/* Room Name */}
              <Text style={styles.roomCardName}>
                {room.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              
              {/* Light Status */}
              <View style={styles.roomCardFooter}>
                <Ionicons 
                  name={isOn ? 'bulb' : 'bulb-outline'} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.roomCardStatus}>
                  {isOn ? `${brightness}%` : 'Off'}
                </Text>
              </View>

              {/* Toggle Indicator */}
              <View style={[styles.toggleIndicator, isOn && styles.toggleIndicatorOn]} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Detailed Control Modal for Selected Room */}
      {selectedRoom && (
        <View style={styles.detailModal}>
          <TouchableWithoutFeedback onPress={() => setSelectedRoom(null)}>
            <View style={styles.detailModalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.detailModalContent} pointerEvents="box-none">
            <View style={styles.detailModalHeader}>
              <Text style={styles.detailModalTitle}>
                {selectedRoom.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedRoom(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fafafa" />
              </TouchableOpacity>
            </View>

            {(() => {
              const light = lights[selectedRoom];
              const isOn = light?.status === 'on';
              const brightness = localBrightness[selectedRoom] !== undefined 
                ? localBrightness[selectedRoom] 
                : (light?.brightness || 0);
              const colorTemp = light?.color_temperature || 'warm';

              return (
                <>
                  {/* Power Toggle */}
                  <TouchableOpacity
                    style={[styles.powerButton, isOn && styles.powerButtonOn]}
                    onPress={() => toggleLight(selectedRoom)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={isOn ? 'power' : 'power-outline'}
                      size={32}
                      color="#FFFFFF"
                    />
                    <Text style={styles.powerButtonText}>
                      {isOn ? 'Turn Off' : 'Turn On'}
                    </Text>
                  </TouchableOpacity>

                  {isOn && (
                    <>
                      {/* Brightness Control */}
                      <View style={styles.detailSection}>
                        <View style={styles.detailSectionHeader}>
                          <Text style={styles.detailSectionTitle}>Brightness</Text>
                          <Text style={styles.detailSectionValue}>{brightness}%</Text>
                        </View>
                        <CustomSlider
                          value={brightness}
                          onValueChange={(value) => setBrightness(selectedRoom, value, false)}
                          minimumValue={0}
                          maximumValue={100}
                        />
                        <View style={styles.quickBrightnessRow}>
                          {[25, 50, 75, 100].map((level) => (
                            <TouchableOpacity
                              key={level}
                              style={[
                                styles.quickBrightnessBtn,
                                brightness === level && styles.quickBrightnessBtnActive,
                              ]}
                              onPress={() => setBrightness(selectedRoom, level, true)}
                              disabled={isLoading}
                            >
                              <Text
                                style={[
                                  styles.quickBrightnessBtnText,
                                  brightness === level && styles.quickBrightnessBtnTextActive,
                                ]}
                              >
                                {level}%
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Color Temperature */}
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Color Temperature</Text>
                        <View style={styles.colorTempRow}>
                          {['warm', 'neutral', 'cool'].map((temp) => (
                            <TouchableOpacity
                              key={temp}
                              style={[
                                styles.colorTempBtn,
                                colorTemp === temp && styles.colorTempBtnActive,
                              ]}
                              onPress={() => setColorTemperature(selectedRoom, temp)}
                              disabled={isLoading}
                            >
                              <Text
                                style={[
                                  styles.colorTempBtnText,
                                  colorTemp === temp && styles.colorTempBtnTextActive,
                                ]}
                              >
                                {temp.charAt(0).toUpperCase() + temp.slice(1)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </>
                  )}
                </>
              );
            })()}
          </View>
        </View>
      )}
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
    fontSize: 14,
  },
  quickActionsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#111118',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  allOnBtn: {
    backgroundColor: '#6366f1',
  },
  allOffBtn: {
    backgroundColor: '#2d3340',
  },
  aiBtn: {
    backgroundColor: '#2d3340',
  },
  aiBtnActive: {
    backgroundColor: '#10b981',
  },
  quickActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  roomCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  roomIconContainer: {
    marginBottom: 8,
  },
  roomCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  roomCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomCardStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toggleIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  toggleIndicatorOn: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  detailModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  detailModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  detailModalContent: {
    backgroundColor: '#111118',
    borderRadius: 24,
    padding: 24,
    width: width - 32,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1001,
    overflow: 'visible',
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  detailModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fafafa',
    textTransform: 'capitalize',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#2d3340',
    marginBottom: 24,
    gap: 12,
  },
  powerButtonOn: {
    backgroundColor: '#10b981',
  },
  powerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a3a3a3',
  },
  detailSectionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fafafa',
  },
  sliderContainer: {
    width: '100%',
    height: 70,
    justifyContent: 'center',
    marginVertical: 16,
  },
  sliderTouchArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    paddingVertical: 25, // Extra large touch area for mobile
  },
  sliderTrack: {
    width: '100%',
    height: 12,
    backgroundColor: '#2d3340',
    borderRadius: 6,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 6,
  },
  sliderThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    position: 'absolute',
    top: -10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  sliderThumbActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    top: -12,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 4.5,
    backgroundColor: '#818cf8',
  },
  quickBrightnessRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quickBrightnessBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#2d3340',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickBrightnessBtnActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  quickBrightnessBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  quickBrightnessBtnTextActive: {
    color: '#FFFFFF',
  },
  colorTempRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorTempBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2d3340',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  colorTempBtnActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  colorTempBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  colorTempBtnTextActive: {
    color: '#FFFFFF',
  },
});

export default LightControlScreen;



