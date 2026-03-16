import { View, Text, TouchableOpacity } from 'react-native';
import type { Transaction } from '../../types';
import { colors } from '../../theme/colors';

interface Props {
  transaction: Transaction;
  isLast?: boolean;
  onPress?: (id: string) => void;
}

function formatAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return amount >= 0 ? `+$${abs}` : `-$${abs}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

export function TransactionItem({ transaction: txn, isLast, onPress }: Props) {
  const isIncome = txn.type === 'income';
  const amountColor = isIncome ? colors.incomeGreen : colors.textPrimary;
  const needsReview = !txn.reviewed && txn.type === 'regular';
  const hasTip = txn.tipAmount > 0 && txn.reviewed;
  const dotColor = needsReview ? colors.dotReview : hasTip ? colors.dotTip : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress ? () => onPress(txn.id) : undefined}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center py-2"
      style={!isLast ? { borderBottomWidth: 0.5, borderBottomColor: colors.separator } : undefined}
    >
      {/* Review dot */}
      <View
        className="w-2 h-2 rounded-full mr-3"
        style={{ backgroundColor: dotColor }}
      />

      {/* Merchant + date */}
      <View className="flex-1">
        <Text className="text-primary font-sans text-base">{txn.merchantName}</Text>
        <Text className="text-tertiary font-sans text-xs mt-0.5">{formatDate(txn.date)}</Text>
      </View>

      {/* Amount */}
      <Text className="font-sans-md text-base" style={{ color: amountColor }}>
        {formatAmount(txn.amount)}
      </Text>
    </TouchableOpacity>
  );
}
