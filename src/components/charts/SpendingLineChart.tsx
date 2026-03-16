import { useWindowDimensions, View, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import type { DailySpend } from '../../types';
import { useColors } from '../../theme/colors';

interface Props {
  data: DailySpend[];
  totalBudget: number;
  lineColor?: string;
}

export function SpendingLineChart({ data, totalBudget, lineColor }: Props) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const chartWidth = width - 64;

  const actualData = data.map((d) => ({ value: d.cumulativeSpent }));
  const idealData = data.map((d) => ({ value: d.idealSpend }));

  if (actualData.length < 2) {
    return (
      <View className="h-28 bg-surface-raised dark:bg-surface-raised-dark rounded-lg items-center justify-center">
        <Text className="text-tertiary dark:text-tertiary-dark text-sm">No spending data yet</Text>
      </View>
    );
  }

  return (
    <View className="overflow-hidden">
      <LineChart
        data={actualData}
        data2={idealData}
        width={chartWidth}
        height={112}
        color1={lineColor ?? colors.accent}
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
        spacing={chartWidth / Math.max(actualData.length - 1, 1)}
        maxValue={totalBudget * 1.1}
        noOfSections={4}
        yAxisColor="transparent"
        xAxisColor="transparent"
        areaChart
        startFillColor1={lineColor ?? colors.accent}
        endFillColor1="transparent"
        startOpacity1={0.15}
        endOpacity1={0}
      />
    </View>
  );
}
