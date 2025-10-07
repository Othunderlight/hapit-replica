import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Edit, MoreVertical, Bell, BellOff } from 'lucide-react-native';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { useHabitStore } from '@/store/habitStore';
import { calculateScore, calculateStreaks, getMonthlyData, getFrequencyByDayOfWeek } from '@/utils/habitStats';

const SCREEN_WIDTH = Dimensions.get('window').width;

type TimeFilter = 'Day' | 'Week' | 'Month' | 'Quarter' | 'Year';

export default function HabitDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { getHabitById, getEntriesForHabit, loadEntriesForHabit } = useHabitStore();

  const [scoreFilter, setScoreFilter] = useState<TimeFilter>('Day');
  const [historyFilter, setHistoryFilter] = useState<'Week' | 'Month'>('Month');

  const habit = getHabitById(params.id);
  const entries = getEntriesForHabit(params.id);

  useEffect(() => {
    if (params.id) {
      loadEntriesForHabit(params.id);
    }
  }, [params.id, loadEntriesForHabit]);

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Habit not found</Text>
      </View>
    );
  }

  const totalEntries = entries.filter(e => e.value === 'yes').length;
  const currentScore = calculateScore(entries, 30);
  const monthScore = calculateScore(entries, 30);
  const yearScore = calculateScore(entries, 365);
  const streaks = calculateStreaks(entries);
  const bestStreak = streaks[0];

  const getFrequencyText = () => {
    const { frequency } = habit;
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

  const getScoreChartData = () => {
    const days = scoreFilter === 'Day' ? 7 : scoreFilter === 'Week' ? 4 * 7 : scoreFilter === 'Month' ? 30 : scoreFilter === 'Quarter' ? 90 : 365;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayEntries = entries.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate.toDateString() === date.toDateString();
      });

      const value = dayEntries.length > 0 && dayEntries[0].value === 'yes' ? 100 : 0;
      data.push({ value, label: date.getDate().toString() });
    }

    return data;
  };

  const getHistoryChartData = () => {
    const monthlyData = getMonthlyData(entries, 6);
    return monthlyData.map(item => ({
      value: item.count,
      label: item.month.split(' ')[0],
      frontColor: habit.color,
    }));
  };

  const frequencyData = getFrequencyByDayOfWeek(entries);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{habit.name}</Text>
          <View style={styles.headerSubtitle}>
            <Text style={styles.frequencyText}>{getFrequencyText()}</Text>
            {habit.reminder.isEnabled ? (
              <Bell size={14} color="#888" />
            ) : (
              <BellOff size={14} color="#888" />
            )}
            <Text style={styles.reminderText}>
              {habit.reminder.isEnabled ? habit.reminder.time : 'Off'}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Edit size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MoreVertical size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewCard}>
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewValue, { color: habit.color }]}>{currentScore}%</Text>
              <Text style={styles.overviewLabel}>Score</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>+{monthScore}%</Text>
              <Text style={styles.overviewLabel}>Month</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>+{yearScore}%</Text>
              <Text style={styles.overviewLabel}>Year</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{totalEntries}</Text>
              <Text style={styles.overviewLabel}>Total</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Score</Text>
            <View style={styles.filterButtons}>
              {(['Day', 'Week', 'Month', 'Quarter', 'Year'] as TimeFilter[]).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterButton, scoreFilter === filter && styles.filterButtonActive]}
                  onPress={() => setScoreFilter(filter)}
                >
                  <Text style={[styles.filterButtonText, scoreFilter === filter && styles.filterButtonTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.chartCard}>
            <LineChart
              data={getScoreChartData()}
              width={SCREEN_WIDTH - 60}
              height={200}
              color={habit.color}
              thickness={3}
              dataPointsColor={habit.color}
              startFillColor={habit.color}
              endFillColor={habit.color}
              startOpacity={0.3}
              endOpacity={0.1}
              spacing={40}
              initialSpacing={20}
              noOfSections={4}
              yAxisColor="#3a3a3a"
              xAxisColor="#3a3a3a"
              yAxisTextStyle={{ color: '#666' }}
              xAxisLabelTextStyle={{ color: '#666', fontSize: 10 }}
              rulesColor="#2a2a2a"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>History</Text>
            <View style={styles.filterButtons}>
              {(['Month'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterButton, styles.filterButtonActive]}
                  onPress={() => setHistoryFilter(filter)}
                >
                  <Text style={[styles.filterButtonText, styles.filterButtonTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.chartCard}>
            <BarChart
              data={getHistoryChartData()}
              width={SCREEN_WIDTH - 100}
              height={200}
              barWidth={30}
              spacing={20}
              roundedTop
              noOfSections={4}
              yAxisColor="#3a3a3a"
              xAxisColor="#3a3a3a"
              yAxisTextStyle={{ color: '#666' }}
              xAxisLabelTextStyle={{ color: '#666', fontSize: 10 }}
              rulesColor="#2a2a2a"
              showValuesAsTopLabel
              topLabelTextStyle={{ color: '#666', fontSize: 10 }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calendar</Text>
          <View style={styles.calendarCard}>
            <Text style={styles.calendarPlaceholder}>Calendar heatmap view</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>EDIT</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best streaks</Text>
          <View style={styles.streaksCard}>
            {streaks.length > 0 ? (
              streaks.slice(0, 5).map((streak, index) => (
                <View key={index} style={styles.streakRow}>
                  <View style={styles.streakInfo}>
                    <Text style={styles.streakDate}>
                      {streak.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    {streak.length > 1 && (
                      <Text style={styles.streakDate}>
                        {streak.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.streakBar, { backgroundColor: habit.color, flex: streak.length / (bestStreak?.length || 1) }]}>
                    <Text style={styles.streakLength}>{streak.length}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No streaks yet</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequency</Text>
          <View style={styles.frequencyCard}>
            {dayNames.map((day, index) => (
              <View key={day} style={styles.frequencyRow}>
                <Text style={styles.frequencyDay}>{day}</Text>
                <View style={styles.frequencyDots}>
                  {Array.from({ length: Math.min(frequencyData[index], 10) }).map((_, i) => (
                    <View key={i} style={[styles.frequencyDot, { backgroundColor: habit.color }]} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  frequencyText: {
    fontSize: 12,
    color: '#888',
  },
  reminderText: {
    fontSize: 12,
    color: '#888',
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A9EFF',
    marginBottom: 12,
  },
  overviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#888',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  filterButtonActive: {
    backgroundColor: '#2a2a2a',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  chartCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  calendarCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  calendarPlaceholder: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
  },
  streaksCard: {
    gap: 12,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakInfo: {
    width: 120,
  },
  streakDate: {
    fontSize: 11,
    color: '#888',
  },
  streakBar: {
    height: 32,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  streakLength: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  frequencyCard: {
    gap: 8,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  frequencyDay: {
    fontSize: 12,
    color: '#888',
    width: 30,
  },
  frequencyDots: {
    flexDirection: 'row',
    gap: 4,
  },
  frequencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
