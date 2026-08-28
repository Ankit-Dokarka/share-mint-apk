import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/navigation';
import { lightTheme } from '../theme/theme';
import { Header } from '../components/dashboard/Header';
import { DashboardTabs } from './DashboardTabs';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppStack = () => {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Dashboard" component={DashboardTabs} />
        </Stack.Navigator>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.bg,
  },
  content: {
    flex: 1,
  },
});
