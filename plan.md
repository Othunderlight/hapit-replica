# Plan for Replicating uHabits in Expo

This document outlines a comprehensive plan to create a high-fidelity replica of the `uhabits` Kotlin-based Android application using the Expo framework with React Native and TypeScript. The goal is to match the original app's functionality, user experience, and core logic as closely as possible.

## Part 1: Core Concepts & Architecture

The foundation of the app lies in its data structure and how data flows between the database, state management, and UI.

### 1.1. Database Schema (expo-sqlite)

The database is the source of truth. We will use `expo-sqlite` to create a local database with a schema that mirrors the original `uhabits` app.

**File:** `database/db.ts`

The initialization script should create two main tables: `habits` and `habit_entries`.

```sql
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
  createdAt INTEGER NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  uuid TEXT NOT NULL UNIQUE
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
```

### 1.2. Data Models (TypeScript)

Define clear TypeScript interfaces for our core data structures. These will be used throughout the app.

**File:** `models/Habit.ts` and `models/HabitEntry.ts`

```typescript
// models/Habit.ts
export type HabitType = 'yes/no' | 'measurable';
export type TargetType = 'at_least' | 'at_most' | 'exactly';
export type FrequencyType = 'every_day' | 'every_x_days' | 'x_times_per_week' | 'x_times_per_month' | 'x_times_in_y_days';

export interface Frequency {
  type: FrequencyType;
  value?: number;
  period?: number; // For 'x_times_in_y_days'
}

export interface Reminder {
  isEnabled: boolean;
  time?: string; // e.g., "08:30"
}

export interface Habit {
  id: string;
  name: string;
  question: string;
  color: string;
  type: HabitType;
  unit?: string;
  target?: number;
  targetType?: TargetType;
  frequency: Frequency;
  reminder: Reminder;
  notes?: string;
  createdAt: Date;
  archived: boolean;
  position: number;
  uuid: string;
}

// models/HabitEntry.ts
export type EntryValue = 'yes' | 'no' | 'skip' | number;

export interface HabitEntry {
    id: string;
    habitId: string;
    date: Date;
    value: EntryValue;
    notes?: string;
}
```

### 1.3. State Management (Zustand)

Zustand will serve as our global state container, holding the habits and their entries. The store should be the single point of interaction for the UI, abstracting away the repository and database details.

**File:** `store/habitStore.ts`

The store should expose actions that call the repository methods and then update the in-memory state. This ensures the UI is always in sync with the database.

```typescript
// Example structure for the store
interface HabitState {
  habits: Habit[];
  entries: Record<string, HabitEntry[]>; // habitId -> entries
  loadHabits: () => Promise<void>;
  addOrUpdateEntry: (habitId: string, date: Date, value: EntryValue, notes?: string) => Promise<void>;
  // ... other actions
}
```

## Part 2: Core Logic Replication

This is the most critical part of the replication. The "feel" of the original app comes from its unique scoring and streak algorithms.

### 2.1. Habit Score (Habit Strength)

The original app uses an exponential moving average to calculate habit strength. This gives more weight to recent activity.

**File:** `utils/habitStats.ts`

**Formula:**
`new_score = old_score * multiplier + (current_day_value * (1 - multiplier))`

Where:
- `current_day_value` is 1 for a success, 0 for a failure. For measurable habits, it's `min(1, actual_value / target_value)`.
- `multiplier` is a decay factor based on the habit's frequency. A good starting point is `multiplier = 0.5 ^ (sqrt(frequency_per_day) / 13)`.

**Implementation Example:**

```typescript
export const calculateScore = (entries: HabitEntry[], frequency: Frequency): number => {
  // Sort entries by date ascending
  const sortedEntries = entries.sort((a, b) => a.date.getTime() - b.date.getTime());

  const freqPerDay = (() => {
    switch (frequency.type) {
      case 'every_day': return 1.0;
      case 'every_x_days': return 1.0 / (frequency.value || 1);
      case 'x_times_per_week': return (frequency.value || 1) / 7.0;
      case 'x_times_per_month': return (frequency.value || 1) / 30.0;
      default: return 1.0;
    }
  })();

  const multiplier = Math.pow(0.5, Math.sqrt(freqPerDay) / 13);
  let score = 0.0;

  if (sortedEntries.length === 0) return 0;

  let lastDate = sortedEntries[0].date;

  for (const entry of sortedEntries) {
    const daysBetween = (entry.date.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
    if (daysBetween > 0) {
      score *= Math.pow(multiplier, daysBetween);
    }

    const value = entry.value === 'yes' ? 1 : 0; // Simplified for yes/no
    score = score * multiplier + value * (1 - multiplier);
    lastDate = entry.date;
  }

  // Decay score from last entry to today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceLast = (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
  if (daysSinceLast > 0) {
      score *= Math.pow(multiplier, daysSinceLast);
  }

  return Math.round(score * 100);
};
```

### 2.2. Streaks

Streaks are calculated based on consecutive days of successful entries, respecting the habit's frequency.

**File:** `utils/habitStats.ts`

