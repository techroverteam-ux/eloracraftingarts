import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../utils/theme';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import MeasurementScreen from '../screens/measurements/MeasurementScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const OrdersStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.onPrimary,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen 
      name="OrdersList" 
      component={OrdersScreen} 
      options={{ title: 'My Orders' }}
    />
    <Stack.Screen 
      name="OrderDetail" 
      component={OrderDetailScreen} 
      options={{ title: 'Order Details' }}
    />
    <Stack.Screen 
      name="Measurement" 
      component={MeasurementScreen} 
      options={{ title: 'Take Measurements' }}
    />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof MaterialIcons.glyphMap;

        if (route.name === 'Orders') {
          iconName = 'assignment';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        } else {
          iconName = 'home';
        }

        return <MaterialIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.secondary,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.outline,
      },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Orders" component={OrdersStack} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <MainTabs /> : <AuthStack />;
};