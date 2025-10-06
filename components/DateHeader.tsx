import { View, Text, StyleSheet } from 'react-native';

interface DateHeaderProps {
  daysToShow?: number;
}

export const DateHeader = ({ daysToShow = 4 }: DateHeaderProps) => {
  const getDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const dayNumber = date.getDate();

      dates.push({ dayName, dayNumber, date });
    }

    return dates;
  };

  const dates = getDates();

  return (
    <View style={styles.container}>
      {dates.map((item, index) => (
        <View key={index} style={styles.dateItem}>
          <Text style={styles.dayName}>{item.dayName}</Text>
          <Text style={styles.dayNumber}>{item.dayNumber}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  dateItem: {
    alignItems: 'center',
    width: 70,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
  },
});
