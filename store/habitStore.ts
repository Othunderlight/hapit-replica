import { create } from 'zustand';
import { Habit } from '../models/Habit';
import { HabitEntry, EntryValue } from '../models/HabitEntry';
import * as habitRepo from '../database/habitRepository';
import * as entryRepo from '../database/habitEntryRepository';

interface HabitStore {
  habits: Habit[];
  entries: Record<string, HabitEntry[]>;
  isLoading: boolean;
  error: string | null;

  loadHabits: () => Promise<void>;
  loadEntriesForHabit: (habitId: string) => Promise<void>;
  createHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  addOrUpdateEntry: (habitId: string, date: Date, value: EntryValue, notes?: string) => Promise<void>;
  getHabitById: (id: string) => Habit | undefined;
  getEntriesForHabit: (habitId: string) => HabitEntry[];
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  entries: {},
  isLoading: false,
  error: null,

  loadHabits: async () => {
    try {
      set({ isLoading: true, error: null });
      const habits = await habitRepo.getAllHabits();
      set({ habits, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load habits', isLoading: false });
      console.error('Error loading habits:', error);
    }
  },

  loadEntriesForHabit: async (habitId: string) => {
    try {
      const entries = await entryRepo.getEntriesForHabit(habitId);
      set(state => ({
        entries: {
          ...state.entries,
          [habitId]: entries
        }
      }));
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  },

  createHabit: async (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    try {
      set({ isLoading: true, error: null });
      const newHabit = await habitRepo.createHabit(habitData);
      set(state => ({
        habits: [newHabit, ...state.habits],
        isLoading: false
      }));
      return newHabit;
    } catch (error) {
      set({ error: 'Failed to create habit', isLoading: false });
      throw error;
    }
  },

  updateHabit: async (id: string, updates: Partial<Habit>) => {
    try {
      set({ isLoading: true, error: null });
      await habitRepo.updateHabit(id, updates);
      set(state => ({
        habits: state.habits.map(h => (h.id === id ? { ...h, ...updates } : h)),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update habit', isLoading: false });
      throw error;
    }
  },

  deleteHabit: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await habitRepo.deleteHabit(id);
      await entryRepo.deleteEntriesForHabit(id);
      set(state => ({
        habits: state.habits.filter(h => h.id !== id),
        entries: Object.fromEntries(
          Object.entries(state.entries).filter(([key]) => key !== id)
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to delete habit', isLoading: false });
      throw error;
    }
  },

  addOrUpdateEntry: async (habitId: string, date: Date, value: EntryValue, notes?: string) => {
    try {
      const entry = await entryRepo.createOrUpdateEntry(habitId, date, value, notes);
      set(state => {
        const habitEntries = state.entries[habitId] || [];
        const existingIndex = habitEntries.findIndex(
          e => new Date(e.date).toDateString() === new Date(entry.date).toDateString()
        );

        const updatedEntries =
          existingIndex >= 0
            ? habitEntries.map((e, i) => (i === existingIndex ? entry : e))
            : [...habitEntries, entry].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              );

        return {
          entries: {
            ...state.entries,
            [habitId]: updatedEntries
          }
        };
      });
    } catch (error) {
      console.error('Error adding/updating entry:', error);
      throw error;
    }
  },

  getHabitById: (id: string) => {
    return get().habits.find(h => h.id === id);
  },

  getEntriesForHabit: (habitId: string) => {
    return get().entries[habitId] || [];
  }
}));
