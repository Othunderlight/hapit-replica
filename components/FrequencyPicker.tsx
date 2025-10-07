import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, TextInput } from 'react-native';
import { Frequency, FrequencyType } from '@/models/Habit';

interface FrequencyPickerProps {
  visible: boolean;
  currentFrequency: Frequency;
  onClose: () => void;
  onSave: (frequency: Frequency) => void;
}

export const FrequencyPicker = ({ visible, currentFrequency, onClose, onSave }: FrequencyPickerProps) => {
  const [selectedType, setSelectedType] = useState<FrequencyType>(currentFrequency.type);
  const [value, setValue] = useState<number>(currentFrequency.value || 1);
  const [period, setPeriod] = useState<number>(currentFrequency.period || 7);

  const handleSave = () => {
    const frequency: Frequency = {
      type: selectedType,
      value: selectedType === 'every_day' ? undefined : value,
      period: selectedType === 'x_times_in_y_days' ? period : undefined,
    };
    onSave(frequency);
    onClose();
  };

  const renderOption = (type: FrequencyType, label: string, showValue: boolean = false, showPeriod: boolean = false) => {
    const isSelected = selectedType === type;

    return (
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={styles.radioRow}
          onPress={() => setSelectedType(type)}
        >
          <View style={styles.radioButton}>
            {isSelected && <View style={styles.radioButtonSelected} />}
          </View>
          <Text style={styles.optionText}>{label}</Text>
        </TouchableOpacity>

        {isSelected && showValue && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={String(value)}
              onChangeText={(text) => setValue(parseInt(text) || 1)}
              keyboardType="numeric"
            />
            {showPeriod && (
              <>
                <Text style={styles.inputLabel}>times in</Text>
                <TextInput
                  style={styles.input}
                  value={String(period)}
                  onChangeText={(text) => setPeriod(parseInt(text) || 7)}
                  keyboardType="numeric"
                />
                <Text style={styles.inputLabel}>days</Text>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  const getFrequencyLabel = () => {
    switch (selectedType) {
      case 'every_day':
        return 'Every day';
      case 'every_x_days':
        return `Every ${value} days`;
      case 'x_times_per_week':
        return `${value} times per week`;
      case 'x_times_per_month':
        return `${value} times per month`;
      case 'x_times_in_y_days':
        return `${value} times in ${period} days`;
      default:
        return 'Every day';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {renderOption('every_day', 'Every day')}
          {renderOption('every_x_days', `Every ${value} days`, true)}
          {renderOption('x_times_per_week', `${value} times per week`, true)}
          {renderOption('x_times_per_month', `${value} times per month`, true)}
          {renderOption('x_times_in_y_days', `${value} times in ${period} days`, true, true)}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity>
        </Pressable>
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
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    gap: 16,
  },
  optionContainer: {
    gap: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4A9EFF',
  },
  optionText: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 36,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    padding: 8,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#4A9EFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
});
