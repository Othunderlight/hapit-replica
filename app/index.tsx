import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Menu, MoveVertical as MoreVertical } from 'lucide-react-native';
import { useHabitStore } from '@/store/habitStore';
import { DateHeader } from '@/components/DateHeader';
import { HabitRow } from '@/components/HabitRow';
import { HabitTypeModal } from '@/components/HabitTypeModal';
import { EntryModal } from '@/components/EntryModal';
import { Habit } from '@/models/Habit';
import { EntryValue } from '@/models/HabitEntry';

export default function HabitsListScreen() {
  const router = useRouter();
  const { habits, entries, loadHabits, loadEntriesForHabit, addOrUpdateEntry } = useHabitStore();

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    habits.forEach(habit => {
      loadEntriesForHabit(habit.id);
    });
  }, [habits, loadEntriesForHabit]);

  const handleAddHabit = () => {
    setShowTypeModal(true);
  };

  const handleTypeSelect = (type: 'yes/no' | 'measurable') => {
    router.push({
      pathname: '/habit/create',
      params: { type }
    });
  };

  const handleDayPress = (habit: Habit, date: Date) => {
    setSelectedHabit(habit);
    setSelectedDate(date);
    setShowEntryModal(true);
  };

  const handleEntrySave = async (value: EntryValue, notes?: string) => {
    if (selectedHabit && selectedDate) {
      try {
        await addOrUpdateEntry(selectedHabit.id, selectedDate, value, notes);
      } catch (error) {
        console.error('Error saving entry:', error);
      }
    }
  };

  const handleHabitPress = (habitId: string) => {
    router.push(`/habit/${habitId}`);
  };

  const getCurrentEntry = () => {
    if (!selectedHabit || !selectedDate) return undefined;

    const habitEntries = entries[selectedHabit.id] || [];
    const normalizedDate = new Date(selectedDate);
    normalizedDate.setHours(0, 0, 0, 0);

    return habitEntries.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === normalizedDate.getTime();
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Habits</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleAddHabit}>
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Menu size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MoreVertical size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <DateHeader daysToShow={4} />

      <ScrollView style={styles.habitsList}>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to create your first habit</Text>
          </View>
        ) : (
          habits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              entries={entries[habit.id] || []}
              onDayPress={(date) => handleDayPress(habit, date)}
              onHabitPress={() => handleHabitPress(habit.id)}
              daysToShow={4}
            />
          ))
        )}
      </ScrollView>

      <HabitTypeModal
        visible={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelectType={handleTypeSelect}
      />

      <EntryModal
        visible={showEntryModal}
        habit={selectedHabit}
        date={selectedDate}
        currentValue={getCurrentEntry()?.value}
        onClose={() => setShowEntryModal(false)}
        onSave={handleEntrySave}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  habitsList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
