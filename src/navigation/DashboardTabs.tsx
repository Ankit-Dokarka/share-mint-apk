import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from '@react-native-vector-icons/feather';
import { lightTheme } from '../theme/theme';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import GroupsScreen from '../screens/dashboard/GroupsScreen';
import ChatScreen from '../screens/dashboard/ChatScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';

const Tab = createBottomTabNavigator();

const DashboardIcon = ({ color }: { color: string }) => (
  <Feather name="home" size={22} color={color} />
);

const GroupsIcon = ({ color }: { color: string }) => (
  <Feather name="users" size={22} color={color} />
);

const ChatIcon = ({ color }: { color: string }) => (
  <Feather name="message-square" size={22} color={color} />
);

const ProfileIcon = ({ color }: { color: string }) => (
  <Feather name="user" size={22} color={color} />
);

export const DashboardTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: lightTheme.colors.primary,
        tabBarInactiveTintColor: lightTheme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: lightTheme.colors.surface,
          borderTopColor: lightTheme.colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: DashboardIcon,
        }}
      />
      <Tab.Screen
        name="GroupsTab"
        component={GroupsScreen}
        options={{
          title: 'Groups',
          tabBarIcon: GroupsIcon,
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatScreen}
        options={{
          title: 'Chat',
          tabBarIcon: ChatIcon,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};
