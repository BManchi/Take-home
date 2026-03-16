import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useCategories } from '../../hooks/useCategories';
import type { Transaction, TransactionType } from '../../types';
import { useColors } from '../../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (txn: Transaction) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const TYPES: { key: TransactionType; label: string }[] = [
  { key: 'regular', label: 'Regular' },
  { key: 'income', label: 'Income' },
  { key: 'internal_transfer', label: 'Transfer' },
];

export function AddTransactionSheet({ visible, onClose, onSubmit }: Props) {
  const colors = useColors();
  const { categories } = useCategories();

  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today());
  const [type, setType] = useState<TransactionType>('regular');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [showCategoryList, setShowCategoryList] = useState(false);

  function resetForm() {
    setMerchant('');
    setAmount('');
    setDate(today());
    setType('regular');
    setCategoryId(null);
    setShowCategoryList(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit() {
    const parsedAmount = parseFloat(amount);
    if (!merchant.trim() || isNaN(parsedAmount)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const txn: Transaction = {
      id: `manual-${Date.now()}`,
      accountId: 'acc-01',
      date,
      originalDate: date,
      merchantName: merchant.trim(),
      originalMerchantName: merchant.trim(),
      amount: type === 'income' ? Math.abs(parsedAmount) : -Math.abs(parsedAmount),
      originalAmount: type === 'income' ? Math.abs(parsedAmount) : -Math.abs(parsedAmount),
      tipAmount: 0,
      type,
      categoryId,
      reviewed: true,
      isRecurring: false,
      recurringId: null,
      tags: [],
      notes: '',
      isExcluded: false,
      isSplit: false,
      splitParentId: null,
      splitChildren: [],
      isManual: true,
      currencyCode: 'USD',
      originalCurrencyCode: null,
      originalCurrencyAmount: null,
    };

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit(txn);
    resetForm();
  }

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const inputStyle = {
    backgroundColor: colors.input,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="formSheet"
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: colors.surfaceRaised }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ color: colors.textPrimary, fontFamily: 'Inter_700Bold', fontSize: 20 }}>Add Transaction</Text>
          <TouchableOpacity onPress={handleClose} style={{ padding: 8 }}>
            <X color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }} keyboardShouldPersistTaps="handled">
          {/* Merchant */}
          <TextInput
            style={inputStyle}
            placeholder="Merchant name"
            placeholderTextColor={colors.textTertiary}
            value={merchant}
            onChangeText={setMerchant}
          />

          {/* Amount */}
          <TextInput
            style={inputStyle}
            placeholder="Amount"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          {/* Date */}
          <TextInput
            style={inputStyle}
            placeholder="Date (YYYY-MM-DD)"
            placeholderTextColor={colors.textTertiary}
            value={date}
            onChangeText={setDate}
          />

          {/* Type toggles */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {TYPES.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                onPress={() => setType(key)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: type === key ? colors.accent : colors.input,
                }}
              >
                <Text style={{ color: type === key ? '#fff' : colors.textSecondary, fontFamily: 'Inter_500Medium', fontSize: 14 }}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category picker */}
          <TouchableOpacity
            style={{ ...inputStyle, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            onPress={() => setShowCategoryList((v) => !v)}
          >
            <Text style={{ color: colors.textPrimary, fontFamily: 'Inter_400Regular', fontSize: 16 }}>
              {selectedCategory ? `${selectedCategory.emoji} ${selectedCategory.name}` : 'Select category'}
            </Text>
            <Text style={{ color: colors.textSecondary }}>{showCategoryList ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showCategoryList && (
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => { setCategoryId(cat.id); setShowCategoryList(false); }}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.separator }}
                  >
                    <Text style={{ fontSize: 16, marginRight: 8 }}>{cat.emoji}</Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: categoryId === cat.id ? colors.accent : colors.textPrimary }}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{ backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 32 }}
          >
            <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16 }}>Add Transaction</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
