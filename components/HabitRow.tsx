import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Habit } from '@/models/Habit';
import { HabitEntry } from '@/models/HabitEntry';

interface HabitRowProps {
  habit: Habit;
  entries: HabitEntry[];
  onDayPress: (date: Date) => void;
  onHabitPress: () => void;
  daysToShow?: number;
}

export const HabitRow = ({ habit, entries, onDayPress, onHabitPress, daysToShow = 4 }: HabitRowProps) => {
  const getDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }

    return dates;
  };

  const getEntryForDate = (date: Date): HabitEntry | undefined => {
    return entries.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === date.getTime();
    });
  };

  const renderDayStatus = (date: Date) => {
    const entry = getEntryForDate(date);

    if (habit.type === 'yes/no') {
      if (!entry) {
        return <View style={styles.emptyCircle} />;
      }

      if (entry.value === 'yes') {
        return (
          <View style={[styles.checkContainer, { backgroundColor: habit.color }]}>
            <Check size={20} color="#000" strokeWidth={3} />
          </View>
        );
      } else {
        return (
          <View style={styles.xContainer}>
            <X size={20} color="#666" strokeWidth={2} />
          </View>
        );
      }
    } else {
      if (!entry || entry.value === 0) {
        return <Text style={styles.numberValue}>0</Text>;
      }

      const value = typeof entry.value === 'number' ? entry.value : 0;
      return <Text style={[styles.numberValue, { color: habit.color }]}>{value}</Text>;
    }
  };

  const dates = getDates();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.leftSection} onPress={onHabitPress}>
        <View style={[styles.colorIndicator, { backgroundColor: habit.color }]} />
        <Text style={styles.habitName}>{habit.name}</Text>
      </TouchableOpacity>

      <View style={styles.daysContainer}>
        {dates.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dayCell}
            onPress={() => onDayPress(date)}
          >
            {renderDayStatus(date)}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '400',
    color: '#fff',
    flex: 1,
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayCell: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#444',
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
