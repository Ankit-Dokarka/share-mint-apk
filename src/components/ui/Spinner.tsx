import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { lightTheme } from '../../theme/theme';

export const Spinner = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={lightTheme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
