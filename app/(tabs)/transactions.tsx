/**
 * Transaction List Screen
 *
 * PRD §2.3 — Search bar, filter chips, month-grouped list with dot indicators,
 * and type badges [R] [I] [T].
 *
 * Build task: extract TransactionRow, FilterChipRow, and TransactionDetailSheet
 * into src/components/.
 */
import {
  View,
  Text,
  TextInput,
  FlatList,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { useUIStore } from '../../src/stores/uiStore';
import { colors } from '../../src/theme/colors';
import type { Transaction } from '../../src/types';

function formatAmount(n: number) {
  const formatted = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `-$${formatted}` : `+$${formatted}`;
}

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
}

function DotIndicator({ txn }: { txn: Transaction }) {
  if (!txn.reviewed && txn.type === 'regular') {
    return <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.dotReview, marginRight: 10 }} />;
  }
  if (txn.tipAmount > 0) {
    return <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.dotTip, marginRight: 10 }} />;
  }
  return <View style={{ width: 8, height: 8, marginRight: 10 }} />;
}

function TypeBadge({ type, isRecurring }: { type: string; isRecurring: boolean }) {
  if (isRecurring) return <Text style={{ color: colors.textTertiary, fontSize: 11, fontFamily: 'Inter_600SemiBold', marginLeft: 4 }}>[R]</Text>;
  if (type === 'income') return <Text style={{ color: colors.incomeGreen, fontSize: 11, fontFamily: 'Inter_600SemiBold', marginLeft: 4 }}>[I]</Text>;
  if (type === 'internal_transfer') return <Text style={{ color: colors.accent, fontSize: 11, fontFamily: 'Inter_600SemiBold', marginLeft: 4 }}>[T]</Text>;
  return null;
}

export default function TransactionsScreen() {
  const { groupedByMonth } = useTransactions();
  const { categories } = useCategoryStore();
  const { transactionFilters, setSearchQuery } = useUIStore();

  const sections = groupedByMonth.map((group) => ({
    title: `${formatMonth(group.month)}  ·  $${group.totalSpent.toFixed(0)} spent`,
    data: group.transactions,
  }));

  const getCategoryEmoji = (categoryId: string | null) =>
    categories.find((c) => c.id === categoryId)?.emoji ?? '📦';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.input, borderRadius: 10, paddingHorizontal: 12 }}>
          <TextInput
            placeholder="Search transactions..."
            placeholderTextColor={colors.textTertiary}
            value={transactionFilters.searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, color: colors.textPrimary, fontSize: 15, fontFamily: 'Inter_400Regular', paddingVertical: 10 }}
          />
        </View>
        <TouchableOpacity style={{ width: 36, height: 36, backgroundColor: colors.accent, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
          <Plus color="#fff" size={18} />
        </TouchableOpacity>
      </View>

      {/* Filter chips (placeholder row) */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 10, gap: 8 }}>
        {['Category', 'Type', 'Tags', 'Account'].map((label) => (
          <View key={label} style={{ backgroundColor: colors.input, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: 'Inter_500Medium' }}>{label} ▾</Text>
          </View>
        ))}
      </View>

      {/* Transaction list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.background }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 }}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item: txn }) => (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.separator,
            }}
          >
            <DotIndicator txn={txn} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: 'Inter_400Regular' }}>
                  {txn.merchantName}
                </Text>
                <TypeBadge type={txn.type} isRecurring={txn.isRecurring} />
              </View>
              {txn.tags.length > 0 && (
                <View style={{ flexDirection: 'row', gap: 4, marginTop: 2 }}>
                  {txn.tags.map((tag) => (
                    <View key={tag} style={{ backgroundColor: colors.surfaceRaised, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <Text style={{ fontSize: 20, marginHorizontal: 10 }}>
              {getCategoryEmoji(txn.categoryId)}
            </Text>
            <Text style={{
              color: txn.amount > 0 ? colors.incomeGreen : colors.textPrimary,
              fontSize: 15,
              fontFamily: 'Inter_600SemiBold',
            }}>
              {formatAmount(txn.amount)}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
}
