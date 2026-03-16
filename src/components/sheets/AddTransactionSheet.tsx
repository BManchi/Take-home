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
import { colors } from '../../theme/colors';

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

const inputClass = 'bg-input rounded-xl px-4 py-3 mb-3 text-primary font-sans text-base';

export function AddTransactionSheet({ visible, onClose, onSubmit }: Props) {
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

  return (
    <Modal
      animationType="slide"
      presentationStyle="formSheet"
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-surface-raised"
      >
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <Text className="font-sans-bold text-xl text-primary">Add Transaction</Text>
          <TouchableOpacity onPress={handleClose} className="p-2">
            <X color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 pt-2" keyboardShouldPersistTaps="handled">
          {/* Merchant */}
          <TextInput
            className={inputClass}
            placeholder="Merchant name"
            placeholderTextColor={colors.textTertiary}
            value={merchant}
            onChangeText={setMerchant}
          />

          {/* Amount */}
          <TextInput
            className={inputClass}
            placeholder="Amount"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          {/* Date */}
          <TextInput
            className={inputClass}
            placeholder="Date (YYYY-MM-DD)"
            placeholderTextColor={colors.textTertiary}
            value={date}
            onChangeText={setDate}
          />

          {/* Type toggles */}
          <View className="flex-row gap-2 mb-3">
            {TYPES.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                onPress={() => setType(key)}
                className={`flex-1 items-center py-2.5 rounded-xl ${type === key ? 'bg-accent' : 'bg-input'}`}
              >
                <Text className={`font-sans-md text-sm ${type === key ? 'text-white' : 'text-secondary'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category picker */}
          <TouchableOpacity
            className="bg-input rounded-xl px-4 py-3 mb-3 flex-row justify-between items-center"
            onPress={() => setShowCategoryList((v) => !v)}
          >
            <Text className="text-primary font-sans text-base">
              {selectedCategory ? `${selectedCategory.emoji} ${selectedCategory.name}` : 'Select category'}
            </Text>
            <Text className="text-secondary">{showCategoryList ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showCategoryList && (
            <View className="bg-surface rounded-xl mb-3 overflow-hidden">
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      setCategoryId(cat.id);
                      setShowCategoryList(false);
                    }}
                    className="flex-row items-center px-4 py-3"
                    style={{ borderBottomWidth: 0.5, borderBottomColor: colors.separator }}
                  >
                    <Text className="text-base mr-2">{cat.emoji}</Text>
                    <Text className={`font-sans text-base ${categoryId === cat.id ? 'text-accent' : 'text-primary'}`}>
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
            className="bg-accent rounded-xl py-3 items-center mb-8"
          >
            <Text className="text-white font-sans-bold text-base">Add Transaction</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
