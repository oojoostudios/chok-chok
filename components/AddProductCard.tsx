import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Leads the carousel and doubles as the empty state for a cabinet with
// no products yet. Same dimensions as ProductCard, no role color.
export default function AddProductCard({ width, height }: { width: number; height: number }) {
  return (
    <View style={[styles.card, { width, height }]}>
      <View style={styles.circle}>
        <Text style={styles.plus}>+</Text>
      </View>
      <Text style={styles.label}>Add product</Text>
      <Text style={styles.sub}>Start your cabinet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C3B7AE',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  circle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#E4DAD2', alignItems: 'center', justifyContent: 'center' },
  plus: { fontSize: 30, lineHeight: 34, color: '#8A7D75', fontWeight: '300' },
  label: { fontSize: 14, fontWeight: '600', color: '#3A322E', marginTop: 14 },
  sub: { fontSize: 12, color: '#8A7D75', marginTop: 3 },
});
