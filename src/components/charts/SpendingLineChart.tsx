import { useWindowDimensions, View, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import type { DailySpend } from '../../types';
import { colors } from '../../theme/colors';

interface Props {
  data: DailySpend[];
  totalBudget: number;
}

export function SpendingLineChart({ data, totalBudget }: Props) {
  const { width } = useWindowDimensions();
  const chartWidth = width - 64; // 16px margin each side + 16px card padding each side

  // gifted-charts expects { value: number }[]
  const actualData = data.map((d) => ({ value: d.cumulativeSpent }));
  const idealData = data.map((d) => ({ value: d.idealSpend }));

  // Only show data up to the current day (non-zero cumulative or day 1)
  const lastNonZeroIdx = actualData.reduce((acc, d, i) => (d.value > 0 ? i : acc), 0);
  const trimmedActual = actualData.slice(0, lastNonZeroIdx + 1);

  if (trimmedActual.length < 2) {
    return (
      <View className="h-28 bg-surface-raised rounded-lg items-center justify-center">
        <Text className="text-tertiary text-sm">No spending data yet</Text>
      </View>
    );
  }

  return (
    <View className="overflow-hidden">
      <LineChart
        data={trimmedActual}
        data2={idealData.slice(0, trimmedActual.length)}
        width={chartWidth}
        height={112}
        color1={colors.accent}
        color2={colors.chartIdealLine}
        thickness1={2}
        thickness2={1.5}
        dashGap={4}
        dashWidth={4}
        curved
        hideDataPoints
        hideDataPoints2
        hideAxesAndRules
        backgroundColor="transparent"
        initialSpacing={0}
        spacing={chartWidth / Math.max(trimmedActual.length - 1, 1)}
        maxValue={totalBudget * 1.1}
        noOfSections={4}
        yAxisColor="transparent"
        xAxisColor="transparent"
        areaChart
        startFillColor1={colors.accent}
        endFillColor1="transparent"
        startOpacity1={0.15}
        endOpacity1={0}
      />
    </View>
  );
}
