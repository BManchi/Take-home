/**
 * Recurrings Screen
 *
 * PRD Navigation Map — Tab 5. Shows recurring transactions in list or grid view.
 * Sections: This Month (paid / unpaid), In the Future, Paused, Archived.
 *
 * Build task: implement RecurringCard, list/grid toggle, and CreateRecurringSheet.
 */
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useAccountStore } from '../../src/stores/accountStore';
import { colors } from '../../src/theme/colors';

function formatCurrency(n: number) {
  return `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RecurringsScreen() {
  const { recurrings } = useAccountStore();

  const active = recurrings.filter((r) => r.status === 'active');
  const paused = recurrings.filter((r) => r.status === 'paused');

  const totalMonthly = active
    .filter((r) => r.frequency === 'monthly')
    .reduce((s, r) => s + Math.abs(r.expectedAmount), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }}>
          <View>
            <Text style={{ color: colors.textPrimary, fontSize: 22, fontFamily: 'Inter_700Bold' }}>Recurrings</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
              {formatCurrency(totalMonthly)}/mo · {active.length} active
            </Text>
          </View>
          <TouchableOpacity style={{ width: 32, height: 32, backgroundColor: colors.accent, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Plus color="#fff" size={16} />
          </TouchableOpacity>
        </View>

        {/* Active recurrings */}
        <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
          This Month
        </Text>
        {active.map((r) => (
          <TouchableOpacity key={r.id} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 22 }}>{r.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: 'Inter_500Medium' }}>{r.name}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
                {r.frequency.charAt(0).toUpperCase() + r.frequency.slice(1)} · day {r.expectedDayOfMonth}
              </Text>
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: 'Inter_700Bold' }}>
              {formatCurrency(r.expectedAmount)}
            </Text>
          </TouchableOpacity>
        ))}

        {paused.length > 0 && (
          <>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase', marginVertical: 10 }}>
              Paused
            </Text>
            {paused.map((r) => (
              <View key={r.id} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 8, opacity: 0.5, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 22, marginRight: 12 }}>{r.emoji}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 15, fontFamily: 'Inter_500Medium' }}>{r.name}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
