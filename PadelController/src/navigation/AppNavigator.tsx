import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Screen1_Connexio from '../screens/Screen1_Connexio';
import Screen2_Parametres from '../screens/Screen2_Parametres';
import Screen3_Cops from '../screens/Screen3_Cops';
import { useBluetooth } from '../hooks/useBluetooth';

const Tab = createBottomTabNavigator();

const theme = {
  background: '#F0F2F5',
  surface: '#FFFFFF',
  primary: '#059669',
  danger: '#DC2626',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

interface TabIconProps {
  focused: boolean;
  showBadge: boolean;
  icon: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, showBadge, icon }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>
    {showBadge && <View style={styles.badge} />}
  </View>
);

const AppNavigator: React.FC = () => {
  const { isConnected } = useBluetooth();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Connexio"
          component={Screen1_Connexio}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} showBadge={false} icon="📶" />
            ),
          }}
        />
        <Tab.Screen
          name="Parametres"
          component={Screen2_Parametres}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} showBadge={!isConnected} icon="🎛️" />
            ),
          }}
        />
        <Tab.Screen
          name="Cops"
          component={Screen3_Cops}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} showBadge={!isConnected} icon="🎾" />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  icon: {
    fontSize: 24,
  },
  iconFocused: {
    transform: [{ scale: 1.1 }],
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.danger,
  },
});

export default AppNavigator;