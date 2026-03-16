/**
 * Transactions Screen — PRD §2.3
 *
 * Search bar, filter chips, date-grouped SectionList, FAB, AddTransactionSheet.
 */
import { useMemo, useState } from 'react';
import { View, Text, TextInput, SectionList, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useCategories } from '../../src/hooks/useCategories';
import { useUIStore } from '../../src/stores/uiStore';
import { TransactionRow } from '../../src/components/cards/TransactionRow';
import { FilterChip } from '../../src/components/common/FilterChip';
import { AddTransactionSheet } from '../../src/components/sheets/AddTransactionSheet';
import { colors } from '../../src/theme/colors';
import type { Transaction } from '../../src/types';

const FAB_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function TransactionsScreen() {
  const { filteredTransactions, addTransaction, isLoading } = useTransactions();
  const { categories } = useCategories();
  const {
    transactionFilters,
    setSearchQuery,
    toggleCategoryFilter,
    toggleTypeFilter,
    clearFilters,
    openTransactionSheet,
  } = useUIStore();

  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const categoryEmojiMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.emoji])),
    [categories],
  );

  const sections = useMemo(() => {
    const dateMap: Record<string, Transaction[]> = {};
    for (const txn of filteredTransactions) {
      if (!dateMap[txn.date]) dateMap[txn.date] = [];
      dateMap[txn.date].push(txn);
    }
    return Object.entries(dateMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, txns]) => ({
        date,
        title: formatDate(date),
        data: txns,
      }));
  }, [filteredTransactions]);

  const hasActiveFilters =
    transactionFilters.categoryIds.length > 0 || transactionFilters.types.length > 0;

  const { categoryIds, types, searchQuery } = transactionFilters;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Search bar */}
      <View className="flex-row items-center px-4 py-2.5 gap-2.5">
        <View className="flex-1 flex-row items-center bg-input rounded-xl px-3">
          <Search color={colors.textTertiary} size={16} />
          <TextInput
            placeholder="Search..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-primary font-sans text-base py-2.5 ml-2"
          />
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 pb-2 gap-2 flex-row"
      >
        <FilterChip
          label="Category"
          active={categoryIds.length > 0}
          onPress={() => {
            Haptics.selectionAsync();
            setShowCategoryPicker((p) => !p);
            setShowTypePicker(false);
          }}
        />
        <FilterChip
          label="Type"
          active={types.length > 0}
          onPress={() => {
            Haptics.selectionAsync();
            setShowTypePicker((p) => !p);
            setShowCategoryPicker(false);
          }}
        />
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters} className="px-3 py-1.5 justify-center">
            <Text className="text-accent font-sans-md text-sm">Clear</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Inline category picker */}
      {showCategoryPicker && (
        <View className="bg-surface-raised mx-4 mb-2 rounded-xl overflow-hidden">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-2">
            <View className="flex-row gap-2">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => toggleCategoryFilter(cat.id)}
                  className={`flex-row items-center rounded-full px-3 py-1.5 ${
                    categoryIds.includes(cat.id) ? 'bg-accent' : 'bg-input'
                  }`}
                >
                  <Text className="text-base mr-1">{cat.emoji}</Text>
                  <Text
                    className={`font-sans-md text-sm ${
                      categoryIds.includes(cat.id) ? 'text-white' : 'text-secondary'
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Inline type picker */}
      {showTypePicker && (
        <View className="flex-row gap-2 px-4 mb-2">
          {(['regular', 'income', 'internal_transfer'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => toggleTypeFilter(t)}
              className={`flex-1 items-center py-1.5 rounded-full ${
                types.includes(t) ? 'bg-accent' : 'bg-input'
              }`}
            >
              <Text
                className={`font-sans-md text-sm ${types.includes(t) ? 'text-white' : 'text-secondary'}`}
              >
                {t === 'regular' ? 'Regular' : t === 'income' ? 'Income' : 'Transfer'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Loading state */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {/* Transaction list */}
      {!isLoading && (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section }) => (
            <View className="px-4 py-2 bg-background">
              <Text className="text-secondary font-sans-semi text-xs uppercase tracking-widest">
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item, index, section }) => (
            <TransactionRow
              transaction={item}
              categoryEmoji={categoryEmojiMap[item.categoryId ?? ''] ?? '📦'}
              isLast={index === section.data.length - 1}
              onPress={openTransactionSheet}
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-20 px-8">
              <Text className="text-4xl mb-3">🔍</Text>
              <Text className="text-primary font-sans-semi text-base mb-1">No transactions</Text>
              <Text className="text-secondary font-sans text-sm text-center">
                {hasActiveFilters || transactionFilters.searchQuery
                  ? 'Try adjusting your filters or search'
                  : 'Your transactions will appear here'}
              </Text>
            </View>
          }
          contentContainerClassName="pb-32"
        />
      )}

      {/* FAB */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setAddSheetVisible(true);
          }}
          className="w-14 h-14 bg-accent rounded-full items-center justify-center"
          style={FAB_SHADOW}
        >
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <AddTransactionSheet
        visible={addSheetVisible}
        onClose={() => setAddSheetVisible(false)}
        onSubmit={(txn) => {
          addTransaction(txn);
          setAddSheetVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
