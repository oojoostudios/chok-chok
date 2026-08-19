import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Linking, Share } from 'react-native';
import { COLORS, CATEGORY } from '../theme';
import type { Product } from '../types';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ProductDetailSheet({ product, visible, onClose }:{
  product: Product | null; visible: boolean; onClose: () => void;
}) {
  if (!product) return null;
  const cat = CATEGORY[product.category] ?? CATEGORY.other;

  const openBuy = () => { if (product.buyUrl) Linking.openURL(product.buyUrl); };
  const onShare = () => {
    const line = product.buyUrl ? `${product.name} — ${product.buyUrl}` : product.name;
    Share.share({ message: `A pick from my Chok Chok cabinet:\n${line}` });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.top}>
          <View style={[styles.thumb, { backgroundColor: cat.bg }]}>
            <View style={[styles.bottle, { backgroundColor: cat.tint }]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{product.name}</Text>
            {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}
          </View>
          <Pressable onPress={onClose} style={styles.close}><Text style={styles.closeX}>✕</Text></Pressable>
        </View>

        <View style={styles.meta}>
          <Row label="Category" value={cat.label} />
          <Row label="Concern" value={product.concerns.join(', ') || '—'} />
          <Row label="Frequency" value={product.frequency} />
          {product.priceNote ? <Row label="Price" value={product.priceNote} /> : null}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.buy} onPress={openBuy}>
            <Text style={styles.buyText}>Buy{product.priceNote ? `  ·  ${product.priceNote}` : ''}</Text>
          </Pressable>
          <Pressable style={styles.share} onPress={onShare}><Text style={styles.shareText}>↗</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(40,32,28,0.42)' },
  sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 30 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D9CEC6', alignSelf: 'center', marginBottom: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  thumb: { width: 64, height: 64, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bottle: { width: 20, height: 40, borderRadius: 7 },
  name: { fontSize: 16, color: COLORS.ink, fontWeight: '600' },
  brand: { fontSize: 12, color: COLORS.sub, marginTop: 2 },
  close: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EFE7E1', alignItems: 'center', justifyContent: 'center' },
  closeX: { color: '#6A5D56', fontSize: 14 },
  meta: { marginTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.line, paddingTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { color: COLORS.sub, fontSize: 13 },
  rowValue: { color: COLORS.ink, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  buy: { flex: 1, height: 48, borderRadius: 14, backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  buyText: { color: '#F6EFEA', fontSize: 14, fontWeight: '600' },
  share: { width: 48, height: 48, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: '#D9CEC6', alignItems: 'center', justifyContent: 'center' },
  shareText: { fontSize: 16, color: '#5A4F49' },
});
