import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import ProductRing from '../components/ProductRing';
import ProductDetailSheet from '../components/ProductDetailSheet';
import { loadProducts, upsertProduct } from '../productStore';
import { COLORS } from '../theme';
import type { Product } from '../types';
import type { IconId } from '../data/containerIcons';

type Filter = 'all' | 'beauty' | 'wellness';

export default function CabinetScreen() {
  const router = useRouter();
  const [all, setAll] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  // Refreshes when returning from the add-product form.
  useFocusEffect(
    React.useCallback(() => {
      loadProducts().then(setAll);
    }, [])
  );

  const products = all.filter((p) => filter === 'all' || p.type === filter);

  const changeIcon = async (productId: string, icon: IconId) => {
    const target = all.find((p) => p.id === productId);
    if (!target) return;
    const updated = { ...target, icon };
    setAll((prev) => prev.map((p) => (p.id === productId ? updated : p)));
    setSelected((prev) => (prev && prev.id === productId ? updated : prev));
    await upsertProduct(updated);
  };

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'beauty', label: 'Beauty' },
    { key: 'wellness', label: 'Wellness' },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>Dodam</Text>
        <Text style={styles.tagline}>routines worth sharing</Text>
      </View>

      <View style={styles.segment}>
        {tabs.map((t) => {
          const active = filter === t.key;
          return (
            <Pressable key={t.key} onPress={() => setFilter(t.key)} style={[styles.segItem, active && styles.segItemActive]}>
              <Text style={[styles.segText, active && styles.segTextActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ProductRing
          products={products}
          onSelect={setSelected}
          onAdd={() => router.push('/add-product')}
        />
      </View>

      <Pressable style={styles.routinesBtn} onPress={() => router.push('/routines')}>
        <Text style={styles.routinesText}>Routines ›</Text>
      </Pressable>

      <ProductDetailSheet
        product={selected}
        visible={selected !== null}
        onClose={() => setSelected(null)}
        onChangeIcon={changeIcon}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  brandRow: { alignItems: 'center', paddingTop: 8, paddingBottom: 8 },
  brand: { fontSize: 24, color: COLORS.ink, fontWeight: '600' },
  tagline: { fontSize: 12, color: COLORS.sub, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },

  segment: { flexDirection: 'row', alignSelf: 'center', backgroundColor: '#E4DAD2', borderRadius: 20, padding: 3, marginBottom: 4 },
  segItem: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 18 },
  segItemActive: { backgroundColor: COLORS.card },
  segText: { fontSize: 13, color: COLORS.sub, fontWeight: '500' },
  segTextActive: { color: COLORS.ink },

  routinesBtn: { alignSelf: 'center', marginBottom: 18, backgroundColor: COLORS.ink, borderRadius: 20, paddingHorizontal: 22, paddingVertical: 10 },
  routinesText: { color: '#F6EFEA', fontSize: 14, fontWeight: '600' },
});
