import React from 'react';
import { Checkbox, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

const CustomCheckbox = ({ label, checked, onPress }) => (
  <View style={styles.row}>
    <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={onPress} />
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 8,
  },
});

export default CustomCheckbox;
