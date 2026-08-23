import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { lightTheme } from '../../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'danger';
}

export const Button = ({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  const bgColor =
    variant === 'danger' ? lightTheme.colors.danger : lightTheme.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor,
          opacity: isDisabled ? 0.7 : pressed ? 0.85 : 1,
        },
        variant === 'primary' ? lightTheme.shadows.md : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={styles.text.color} size="small" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});
