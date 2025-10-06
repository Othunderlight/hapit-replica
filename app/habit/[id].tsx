import { View, Text, StyleSheet } from 'react-native';

export default function HabitDetailsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Habit Details Screen - Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
});
