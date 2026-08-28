import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { lightTheme } from '../../theme/theme';
import { FormInput } from '../../components/ui/FormInput';
import { Button } from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearError } from '../../store/authSlice';
import type { AuthNavProp } from '../../types/navigation';
import { useNavigation } from '@react-navigation/native';

export default function SignupScreen() {
  const dispatch = useAppDispatch();
  const { error, status } = useAppSelector(state => state.auth);
  const navigation = useNavigation<AuthNavProp>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSignup = () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    dispatch(registerUser({ fullName, email, password }))
      .unwrap()
      .then(() => {
        navigation.navigate('VerifyEmail', { email });
      })
      .catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Feather name="credit-card" size={28} color="#ffffff" />
            </View>
            <Text style={styles.appName}>Sharemint</Text>
            <Text style={styles.subtitle}>
              Create an account to get started
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Get Started</Text>
            <Text style={styles.cardSubtitle}>
              Use your email to create an account
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Feather
                  name="alert-circle"
                  size={14}
                  color={lightTheme.colors.danger}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <FormInput
              label="Full Name"
              iconName="user"
              value={fullName}
              onChangeText={setFullName}
              placeholder="John Doe"
              autoComplete="name"
              textContentType="name"
            />

            <FormInput
              label="Email Address"
              iconName="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <FormInput
              label="Password"
              iconName="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
            />

            <View style={styles.buttonContainer}>
              <Button
                title={status === 'loading' ? 'Please wait...' : 'Sign Up'}
                onPress={handleSignup}
                loading={status === 'loading'}
              />
            </View>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>Already have an account? </Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={styles.toggleLink}>Log in</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // (Styles are identical to LoginScreen to maintain consistency,
  // but in a real app you might extract these into a shared authStyles file)
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: lightTheme.radii.btn,
    backgroundColor: lightTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...lightTheme.shadows.md,
  },
  appName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 28,
    color: lightTheme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
  },
  card: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.radii.btn,
    padding: 24,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    ...lightTheme.shadows.lg,
  },
  cardTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 20,
    color: lightTheme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: lightTheme.colors.dangerSoft,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: lightTheme.colors.danger,
  },
  buttonContainer: {
    marginTop: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  toggleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
  },
  toggleLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: lightTheme.colors.primary,
  },
});
