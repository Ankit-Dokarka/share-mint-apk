import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

import FontAwesome from '@react-native-vector-icons/fontawesome';
import { lightTheme } from '../../theme/theme';
import { FormInput } from '../../components/ui/FormInput';
import { Button } from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, googleLogin, clearError } from '../../store/authSlice';
import type { AuthNavProp } from '../../types/navigation';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { error, status } = useAppSelector(state => state.auth);
  const navigation = useNavigation<AuthNavProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  const handleGoogleLogin = () => {
    dispatch(googleLogin());
  };

  const handleNavigateToSignup = () => {
    navigation.navigate('Signup');
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
            <Text style={styles.subtitle}>Sign in to manage your expenses</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>
              Enter your details to access your account
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
              autoComplete="password"
              textContentType="password"
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Log In"
                onPress={handleLogin}
                loading={status === 'loading'}
              />
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable style={styles.googleButton} onPress={handleGoogleLogin}>
              <FontAwesome
                name="google"
                size={18}
                color={lightTheme.colors.text}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>Don't have an account? </Text>
              <Pressable onPress={handleNavigateToSignup}>
                <Text style={styles.toggleLink}>Sign up</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: lightTheme.colors.border,
  },
  dividerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: lightTheme.colors.textMuted,
    marginHorizontal: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  googleButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: lightTheme.colors.text,
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
