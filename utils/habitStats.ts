import { HabitEntry } from '@/models/HabitEntry';

export interface Streak {
  startDate: Date;
  endDate: Date;
  length: number;
}

export const calculateScore = (entries: HabitEntry[], days: number): number => {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const relevantEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= now && entry.value === 'yes';
  });

  return Math.round((relevantEntries.length / days) * 100);
};

export const calculateStreaks = (entries: HabitEntry[]): Streak[] => {
  const sortedEntries = [...entries]
    .filter(e => e.value === 'yes')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedEntries.length === 0) return [];

  const streaks: Streak[] = [];
  let currentStreak: Streak = {
    startDate: new Date(sortedEntries[0].date),
    endDate: new Date(sortedEntries[0].date),
    length: 1,
  };

  for (let i = 1; i < sortedEntries.length; i++) {
    const prevDate = new Date(sortedEntries[i - 1].date);
    const currDate = new Date(sortedEntries[i].date);

    const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));

    if (dayDiff === 1) {
      currentStreak.endDate = currDate;
      currentStreak.length++;
    } else {
      streaks.push({ ...currentStreak });
      currentStreak = {
        startDate: currDate,
        endDate: currDate,
        length: 1,
      };
    }
  }

  streaks.push(currentStreak);

  return streaks.sort((a, b) => b.length - a.length);
};

export const getFrequencyByDayOfWeek = (entries: HabitEntry[]): number[] => {
  const counts = [0, 0, 0, 0, 0, 0, 0];

  entries.forEach(entry => {
    if (entry.value === 'yes') {
      const date = new Date(entry.date);
      const dayOfWeek = date.getDay();
      counts[dayOfWeek]++;
    }
  });

  return counts;
};

export const getMonthlyData = (entries: HabitEntry[], months: number = 6): { month: string; count: number }[] => {
  const now = new Date();
  const monthlyData: { month: string; count: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();

    const count = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear() &&
        entry.value === 'yes'
      );
    }).length;

    monthlyData.push({ month: `${monthName} ${year}`, count });
  }

  return monthlyData;
};
