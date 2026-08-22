import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Linking, Share, Alert } from 'react-native';
import { COLORS, styleFor } from '../theme';
import type { Product } from '../types';
import Silhouette from './Silhouette';
import ContainerPicker from './ContainerPicker';
import { deleteProduct } from '../productStore';
import { iconFor } from '../data/formDefaults';
import type { IconId } from '../data/containerIcons';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ProductDetailSheet({ product, visible, onClose, onChangeIcon, onEdit, onDeleted }:{
  product: Product | null; visible: boolean; onClose: () => void;
  onChangeIcon?: (productId: string, icon: IconId) => void;
  onEdit?: (product: Product) => void;
  /** Called with the remaining cabinet after a delete, so the caller can refresh. */
  onDeleted?: (remaining: Product[]) => void;
}) {
  const [pickingIcon, setPickingIcon] = useState(false);
  if (!product) return null;
  const p = product;
  const cat = styleFor(p);
  const isWellness = p.type === 'wellness';

  // No live pricing — an explicit buyUrl wins, otherwise search the web for it.
  const openBuy = () => {
    if (p.buyUrl) { Linking.openURL(p.buyUrl); return; }
    const q = encodeURIComponent(`${p.brand} ${p.name}`.trim());
    Linking.openURL(`https://www.google.com/search?q=${q}`);
  };
  const onShare = () => {
    const line = p.buyUrl ? `${p.name} — ${p.buyUrl}` : p.name;
    Share.share({ message: `A pick from my Dodam cabinet:\n${line}` });
  };

  const confirmDelete = () => {
    Alert.alert('Delete product', `Remove ${p.name} from your cabinet?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const remaining = await deleteProduct(p.id);
          onClose();
          onDeleted?.(remaining);
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.top}>
          <View style={[styles.thumb, { backgroundColor: cat.bg }]}>
            <Silhouette icon={iconFor(p)} color={cat.tint} size={40} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{p.name}</Text>
            {p.brand ? <Text style={styles.brand}>{p.brand}</Text> : null}
          </View>
          {onEdit ? (
            <Pressable onPress={() => { onClose(); onEdit(p); }} hitSlop={8} style={styles.edit}>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={onClose} style={styles.close}><Text style={styles.closeX}>✕</Text></Pressable>
        </View>

        <View style={styles.meta}>
          <Row label={isWellness ? (p.goal ? 'Goal' : 'Category') : 'Role'} value={cat.label} />
          {isWellness && p.dosage ? <Row label="Dosage" value={p.dosage} /> : null}
          <Row label="Timing" value={p.timing ?? p.frequency ?? '—'} />
          {!isWellness && p.concerns?.length ? <Row label="Concern" value={p.concerns.join(', ')} /> : null}
          {p.priceNote ? <Row label="Price" value={p.priceNote} /> : null}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.buy} onPress={openBuy}>
            <Text style={styles.buyText}>
              {p.buyUrl ? 'Buy' : 'Find it'}{p.priceNote ? `  ·  ${p.priceNote}` : ''}
            </Text>
          </Pressable>
          <Pressable style={styles.share} onPress={onShare}><Text style={styles.shareText}>↗</Text></Pressable>
        </View>

        {isWellness ? (
          <Text style={styles.disclaimer}>Not medical advice. Talk to your doctor or pharmacist before starting a supplement.</Text>
        ) : null}

        {onDeleted ? (
          <Pressable onPress={confirmDelete} hitSlop={8} style={styles.deleteRow}>
            <Text style={styles.deleteText}>Delete from cabinet</Text>
          </Pressable>
        ) : null}
      </View>

      {onChangeIcon ? (
        <ContainerPicker
          visible={pickingIcon}
          icon={iconFor(p)}
          color={cat.tint}
          onSelect={(id) => onChangeIcon(p.id, id)}
          onClose={() => setPickingIcon(false)}
        />
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(40,32,28,0.42)' },
  sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 28 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D9CEC6', alignSelf: 'center', marginBottom: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  thumb: { width: 64, height: 64, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, color: COLORS.ink, fontWeight: '600' },
  brand: { fontSize: 12, color: COLORS.sub, marginTop: 2 },
  edit: { paddingHorizontal: 4, paddingVertical: 6 },
  editText: { fontSize: 14, color: COLORS.ink, fontWeight: '600' },
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
  disclaimer: { marginTop: 14, fontSize: 11, color: COLORS.sub, textAlign: 'center', lineHeight: 15 },
  deleteRow: { alignSelf: 'center', marginTop: 16, paddingVertical: 4 },
  deleteText: { fontSize: 12, color: '#B5675A', fontWeight: '600' },
});
