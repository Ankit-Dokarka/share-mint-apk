import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TextInputProps,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { lightTheme } from '../../theme/theme';

interface FormInputProps {
  label: string;
  iconName: React.ComponentProps<typeof Feather>['name'];
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  keyboardType?: TextInputProps['keyboardType'];
  textContentType?: TextInputProps['textContentType'];
  autoComplete?: TextInputProps['autoComplete'];
}

export const FormInput = ({
  label,
  iconName,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
  textContentType,
  autoComplete,
}: FormInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          error
            ? styles.inputError
            : isFocused
            ? styles.inputFocused
            : styles.inputDefault,
        ]}
      >
        <Feather
          name={iconName}
          size={16}
          color={lightTheme.colors.textMuted}
          style={styles.icon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={lightTheme.colors.textSoft}
          secureTextEntry={secureTextEntry ? !showPassword : false}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          textContentType={textContentType}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.input}
        />
        {secureTextEntry && (
          <Pressable onPress={togglePasswordVisibility} hitSlop={8}>
            <Feather
              name={showPassword ? 'eye-off' : 'eye'}
              size={16}
              color={lightTheme.colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: lightTheme.colors.textMuted,
    fontFamily: 'Inter-Medium',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.bg,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1.5,
  },
  inputDefault: {
    borderColor: lightTheme.colors.border,
  },
  inputFocused: {
    borderColor: lightTheme.colors.primary,
  },
  inputError: {
    borderColor: lightTheme.colors.danger,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: lightTheme.colors.text,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: lightTheme.colors.danger,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
});
