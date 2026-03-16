import { View, Text, TouchableOpacity } from 'react-native';
import type { Transaction } from '../../types';
import { colors } from '../../theme/colors';

interface Props {
  transaction: Transaction;
  categoryEmoji: string;
  isLast?: boolean;
  onPress: (id: string) => void;
}

function formatAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount >= 0 ? `+$${abs}` : `-$${abs}`;
}

export function TransactionRow({ transaction: txn, categoryEmoji, isLast, onPress }: Props) {
  const needsReview = !txn.reviewed && txn.type === 'regular';
  const hasTip = txn.tipAmount > 0 && txn.reviewed;

  let dotColor = 'transparent';
  if (needsReview) dotColor = colors.dotReview;
  else if (hasTip) dotColor = colors.dotTip;

  const amountColor = txn.amount >= 0 ? colors.incomeGreen : colors.textPrimary;

  return (
    <TouchableOpacity
      onPress={() => onPress(txn.id)}
      className="flex-row items-center py-3 px-4"
      style={!isLast ? { borderBottomWidth: 0.5, borderBottomColor: colors.separator } : undefined}
    >
      {/* Review dot */}
      <View
        className="w-2 h-2 rounded-full mr-3"
        style={{ backgroundColor: dotColor }}
      />

      {/* Merchant + tags */}
      <View className="flex-1 mr-2">
        <Text className="text-primary font-sans text-base">{txn.merchantName}</Text>
        {txn.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-0.5">
            {txn.tags.map((tag) => (
              <View key={tag} className="bg-surface-raised rounded px-1.5 py-0.5">
                <Text className="text-tertiary text-xs">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Category emoji */}
      <Text className="text-base mr-2">{categoryEmoji}</Text>

      {/* Type badge */}
      {txn.type === 'income' && (
        <Text className="font-sans-md text-xs mr-2" style={{ color: colors.incomeGreen }}>
          [I]
        </Text>
      )}
      {txn.type === 'internal_transfer' && (
        <Text className="font-sans-md text-xs mr-2" style={{ color: colors.accent }}>
          [T]
        </Text>
      )}
      {txn.isRecurring && txn.type === 'regular' && (
        <Text className="font-sans-md text-xs mr-2" style={{ color: colors.textTertiary }}>
          [R]
        </Text>
      )}

      {/* Amount */}
      <Text className="font-sans-md text-base" style={{ color: amountColor }}>
        {formatAmount(txn.amount)}
      </Text>
    </TouchableOpacity>
  );
}
