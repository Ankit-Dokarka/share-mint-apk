import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import Feather from '@react-native-vector-icons/feather';
import { lightTheme } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchGroupDetails } from '../../store/expenseSlice';
import type { AppStackParamList } from '../../types/navigation';
import type { Expense, Balance } from '../../types/expense';
import { AddExpenseModal } from '../../components/dashboard/modals/AddExpenseModal';

type GroupDetailsRouteProp = RouteProp<AppStackParamList, 'GroupDetails'>;

const formatINR = (val: number) =>
  `₹${val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (isoString?: string) =>
  isoString
    ? new Date(isoString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'No date';

const ExpenseRow = ({ expense }: { expense: Expense }) => (
  <View style={styles.expenseRow}>
    <View style={styles.expenseTitleContainer}>
      <Text style={styles.expenseTitle} numberOfLines={1}>
        {expense.title}
      </Text>
      <Text style={styles.expensePaidBy}>
        Paid by {expense.paidBy.fullName}
      </Text>
    </View>
    <Text style={styles.expenseAmount}>{formatINR(expense.amount)}</Text>
    <View style={styles.expenseDateContainer}>
      <Feather name="calendar" size={12} color={lightTheme.colors.textMuted} />
      <Text style={styles.expenseDate}>{formatDate(expense.expenseDate)}</Text>
    </View>
  </View>
);

const BalanceCard = ({ balance }: { balance: Balance }) => (
  <View style={styles.balanceCard}>
    <View style={styles.balanceUserInfo}>
      <Text style={styles.balanceUserName} numberOfLines={1}>
        {balance.user.fullName}
      </Text>
      <Text style={styles.balanceUserEmail} numberOfLines={1}>
        {balance.user.email}
      </Text>
    </View>
    {balance.balance > 0 ? (
      <Text style={styles.balancePositive}>
        {formatINR(balance.balance)} to receive
      </Text>
    ) : balance.balance < 0 ? (
      <Text style={styles.balanceNegative}>
        {formatINR(Math.abs(balance.balance))} to pay
      </Text>
    ) : (
      <Text style={styles.balanceSettled}>Settled up</Text>
    )}
  </View>
);

export default function GroupDetailsScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<GroupDetailsRouteProp>();
  const groupId = route.params?.groupId;

  const { user } = useAppSelector(state => state.auth);
  const { groups, isLoading: isLoadingGroups } = useAppSelector(
    state => state.group,
  );
  const {
    expenses,
    balances,
    isLoading: isLoadingExpenses,
    error,
  } = useAppSelector(state => state.expense);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const group = useMemo(
    () => groups.find(g => g._id === groupId),
    [groups, groupId],
  );

  useEffect(() => {
    if (groupId) {
      dispatch(fetchGroupDetails(groupId));
    }
  }, [dispatch, groupId]);

  const currentUserBalance = useMemo(
    () => balances.find(b => b.user._id === user?.id),
    [balances, user?.id],
  );

  const totalSpent = useMemo(
    () => expenses.reduce((sum, exp) => sum + exp.amount, 0),
    [expenses],
  );

  const handleAddExpense = useCallback(() => {
    setIsAddExpenseOpen(true);
  }, []);

  const handleSettleUp = useCallback(() => {
    Alert.alert('Coming Soon', 'Settle Up modal is not implemented yet.');
  }, []);

  const isOverallLoading =
    isLoadingGroups || (group ? isLoadingExpenses : false);

  if (isOverallLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Feather
          name="alert-circle"
          size={48}
          color={lightTheme.colors.danger}
        />
        <Text style={styles.errorTitle}>Failed to load group details</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          style={styles.actionButton}
          onPress={() => dispatch(fetchGroupDetails(groupId))}
        >
          <Text style={styles.actionButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.centerContainer}>
        <Feather
          name="alert-circle"
          size={48}
          color={lightTheme.colors.danger}
        />
        <Text style={styles.errorTitle}>Group not found</Text>
        <Pressable
          style={styles.actionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.actionButtonText}>Back to Groups</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Feather
          name="arrow-left"
          size={16}
          color={lightTheme.colors.textMuted}
        />
        <Text style={styles.backButtonText}>Groups</Text>
      </Pressable>

      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.groupInfoContainer}>
            <View style={styles.groupIcon}>
              <Feather
                name="users"
                size={24}
                color={lightTheme.colors.primary}
              />
            </View>
            <View>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupStats}>
                {group.members.length}{' '}
                {group.members.length === 1 ? 'member' : 'members'} · Total{' '}
                {formatINR(totalSpent)}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={[styles.actionButton, styles.settleButton]}
              onPress={handleSettleUp}
            >
              <Feather name="check-circle" size={16} color="#ffffff" />
              <Text style={styles.actionButtonText}>Settle Up</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.addExpenseButton]}
              onPress={handleAddExpense}
            >
              <Feather name="plus" size={16} color="#ffffff" />
              <Text style={styles.actionButtonText}>Add Expense</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.membersList}
        >
          {group.members.map(member => (
            <View key={member._id} style={styles.memberChip}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {member.fullName?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
              <Text style={styles.memberName} numberOfLines={1}>
                {member.fullName}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* User Balance Card */}
      <View
        style={[
          styles.balanceSummaryCard,
          currentUserBalance?.balance && currentUserBalance.balance > 0
            ? styles.balancePositiveBorder
            : null,
          currentUserBalance?.balance && currentUserBalance.balance < 0
            ? styles.balanceNegativeBorder
            : null,
        ]}
      >
        <Text style={styles.balanceSummaryLabel}>YOUR BALANCE</Text>
        <Text
          style={[
            styles.balanceSummaryText,
            currentUserBalance?.balance && currentUserBalance.balance > 0
              ? styles.balancePositiveText
              : null,
            currentUserBalance?.balance && currentUserBalance.balance < 0
              ? styles.balanceNegativeText
              : null,
          ]}
        >
          {!currentUserBalance || currentUserBalance.balance === 0
            ? 'You are settled up'
            : currentUserBalance.balance > 0
            ? `You have ${formatINR(currentUserBalance.balance)} to receive`
            : `You have ${formatINR(
                Math.abs(currentUserBalance.balance),
              )} to pay`}
        </Text>
      </View>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIcon}>
            <Feather
              name="credit-card"
              size={28}
              color={lightTheme.colors.primary}
            />
          </View>
          <Text style={styles.emptyStateTitle}>No expenses yet</Text>
          <Text style={styles.emptyStateText}>
            Add the first expense to start calculating what each member has to
            pay or to receive.
          </Text>
          <Pressable
            style={[styles.actionButton, styles.addExpenseButton]}
            onPress={handleAddExpense}
          >
            <Feather name="plus" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Add Expense</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.expensesContainer}>
          <Text style={styles.listHeader}>EXPENSES</Text>
          {expenses.map(expense => (
            <ExpenseRow key={expense._id} expense={expense} />
          ))}
        </View>
      )}

      {/* Balances Grid */}
      {balances.length > 0 && (
        <View style={styles.balancesContainer}>
          <Text style={styles.listHeader}>GROUP BALANCES</Text>
          <View style={styles.balancesGrid}>
            {balances.map(balance => (
              <BalanceCard key={balance.user._id} balance={balance} />
            ))}
          </View>
        </View>
      )}
      {group && (
        <AddExpenseModal
          isVisible={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          group={group}
          onCreated={() => {
            dispatch(fetchGroupDetails(groupId));
          }}
        />
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
  },
  headerCard: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    ...lightTheme.shadows.sm,
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 20,
  },
  groupInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  groupIcon: {
    padding: 12,
    backgroundColor: lightTheme.colors.primarySoft,
    borderRadius: 8,
  },
  groupName: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 24,
    color: lightTheme.colors.text,
    marginBottom: 4,
  },
  groupStats: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: lightTheme.colors.textMuted,
  },
  headerActions: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  settleButton: {
    backgroundColor: lightTheme.colors.success,
  },
  addExpenseButton: {
    backgroundColor: lightTheme.colors.primary,
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#ffffff',
  },
  membersList: {
    flexDirection: 'row',
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: lightTheme.colors.surfaceStrong,
    borderRadius: 16,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 12,
    marginRight: 8,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: lightTheme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: lightTheme.colors.primary,
  },
  memberName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: lightTheme.colors.textMuted,
  },
  balanceSummaryCard: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    ...lightTheme.shadows.sm,
    marginBottom: 16,
  },
  balancePositiveBorder: {
    borderColor: 'rgba(20, 184, 166, 0.4)',
  },
  balanceNegativeBorder: {
    borderColor: 'rgba(244, 63, 94, 0.4)',
  },
  balanceSummaryLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: lightTheme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  balanceSummaryText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 24,
    color: lightTheme.colors.text,
  },
  balancePositiveText: {
    color: lightTheme.colors.success,
  },
  balanceNegativeText: {
    color: lightTheme.colors.danger,
  },
  emptyStateContainer: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    ...lightTheme.shadows.sm,
    marginBottom: 16,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: lightTheme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  expensesContainer: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    ...lightTheme.shadows.sm,
    marginBottom: 16,
  },
  listHeader: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: lightTheme.colors.textMuted,
    marginBottom: 16,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  expenseTitleContainer: {
    flex: 1,
  },
  expenseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: lightTheme.colors.text,
    marginBottom: 4,
  },
  expensePaidBy: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: lightTheme.colors.textMuted,
  },
  expenseAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: lightTheme.colors.text,
    marginHorizontal: 16,
  },
  expenseDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expenseDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: lightTheme.colors.textMuted,
  },
  balancesContainer: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    ...lightTheme.shadows.sm,
  },
  balancesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  balanceCard: {
    backgroundColor: lightTheme.colors.surfaceStrong,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    flexBasis: '48%',
    flexGrow: 1,
  },
  balanceUserInfo: {
    marginBottom: 8,
  },
  balanceUserName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: lightTheme.colors.text,
    marginBottom: 2,
  },
  balanceUserEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: lightTheme.colors.textMuted,
  },
  balancePositive: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: lightTheme.colors.success,
  },
  balanceNegative: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: lightTheme.colors.danger,
  },
  balanceSettled: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: lightTheme.colors.textMuted,
  },
  errorTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    color: lightTheme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
});
