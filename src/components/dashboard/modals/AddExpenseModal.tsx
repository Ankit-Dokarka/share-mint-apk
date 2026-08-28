import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { lightTheme } from '../../../theme/theme';
import { expenseAPI } from '../../../api/expense/expenseApi';
import { getFriendlyError } from '../../../utils/getFriendlyError';
import type { Group, Member } from '../../../types/group';

interface AddExpenseModalProps {
  isVisible: boolean;
  onClose: () => void;
  group: Group;
  onCreated: () => Promise<void> | void;
}

interface FormErrors {
  title?: string;
  amount?: string;
  expenseDate?: string;
  paidBy?: string;
  participants?: string;
}

const formatExpenseDate = (htmlDate: string): string => {
  if (!htmlDate) return '';
  const date = new Date(htmlDate);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
};

const getDefaultDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const ParticipantItem = ({
  member,
  isChecked,
  onToggle,
}: {
  member: Member;
  isChecked: boolean;
  onToggle: (id: string) => void;
}) => (
  <Pressable
    style={[
      styles.participantItem,
      isChecked ? styles.participantChecked : null,
    ]}
    onPress={() => onToggle(member._id)}
  >
    <View style={styles.participantInfo}>
      <View style={styles.participantAvatar}>
        <Text style={styles.participantAvatarText}>
          {member.fullName?.[0]?.toUpperCase() || 'U'}
        </Text>
      </View>
      <Text style={styles.participantName} numberOfLines={1}>
        {member.fullName}
      </Text>
    </View>
    <View style={[styles.checkbox, isChecked ? styles.checkboxChecked : null]}>
      {isChecked && <Feather name="check" size={13} color="#ffffff" />}
    </View>
  </Pressable>
);

