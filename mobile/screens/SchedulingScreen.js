import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SchedulingScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="time-outline" size={48} color="#6366f1" />
        <Text style={styles.title}>Scheduling</Text>
        <Text style={styles.subtitle}>
          Set up automated lighting schedules for different times of day
        </Text>
        <Text style={styles.comingSoon}>Coming Soon</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  card: {
    backgroundColor: '#111118',
    margin: 16,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fafafa',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  comingSoon: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
});

export default SchedulingScreen;






