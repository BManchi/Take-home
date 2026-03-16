/**
 * TransactionDetailSheet — PRD §2.4
 *
 * Modal bottom sheet (85% height) that opens when any transaction row is tapped.
 * Editable fields: name, category, type, notes, isExcluded.
 * Uses @gorhom/bottom-sheet BottomSheetModal.
 */
import { useRef, useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { X, Check } from 'lucide-react-native';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { useAccounts } from '../../hooks/useAccounts';
import { useUIStore } from '../../stores/uiStore';
import { colors } from '../../theme/colors';
import type { TransactionType } from '../../types';

const SNAP_POINTS = ['85%'];

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'income', label: 'Income' },
  { value: 'internal_transfer', label: 'Transfer' },
];

function formatAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount >= 0 ? `+$${abs}` : `-$${abs}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TransactionDetailSheet() {
  const ref = useRef<BottomSheetModal>(null);

  const { allTransactions, updateTransaction } = useTransactions();
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { activeTransactionId, closeTransactionSheet } = useUIStore();

  const transaction = useMemo(
    () => allTransactions.find((t) => t.id === activeTransactionId) ?? null,
    [allTransactions, activeTransactionId],
  );

  const account = useMemo(
    () => accounts.find((a) => a.id === transaction?.accountId) ?? null,
    [accounts, transaction],
  );

  // Local editable state
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType>('regular');
  const [notes, setNotes] = useState('');
  const [isExcluded, setIsExcluded] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Sync local state when transaction changes
  useEffect(() => {
    if (transaction) {
      setName(transaction.merchantName);
      setCategoryId(transaction.categoryId);
      setType(transaction.type);
      setNotes(transaction.notes);
      setIsExcluded(transaction.isExcluded);
      setShowCategoryPicker(false);
    }
  }, [transaction?.id]);

  // Present/dismiss the sheet based on activeTransactionId
  useEffect(() => {
    if (activeTransactionId) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [activeTransactionId]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId],
  );

  function handleSave() {
    if (!transaction) return;
    updateTransaction(transaction.id, {
      merchantName: name,
      categoryId,
      type,
      notes,
      isExcluded,
    });
    closeTransactionSheet();
  }

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={SNAP_POINTS}
      onDismiss={closeTransactionSheet}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {transaction && (
          <>
            {/* ── Header: editable name + close ── */}
            <View style={styles.headerRow}>
              <BottomSheetTextInput
                value={name}
                onChangeText={setName}
                style={styles.nameInput}
                placeholderTextColor={colors.textTertiary}
                selectionColor={colors.accent}
              />
              <TouchableOpacity
                onPress={() => ref.current?.dismiss()}
                style={styles.closeBtn}
                hitSlop={8}
              >
                <X color={colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            {/* ── Original name (if renamed) ── */}
            {transaction.merchantName !== transaction.originalMerchantName && (
              <Text style={styles.originalName}>Original: {transaction.originalMerchantName}</Text>
            )}

            {/* ── Date · Account ── */}
            <Text style={styles.meta}>
              {formatDate(transaction.date)}
              {account ? ` · ${account.institutionName} ••${account.accountNumberMask}` : ''}
            </Text>

            {/* ── Amount ── */}
            <Text
              style={[
                styles.amount,
                { color: transaction.amount >= 0 ? colors.incomeGreen : colors.textPrimary },
              ]}
            >
              {formatAmount(transaction.amount)}
            </Text>
            {transaction.tipAmount > 0 && (
              <Text style={styles.tip}>Tip  ${transaction.tipAmount.toFixed(2)}</Text>
            )}

            <View style={styles.divider} />

            {/* ── Category row ── */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowCategoryPicker((p) => !p)}
              activeOpacity={0.7}
            >
              <Text style={styles.rowLabel}>Category</Text>
              <Text style={styles.rowValue}>
                {selectedCategory
                  ? `${selectedCategory.emoji} ${selectedCategory.name}`
                  : 'None'}{' '}
                ›
              </Text>
            </TouchableOpacity>

            {showCategoryPicker && (
              <View style={styles.categoryGrid}>
                {categories.map((cat) => {
                  const isActive = cat.id === categoryId;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        setCategoryId(cat.id);
                        setShowCategoryPicker(false);
                      }}
                      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                      <Text style={[styles.categoryName, isActive && styles.categoryNameActive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* ── Type row ── */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Type</Text>
              <View style={styles.typeRow}>
                {TYPE_OPTIONS.map(({ value, label }) => {
                  const isActive = type === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => setType(value)}
                      style={[styles.typeChip, isActive && styles.typeChipActive]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.typeChipText, isActive && styles.typeChipTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.divider} />

            {/* ── Notes ── */}
            <Text style={styles.sectionLabel}>Notes</Text>
            <BottomSheetTextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add a note..."
              placeholderTextColor={colors.textTertiary}
              multiline
              style={styles.notesInput}
              selectionColor={colors.accent}
              textAlignVertical="top"
            />

            {/* ── Exclude from budget toggle ── */}
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <Text style={styles.rowLabel}>Exclude from budget</Text>
              <Switch
                value={isExcluded}
                onValueChange={setIsExcluded}
                trackColor={{ false: colors.surfaceRaised, true: colors.accent }}
                thumbColor={colors.textPrimary}
                ios_backgroundColor={colors.input}
              />
            </View>

            {/* ── Save button ── */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Check color="#fff" size={16} />
              <Text style={styles.saveBtnText}>SAVE</Text>
            </TouchableOpacity>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.surfaceRaised,
  },
  handle: {
    backgroundColor: colors.textTertiary,
    width: 36,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameInput: {
    flex: 1,
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  closeBtn: {
    padding: 8,
  },
  originalName: {
    color: colors.textTertiary,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  amount: {
    fontSize: 34,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  tip: {
    color: colors.textTertiary,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
    marginLeft: 4,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.separator,
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.separator,
  },
  rowLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  rowValue: {
    color: colors.textSecondary,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 2,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryChipActive: {
    backgroundColor: colors.accent,
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryName: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  categoryNameActive: {
    color: '#fff',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typeChip: {
    backgroundColor: colors.input,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeChipActive: {
    backgroundColor: colors.accent,
  },
  typeChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  typeChipTextActive: {
    color: '#fff',
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: colors.input,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    minHeight: 80,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
});
