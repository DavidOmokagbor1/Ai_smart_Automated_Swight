import React, { useState } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, ScrollView, TouchableOpacity, Text } from 'react-native';

// Import screens
import DashboardScreen from './screens/DashboardScreen';
import LightControlScreen from './screens/LightControlScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import WeatherScreen from './screens/WeatherScreen';
import SchedulingScreen from './screens/SchedulingScreen';
import ActivityLogScreen from './screens/ActivityLogScreen';
import ProfileScreen from './screens/ProfileScreen';
import SecurityScreen from './screens/SecurityScreen';
import SettingsScreen from './screens/SettingsScreen';
import DeviceManagementScreen from './screens/DeviceManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom dark theme matching web app
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#6366f1',
    background: '#0a0a0f',
    card: '#111118',
    text: '#fafafa',
    border: 'rgba(255, 255, 255, 0.1)',
    notification: '#ef4444',
  },
};

// Custom light theme
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366f1',
    background: '#fafafa',
    card: '#ffffff',
    text: '#0a0a0a',
    border: 'rgba(0, 0, 0, 0.08)',
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Lights') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Statistics') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Weather') {
            iconName = focused ? 'partly-sunny' : 'partly-sunny-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'menu' : 'menu-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#6B7280',
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'AI Smart Lights' }}
      />
      <Tab.Screen 
        name="Lights" 
        component={LightControlScreen}
        options={{ title: 'Our place' }}
      />
      <Tab.Screen 
        name="Statistics" 
        component={StatisticsScreen}
        options={{ title: 'Energy Stats' }}
      />
      <Tab.Screen 
        name="Weather" 
        component={WeatherScreen}
        options={{ title: 'Weather' }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreStack}
        options={{ title: 'More', headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// More Menu Screen Component
function MoreMenuScreen({ navigation }) {
  const menuItems = [
    { name: 'Scheduling', icon: 'time-outline', screen: 'Scheduling' },
    { name: 'Activity Log', icon: 'document-text-outline', screen: 'ActivityLog' },
    { name: 'Profile', icon: 'person-outline', screen: 'Profile' },
    { name: 'Security', icon: 'shield-checkmark-outline', screen: 'Security' },
    { name: 'Settings', icon: 'settings-outline', screen: 'Settings' },
    { name: 'Devices', icon: 'phone-portrait-outline', screen: 'DeviceManagement' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: '#111118',
            margin: 8,
            marginHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Ionicons name={item.icon} size={24} color="#6366f1" style={{ marginRight: 16 }} />
          <Text style={{ color: '#fafafa', fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function MoreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MoreMenu" 
        component={MoreMenuScreen}
        options={{ title: 'More' }}
      />
      <Stack.Screen 
        name="Scheduling" 
        component={SchedulingScreen}
        options={{ title: 'Scheduling' }}
      />
      <Stack.Screen 
        name="ActivityLog" 
        component={ActivityLogScreen}
        options={{ title: 'Activity Log' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="Security" 
        component={SecurityScreen}
        options={{ title: 'Security' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="DeviceManagement" 
        component={DeviceManagementScreen}
        options={{ title: 'Device Management' }}
      />
    </Stack.Navigator>
  );
}


export default function App() {
  const colorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');

  return (
    <NavigationContainer theme={darkMode ? CustomDarkTheme : CustomLightTheme}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <MainTabs />
    </NavigationContainer>
  );
}
