import React, { useState, useEffect, useCallback } from 'react';
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
import { settlementAPI } from '../../../api/settlement/settlementApi';
import { getFriendlyError } from '../../../utils/getFriendlyError';
import { useAppSelector } from '../../../store/hooks';
import type { Balance } from '../../../types/expense';

interface SettleUpModalProps {
  isVisible: boolean;
  onClose: () => void;
  groupId: string;
  balances: Balance[];
  onSettled: () => Promise<void> | void;
}

interface FormErrors {
  receiver?: string;
  amount?: string;
}

const formatINR = (val: number) =>
  `₹${val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const SettleUpModal = ({
  isVisible,
  onClose,
  groupId,
  balances,
  onSettled,
}: SettleUpModalProps) => {
  const { user } = useAppSelector(state => state.auth);

  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usersToPay = balances.filter(
    b => b.balance > 0 && b.user._id !== user?.id,
  );

  useEffect(() => {
    if (isVisible) {
      setReceiver('');
      setAmount('');
      setNote('');
      setErrors({});
      setApiError(null);
    }
  }, [isVisible]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) onClose();
  }, [isSubmitting, onClose]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!receiver) newErrors.receiver = 'Please select a user';

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Enter a valid amount';
    } else {
      const selectedBalance = balances.find(b => b.user._id === receiver);
      if (selectedBalance && numAmount > selectedBalance.balance) {
        newErrors.amount = 'Amount cannot exceed the amount to be paid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      await settlementAPI.createSettlement({
        groupId,
        receiver,
        amount: Number(amount),
        note: note.trim() || '',
      });
      await onSettled();
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
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Feather
                  name="check-circle"
                  size={20}
                  color={lightTheme.colors.success}
                />
              </View>
              <Text style={styles.modalTitle}>Settle Up</Text>
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

            {usersToPay.length === 0 ? (
              <Text style={styles.emptyText}>
                You are all settled up! You don't have to pay anyone in this
                group.
              </Text>
            ) : (
              <>
                <Text style={styles.label}>Pay To *</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipsContainer}
                >
                  {usersToPay.map(b => (
                    <Pressable
                      key={b.user._id}
                      style={[
                        styles.chip,
                        receiver === b.user._id ? styles.chipSelected : null,
                      ]}
                      onPress={() => setReceiver(b.user._id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          receiver === b.user._id
                            ? styles.chipTextSelected
                            : null,
                        ]}
                      >
                        {b.user.fullName} (Pay {formatINR(Math.abs(b.balance))})
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                {errors.receiver && (
                  <Text style={styles.errorText}>{errors.receiver}</Text>
                )}

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

                <Text style={styles.label}>Note (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Cash, GPay, etc."
                  placeholderTextColor={lightTheme.colors.textSoft}
                  value={note}
                  onChangeText={setNote}
                />
              </>
            )}
          </ScrollView>

          {/* Footer */}
          {usersToPay.length > 0 && (
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
                  <Text style={styles.submitButtonText}>Confirm Payment</Text>
                )}
              </Pressable>
            </View>
          )}
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
    backgroundColor: lightTheme.colors.successSoft,
    borderRadius: 8,
  },
  modalTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: lightTheme.colors.text,
  },
  modalBody: {
    padding: 20,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 40,
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
    backgroundColor: lightTheme.colors.success,
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
});
