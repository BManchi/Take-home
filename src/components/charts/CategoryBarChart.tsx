import { useWindowDimensions, View, Text } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

interface Props {
  data: Array<{ label: string; value: number; frontColor: string }>;
  maxValue: number;
}

export function CategoryBarChart({ data, maxValue }: Props) {
  const { width } = useWindowDimensions();
  const chartWidth = width - 64;

  if (data.length === 0) {
    return (
      <View className="h-28 items-center justify-center">
        <Text className="text-tertiary text-sm">No category data</Text>
      </View>
    );
  }

  return (
    <View className="overflow-hidden">
      <BarChart
        data={data}
        width={chartWidth}
        barWidth={28}
        spacing={16}
        hideRules
        noOfSections={4}
        yAxisLabelWidth={0}
        maxValue={maxValue}
        hideAxesAndRules
        xAxisLabelTextStyle={{ color: 'transparent' }}
        renderTooltip={() => null}
      />
    </View>
  );
}
