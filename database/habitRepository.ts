import { getDatabase } from './db';
import { Habit, HabitType, FrequencyType, TargetType } from '../models/Habit';

export const createHabit = async (habit: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> => {
  const db = await getDatabase();
  const id = generateId();
  const createdAt = new Date();

  await db.runAsync(
    `INSERT INTO habits (
      id, name, question, color, type, unit, target, targetType,
      frequencyType, frequencyValue, frequencyPeriod,
      reminderEnabled, reminderTime, notes, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      habit.name,
      habit.question,
      habit.color,
      habit.type,
      habit.unit || null,
      habit.target || null,
      habit.targetType || null,
      habit.frequency.type,
      habit.frequency.value || null,
      habit.frequency.period || null,
      habit.reminder.isEnabled ? 1 : 0,
      habit.reminder.time || null,
      habit.notes || null,
      createdAt.getTime()
    ]
  );

  return {
    ...habit,
    id,
    createdAt
  };
};

export const getAllHabits = async (): Promise<Habit[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM habits ORDER BY createdAt DESC');

  return rows.map(rowToHabit);
};

export const getHabitById = async (id: string): Promise<Habit | null> => {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM habits WHERE id = ?', [id]);

  return row ? rowToHabit(row) : null;
};

export const updateHabit = async (id: string, updates: Partial<Habit>): Promise<void> => {
  const db = await getDatabase();
  const habit = await getHabitById(id);

  if (!habit) {
    throw new Error(`Habit with id ${id} not found`);
  }

  const merged = { ...habit, ...updates };

  await db.runAsync(
    `UPDATE habits SET
      name = ?, question = ?, color = ?, type = ?,
      unit = ?, target = ?, targetType = ?,
      frequencyType = ?, frequencyValue = ?, frequencyPeriod = ?,
      reminderEnabled = ?, reminderTime = ?, notes = ?
    WHERE id = ?`,
    [
      merged.name,
      merged.question,
      merged.color,
      merged.type,
      merged.unit || null,
      merged.target || null,
      merged.targetType || null,
      merged.frequency.type,
      merged.frequency.value || null,
      merged.frequency.period || null,
      merged.reminder.isEnabled ? 1 : 0,
      merged.reminder.time || null,
      merged.notes || null,
      id
    ]
  );
};

export const deleteHabit = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
};

const rowToHabit = (row: any): Habit => {
  return {
    id: row.id,
    name: row.name,
    question: row.question,
    color: row.color,
    type: row.type as HabitType,
    unit: row.unit,
    target: row.target,
    targetType: row.targetType as TargetType | undefined,
    frequency: {
      type: row.frequencyType as FrequencyType,
      value: row.frequencyValue,
      period: row.frequencyPeriod
    },
    reminder: {
      isEnabled: row.reminderEnabled === 1,
      time: row.reminderTime
    },
    notes: row.notes,
    createdAt: new Date(row.createdAt)
  };
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
