/**
 * NetWorthChart — renders the net worth line chart on the Accounts screen.
 */
import { useWindowDimensions, View, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useColors } from '../../theme/colors';

interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  positive: boolean;
}

export function NetWorthChart({ data, positive }: Props) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const chartWidth = width - 64;

  if (data.length < 2) {
    return (
      <View
        style={{
          height: 100,
          backgroundColor: colors.surfaceRaised,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: colors.textTertiary, fontSize: 13 }}>No history available</Text>
      </View>
    );
  }

  const lineColor = positive ? colors.budgetGreen : colors.budgetRed;
  const chartData = data.map((d) => ({ value: d.value }));

  return (
    <View style={{ overflow: 'hidden' }}>
      <LineChart
        data={chartData}
        width={chartWidth}
        height={100}
        color={lineColor}
        thickness={2}
        curved
        hideDataPoints
        hideAxesAndRules
        backgroundColor="transparent"
        initialSpacing={0}
        spacing={chartWidth / Math.max(chartData.length - 1, 1)}
        yAxisColor="transparent"
        xAxisColor="transparent"
        areaChart
        startFillColor={lineColor}
        endFillColor="transparent"
        startOpacity={0.2}
        endOpacity={0}
      />
    </View>
  );
}
