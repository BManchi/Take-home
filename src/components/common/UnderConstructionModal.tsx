import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { useColors } from '../../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function UnderConstructionModal({ visible, onClose }: Props) {
  const colors = useColors();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 32,
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: 20,
            padding: 28,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 44, marginBottom: 12 }}>🚧</Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontFamily: 'Inter_700Bold',
              marginBottom: 8,
            }}
          >
            Under Construction
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              fontFamily: 'Inter_400Regular',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            This feature is coming soon!
          </Text>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 40,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 15,
                fontFamily: 'Inter_600SemiBold',
                letterSpacing: 0.3,
              }}
            >
              Got it
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
