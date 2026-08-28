import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { lightTheme } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchGroups } from '../../store/groupSlice';
import { AddGroupModal } from '../../components/dashboard/modals/AddGroupModal';
import type { Group } from '../../types/group';
import { useNavigation } from '@react-navigation/native';
import type { AppNavProp } from '../../types/navigation';

const GroupCard = ({ group }: { group: Group }) => {
  const navigation = useNavigation<AppNavProp>();
  return (
    <Pressable
      style={styles.groupCard}
      onPress={() =>
        navigation.navigate('GroupDetails', { groupId: group._id })
      }
    >
      <View style={styles.cardTopRow}>
        <View style={styles.groupIconContainer}>
          <Feather name="users" size={20} color={lightTheme.colors.primary} />
        </View>
        <Feather
          name="arrow-right"
          size={18}
          color={lightTheme.colors.textSoft}
        />
      </View>

      <View style={styles.cardMiddle}>
        <Text style={styles.groupName} numberOfLines={1}>
          {group.name}
        </Text>
        <Text style={styles.groupMembers}>
          {group.members.length}{' '}
          {group.members.length === 1 ? 'member' : 'members'}
        </Text>
      </View>

      <View style={styles.cardBottomRow}>
        <View style={styles.avatarStack}>
          {group.members.slice(0, 4).map((member, index) => (
            <View
              key={member._id}
              style={index === 0 ? styles.avatarFirst : styles.avatar}
            >
              <Text style={styles.avatarText}>
                {member.fullName?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
          ))}
          {group.members.length > 4 && (
            <View style={styles.avatarOverflow}>
              <Text style={styles.avatarText}>+{group.members.length - 4}</Text>
            </View>
          )}
        </View>
        <View>
          <Text style={styles.balancesLabel}>BALANCES</Text>
          <Text style={styles.viewDetailsText}>View details</Text>
        </View>
      </View>
    </Pressable>
  );
};

const StateMessage = ({
  isError,
  icon,
  title,
  message,
  action,
}: {
  isError?: boolean;
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}) => (
  <View
    style={[
      styles.stateContainer,
      isError ? styles.stateErrorBorder : styles.stateDefaultBorder,
    ]}
  >
    <View
      style={[
        styles.stateIconCircle,
        isError ? styles.stateIconError : styles.stateIconDefault,
      ]}
    >
      {icon}
    </View>
    <Text style={styles.stateTitle}>{title}</Text>
    <Text style={styles.stateMessage}>{message}</Text>
    {action}
  </View>
);

export default function GroupsScreen() {
  const dispatch = useAppDispatch();
  const { groups, isLoading, error } = useAppSelector(state => state.group);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  const handleCreatePress = useCallback(() => {
    setIsCreateOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateOpen(false);
  }, []);

  if (isLoading && groups.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Groups</Text>
            <Text style={styles.headerSubtitle}>
              Create shared spaces and track every amount to pay or to receive.
            </Text>
          </View>
        </View>
        <StateMessage
          isError
          icon={
            <Feather
              name="alert-circle"
              size={28}
              color={lightTheme.colors.danger}
            />
          }
          title="Failed to load groups"
          message={error}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Groups</Text>
          <Text style={styles.headerSubtitle}>
            Create shared spaces and track every amount to pay or to receive.
          </Text>
        </View>
        <Pressable style={styles.createButton} onPress={handleCreatePress}>
          <Feather name="plus" size={16} color="#ffffff" />
          <Text style={styles.createButtonText}>Create Group</Text>
        </Pressable>
      </View>

      {groups.length === 0 ? (
        <StateMessage
          icon={
            <Feather name="users" size={28} color={lightTheme.colors.primary} />
          }
          title="No groups created yet"
          message="Start with a home, trip, team, or dinner group and keep shared expenses organized from the first entry."
          action={
            <Pressable style={styles.createButton} onPress={handleCreatePress}>
              <Feather name="plus" size={16} color="#ffffff" />
              <Text style={styles.createButtonText}>Create Group</Text>
            </Pressable>
          }
        />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <GroupCard group={item} />}
        />
      )}

      <AddGroupModal isVisible={isCreateOpen} onClose={handleCloseModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.bg,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 28,
    color: lightTheme.colors.text,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
    marginTop: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightTheme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    ...lightTheme.shadows.sm,
  },
  createButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  listContent: {
    paddingBottom: 40,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  groupCard: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    flexBasis: '48%',
    flexGrow: 1,
    ...lightTheme.shadows.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  groupIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: lightTheme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMiddle: {
    marginBottom: 20,
  },
  groupName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: lightTheme.colors.text,
    marginBottom: 4,
  },
  groupMembers: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: lightTheme.colors.textMuted,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: lightTheme.colors.surface,
    backgroundColor: lightTheme.colors.surfaceStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  avatarFirst: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: lightTheme.colors.surface,
    backgroundColor: lightTheme.colors.surfaceStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
    zIndex: 10,
  },
  avatarOverflow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: lightTheme.colors.surface,
    backgroundColor: lightTheme.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    zIndex: 0,
  },
  avatarText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: lightTheme.colors.textMuted,
  },
  balancesLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: lightTheme.colors.textSoft,
    textTransform: 'uppercase',
  },
  viewDetailsText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
    marginTop: 2,
  },
  stateContainer: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    ...lightTheme.shadows.sm,
  },
  stateErrorBorder: {
    borderColor: lightTheme.colors.danger,
  },
  stateDefaultBorder: {
    borderColor: lightTheme.colors.borderStrong,
    borderStyle: 'dashed',
  },
  stateIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stateIconError: {
    backgroundColor: lightTheme.colors.dangerSoft,
  },
  stateIconDefault: {
    backgroundColor: lightTheme.colors.primarySoft,
  },
  stateTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    color: lightTheme.colors.text,
    marginBottom: 8,
  },
  stateMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
});
