import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, TextInput } from 'react-native';
import { Habit } from '@/models/Habit';
import { EntryValue } from '@/models/HabitEntry';

interface EntryModalProps {
  visible: boolean;
  habit: Habit | null;
  date: Date | null;
  currentValue?: EntryValue;
  onClose: () => void;
  onSave: (value: EntryValue, notes?: string) => void;
}

export const EntryModal = ({ visible, habit, date, currentValue, onClose, onSave }: EntryModalProps) => {
  const [value, setValue] = useState<EntryValue>('no');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (currentValue !== undefined) {
      setValue(currentValue);
    } else if (habit?.type === 'measurable') {
      setValue(0);
    } else {
      setValue('no');
    }
    setNotes('');
  }, [visible, currentValue, habit]);

  if (!habit || !date) return null;

  const handleSave = () => {
    onSave(value, notes || undefined);
    onClose();
  };

  const renderYesNoContent = () => (
    <View style={styles.yesNoContainer}>
      <TouchableOpacity
        style={[styles.yesNoButton, value === 'yes' && styles.yesNoButtonActive]}
        onPress={() => setValue('yes')}
      >
        <Text style={[styles.yesNoButtonText, value === 'yes' && styles.yesNoButtonTextActive]}>
          Yes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.yesNoButton, value === 'no' && styles.yesNoButtonActive]}
        onPress={() => setValue('no')}
      >
        <Text style={[styles.yesNoButtonText, value === 'no' && styles.yesNoButtonTextActive]}>
          No
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={onClose}
      >
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMeasurableContent = () => (
    <View style={styles.measurableContainer}>
      <Text style={styles.notesLabel}>Notes</Text>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="Add notes..."
        placeholderTextColor="#666"
        multiline
      />

      <TextInput
        style={styles.numberInput}
        value={String(value)}
        onChangeText={(text) => {
          const num = parseFloat(text) || 0;
          setValue(num);
        }}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#666"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>SAVE</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.dateText}>
            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>

          {habit.type === 'yes/no' ? renderYesNoContent() : renderMeasurableContent()}
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
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  habitName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  yesNoContainer: {
    gap: 12,
  },
  yesNoButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  yesNoButtonActive: {
    borderColor: '#4a9eff',
    backgroundColor: '#1a3a5a',
  },
  yesNoButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
  },
  yesNoButtonTextActive: {
    color: '#fff',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#888',
  },
  measurableContainer: {
    gap: 16,
  },
  notesLabel: {
    fontSize: 16,
    color: '#888',
    marginBottom: -8,
  },
  notesInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  numberInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  saveButton: {
    backgroundColor: '#4a9eff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
});
