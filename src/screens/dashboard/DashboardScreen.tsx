import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightTheme } from '../../theme/theme';
import { Button } from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/authSlice';

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.nameText}>{user?.fullName || 'User'}!</Text>

        <Text style={styles.subtitle}>
          You have successfully logged in. This is your protected dashboard.
        </Text>

        <View style={styles.buttonContainer}>
          <Button title="Log Out" onPress={handleLogout} variant="danger" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  welcomeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 24,
    color: lightTheme.colors.textMuted,
  },
  nameText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    color: lightTheme.colors.text,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: lightTheme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
});
