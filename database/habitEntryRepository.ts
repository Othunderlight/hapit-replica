import { getDatabase } from './db';
import { HabitEntry, EntryValue } from '../models/HabitEntry';

export const createOrUpdateEntry = async (
  habitId: string,
  date: Date,
  value: EntryValue,
  notes?: string
): Promise<HabitEntry> => {
  const db = await getDatabase();
  const normalizedDate = normalizeDate(date);
  const dateTimestamp = normalizedDate.getTime();
  const id = generateId();

  const existing = await getEntryByDate(habitId, normalizedDate);

  if (existing) {
    await db.runAsync(
      'UPDATE habit_entries SET value = ?, notes = ? WHERE habitId = ? AND date = ?',
      [String(value), notes || null, habitId, dateTimestamp]
    );

    return {
      ...existing,
      value,
      notes
    };
  } else {
    await db.runAsync(
      'INSERT INTO habit_entries (id, habitId, date, value, notes) VALUES (?, ?, ?, ?, ?)',
      [id, habitId, dateTimestamp, String(value), notes || null]
    );

    return {
      id,
      habitId,
      date: normalizedDate,
      value,
      notes
    };
  }
};

export const getEntryByDate = async (habitId: string, date: Date): Promise<HabitEntry | null> => {
  const db = await getDatabase();
  const normalizedDate = normalizeDate(date);
  const dateTimestamp = normalizedDate.getTime();

  const row = await db.getFirstAsync<any>(
    'SELECT * FROM habit_entries WHERE habitId = ? AND date = ?',
    [habitId, dateTimestamp]
  );

  return row ? rowToEntry(row) : null;
};

export const getEntriesForHabit = async (habitId: string): Promise<HabitEntry[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM habit_entries WHERE habitId = ? ORDER BY date DESC',
    [habitId]
  );

  return rows.map(rowToEntry);
};

export const getEntriesInDateRange = async (
  habitId: string,
  startDate: Date,
  endDate: Date
): Promise<HabitEntry[]> => {
  const db = await getDatabase();
  const start = normalizeDate(startDate).getTime();
  const end = normalizeDate(endDate).getTime();

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM habit_entries WHERE habitId = ? AND date >= ? AND date <= ? ORDER BY date ASC',
    [habitId, start, end]
  );

  return rows.map(rowToEntry);
};

export const deleteEntry = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM habit_entries WHERE id = ?', [id]);
};

export const deleteEntriesForHabit = async (habitId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM habit_entries WHERE habitId = ?', [habitId]);
};

const rowToEntry = (row: any): HabitEntry => {
  const value: EntryValue =
    row.value === 'yes' || row.value === 'no'
      ? row.value
      : parseFloat(row.value);

  return {
    id: row.id,
    habitId: row.habitId,
    date: new Date(row.date),
    value,
    notes: row.notes
  };
};

const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
