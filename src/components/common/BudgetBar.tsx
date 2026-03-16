import { View, Text } from 'react-native';
import type { Category } from '../../types';
import { getBudgetColor, colors } from '../../theme/colors';

interface Props {
  category: Category;
  spent: number;
  currentDay: number;
  daysInMonth: number;
}

function formatCurrency(n: number) {
  return `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function BudgetBar({ category, spent, currentDay, daysInMonth }: Props) {
  const budget = category.budgetAmount ?? 0;
  const ratio = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const remaining = budget - spent;
  const barColor = getBudgetColor(spent, budget, currentDay, daysInMonth);

  return (
    <View className="mb-3.5">
      <View className="flex-row justify-between mb-1">
        <Text className="text-primary font-sans text-base">
          {category.emoji}{'  '}{category.name}
        </Text>
        <Text
          className="font-sans-md text-sm"
          style={{ color: remaining >= 0 ? colors.textSecondary : colors.budgetRed }}
        >
          {remaining >= 0
            ? `${formatCurrency(remaining)} left`
            : `${formatCurrency(Math.abs(remaining))} over`}
        </Text>
      </View>

      {/* Track */}
      <View className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
        {/* Fill */}
        <View
          className="h-1.5 rounded-full"
          style={{ width: `${ratio * 100}%`, backgroundColor: barColor }}
        />
      </View>
    </View>
  );
}
