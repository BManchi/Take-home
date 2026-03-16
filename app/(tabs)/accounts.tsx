/**
 * Accounts Screen
 *
 * PRD §2.5 — Net worth chart, connection alerts, and account type sections
 * (credit cards, checking, savings, investments, loans, other).
 *
 * Build task: implement NetWorthChart using react-native-svg,
 * and AccountRow with credit utilization dots.
 */
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useAccounts } from '../../src/hooks/useAccounts';
import { colors, getUtilizationColor } from '../../src/theme/colors';
import type { Account } from '../../src/types';

function formatCurrency(n: number) {
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return n < 0 ? `-$${abs}` : `$${abs}`;
}

const TIME_RANGES = ['1W', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'] as const;

function AccountRow({ account }: { account: Account }) {
  return (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.separator }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: 'Inter_400Regular' }}>
          {account.institutionName} {account.accountName}
        </Text>
        <Text style={{ color: colors.textTertiary, fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 }}>
          ••{account.accountNumberMask}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
          {formatCurrency(account.balance)}
        </Text>
        {account.type === 'credit_card' && account.creditUtilization != null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: getUtilizationColor(account.creditUtilization), marginRight: 4 }} />
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
              {Math.round(account.creditUtilization * 100)}% util
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function AccountsScreen() {
  const {
    netWorth,
    totalAssets,
    totalLiabilities,
    groupedAccounts,
    alertAccounts,
    netWorthTimeRange,
    setNetWorthTimeRange,
  } = useAccounts();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 22, fontFamily: 'Inter_700Bold' }}>Accounts</Text>
          <TouchableOpacity style={{ width: 32, height: 32, backgroundColor: colors.accent, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Plus color="#fff" size={16} />
          </TouchableOpacity>
        </View>

        {/* Net Worth */}
        <View style={{ backgroundColor: colors.surface, marginHorizontal: 16, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>
            Net Worth
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 32, fontFamily: 'Inter_700Bold', marginBottom: 12 }}>
            {formatCurrency(netWorth)}
          </Text>

          {/* Time range selector */}
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
            {TIME_RANGES.map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => setNetWorthTimeRange(range)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 100,
                  backgroundColor: netWorthTimeRange === range ? colors.accent : colors.input,
                }}
              >
                <Text style={{ color: netWorthTimeRange === range ? '#fff' : colors.textSecondary, fontSize: 12, fontFamily: 'Inter_500Medium' }}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart placeholder */}
          <View style={{ height: 100, backgroundColor: colors.surfaceRaised, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.textTertiary, fontSize: 13, fontFamily: 'Inter_400Regular' }}>
              📈 NetWorthChart (TODO)
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 4 }}>
              Assets: {formatCurrency(totalAssets)}  ·  Liabilities: {formatCurrency(totalLiabilities)}
            </Text>
          </View>
        </View>

        {/* Connection alerts */}
        {alertAccounts.map((acc) => (
          <View key={acc.id} style={{ backgroundColor: '#2C1B0E', marginHorizontal: 16, borderRadius: 12, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.budgetLightOrange, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>⚠ {acc.institutionName}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>stopped syncing data</Text>
            </View>
            <TouchableOpacity style={{ backgroundColor: colors.budgetLightOrange, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>REVERIFY</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Account type sections */}
        {groupedAccounts.map(({ label, accounts, total }) => (
          <View key={label} style={{ backgroundColor: colors.surface, marginHorizontal: 16, borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                {label}
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: 'Inter_700Bold' }}>
                {formatCurrency(total)}
              </Text>
            </View>
            {accounts.map((acc) => (
              <AccountRow key={acc.id} account={acc} />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
