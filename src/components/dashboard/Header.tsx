import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { lightTheme } from '../../theme/theme';
import { useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/authSlice';

export const Header = () => {
  const dispatch = useAppDispatch();

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={lightTheme.colors.textSoft} />
        <View style={styles.searchPlaceholderLine} />
      </View>

      <View style={styles.actionsContainer}>
        <Pressable style={styles.iconButton}>
          <Feather name="bell" size={18} color={lightTheme.colors.textMuted} />
        </Pressable>

        <Pressable
          style={[styles.iconButton, styles.logoutButton]}
          onPress={() => dispatch(logoutUser())}
        >
          <Feather
            name="log-out"
            size={16}
            color={lightTheme.colors.textSoft}
          />
        </Pressable>

        <View style={styles.divider} />

        <Pressable style={styles.themeToggle}>
          <Feather
            name="sun"
            size={14}
            color="#f59e0b"
            style={styles.iconSun}
          />
          <Feather
            name="moon"
            size={14}
            color={lightTheme.colors.primary}
            style={styles.iconMoon}
          />
          <View style={styles.themeToggleKnob} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: lightTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 36,
    width: 180,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: lightTheme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  searchPlaceholderLine: {
    height: 8,
    width: 60,
    backgroundColor: lightTheme.colors.border,
    borderRadius: 2,
    opacity: 0.7,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  logoutButton: {
    marginLeft: 4,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: lightTheme.colors.border,
    marginHorizontal: 8,
  },
  themeToggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: lightTheme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    justifyContent: 'center',
  },
  iconSun: {
    position: 'absolute',
    left: 8,
  },
  iconMoon: {
    position: 'absolute',
    right: 8,
  },
  themeToggleKnob: {
    position: 'absolute',
    left: 4,
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: lightTheme.colors.elevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});
