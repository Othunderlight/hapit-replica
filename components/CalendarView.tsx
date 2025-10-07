import { View, Text, StyleSheet } from 'react-native';
import { Calendar, CalendarTheme } from 'react-native-calendars';
import { Habit } from '@/models/Habit';
import { HabitEntry } from '@/models/HabitEntry';

interface CalendarViewProps {
  habit: Habit;
  entries: HabitEntry[];
}

export const CalendarView = ({ habit, entries }: CalendarViewProps) => {
  const markedDates = entries.reduce((acc, entry) => {
    const dateString = new Date(entry.date).toISOString().split('T')[0];
    let color = '#3a3a3a'; // Default for 'no' or skipped

    if (entry.value === 'yes') {
      color = habit.color;
    } else if (typeof entry.value === 'number' && entry.value > 0) {
      const target = habit.target || 1;
      const completion = entry.value / target;
      if (completion >= 1) {
        color = habit.color;
      } else {
        color = `${habit.color}80`; // Add alpha for partial completion
      }
    }

    acc[dateString] = {
      customStyles: {
        container: {
          backgroundColor: color,
          borderRadius: 4,
        },
        text: {
          color: '#000',
          fontWeight: '600',
        },
      },
    };
    return acc;
  }, {} as { [key: string]: any });

  const theme: CalendarTheme = {
    backgroundColor: '#1a1a1a',
    calendarBackground: '#1a1a1a',
    textSectionTitleColor: '#888',
    selectedDayBackgroundColor: habit.color,
    selectedDayTextColor: '#000',
    todayTextColor: '#4A9EFF',
    dayTextColor: '#fff',
    textDisabledColor: '#444',
    dotColor: habit.color,
    selectedDotColor: '#fff',
    arrowColor: '#4A9EFF',
    disabledArrowColor: '#444',
    monthTextColor: '#fff',
    indicatorColor: 'blue',
    textDayFontWeight: '300',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '300',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 14,
  };

  return (
    <View style={styles.container}>
      <Calendar
        markingType={'custom'}
        markedDates={markedDates}
        theme={theme}
        style={styles.calendar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendar: {
    borderRadius: 8,
  },
});