The logic involves iterating through sorted entries and checking if the gap between successful entries is within the allowed period based on the habit's frequency.

### 2.3. Automatic Checkmarks (`YES_AUTO`)

For habits that are not daily (e.g., 3 times a week), the original app automatically fills in the gaps between manual checkmarks to show that the user is on track. This is a key feature to replicate.

**File:** `store/habitStore.ts` or a dedicated utility.

This involves:
1.  Getting all `YES_MANUAL` entries.
2.  For each set of `N` successful entries (where `N` is the frequency numerator, e.g., 3), calculate the interval they fall into.
3.  If the interval is valid (e.g., `N` entries within `D` days), fill the days between the first and last entry of that group with `YES_AUTO`.
4.  The original app has a clever "snapping" algorithm to maximize streaks by slightly shifting these intervals. This is advanced but key for a 1:1 feel.

## Part 3: UI/UX and Feature Parity

The goal is to replicate the clean, minimalistic interface.

### 3.1. Main Screen (`app/index.tsx`)

-   **Layout:** A `ScrollView` or `FlatList` for the habits.
-   **Date Header:** A horizontally scrollable header showing the last `N` days. This is already partially implemented in `DateHeader.tsx`.
-   **Habit Row (`components/HabitRow.tsx`):**
    -   Left side: Habit name and color indicator. Tapping it navigates to the details screen.
    -   Right side: A horizontally synchronized scroll view containing the checkmarks for the last `N` days. This is the most complex part of this screen. All rows should scroll their checkmarks together. This can be achieved by lifting the scroll position state to the parent `index.tsx` screen.

### 3.2. Habit Details Screen (`app/habit/[id].tsx`)

This screen is a dashboard of charts. `react-native-gifted-charts` is a good choice.

-   **Overview:** Display current score, monthly/yearly change, and total completions.
-   **Score Chart:** A `LineChart` showing the habit strength over time. The data will come from a re-implementation of the `ScoreList.kt` logic.
-   **History Chart:** A `BarChart` showing completions per week or month.
-   **Calendar:** Use `react-native-calendars` to show a full-year view with custom-colored dates for completions.
-   **Best Streaks:** A custom-built horizontal bar chart to visualize the top 5 streaks.
-   **Frequency:** A custom chart to show completions by day of the week.

### 3.3. Creation/Editing Flow

-   **Type Selection (`components/HabitTypeModal.tsx`):** A modal to choose between "Yes/No" and "Measurable".
-   **Form (`app/habit/create.tsx`):**
    -   Use the existing components: `ColorPicker.tsx`, `FrequencyPicker.tsx`.
    -   Ensure all fields from the `Habit` model are present.
    -   The "Question" field should default to a sensible value based on the habit name if left blank.

## Part 4: Step-by-Step Implementation Guide

1.  **Foundation (DB & State):**
    -   [ ] Solidify the `expo-sqlite` schema in `database/db.ts`.
    -   [ ] Finalize the TypeScript models in `models/`.
    -   [ ] Implement all repository functions (`habitRepository.ts`, `entryRepository.ts`) for full CRUD operations.
    -   [ ] Flesh out the `habitStore.ts` to handle all data interactions, including loading entries for habits.

2.  **Core Logic:**
    -   [ ] **Crucial:** Re-implement the `Score.compute` logic from the original `uhabits` in `utils/habitStats.ts`.
    -   [ ] Implement the streak calculation logic.
    -   [ ] Implement the logic for `YES_AUTO` entries for non-daily habits. This is complex but essential.

3.  **UI - Main Screen:**
    -   [ ] Implement the synchronized horizontal scrolling for the checkmarks in `HabitRow.tsx` and `index.tsx`.
    -   [ ] Ensure the `DateHeader.tsx` scroll position is linked to the habit rows.
    -   [ ] Wire up the `+` button to the `HabitTypeModal`.

4.  **UI - Habit Details Screen:**
    -   [ ] Create data provider functions in `utils/habitStats.ts` that format data correctly for `react-native-gifted-charts`.
    -   [ ] Implement the Score `LineChart`.
    -   [ ] Implement the History `BarChart`.
    -   [ ] Implement the `CalendarView.tsx` with custom-marked dates.
    -   [ ] Build the custom Best Streaks and Frequency charts.

5.  **CRUD and Modals:**
    -   [ ] Complete the `app/habit/create.tsx` screen with all fields and save functionality.
    -   [ ] Implement the `app/habit/edit/[id].tsx` screen, pre-filling it with the existing habit data.
    -   [ ] Refine the `EntryModal.tsx` to handle "Yes/No", "Measurable", and "Skip" entries correctly.

6.  **Advanced Features:**
    -   [ ] Implement reminders using `expo-notifications`. This will involve scheduling daily or weekly notifications.
    -   [ ] Implement data import/export functionality. This is a lower priority.
    -   [ ] Research and plan the implementation of home-screen widgets (platform-specific, may require ejecting from Expo's managed workflow).

This plan provides a clear path forward. The most challenging aspects will be correctly replicating the scoring/streak logic and the synchronized scrolling on the main screen. Focusing on those will deliver the "feel" of the original application.
