/**
 * Categories Screen — PRD §2.2
 */
import { useMemo } from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useCategories } from '../../src/hooks/useCategories';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useUIStore } from '../../src/stores/uiStore';
import { BudgetBar } from '../../src/components/common/BudgetBar';
import { CategoryBarChart } from '../../src/components/charts/CategoryBarChart';
import { CategoryDetailSheet } from '../../src/components/sheets/CategoryDetailSheet';
import { useColors, getBudgetColor } from '../../src/theme/colors';

function formatCurrency(n: number) {
  return `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function CategoriesScreen() {
  const colors = useColors();
  const { categories, categoriesBySpend, categorySpending, totalBudget, totalSpent } =
    useCategories();
  const { allTransactions } = useTransactions();
  const {
    selectedMonth,
    goToPrevMonth,
    goToNextMonth,
    activeCategoryId,
    openCategorySheet,
    closeCategorySheet,
  } = useUIStore();

  const daysInMonth = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  }, [selectedMonth]);

  const currentDay = useMemo(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7) === selectedMonth ? today.getDate() : daysInMonth;
  }, [selectedMonth, daysInMonth]);

  const barData = useMemo(
    () =>
      categoriesBySpend.slice(0, 6).map((cat) => ({
        value: categorySpending[cat.id] ?? 0,
        label: cat.emoji,
        frontColor: cat.color,
      })),
    [categoriesBySpend, categorySpending],
  );

  const barMaxValue = useMemo(
    () => Math.max(...categoriesBySpend.slice(0, 6).map((c) => c.budgetAmount ?? 0), 1),
    [categoriesBySpend],
  );

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId) ?? null,
    [categories, activeCategoryId],
  );

  const monthlyHistory = useMemo(() => {
    if (!activeCategoryId) return [];
    const monthMap: Record<string, number> = {};
    for (const txn of allTransactions) {
      if (
        txn.categoryId === activeCategoryId &&
        txn.type === 'regular' &&
        !txn.isExcluded
      ) {
        const month = txn.date.slice(0, 7);
        monthMap[month] = (monthMap[month] ?? 0) + Math.abs(txn.amount);
      }
    }
    return Object.entries(monthMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)
      .map(([month, spent]) => ({
        month,
        spent,
        budget: activeCategory?.budgetAmount ?? 0,
      }));
  }, [activeCategoryId, allTransactions, activeCategory]);

  const overallRatio = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;
  const overallBarColor = getBudgetColor(totalSpent, totalBudget, currentDay, daysInMonth);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Month selector */}
        <View className="flex-row items-center justify-center py-4">
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); goToPrevMonth(); }} className="p-2">
            <ChevronLeft color={colors.textSecondary} size={20} />
          </TouchableOpacity>
          <Text className="text-primary dark:text-primary-dark font-sans-semi text-lg mx-3">
            {formatMonth(selectedMonth)}
          </Text>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); goToNextMonth(); }} className="p-2">
            <ChevronRight color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Summary card */}
        <View className="bg-surface dark:bg-surface-dark rounded-xl p-4 mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-primary dark:text-primary-dark font-sans-bold text-xl">
              {formatCurrency(totalSpent)}
              <Text className="text-secondary dark:text-secondary-dark font-sans text-sm"> / {formatCurrency(totalBudget)}</Text>
            </Text>
            <Text className="text-secondary dark:text-secondary-dark font-sans-md text-sm self-end">
              {Math.round(overallRatio * 100)}%
            </Text>
          </View>
          <View className="h-2 bg-surface-raised dark:bg-surface-raised-dark rounded-full overflow-hidden">
            <View
              className="h-2 rounded-full"
              style={{ width: `${overallRatio * 100}%`, backgroundColor: overallBarColor }}
            />
          </View>
        </View>

        {/* Bar chart card */}
        <View className="bg-surface dark:bg-surface-dark rounded-xl p-4 mb-4">
          <Text className="text-secondary dark:text-secondary-dark font-sans-semi text-xs uppercase tracking-widest mb-3">
            Spending by Category
          </Text>
          <CategoryBarChart data={barData} maxValue={barMaxValue} />
        </View>

        {/* Empty state */}
        {categoriesBySpend.length === 0 && (
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">📊</Text>
            <Text className="text-secondary dark:text-secondary-dark font-sans text-base">No categories yet</Text>
          </View>
        )}

        {/* Category rows */}
        {categoriesBySpend.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openCategorySheet(cat.id);
            }}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark rounded-xl p-4 mb-2"
          >
            <BudgetBar
              category={cat}
              spent={categorySpending[cat.id] ?? 0}
              currentDay={currentDay}
              daysInMonth={daysInMonth}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <CategoryDetailSheet
        visible={activeCategoryId !== null}
        category={activeCategory}
        monthlyHistory={monthlyHistory}
        onClose={closeCategorySheet}
      />
    </SafeAreaView>
  );
}
