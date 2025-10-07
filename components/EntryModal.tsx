import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, TextInput } from 'react-native';
import { Check, X } from 'lucide-react-native';
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

  const handleSave = (newValue: EntryValue) => {
    onSave(newValue, notes || undefined);
    onClose();
  };

  const renderYesNoContent = () => (
    <View style={styles.yesNoContainer}>
      <Text style={styles.notesLabel}>Notes</Text>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="Add notes..."
        placeholderTextColor="#666"
        multiline
      />

      <View style={styles.yesNoButtons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleSave('yes')}
        >
          <Check size={48} color="#4A9EFF" strokeWidth={3} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleSave('no')}
        >
          <X size={48} color="#888" strokeWidth={3} />
        </TouchableOpacity>
      </View>
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

      <TouchableOpacity style={styles.saveButton} onPress={() => handleSave(value)}>
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
    gap: 16,
  },
  yesNoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    gap: 40,
  },
  iconButton: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
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
