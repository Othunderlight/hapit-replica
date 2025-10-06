import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useHabitStore } from '@/store/habitStore';

export default function RootLayout() {
  useFrameworkReady();
  const loadHabits = useHabitStore(state => state.loadHabits);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="habit/[id]" />
        <Stack.Screen name="habit/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="habit/edit/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
