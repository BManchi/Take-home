/**
 * Dashboard Screen — PRD §2.1
 *
 * Sections: SpendingGraph, ToReview, Budgets, Upcoming, NetThisMonth.
 * Data: useDashboard() + useTransactions() hooks → Zustand stores.
 */
import { useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useDashboard } from '../../src/hooks/useDashboard';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useUIStore } from '../../src/stores/uiStore';
import { SpendingLineChart } from '../../src/components/charts/SpendingLineChart';
import { TransactionItem } from '../../src/components/cards/TransactionItem';
import { BudgetBar } from '../../src/components/common/BudgetBar';
import { UpcomingCard } from '../../src/components/cards/UpcomingCard';
import { NetSummaryCard } from '../../src/components/cards/NetSummaryCard';
import { UnderConstructionModal } from '../../src/components/common/UnderConstructionModal';
import { useColors, getBudgetColor } from '../../src/theme/colors';

function formatCurrency(n: number) {
  return `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function DashboardScreen() {
  const colors = useColors();
  const {
    summary,
    topBudgetCategories,
    upcomingRecurrings,
    selectedMonth,
    daysInMonth,
    goToPrevMonth,
    goToNextMonth,
  } = useDashboard();
  const { pendingReview, markAllReviewed } = useTransactions();
  const { openTransactionSheet } = useUIStore();
  const [modalVisible, setModalVisible] = useState(false);

  const today = new Date();
  const currentDay =
    today.toISOString().slice(0, 7) === selectedMonth ? today.getDate() : daysInMonth;

  const isCurrentMonth = today.toISOString().slice(0, 7) === selectedMonth;
  const paceColor = getBudgetColor(summary.totalSpent, summary.totalBudget, currentDay, daysInMonth);
  const amountColor = summary.freeToSpend >= 0 ? colors.budgetGreen : colors.budgetRed;
  const chartData = summary.dailySpending.slice(0, currentDay);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Month selector ── */}
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

        {/* ── Spending pace / balance card ── */}
        <View className="bg-surface dark:bg-surface-dark mx-4 rounded-xl p-5 mb-4">
          <Text className="text-secondary dark:text-secondary-dark font-sans-semi text-xs uppercase tracking-widest mb-1">
            {isCurrentMonth ? 'Free to Spend' : 'Balance'}
          </Text>
          <Text style={{ color: amountColor, fontFamily: 'Inter_700Bold', fontSize: 40, marginBottom: 2 }}>
            {summary.freeToSpend < 0 ? '-' : ''}{formatCurrency(summary.freeToSpend)}
          </Text>
          <Text className="text-secondary dark:text-secondary-dark font-sans text-sm" style={{ marginBottom: isCurrentMonth ? 16 : 0 }}>
            {formatCurrency(summary.totalSpent)} spent · {formatCurrency(summary.totalBudget)} budget
          </Text>
          {isCurrentMonth && (
            <SpendingLineChart
              data={chartData}
              totalBudget={summary.totalBudget}
              lineColor={paceColor}
            />
          )}
        </View>

        {/* ── To Review ── */}
        {pendingReview.length > 0 && (
          <View className="bg-surface dark:bg-surface-dark mx-4 rounded-xl p-4 mb-4">
            <View className="flex-row justify-between mb-3">
              <Text className="text-secondary dark:text-secondary-dark font-sans-semi text-xs uppercase tracking-widest">
                To Review ({pendingReview.length})
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text className="text-accent font-sans-md text-sm">view all &gt;</Text>
              </TouchableOpacity>
            </View>

            {pendingReview.slice(0, 5).map((txn, idx) => (
              <TransactionItem
                key={txn.id}
                transaction={txn}
                isLast={idx === Math.min(pendingReview.length, 5) - 1}
                onPress={openTransactionSheet}
              />
            ))}

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                markAllReviewed(pendingReview.map((t) => t.id));
              }}
              className="mt-3 py-2.5 items-center border rounded-lg"
              style={{ borderColor: colors.separator }}
            >
              <Text className="text-secondary dark:text-secondary-dark font-sans-semi text-xs uppercase tracking-widest">
                Mark All as Reviewed
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Budgets ── */}
        <View className="bg-surface dark:bg-surface-dark mx-4 rounded-xl p-4 mb-4">
          <View className="flex-row justify-between mb-3">
            <Text className="text-secondary dark:text-secondary-dark font-sans-semi text-xs uppercase tracking-widest">
              Budgets
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text className="text-accent font-sans-md text-sm">view all &gt;</Text>
            </TouchableOpacity>
          </View>

          {topBudgetCategories.map(({ category, spent }) => (
            <BudgetBar
              key={category.id}
              category={category}
              spent={spent}
              currentDay={currentDay}
              daysInMonth={daysInMonth}
            />
          ))}
        </View>

        {/* ── Upcoming recurrings ── */}
        {upcomingRecurrings.length > 0 && (
          <View className="mb-4">
            <View className="flex-row justify-between px-4 mb-2.5">
              <Text className="text-secondary dark:text-secondary-dark font-sans-semi text-xs uppercase tracking-widest">
                Upcoming
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text className="text-accent font-sans-md text-sm">view all &gt;</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="px-4 gap-x-3"
            >
              {upcomingRecurrings.map((r) => (
                <UpcomingCard key={r.id} recurring={r} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Net This Month ── */}
        <NetSummaryCard summary={summary} />
      </ScrollView>

      <UnderConstructionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}
