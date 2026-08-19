import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import ProductRing from '../components/ProductRing';
import ProductDetailSheet from '../components/ProductDetailSheet';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';
import { COLORS } from '../theme';
import type { Product } from '../types';

export default function CabinetScreen() {
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>Chok Chok</Text>
        <Text style={styles.tagline}>my cabinet</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ProductRing products={SAMPLE_PRODUCTS} onSelect={setSelected} />
      </View>

      <ProductDetailSheet
        product={selected}
        visible={selected !== null}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  brandRow: { alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  brand: { fontSize: 24, color: COLORS.ink, fontWeight: '600' },
  tagline: { fontSize: 12, color: COLORS.sub, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
});
