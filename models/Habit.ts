export type HabitType = 'yes/no' | 'measurable';
export type TargetType = 'at_least' | 'at_most' | 'exactly';
export type FrequencyType = 'every_day' | 'every_x_days' | 'x_times_per_week' | 'x_times_per_month' | 'x_times_in_y_days';

export interface Frequency {
  type: FrequencyType;
  value?: number;
  period?: number;
}

export interface Reminder {
  isEnabled: boolean;
  time?: string;
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
}
