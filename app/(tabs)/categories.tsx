/**
 * Categories Screen
 *
 * PRD §2.2 — Shows CategorySummaryChart, CategoryGroupHeaders, CategoryRows,
 * and the CategoryDetailSheet bottom sheet.
 *
 * Build task: implement CategoryRow, CategoryProgressBar, and CategoryDetailSheet
 * as components in src/components/cards/ and src/components/common/.
 */
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useCategories } from '../../src/hooks/useCategories';
import { useUIStore } from '../../src/stores/uiStore';
import { colors } from '../../src/theme/colors';

function formatCurrency(n: number) {
  return `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export default function CategoriesScreen() {
  const { categoriesBySpend, groups, totalBudget, totalSpent, categorySpending } = useCategories();
  const { selectedMonth, goToPrevMonth, goToNextMonth } = useUIStore();

  const overallRatio = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 }}>
        <TouchableOpacity onPress={goToPrevMonth} style={{ padding: 8 }}>
          <ChevronLeft color={colors.textSecondary} size={20} />
        </TouchableOpacity>
        <Text style={{ color: colors.textPrimary, fontSize: 17, fontFamily: 'Inter_600SemiBold', marginHorizontal: 12 }}>
          {formatMonth(selectedMonth)}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={{ padding: 8 }}>
          <ChevronRight color={colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        {/* Summary chart */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 22, fontFamily: 'Inter_700Bold' }}>
              {formatCurrency(totalSpent)}
              <Text style={{ color: colors.textSecondary, fontSize: 15, fontFamily: 'Inter_400Regular' }}> / {formatCurrency(totalBudget)}</Text>
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, fontFamily: 'Inter_500Medium', alignSelf: 'flex-end' }}>
              {Math.round(overallRatio * 100)}%
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: colors.surfaceRaised, borderRadius: 4 }}>
            <View style={{ height: 8, width: `${overallRatio * 100}%`, backgroundColor: colors.budgetGreen, borderRadius: 4 }} />
          </View>
        </View>

        {/* Category rows */}
        {categoriesBySpend.map((category) => {
          const spent = categorySpending[category.id] ?? 0;
          const budget = category.budgetAmount ?? 0;
          const ratio = budget > 0 ? Math.min(spent / budget, 1) : 0;
          const remaining = budget - spent;

          return (
            <TouchableOpacity
              key={category.id}
              style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 8 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: category.color + '33', marginRight: 10,
                  }}>
                    <Text style={{ fontSize: 20 }}>{category.emoji}</Text>
                  </View>
                  <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: 'Inter_500Medium' }}>
                    {category.name}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
                    {formatCurrency(spent)}
                  </Text>
                  {budget > 0 && (
                    <Text style={{ color: remaining >= 0 ? colors.textSecondary : colors.budgetRed, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
                      {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                    </Text>
                  )}
                </View>
              </View>
              {budget > 0 && (
                <View style={{ height: 6, backgroundColor: colors.surfaceRaised, borderRadius: 3 }}>
                  <View style={{ height: 6, width: `${ratio * 100}%`, backgroundColor: colors.budgetGreen, borderRadius: 3 }} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
