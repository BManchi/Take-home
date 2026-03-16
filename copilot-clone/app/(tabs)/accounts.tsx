/**
 * Accounts Screen — PRD §2.5
 */
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAccounts } from '../../src/hooks/useAccounts';
import { NetWorthChart } from '../../src/components/charts/NetWorthChart';
import { useColors, getUtilizationColor } from '../../src/theme/colors';
import type { Account } from '../../src/types';

function formatCurrency(n: number) {
  const abs = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return n < 0 ? `-$${abs}` : `$${abs}`;
}

function formatPercent(p: number) {
  const sign = p >= 0 ? '+' : '';
  return `${sign}${p.toFixed(1)}%`;
}

const TIME_RANGES = ['1W', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'] as const;

const ALERT_BG_DARK  = '#2C1B0E';
const ALERT_BG_LIGHT = '#FFF3E0';

interface AccountRowProps {
  account: Account;
  change?: { delta: number; percent: number };
  isLast?: boolean;
}

function AccountRow({ account, change, isLast }: AccountRowProps) {
  const colors = useColors();
  const isCredit = account.type === 'credit_card';
  const isPositiveChange = (change?.delta ?? 0) >= 0;

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: isLast ? 0 : 0.5,
        borderBottomColor: colors.separator,
      }}
      activeOpacity={0.7}
    >
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

        {isCredit && account.creditUtilization != null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: getUtilizationColor(account.creditUtilization),
                marginRight: 4,
              }}
            />
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
              {Math.round(account.creditUtilization * 100)}% util
            </Text>
          </View>
        )}

        {!isCredit && change && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 3 }}>
            {isPositiveChange ? (
              <TrendingUp color={colors.budgetGreen} size={11} />
            ) : (
              <TrendingDown color={colors.budgetRed} size={11} />
            )}
            <Text style={{ color: isPositiveChange ? colors.budgetGreen : colors.budgetRed, fontSize: 12, fontFamily: 'Inter_500Medium' }}>
              {formatPercent(change.percent)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function AccountsScreen() {
  const colors = useColors();
  const {
    netWorth,
    totalAssets,
    totalLiabilities,
    netWorthHistory,
    netWorthChange,
    accountChanges,
    groupedAccounts,
    alertAccounts,
    netWorthTimeRange,
    setNetWorthTimeRange,
  } = useAccounts();

  const isPositive = netWorthChange.delta >= 0;
  const alertBg = colors.background === '#F2F2F7' ? ALERT_BG_LIGHT : ALERT_BG_DARK;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 22, fontFamily: 'Inter_700Bold' }}>
            Accounts
          </Text>
          <TouchableOpacity
            style={{ width: 32, height: 32, backgroundColor: colors.accent, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
            activeOpacity={0.7}
          >
            <Plus color="#fff" size={16} />
          </TouchableOpacity>
        </View>

        {/* ── Net Worth card ── */}
        <View style={{ backgroundColor: colors.surface, marginHorizontal: 16, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>
            Net Worth
          </Text>

          <Text style={{ color: colors.textPrimary, fontSize: 32, fontFamily: 'Inter_700Bold', marginBottom: 4 }}>
            {formatCurrency(netWorth)}
          </Text>

          {netWorthHistory.length >= 2 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
              {isPositive ? (
                <TrendingUp color={colors.budgetGreen} size={14} />
              ) : (
                <TrendingDown color={colors.budgetRed} size={14} />
              )}
              <Text style={{ color: isPositive ? colors.budgetGreen : colors.budgetRed, fontSize: 13, fontFamily: 'Inter_500Medium' }}>
                {isPositive ? '+' : ''}{formatCurrency(netWorthChange.delta)}{' '}
                ({formatPercent(netWorthChange.percent)})
              </Text>
            </View>
          )}

          {/* Time range selector */}
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {TIME_RANGES.map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => {
                  Haptics.selectionAsync();
                  setNetWorthTimeRange(range);
                }}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 100,
                  backgroundColor: netWorthTimeRange === range ? colors.accent : colors.input,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: netWorthTimeRange === range ? '#fff' : colors.textSecondary, fontSize: 12, fontFamily: 'Inter_500Medium' }}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <NetWorthChart data={netWorthHistory} positive={isPositive} />

          {/* Assets / Liabilities */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: colors.separator }}>
            <View>
              <Text style={{ color: colors.textTertiary, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 }}>Assets</Text>
              <Text style={{ color: colors.budgetGreen, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>{formatCurrency(totalAssets)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: colors.textTertiary, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 }}>Liabilities</Text>
              <Text style={{ color: colors.budgetRed, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>{formatCurrency(totalLiabilities)}</Text>
            </View>
          </View>
        </View>

        {/* ── Connection alerts ── */}
        {alertAccounts.map((acc) => (
          <View
            key={acc.id}
            style={{ backgroundColor: alertBg, marginHorizontal: 16, borderRadius: 12, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.budgetLightOrange, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
                ⚠ {acc.institutionName}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>stopped syncing data</Text>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: colors.budgetLightOrange, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}
              activeOpacity={0.7}
            >
              <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>REVERIFY</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* ── Account type sections ── */}
        {groupedAccounts.map(({ label, accounts, total }) => (
          <View
            key={label}
            style={{ backgroundColor: colors.surface, marginHorizontal: 16, borderRadius: 12, padding: 16, marginBottom: 12 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                {label}
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: 'Inter_700Bold' }}>
                {formatCurrency(total)}
              </Text>
            </View>

            {accounts.map((acc, idx) => (
              <AccountRow
                key={acc.id}
                account={acc}
                change={accountChanges[acc.id]}
                isLast={idx === accounts.length - 1}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
