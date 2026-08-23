import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import Feather from '@react-native-vector-icons/feather';
import { lightTheme } from '../../theme/theme';
import { Button } from '../../components/ui/Button';
import { useAppDispatch } from '../../store/hooks';
import { verifyEmail, resendOTP, clearError } from '../../store/authSlice';
import type { AuthNavProp, AuthStackParamList } from '../../types/navigation';

type VerifyEmailRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

export default function VerifyEmailScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<VerifyEmailRouteProp>();
  const email = route.params?.email || '';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const inputRefs = useRef<Array<React.ComponentRef<typeof TextInput> | null>>(
    [],
  );

  useEffect(() => {
    inputRefs.current[0]?.focus();
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (index: number, value: string) => {
    if (localError) setLocalError('');
    if (successMsg) setSuccessMsg('');

    // Handle paste
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = Array(6).fill('');
      pastedDigits.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Handle single digit
    const sanitizedValue = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = sanitizedValue;
    setOtp(newOtp);

    if (sanitizedValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async () => {
    const finalOtp = otp.join('');

    if (finalOtp.length !== 6) {
      setLocalError('Please enter all 6 digits.');
      return;
    }

    setIsVerifying(true);
    setLocalError('');

    try {
      const result = await dispatch(
        verifyEmail({ email, otp: finalOtp }),
      ).unwrap();
      setSuccessMsg(result.message + ' Redirecting to login...');

      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (err: any) {
      setLocalError(err || 'Verification failed');
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setLocalError('');
    setSuccessMsg('');

    try {
      const result = await dispatch(resendOTP(email)).unwrap();
      setSuccessMsg(result.message);
    } catch (err: any) {
      setLocalError(err);
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.every(d => d !== '');

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
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Feather name="shield" size={28} color="#ffffff" />
              </View>
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit code to{' '}
                <Text style={styles.emailText}>{email}</Text>. Please enter it
                below.
              </Text>
            </View>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    localError ? styles.otpInputError : null,
                  ]}
                  value={digit}
                  onChangeText={text => handleChange(index, text)}
                  onKeyPress={e => handleKeyPress(index, e.nativeEvent.key)}
                  keyboardType="numeric"
                  maxLength={6}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {localError ? (
              <View style={styles.messageContainer}>
                <Feather
                  name="alert-circle"
                  size={12}
                  color={lightTheme.colors.danger}
                />
                <Text style={styles.errorText}>{localError}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={styles.messageContainer}>
                <Feather
                  name="check-circle"
                  size={12}
                  color={lightTheme.colors.success}
                />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            <View style={styles.buttonContainer}>
              <Button
                title={isVerifying ? 'Verifying...' : 'Verify Account'}
                onPress={onSubmit}
                loading={isVerifying}
                disabled={!isComplete || isVerifying}
              />
            </View>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <Pressable onPress={handleResend} disabled={isResending}>
                <Text
                  style={[
                    styles.resendLink,
                    isResending && styles.resendLinkDisabled,
                  ]}
                >
                  {isResending ? 'Sending...' : 'Resend'}
                </Text>
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
  card: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    ...lightTheme.shadows.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: lightTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...lightTheme.shadows.md,
  },
  title: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 24,
    color: lightTheme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  emailText: {
    fontFamily: 'Inter-Bold',
    color: lightTheme.colors.text,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: lightTheme.colors.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: lightTheme.colors.text,
    backgroundColor: lightTheme.colors.surface,
  },
  otpInputError: {
    borderColor: lightTheme.colors.danger,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
    minHeight: 20,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: lightTheme.colors.danger,
  },
  successText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: lightTheme.colors.success,
  },
  buttonContainer: {
    marginTop: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
  },
  resendLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: lightTheme.colors.primary,
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
});
