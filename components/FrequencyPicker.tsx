import { useState, useEffect } from 'react';
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
  const [everyXDays, setEveryXDays] = useState(currentFrequency.type === 'every_x_days' ? currentFrequency.value || 1 : 1);
  const [xTimesPerWeek, setXTimesPerWeek] = useState(currentFrequency.type === 'x_times_per_week' ? currentFrequency.value || 1 : 1);
  const [xTimesPerMonth, setXTimesPerMonth] = useState(currentFrequency.type === 'x_times_per_month' ? currentFrequency.value || 1 : 1);
  const [xTimesInYDaysValue, setXTimesInYDaysValue] = useState(currentFrequency.type === 'x_times_in_y_days' ? currentFrequency.value || 1 : 1);
  const [xTimesInYDaysPeriod, setXTimesInYDaysPeriod] = useState(currentFrequency.type === 'x_times_in_y_days' ? currentFrequency.period || 7 : 7);

  useEffect(() => {
    setSelectedType(currentFrequency.type);
    if (currentFrequency.type === 'every_x_days') setEveryXDays(currentFrequency.value || 1);
    if (currentFrequency.type === 'x_times_per_week') setXTimesPerWeek(currentFrequency.value || 1);
    if (currentFrequency.type === 'x_times_per_month') setXTimesPerMonth(currentFrequency.value || 1);
    if (currentFrequency.type === 'x_times_in_y_days') {
      setXTimesInYDaysValue(currentFrequency.value || 1);
      setXTimesInYDaysPeriod(currentFrequency.period || 7);
    }
  }, [visible, currentFrequency]);

  const handleSave = () => {
    let frequency: Frequency;
    switch (selectedType) {
      case 'every_x_days':
        frequency = { type: 'every_x_days', value: everyXDays };
        break;
      case 'x_times_per_week':
        frequency = { type: 'x_times_per_week', value: xTimesPerWeek };
        break;
      case 'x_times_per_month':
        frequency = { type: 'x_times_per_month', value: xTimesPerMonth };
        break;
      case 'x_times_in_y_days':
        frequency = { type: 'x_times_in_y_days', value: xTimesInYDaysValue, period: xTimesInYDaysPeriod };
        break;
      default:
        frequency = { type: 'every_day' };
    }
    onSave(frequency);
    onClose();
  };

  const renderOption = (type: FrequencyType, label: string, children?: React.ReactNode) => {
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
        {isSelected && children}
      </View>
    );
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
          {renderOption('every_x_days', 'Every', (
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={String(everyXDays)} onChangeText={(t) => setEveryXDays(parseInt(t) || 1)} keyboardType="numeric" />
              <Text style={styles.inputLabel}>days</Text>
            </View>
          ))}
          {renderOption('x_times_per_week', 'times per week', (
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={String(xTimesPerWeek)} onChangeText={(t) => setXTimesPerWeek(parseInt(t) || 1)} keyboardType="numeric" />
              <Text style={styles.inputLabel}>times per week</Text>
            </View>
          ))}
          {renderOption('x_times_per_month', 'times per month', (
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={String(xTimesPerMonth)} onChangeText={(t) => setXTimesPerMonth(parseInt(t) || 1)} keyboardType="numeric" />
              <Text style={styles.inputLabel}>times per month</Text>
            </View>
          ))}
          {renderOption('x_times_in_y_days', 'times in', (
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={String(xTimesInYDaysValue)} onChangeText={(t) => setXTimesInYDaysValue(parseInt(t) || 1)} keyboardType="numeric" />
              <Text style={styles.inputLabel}>times in</Text>
              <TextInput style={styles.input} value={String(xTimesInYDaysPeriod)} onChangeText={(t) => setXTimesInYDaysPeriod(parseInt(t) || 7)} keyboardType="numeric" />
              <Text style={styles.inputLabel}>days</Text>
            </View>
          ))}

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
