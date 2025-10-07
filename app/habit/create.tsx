import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useHabitStore } from '@/store/habitStore';
import { ColorPicker } from '@/components/ColorPicker';
import { FrequencyPicker } from '@/components/FrequencyPicker';
import { HabitType, Frequency } from '@/models/Habit';

export default function CreateHabitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type: HabitType }>();
  const createHabit = useHabitStore(state => state.createHabit);

  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [color, setColor] = useState('#4A9EFF');
  const [unit, setUnit] = useState('');
  const [target, setTarget] = useState('');
  const [targetType, setTargetType] = useState<'at_least' | 'at_most' | 'exactly'>('at_least');
  const [frequency, setFrequency] = useState<Frequency>({ type: 'every_day' });
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [notes, setNotes] = useState('');

  const habitType = params.type || 'yes/no';

  const getFrequencyLabel = () => {
    switch (frequency.type) {
      case 'every_day':
        return 'Every day';
      case 'every_x_days':
        return `Every ${frequency.value} days`;
      case 'x_times_per_week':
        return `${frequency.value} times per week`;
      case 'x_times_per_month':
        return `${frequency.value} times per month`;
      case 'x_times_in_y_days':
        return `${frequency.value} times in ${frequency.period} days`;
      default:
        return 'Every day';
    }
  };

  const getReminderLabel = () => {
    if (!reminderEnabled) return 'Off';
    return reminderTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a habit name');
      return;
    }

    try {
      await createHabit({
        name: name.trim(),
        question: question.trim() || `Did you ${name.toLowerCase()} today?`,
        color,
        type: habitType,
        unit: habitType === 'measurable' ? unit : undefined,
        target: habitType === 'measurable' && target ? parseFloat(target) : undefined,
        targetType: habitType === 'measurable' ? targetType : undefined,
        frequency,
        reminder: {
          isEnabled: reminderEnabled,
          time: reminderEnabled ? reminderTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : undefined,
        },
        notes: notes.trim() || undefined,
      });

      router.back();
    } catch (error) {
      console.error('Error creating habit:', error);
      alert('Failed to create habit');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create habit</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.row}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Exercise"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.colorSection}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorPreview} />
            <View style={[styles.colorBox, { backgroundColor: color }]} />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Question</Text>
          <TextInput
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            placeholder="e.g. Did you exercise today?"
            placeholderTextColor="#666"
          />
        </View>

        {habitType === 'measurable' && (
          <>
            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Unit</Text>
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="e.g. miles"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Target</Text>
                <TextInput
                  style={styles.input}
                  value={target}
                  onChangeText={setTarget}
                  placeholder="e.g. 5"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Target Type</Text>
              <View style={styles.segmentControl}>
                {(['at_least', 'at_most', 'exactly'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.segment, targetType === type && styles.segmentActive]}
                    onPress={() => setTargetType(type)}
                  >
                    <Text style={[styles.segmentText, targetType === type && styles.segmentTextActive]}>
                      {type === 'at_least' ? 'At least' : type === 'at_most' ? 'At most' : 'Exactly'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <TouchableOpacity style={styles.formGroup} onPress={() => setShowFrequencyPicker(true)}>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.selectBox}>
            <Text style={styles.selectText}>{getFrequencyLabel()}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.formGroup}
          onPress={() => {
            if (Platform.OS !== 'web') {
              setShowTimePicker(true);
            }
            setReminderEnabled(!reminderEnabled);
          }}
        >
          <Text style={styles.label}>Reminder</Text>
          <View style={styles.selectBox}>
            <Text style={styles.selectText}>{getReminderLabel()}</Text>
          </View>
        </TouchableOpacity>

        {showTimePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            is24Hour={false}
            onChange={(event, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) {
                setReminderTime(selectedDate);
                setReminderEnabled(true);
              }
            }}
          />
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="(Optional)"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.colorPickerSection}>
          <ColorPicker selectedColor={color} onColorSelect={setColor} />
        </View>
      </ScrollView>

      <FrequencyPicker
        visible={showFrequencyPicker}
        currentFrequency={frequency}
        onClose={() => setShowFrequencyPicker(false)}
        onSave={setFrequency}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  selectText: {
    color: '#fff',
    fontSize: 16,
  },
  colorSection: {
    width: 100,
  },
  colorPreview: {
    marginBottom: 8,
  },
  colorBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: '#2a2a2a',
  },
  segmentText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#fff',
  },
  colorPickerSection: {
    marginTop: 20,
    marginBottom: 40,
  },
});
