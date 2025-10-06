import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';

interface HabitTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectType: (type: 'yes/no' | 'measurable') => void;
}

export const HabitTypeModal = ({ visible, onClose, onSelectType }: HabitTypeModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onSelectType('yes/no');
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.title}>Yes or No</Text>
            <Text style={styles.description}>
              e.g. Did you wake up early today? Did you exercise? Did you play chess?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onSelectType('measurable');
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.title}>Measurable</Text>
            <Text style={styles.description}>
              e.g. How many miles did you run today? How many pages did you read?
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
  },
  option: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#aaa',
    lineHeight: 22,
  },
});
