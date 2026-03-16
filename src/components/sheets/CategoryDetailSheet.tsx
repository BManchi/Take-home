import { Modal, View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { LineChart } from 'react-native-gifted-charts';
import type { Category } from '../../types';
import { colors } from '../../theme/colors';

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
  const { width } = useWindowDimensions();
  const chartWidth = width - 80;

  // History is returned newest-first; reverse for chart (oldest→newest left→right)
  const chartHistory = [...monthlyHistory].reverse();
  const chartData = chartHistory.map((m) => ({ value: m.spent }));

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-surface-raised rounded-t-3xl pt-2 px-4">
        {/* Drag handle */}
        <View className="w-10 h-1 bg-tertiary rounded-full mx-auto mt-2 mb-4" />

        {/* Header row */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-sans-bold text-2xl text-primary">
            {category?.emoji} {category?.name}
          </Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Mini line chart */}
        {chartData.length >= 2 && (
          <View className="overflow-hidden mb-4">
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
              className="flex-row justify-between py-3"
              style={{ borderBottomWidth: 0.5, borderBottomColor: colors.separator }}
            >
              <Text className="text-secondary text-sm font-sans">{formatMonthLabel(m.month)}</Text>
              <Text className="text-secondary text-sm font-sans">
                {formatCurrency(m.spent)} / {formatCurrency(m.budget)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
