import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { lightTheme } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { createGroup } from '../../../store/groupSlice';
import { groupAPI } from '../../../api/groups/groupApi';
import { useDebounce } from '../../../hooks/useDebounce';
import type { User } from '../../../types/group';

interface AddGroupModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AddGroupModal = ({ isVisible, onClose }: AddGroupModalProps) => {
  const dispatch = useAppDispatch();
  const { isCreatingGroup } = useAppSelector(state => state.group);

  const [groupName, setGroupName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);

  useEffect(() => {
    if (!isVisible) return;

    const trimmedQuery = debouncedQuery.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    setApiError(null);

    groupAPI
      .searchMembers(trimmedQuery)
      .then(users => {
        if (!cancelled) setSearchResults(users);
      })
      .catch(error => {
        if (!cancelled) {
          setSearchResults([]);
          setApiError(
            error instanceof Error ? error.message : 'Failed to search users',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, isVisible]);

  const toggleMember = useCallback((user: User) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(m => m._id === user._id);
      return isSelected
        ? prev.filter(m => m._id !== user._id)
        : [...prev, user];
    });
  }, []);

  const removeMember = useCallback((id: string) => {
    setSelectedMembers(prev => prev.filter(m => m._id !== id));
  }, []);

  const handleClose = useCallback(() => {
    setGroupName('');
    setQuery('');
    setSearchResults([]);
    setApiError(null);
    setSelectedMembers([]);
    setValidationError(null);
    onClose();
  }, [onClose]);

  const onSubmit = useCallback(() => {
    setValidationError(null);

    if (groupName.trim().length < 4) {
      setValidationError('Group name must be greater than 3 characters');
      return;
    }
    if (selectedMembers.length === 0) {
      setValidationError('Please add at least one member');
      return;
    }

    dispatch(
      createGroup({
        name: groupName.trim(),
        members: selectedMembers.map(m => m._id),
      }),
    )
      .unwrap()
      .then(() => handleClose())
      .catch(error => setApiError(error));
  }, [groupName, selectedMembers, dispatch, handleClose]);

  const renderSearchResult = ({ item }: { item: User }) => {
    const isSelected = selectedMembers.some(m => m._id === item._id);
    return (
      <View style={styles.searchResultItem}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {item.fullName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.fullName}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
        </View>
        <Pressable
          style={[
            styles.addButton,
            isSelected ? styles.addButtonSelected : null,
          ]}
          onPress={() => toggleMember(item)}
        >
          <Text
            style={[
              styles.addButtonText,
              isSelected ? styles.addButtonTextSelected : null,
            ]}
          >
            {isSelected ? 'Added' : 'Add'}
          </Text>
        </Pressable>
      </View>
    );
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
                  name="users"
                  size={20}
                  color={lightTheme.colors.primary}
                />
              </View>
              <View>
                <Text style={styles.modalTitle}>Create Group</Text>
                <Text style={styles.modalSubtitle}>
                  Add people now or invite them later.
                </Text>
              </View>
            </View>
            <Pressable onPress={handleClose}>
              <Feather name="x" size={24} color={lightTheme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.label}>Group Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Apartment 4B"
              placeholderTextColor={lightTheme.colors.textSoft}
              value={groupName}
              onChangeText={setGroupName}
            />

            {validationError && (
              <Text style={styles.errorText}>{validationError}</Text>
            )}
            {apiError && <Text style={styles.errorText}>{apiError}</Text>}

            {selectedMembers.length > 0 && (
              <View style={styles.chipsContainer}>
                {selectedMembers.map(m => (
                  <View key={m._id} style={styles.chip}>
                    <Text style={styles.chipText}>{m.fullName}</Text>
                    <Pressable onPress={() => removeMember(m._id)}>
                      <Feather
                        name="x"
                        size={12}
                        color={lightTheme.colors.primary}
                      />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.divider} />

            <Text style={styles.label}>Search members</Text>
            <View style={styles.searchInputContainer}>
              <Feather
                name="search"
                size={16}
                color={lightTheme.colors.textMuted}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search name or email..."
                placeholderTextColor={lightTheme.colors.textSoft}
                value={query}
                onChangeText={setQuery}
              />
            </View>

            <FlatList
              data={searchResults}
              keyExtractor={item => item._id}
              renderItem={renderSearchResult}
              style={styles.searchResultsList}
              ListEmptyComponent={
                !isSearching && query.trim().length > 0 ? (
                  <Text style={styles.emptyText}>No users found.</Text>
                ) : !isSearching ? (
                  <Text style={styles.emptyText}>
                    Type a name or email to search.
                  </Text>
                ) : (
                  <></>
                )
              }
              ListHeaderComponent={
                isSearching ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator
                      size="small"
                      color={lightTheme.colors.primary}
                    />
                    <Text style={styles.loadingText}>Searching users...</Text>
                  </View>
                ) : (
                  <></>
                )
              }
            />
          </View>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.footerButton, styles.cancelButton]}
              onPress={handleClose}
              disabled={isCreatingGroup}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.footerButton, styles.createButton]}
              onPress={onSubmit}
              disabled={isCreatingGroup}
            >
              {isCreatingGroup ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.createButtonText}>Create Group</Text>
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
    gap: 16,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: lightTheme.colors.text,
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
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: lightTheme.colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  chipText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: lightTheme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: lightTheme.colors.border,
    marginVertical: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    backgroundColor: lightTheme.colors.surfaceStrong,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: lightTheme.colors.text,
    fontFamily: 'Inter-Regular',
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: lightTheme.colors.primary,
  },
  userName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: lightTheme.colors.text,
  },
  userEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: lightTheme.colors.textMuted,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: lightTheme.colors.primary,
  },
  addButtonSelected: {
    backgroundColor: lightTheme.colors.successSoft,
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#ffffff',
  },
  addButtonTextSelected: {
    color: lightTheme.colors.success,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: lightTheme.colors.textMuted,
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
  createButton: {
    backgroundColor: lightTheme.colors.primary,
  },
  createButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
});