export const AddExpenseModal = ({
  isVisible,
  onClose,
  group,
  onCreated,
}: AddExpenseModalProps) => {
  const members = useMemo(() => group.members ?? [], [group.members]);
  const isTwoPersonGroup = members.length === 2;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(getDefaultDateTime());
  const [paidBy, setPaidBy] = useState(members[0]?._id ?? '');
  const [participants, setParticipants] = useState<string[]>(
    members.map(m => m._id),
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const defaultParticipantIds = members.map(m => m._id);
      setTitle('');
      setDescription('');
      setAmount('');
      setExpenseDate(getDefaultDateTime());
      setPaidBy(defaultParticipantIds[0] ?? '');
      setParticipants(defaultParticipantIds);
      setErrors({});
      setApiError(null);
    }
  }, [isVisible, members]);

  const toggleParticipant = useCallback(
    (userId: string) => {
      if (isTwoPersonGroup) return;
      setParticipants(prev =>
        prev.includes(userId)
          ? prev.filter(id => id !== userId)
          : [...prev, userId],
      );
    },
    [isTwoPersonGroup],
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting) onClose();
  }, [isSubmitting, onClose]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!title.trim()) newErrors.title = 'Title is required';

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Enter a valid amount';
    }

    if (!expenseDate) newErrors.expenseDate = 'Date and time are required';
    if (!paidBy) newErrors.paidBy = 'Select who paid';
    if (participants.length === 0)
      newErrors.participants = 'Select at least one participant';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const participantsPayload = participants.map(id => ({ user: id }));
      await expenseAPI.createExpense({
        title: title.trim(),
        description: description?.trim() || '',
        amount: Number(amount),
        groupId: group._id,
        paidBy,
        splitType: 'equal',
        participants: participantsPayload,
        expenseDate: formatExpenseDate(expenseDate),
      });
      await onCreated();
      onClose();
    } catch (error) {
      setApiError(getFriendlyError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Feather
                  name="credit-card"
                  size={20}
                  color={lightTheme.colors.primary}
                />
              </View>
              <View>
                <Text style={styles.modalTitle}>Add Expense</Text>
                <Text style={styles.modalSubtitle}>
                  Split evenly across selected participants.
                </Text>
              </View>
            </View>
            <Pressable onPress={handleClose} disabled={isSubmitting}>
              <Feather name="x" size={24} color={lightTheme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {apiError && (
              <View style={styles.apiErrorContainer}>
                <Feather
                  name="alert-circle"
                  size={16}
                  color={lightTheme.colors.danger}
                />
                <Text style={styles.apiErrorText}>{apiError}</Text>
              </View>
            )}

            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dinner"
              placeholderTextColor={lightTheme.colors.textSoft}
              value={title}
              onChangeText={setTitle}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional notes"
              placeholderTextColor={lightTheme.colors.textSoft}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Amount *</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor={lightTheme.colors.textSoft}
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
                {errors.amount && (
                  <Text style={styles.errorText}>{errors.amount}</Text>
                )}
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>Date & Time *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DDTHH:MM"
                  placeholderTextColor={lightTheme.colors.textSoft}
                  value={expenseDate}
                  onChangeText={setExpenseDate}
                />
                {errors.expenseDate && (
                  <Text style={styles.errorText}>{errors.expenseDate}</Text>
                )}
              </View>
            </View>

            <Text style={styles.label}>Paid By *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsContainer}
            >
              {members.map(member => (
                <Pressable
                  key={member._id}
                  style={[
                    styles.chip,
                    paidBy === member._id ? styles.chipSelected : null,
                  ]}
                  onPress={() => setPaidBy(member._id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      paidBy === member._id ? styles.chipTextSelected : null,
                    ]}
                  >
                    {member.fullName}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            {errors.paidBy && (
              <Text style={styles.errorText}>{errors.paidBy}</Text>
            )}

            <Text style={styles.label}>Participants *</Text>
            <View style={styles.participantsList}>
              {members.map(member => {
                const isChecked = participants.includes(member._id);
                return (
                  <ParticipantItem
                    key={member._id}
                    member={member}
                    isChecked={isChecked}
                    onToggle={toggleParticipant}
                  />
                );
              })}
            </View>
            {errors.participants && (
              <Text style={styles.errorText}>{errors.participants}</Text>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.footerButton, styles.cancelButton]}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.footerButton, styles.submitButton]}
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Add Expense</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 12,
    width: '100%',
    maxWidth: 450,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    padding: 8,
    backgroundColor: lightTheme.colors.primarySoft,
    borderRadius: 8,
  },
  modalTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: lightTheme.colors.text,
  },
  modalSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: lightTheme.colors.textMuted,
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: lightTheme.colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    backgroundColor: lightTheme.colors.surfaceStrong,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: lightTheme.colors.text,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: lightTheme.colors.danger,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    backgroundColor: lightTheme.colors.surfaceStrong,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 14,
    color: lightTheme.colors.textMuted,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: lightTheme.colors.text,
    fontFamily: 'Inter-Regular',
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: lightTheme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: lightTheme.colors.primary,
    borderColor: lightTheme.colors.primary,
  },
  chipText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: lightTheme.colors.textMuted,
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  participantsList: {
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    borderRadius: 8,
    backgroundColor: lightTheme.colors.surfaceStrong,
    padding: 8,
    marginBottom: 20,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: lightTheme.colors.surface,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  participantChecked: {
    backgroundColor: lightTheme.colors.primarySoft,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantAvatarText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: lightTheme.colors.primary,
  },
  participantName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: lightTheme.colors.text,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: lightTheme.colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: lightTheme.colors.primary,
    borderColor: lightTheme.colors.primary,
  },
  apiErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  apiErrorText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: lightTheme.colors.danger,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: lightTheme.colors.border,
    backgroundColor: lightTheme.colors.surfaceStrong,
  },
  footerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: lightTheme.colors.surface,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  cancelButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: lightTheme.colors.text,
  },
  submitButton: {
    backgroundColor: lightTheme.colors.primary,
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
});
