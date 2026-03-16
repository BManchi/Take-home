import { View, Text } from 'react-native';
import type { MonthlySpendingSummary } from '../../types';
import { colors } from '../../theme/colors';

interface Props {
  summary: MonthlySpendingSummary;
}

function formatCurrency(n: number) {
  return `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface ColProps {
  label: string;
  value: number;
  delta?: number;
}

function SummaryCol({ label, value, delta }: ColProps) {
  return (
    <View className="items-center flex-1">
      <Text className="text-secondary font-sans-md text-xs mb-1 uppercase tracking-widest">
        {label}
      </Text>
      <Text className="text-primary font-sans-bold text-lg">
        {formatCurrency(value)}
      </Text>
      {delta !== undefined && delta !== 0 && (
        <Text
          className="font-sans-md text-xs mt-0.5"
          style={{ color: delta > 0 ? colors.incomeGreen : colors.budgetRed }}
        >
          {delta > 0 ? '▲' : '▼'} {formatCurrency(Math.abs(delta))}
        </Text>
      )}
    </View>
  );
}

export function NetSummaryCard({ summary }: Props) {
  return (
    <View className="bg-surface mx-4 rounded-xl p-4">
      <View className="flex-row justify-between mb-4">
        <Text className="text-secondary font-sans-semi text-xs uppercase tracking-widest">
          Net This Month
        </Text>
        <Text className="text-accent font-sans-md text-sm">cash flow &gt;</Text>
      </View>

      <View className="flex-row">
        <SummaryCol
          label="Income"
          value={summary.totalIncome}
          delta={summary.totalIncome - summary.priorMonthTotalIncome}
        />
        <View className="w-px bg-separator" />
        <SummaryCol
          label="Spend"
          value={summary.totalSpent}
          delta={summary.totalSpent - summary.priorMonthTotalSpent}
        />
        <View className="w-px bg-separator" />
        <SummaryCol
          label="Excluded"
          value={summary.totalExcluded}
        />
      </View>
    </View>
  );
}
