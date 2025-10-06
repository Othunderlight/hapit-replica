import { View, Text, StyleSheet } from 'react-native';

export default function CreateHabitScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create Habit Screen - Coming Soon</Text>
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
