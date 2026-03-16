import { View, Text } from 'react-native';
import type { RecurringTransaction } from '../../types';

interface Props {
  recurring: RecurringTransaction;
}

function formatAmount(amount: number) {
  return `$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatShortDate(dateStr: string | null | undefined) {
  if (!dateStr) return '';
  // "2026-03-15" → "Mar 15"
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

export function UpcomingCard({ recurring: r }: Props) {
  return (
    <View className="bg-surface rounded-xl p-3.5 min-w-[116px]">
      <Text className="text-2xl mb-1.5">{r.emoji}</Text>
      <Text className="text-primary font-sans-semi text-sm mb-0.5" numberOfLines={1}>
        {r.name}
      </Text>
      <Text className="text-secondary font-sans text-xs">
        {formatShortDate(r.nextExpectedDate)}
      </Text>
      <Text className="text-primary font-sans-bold text-base mt-1">
        {formatAmount(r.expectedAmount)}
      </Text>
    </View>
  );
}
