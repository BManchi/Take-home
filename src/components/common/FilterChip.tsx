import { Text, TouchableOpacity } from 'react-native';

interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-full px-3 py-1.5 ${active ? 'bg-accent' : 'bg-input'}`}
    >
      <Text className={`font-sans-md text-sm ${active ? 'text-white' : 'text-secondary'}`}>
        {label} {active ? '✕' : '▾'}
      </Text>
    </TouchableOpacity>
  );
}
