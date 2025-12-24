import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';

const DeviceManagementScreen = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/devices`);
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      } else {
        // Use placeholder data
        setDevices([
          { id: 1, name: 'Living Room Light', type: 'Smart Bulb', status: 'online' },
          { id: 2, name: 'Kitchen Light', type: 'Smart Bulb', status: 'online' },
          { id: 3, name: 'Bedroom Light', type: 'Smart Bulb', status: 'offline' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices([
        { id: 1, name: 'Living Room Light', type: 'Smart Bulb', status: 'online' },
        { id: 2, name: 'Kitchen Light', type: 'Smart Bulb', status: 'online' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading devices...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Device Management</Text>
        <Text style={styles.subtitle}>Manage your connected smart devices</Text>
      </View>

      {devices.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="phone-portrait-outline" size={48} color="#6B7280" />
          <Text style={styles.emptyText}>No devices found</Text>
        </View>
      ) : (
        devices.map((device) => (
          <View key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceIcon}>
              <Ionicons name="bulb" size={24} color="#6366f1" />
            </View>
            <View style={styles.deviceContent}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceType}>{device.type}</Text>
            </View>
            <View style={styles.deviceStatus}>
              <View style={[
                styles.statusDot,
                device.status === 'online' ? styles.statusDotOnline : styles.statusDotOffline
              ]} />
              <Text style={[
                styles.statusText,
                device.status === 'online' ? styles.statusTextOnline : styles.statusTextOffline
              ]}>
                {device.status}
              </Text>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add-circle" size={24} color="#6366f1" />
        <Text style={styles.addButtonText}>Add Device</Text>
      </TouchableOpacity>
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyCard: {
    backgroundColor: '#111118',
    margin: 16,
    padding: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  deviceCard: {
    backgroundColor: '#111118',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceContent: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 12,
    color: '#6B7280',
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotOnline: {
    backgroundColor: '#10b981',
  },
  statusDotOffline: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  statusTextOnline: {
    color: '#10b981',
  },
  statusTextOffline: {
    color: '#ef4444',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111118',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
});

export default DeviceManagementScreen;






