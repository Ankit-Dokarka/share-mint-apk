import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { lightTheme } from '../../theme/theme';

export default function GroupsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.bg,
  },
  text: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: lightTheme.colors.text,
  },
});
