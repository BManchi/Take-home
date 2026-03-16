import { Modal, View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { LineChart } from 'react-native-gifted-charts';
import type { Category } from '../../types';
import { useColors } from '../../theme/colors';

interface Props {
  category: Category | null;
  monthlyHistory: Array<{ month: string; spent: number; budget: number }>;
  visible: boolean;
  onClose: () => void;
}

function formatMonthLabel(ym: string) {
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CategoryDetailSheet({ category, monthlyHistory, visible, onClose }: Props) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const chartWidth = width - 80;

  const chartHistory = [...monthlyHistory].reverse();
  const chartData = chartHistory.map((m) => ({ value: m.spent }));

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.surfaceRaised, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8, paddingHorizontal: 16 }}>
        {/* Drag handle */}
        <View style={{ width: 40, height: 4, backgroundColor: colors.textTertiary, borderRadius: 2, alignSelf: 'center', marginTop: 8, marginBottom: 16 }} />

        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: colors.textPrimary, fontFamily: 'Inter_700Bold', fontSize: 24 }}>
            {category?.emoji} {category?.name}
          </Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <X color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Mini line chart */}
        {chartData.length >= 2 && (
          <View style={{ overflow: 'hidden', marginBottom: 16 }}>
            <LineChart
              data={chartData}
              width={chartWidth}
              height={100}
              color={colors.accent}
              thickness={2}
              hideDataPoints={false}
              hideAxesAndRules
              backgroundColor="transparent"
              initialSpacing={0}
              spacing={chartWidth / Math.max(chartData.length - 1, 1)}
              dataPointsColor={colors.accent}
              dataPointsRadius={4}
            />
          </View>
        )}

        {/* Month rows */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {monthlyHistory.map((m) => (
            <View
              key={m.month}
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.separator }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
                {formatMonthLabel(m.month)}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
                {formatCurrency(m.spent)} / {formatCurrency(m.budget)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
