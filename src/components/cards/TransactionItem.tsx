import { View, Text } from 'react-native';
import type { Transaction } from '../../types';
import { colors } from '../../theme/colors';

interface Props {
  transaction: Transaction;
  isLast?: boolean;
}

function formatAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return amount >= 0 ? `+$${abs}` : `-$${abs}`;
}

function formatDate(dateStr: string) {
  const [, , day] = dateStr.split('-');
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

export function TransactionItem({ transaction: txn, isLast }: Props) {
  const isIncome = txn.type === 'income';
  const amountColor = isIncome ? colors.incomeGreen : colors.textPrimary;

  return (
    <View
      className="flex-row items-center py-2"
      style={!isLast ? { borderBottomWidth: 0.5, borderBottomColor: colors.separator } : undefined}
    >
      {/* Review dot */}
      <View
        className="w-2 h-2 rounded-full mr-3"
        style={{ backgroundColor: colors.dotReview }}
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
    </View>
  );
}
