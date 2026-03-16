import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { MonthlySpendingSummary } from '../../types';
import { useColors } from '../../theme/colors';
import { UnderConstructionModal } from '../common/UnderConstructionModal';

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
  const colors = useColors();
  return (
    <View className="items-center flex-1">
      <Text className="text-secondary dark:text-secondary-dark font-sans-md text-xs mb-1 uppercase tracking-widest">
        {label}
      </Text>
      <Text className="text-primary dark:text-primary-dark font-sans-bold text-lg">
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
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View className="bg-surface dark:bg-surface-dark mx-4 rounded-xl p-4">
        <View className="flex-row justify-between mb-4">
          <Text className="text-secondary dark:text-secondary-dark font-sans-semi text-xs uppercase tracking-widest">
            Net This Month
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text className="text-accent font-sans-md text-sm">cash flow &gt;</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row">
          <SummaryCol
            label="Income"
            value={summary.totalIncome}
            delta={summary.totalIncome - summary.priorMonthTotalIncome}
          />
          <View className="w-px bg-separator dark:bg-separator-dark" />
          <SummaryCol
            label="Spend"
            value={summary.totalSpent}
            delta={summary.totalSpent - summary.priorMonthTotalSpent}
          />
          <View className="w-px bg-separator dark:bg-separator-dark" />
          <SummaryCol
            label="Excluded"
            value={summary.totalExcluded}
          />
        </View>
      </View>

      <UnderConstructionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}
