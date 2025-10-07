import { View, StyleSheet, TouchableOpacity } from 'react-native';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const COLORS = [
  '#4A9EFF',
  '#5DADE2',
  '#48C9B0',
  '#58D68D',
  '#F4D03F',
  '#F39C12',
  '#E67E22',
  '#E74C3C',
  '#EC7063',
  '#AF7AC5',
  '#BB8FCE',
  '#85929E',
];

export const ColorPicker = ({ selectedColor, onColorSelect }: ColorPickerProps) => {
  return (
    <View style={styles.container}>
      {COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorOption,
            { backgroundColor: color },
            selectedColor === color && styles.selectedColor,
          ]}
          onPress={() => onColorSelect(color)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#fff',
    borderWidth: 3,
  },
});
