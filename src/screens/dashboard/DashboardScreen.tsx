import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { lightTheme } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchGroups } from '../../store/groupSlice';

const StatCard = ({
  icon,
  label,
  value,
  colorVariant,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: React.ReactNode;
  colorVariant: 'primary' | 'success' | 'danger';
}) => {
  const colors = {
    primary: {
      bg: lightTheme.colors.primarySoft,
      text: lightTheme.colors.primary,
    },
    success: {
      bg: lightTheme.colors.successSoft,
      text: lightTheme.colors.success,
    },
    danger: {
      bg: lightTheme.colors.dangerSoft,
      text: lightTheme.colors.danger,
    },
  };

  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.statIconContainer,
          { backgroundColor: colors[colorVariant].bg },
        ]}
      >
        <Feather name={icon} size={20} color={colors[colorVariant].text} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { groups, isLoading, error } = useAppSelector(state => state.group);

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  const uniqueMemberCount = useMemo(() => {
    return new Set(
      groups.flatMap(group => group.members.map(member => member._id)),
    ).size;
  }, [groups]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIconContainer}>
          <Feather
            name="alert-circle"
            size={30}
            color={lightTheme.colors.danger}
          />
        </View>
        <Text style={styles.errorTitle}>Failed to load dashboard data</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeGreeting}>
          {user?.fullName ? `Hi ${user.fullName}` : 'Hello'}
        </Text>
        <Text style={styles.welcomeTitle}>Welcome to Sharemint</Text>
        <Text style={styles.welcomeSubtitle}>
          Track shared expenses, review group balances, and settle what you have
          to pay or to receive with a cleaner workspace.
        </Text>
        <Pressable style={styles.welcomeButton}>
          <Text style={styles.welcomeButtonText}>Open Groups</Text>
          <Feather name="arrow-right" size={16} color="#ffffff" />
        </Pressable>
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIconContainer}>
            <Feather name="users" size={30} color={lightTheme.colors.primary} />
          </View>
          <Text style={styles.emptyStateTitle}>Create your first group</Text>
          <Text style={styles.emptyStateText}>
            Invite members, add shared expenses, and Sharemint will keep every
            amount to pay and to receive tidy.
          </Text>
          <Pressable style={styles.welcomeButton}>
            <Feather name="plus" size={16} color="#ffffff" />
            <Text style={styles.welcomeButtonText}>Create Group</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.dataContainer}>
          <View style={styles.statsGrid}>
            <StatCard
              icon="users"
              label="Active groups"
              value={groups.length}
              colorVariant="primary"
            />
            <StatCard
              icon="users"
              label="Members connected"
              value={uniqueMemberCount}
              colorVariant="success"
            />
            <StatCard
              icon="credit-card"
              label="Balance tracking"
              value={
                <Text style={styles.statValueSmall}>To pay and to receive</Text>
              }
              colorVariant="danger"
            />
          </View>

          <View style={styles.recentGroupsCard}>
            <View style={styles.recentGroupsHeader}>
              <Text style={styles.recentGroupsTitle}>Recent groups</Text>
              <Pressable>
                <Text style={styles.viewAllText}>View all</Text>
              </Pressable>
            </View>

            {groups.slice(0, 4).map(group => (
              <Pressable key={group._id} style={styles.groupItem}>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName} numberOfLines={1}>
                    {group.name}
                  </Text>
                  <Text style={styles.groupMembers}>
                    {group.members.length}{' '}
                    {group.members.length === 1 ? 'member' : 'members'}
                  </Text>
                </View>
                <Feather
                  name="arrow-right"
                  size={16}
                  color={lightTheme.colors.textSoft}
                />
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.bg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: lightTheme.colors.bg,
  },
  welcomeCard: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    ...lightTheme.shadows.sm,
    marginBottom: 24,
  },
  welcomeGreeting: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: lightTheme.colors.primary,
    marginBottom: 8,
  },
  welcomeTitle: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 28,
    color: lightTheme.colors.text,
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
    lineHeight: 22,
    marginBottom: 20,
  },
  welcomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightTheme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    ...lightTheme.shadows.sm,
  },
  welcomeButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: lightTheme.colors.dangerSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    color: lightTheme.colors.text,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
    textAlign: 'center',
  },
  emptyStateContainer: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 12,
    padding: 32,
    borderWidth: 1,
    borderColor: lightTheme.colors.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    ...lightTheme.shadows.sm,
  },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: lightTheme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    color: lightTheme.colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  dataContainer: {
    gap: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    ...lightTheme.shadows.sm,
    flexBasis: '47%',
    flexGrow: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: lightTheme.colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 24,
    color: lightTheme.colors.text,
  },
  statValueSmall: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: lightTheme.colors.text,
  },
  recentGroupsCard: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    ...lightTheme.shadows.sm,
    overflow: 'hidden',
  },
  recentGroupsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  recentGroupsTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: lightTheme.colors.text,
  },
  viewAllText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: lightTheme.colors.primary,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  groupInfo: {
    flex: 1,
    marginRight: 16,
  },
  groupName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: lightTheme.colors.text,
    marginBottom: 4,
  },
  groupMembers: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: lightTheme.colors.textMuted,
  },
});
