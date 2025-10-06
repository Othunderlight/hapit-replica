import { Platform } from 'react-native';

interface Database {
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, params?: any[]) => Promise<any>;
  getFirstAsync: <T>(sql: string, params?: any[]) => Promise<T | null>;
  getAllAsync: <T>(sql: string, params?: any[]) => Promise<T[]>;
}

const DATABASE_NAME = 'uhabits.db';

let db: Database | null = null;

export const getDatabase = async (): Promise<Database> => {
  if (db) {
    return db;
  }

  if (Platform.OS === 'web') {
    db = await createInMemoryDatabase();
  } else {
    const SQLite = await import('expo-sqlite');
    const nativeDb = await SQLite.openDatabaseAsync(DATABASE_NAME);
    db = nativeDb as unknown as Database;
  }

  await initializeDatabase(db);
  return db;
};

const createInMemoryDatabase = async (): Promise<Database> => {
  const storage: { [key: string]: any[] } = {
    habits: [],
    habit_entries: []
  };

  return {
    execAsync: async (sql: string) => {
      console.log('Exec SQL (in-memory):', sql);
    },
    runAsync: async (sql: string, params?: any[]) => {
      console.log('Run SQL (in-memory):', sql, params);

      if (sql.includes('INSERT INTO habits')) {
        const habit = {
          id: params![0],
          name: params![1],
          question: params![2],
          color: params![3],
          type: params![4],
          unit: params![5],
          target: params![6],
          targetType: params![7],
          frequencyType: params![8],
          frequencyValue: params![9],
          frequencyPeriod: params![10],
          reminderEnabled: params![11],
          reminderTime: params![12],
          notes: params![13],
          createdAt: params![14]
        };
        storage.habits.push(habit);
      } else if (sql.includes('INSERT INTO habit_entries')) {
        const entry = {
          id: params![0],
          habitId: params![1],
          date: params![2],
          value: params![3],
          notes: params![4]
        };
        storage.habit_entries.push(entry);
      } else if (sql.includes('UPDATE habits')) {
        const id = params![params!.length - 1];
        const index = storage.habits.findIndex(h => h.id === id);
        if (index >= 0) {
          storage.habits[index] = {
            ...storage.habits[index],
            name: params![0],
            question: params![1],
            color: params![2],
            type: params![3],
            unit: params![4],
            target: params![5],
            targetType: params![6],
            frequencyType: params![7],
            frequencyValue: params![8],
            frequencyPeriod: params![9],
            reminderEnabled: params![10],
            reminderTime: params![11],
            notes: params![12]
          };
        }
      } else if (sql.includes('UPDATE habit_entries')) {
        const habitId = params![2];
        const date = params![3];
        const index = storage.habit_entries.findIndex(
          e => e.habitId === habitId && e.date === date
        );
        if (index >= 0) {
          storage.habit_entries[index] = {
            ...storage.habit_entries[index],
            value: params![0],
            notes: params![1]
          };
        }
      } else if (sql.includes('DELETE FROM habits')) {
        const id = params![0];
        storage.habits = storage.habits.filter(h => h.id !== id);
      } else if (sql.includes('DELETE FROM habit_entries WHERE id')) {
        const id = params![0];
        storage.habit_entries = storage.habit_entries.filter(e => e.id !== id);
      } else if (sql.includes('DELETE FROM habit_entries WHERE habitId')) {
        const habitId = params![0];
        storage.habit_entries = storage.habit_entries.filter(e => e.habitId !== habitId);
      }

      return { changes: 1 };
    },
    getFirstAsync: async <T,>(sql: string, params?: any[]): Promise<T | null> => {
      console.log('Get first SQL (in-memory):', sql, params);

      if (sql.includes('FROM habits WHERE id')) {
        return storage.habits.find(h => h.id === params![0]) as T || null;
      } else if (sql.includes('FROM habit_entries WHERE habitId')) {
        if (sql.includes('AND date')) {
          const habitId = params![0];
          const date = params![1];
          return storage.habit_entries.find(
            e => e.habitId === habitId && e.date === date
          ) as T || null;
        }
      }

      return null;
    },
    getAllAsync: async <T,>(sql: string, params?: any[]): Promise<T[]> => {
      console.log('Get all SQL (in-memory):', sql, params);

      if (sql.includes('FROM habits')) {
        return [...storage.habits].sort((a, b) => b.createdAt - a.createdAt) as T[];
      } else if (sql.includes('FROM habit_entries')) {
        if (params && params.length === 1) {
          return storage.habit_entries
            .filter(e => e.habitId === params[0])
            .sort((a, b) => b.date - a.date) as T[];
        } else if (params && params.length === 3) {
          const habitId = params[0];
          const start = params[1];
          const end = params[2];
          return storage.habit_entries
            .filter(e => e.habitId === habitId && e.date >= start && e.date <= end)
            .sort((a, b) => a.date - b.date) as T[];
        }
      }

      return [] as T[];
    }
  };
};

const initializeDatabase = async (database: Database): Promise<void> => {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      question TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT NOT NULL,
      unit TEXT,
      target REAL,
      targetType TEXT,
      frequencyType TEXT NOT NULL,
      frequencyValue INTEGER,
      frequencyPeriod INTEGER,
      reminderEnabled INTEGER NOT NULL DEFAULT 0,
      reminderTime TEXT,
      notes TEXT,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_entries (
      id TEXT PRIMARY KEY NOT NULL,
      habitId TEXT NOT NULL,
      date INTEGER NOT NULL,
      value TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (habitId) REFERENCES habits (id) ON DELETE CASCADE,
      UNIQUE(habitId, date)
    );

    CREATE INDEX IF NOT EXISTS idx_habit_entries_habitId ON habit_entries(habitId);
    CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(date);
  `);
};
