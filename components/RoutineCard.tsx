import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Silhouette from './Silhouette';
import { COLORS, ROLE } from '../theme';
import type { Routine, Product } from '../types';

// Read-only, finished display of a routine. Used both for viewing in-app and
// (wrapped in a capture view) for sharing as an image.
// `products` is the user's cabinet so each step can resolve its product.
export default function RoutineCard({
  routine,
  products,
  forShare = false,
}: {
  routine: Routine;
  products: Product[];
  forShare?: boolean;
}) {
  const byId = (id?: string) => products.find((p) => p.id === id);
  const filled = routine.steps.filter((s) => s.productId);
  const hasWellness = filled.some((s) => byId(s.productId)?.type === 'wellness');

  return (
    <View style={[styles.card, forShare && styles.cardShare]}>
      {/* header pill */}
      <View style={styles.pill}>
        <Text style={styles.pillText}>{routine.name.toUpperCase()}</Text>
      </View>

      {routine.steps.map((step, i) => {
        const p = byId(step.productId);
        const role = p?.role ? ROLE[p.role] : null;
        const tint = role?.tint ?? COLORS.sub;
        return (
          <View key={i} style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{String(i + 1).padStart(2, '0')}</Text>
            </View>
            <Text style={styles.stepLabel}>{step.label}</Text>

            {p ? (
              <View style={styles.product}>
                <Silhouette icon={p.icon} color={tint} size={28} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.pBrand} numberOfLines={1}>
                    {p.brand}
                    {/* beauty shows timing; wellness shows timing but NOT dosage on shared cards */}
                    {p.timing ? ` · ${p.timing}` : ''}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.empty}>—</Text>
            )}
          </View>
        );
      })}

      <Text style={styles.wordmark}>Dodam</Text>
      {hasWellness && (
        <Text style={styles.disclaimer}>
          Not medical advice. Talk to your doctor or pharmacist before starting a supplement.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.bg, borderRadius: 24, padding: 22 },
  cardShare: { padding: 28, width: 380 }, // fixed width for consistent image capture
  pill: {
    alignSelf: 'center', backgroundColor: COLORS.card, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 7, marginBottom: 20,
  },
  pillText: { fontSize: 12, letterSpacing: 1.5, fontWeight: '600', color: COLORS.ink },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  stepNum: { width: 26, alignItems: 'center' },
  stepNumText: { fontSize: 12, color: COLORS.sub, fontWeight: '600' },
  stepLabel: { fontSize: 13, color: COLORS.ink, fontWeight: '600', width: 72 },
  product: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.card, borderRadius: 12, padding: 10,
  },
  pName: { fontSize: 14, color: COLORS.ink, fontWeight: '600' },
  pBrand: { fontSize: 12, color: COLORS.sub, marginTop: 1 },
  empty: { flex: 1, color: COLORS.sub, fontSize: 14 },
  wordmark: {
    textAlign: 'center', marginTop: 8, fontSize: 16, color: COLORS.ink,
    fontWeight: '600',
  },
  disclaimer: {
    marginTop: 8, fontSize: 10, color: COLORS.sub, textAlign: 'center', lineHeight: 14,
  },
});
