/**
 * TransactionDetailSheet — PRD §2.4
 *
 * Modal bottom sheet (85% height) that opens when any transaction row is tapped.
 * Editable fields: name, category, type, notes, isExcluded.
 * Uses @gorhom/bottom-sheet BottomSheetModal.
 */
import { useRef, useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { useAccounts } from '../../hooks/useAccounts';
import { useUIStore } from '../../stores/uiStore';
import { useColors } from '../../theme/colors';
import type { TransactionType } from '../../types';

const SNAP_POINTS = ['85%'];

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'income', label: 'Income' },
  { value: 'internal_transfer', label: 'Transfer' },
];

function formatAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return amount >= 0 ? `+$${abs}` : `-$${abs}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TransactionDetailSheet() {
  const ref = useRef<BottomSheetModal>(null);
  const colors = useColors();

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

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType>('regular');
  const [notes, setNotes] = useState('');
  const [isExcluded, setIsExcluded] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

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
    updateTransaction(transaction.id, { merchantName: name, categoryId, type, notes, isExcluded });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeTransactionSheet();
  }

  const divider = { height: 0.5, backgroundColor: colors.separator, marginVertical: 12 };
  const row = { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: colors.separator };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={SNAP_POINTS}
      onDismiss={closeTransactionSheet}
      backgroundStyle={{ backgroundColor: colors.surfaceRaised }}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary, width: 36 }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48, paddingTop: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        {transaction && (
          <>
            {/* ── Header: editable name + close ── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <BottomSheetTextInput
                value={name}
                onChangeText={setName}
                style={{ flex: 1, fontSize: 22, fontFamily: 'Inter_700Bold', color: colors.textPrimary, paddingVertical: 4, paddingHorizontal: 0 }}
                placeholderTextColor={colors.textTertiary}
                selectionColor={colors.accent}
              />
              <TouchableOpacity onPress={() => ref.current?.dismiss()} style={{ padding: 8 }} hitSlop={8}>
                <X color={colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            {transaction.merchantName !== transaction.originalMerchantName && (
              <Text style={{ color: colors.textTertiary, fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 4 }}>
                Original: {transaction.originalMerchantName}
              </Text>
            )}

            <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 8 }}>
              {formatDate(transaction.date)}
              {account ? ` · ${account.institutionName} ••${account.accountNumberMask}` : ''}
            </Text>

            <Text style={{ fontSize: 34, fontFamily: 'Inter_700Bold', marginBottom: 4, color: transaction.amount >= 0 ? colors.incomeGreen : colors.textPrimary }}>
              {formatAmount(transaction.amount)}
            </Text>
            {transaction.tipAmount > 0 && (
              <Text style={{ color: colors.textTertiary, fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 4, marginLeft: 4 }}>
                Tip  ${transaction.tipAmount.toFixed(2)}
              </Text>
            )}

            <View style={divider} />

            {/* ── Category row ── */}
            <TouchableOpacity style={row} onPress={() => setShowCategoryPicker((p) => !p)} activeOpacity={0.7}>
              <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: 'Inter_400Regular' }}>Category</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 15, fontFamily: 'Inter_400Regular' }}>
                {selectedCategory ? `${selectedCategory.emoji} ${selectedCategory.name}` : 'None'} ›
              </Text>
            </TouchableOpacity>

            {showCategoryPicker && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 10, paddingHorizontal: 2, backgroundColor: colors.surface, borderRadius: 12, marginBottom: 4 }}>
                {categories.map((cat) => {
                  const isActive = cat.id === categoryId;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => { setCategoryId(cat.id); setShowCategoryPicker(false); }}
                      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isActive ? colors.accent : colors.input, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 14, marginRight: 4 }}>{cat.emoji}</Text>
                      <Text style={{ color: isActive ? '#fff' : colors.textSecondary, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* ── Type row ── */}
            <View style={row}>
              <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: 'Inter_400Regular' }}>Type</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {TYPE_OPTIONS.map(({ value, label }) => {
                  const isActive = type === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => setType(value)}
                      style={{ backgroundColor: isActive ? colors.accent : colors.input, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: isActive ? '#fff' : colors.textSecondary, fontSize: 12, fontFamily: 'Inter_500Medium' }}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={divider} />

            {/* ── Notes ── */}
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
              Notes
            </Text>
            <BottomSheetTextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add a note..."
              placeholderTextColor={colors.textTertiary}
              multiline
              style={{ backgroundColor: colors.input, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.textPrimary, fontSize: 15, fontFamily: 'Inter_400Regular', minHeight: 80, marginBottom: 12 }}
              selectionColor={colors.accent}
              textAlignVertical="top"
            />

            {/* ── Exclude toggle ── */}
            <View style={{ ...row, borderBottomWidth: 0 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: 'Inter_400Regular' }}>Exclude from budget</Text>
              <Switch
                value={isExcluded}
                onValueChange={setIsExcluded}
                trackColor={{ false: colors.surfaceRaised, true: colors.accent }}
                thumbColor={colors.textPrimary}
                ios_backgroundColor={colors.input}
              />
            </View>

            {/* ── Save button ── */}
            <TouchableOpacity
              style={{ backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16, flexDirection: 'row', justifyContent: 'center', gap: 6 }}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Check color="#fff" size={16} />
              <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 }}>SAVE</Text>
            </TouchableOpacity>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
