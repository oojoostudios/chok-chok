import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { CATEGORY } from '../theme';
import type { Product } from '../types';
import Silhouette from './Silhouette';
import { formFor } from '../data/formDefaults';

export default function ProductCard({ product, width, height }:{
  product: Product; width: number; height: number;
}) {
  const cat = CATEGORY[product.category] ?? CATEGORY.other;
  return (
    <View style={[styles.card, { width, height, backgroundColor: cat.bg }]}>
      <View style={styles.tag}>
        <Text style={[styles.tagText, { color: cat.ink }]}>{cat.label.toUpperCase()}</Text>
      </View>

      <View style={styles.imageWrap}>
        {product.photoUri ? (
          <Image source={{ uri: product.photoUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <Silhouette form={formFor(product)} color={cat.tint} width={64} height={96} />
        )}
      </View>

      <Text style={[styles.name, { color: cat.ink }]} numberOfLines={1}>{product.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  tag: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tagText: { fontSize: 9, letterSpacing: 0.6, fontWeight: '600' },
  imageWrap: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  image: { width: '80%', height: '80%' },
  name: { fontSize: 14, fontWeight: '600', marginTop: 8 },
});
