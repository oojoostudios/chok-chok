import React, { useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import Silhouette from './Silhouette';
import { FAMILIES, DEFAULT_ICON, familyOf, type Family, type IconId } from '../data/containerIcons';

// Pick a container for a product: tap a family to take its default icon, then
// tap a variant in that family to swap. `color` is the product's role tint.
export default function ContainerPicker({ visible, icon, color, onSelect, onClose }: {
  visible: boolean;
  icon?: IconId;
  color: string;
  onSelect: (icon: IconId) => void;
  onClose: () => void;
}) {
  const selectedFamily = icon ? familyOf(icon) : undefined;
  const [openFamily, setOpenFamily] = useState<Family | undefined>(selectedFamily);

  // Follow the product when it changes underneath us (e.g. a different product).
  const [lastIcon, setLastIcon] = useState(icon);
  if (icon !== lastIcon) {
    setLastIcon(icon);
    setOpenFamily(selectedFamily);
  }

  const variants = useMemo(
    () => FAMILIES.find((f) => f.family === openFamily)?.variants ?? [],
    [openFamily],
  );

  const pickFamily = (family: Family) => {
    setOpenFamily(family);
    onSelect(DEFAULT_ICON[family]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.titleRow}>
          <Text style={styles.title}>Container</Text>
          <Pressable onPress={onClose} hitSlop={10}><Text style={styles.done}>Done</Text></Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
          <View style={styles.grid}>
            {FAMILIES.map((f) => {
              const active = f.family === openFamily;
              return (
                <Pressable
                  key={f.family}
                  onPress={() => pickFamily(f.family)}
                  style={[styles.tile, active && styles.tileActive]}
                >
                  <Silhouette icon={DEFAULT_ICON[f.family]} color={color} size={44} />
                  <Text style={[styles.tileLabel, active && styles.tileLabelActive]} numberOfLines={1}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {variants.length > 1 && (
            <>
              <Text style={styles.section}>Variants</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantRow}>
                {variants.map((v) => {
                  const active = v.id === icon;
                  return (
                    <Pressable
                      key={v.id}
                      onPress={() => onSelect(v.id)}
                      style={[styles.variant, active && styles.tileActive]}
                    >
                      <Silhouette icon={v.id} color={color} size={44} />
                      <Text style={[styles.tileLabel, active && styles.tileLabelActive]} numberOfLines={1}>
                        {v.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(40,32,28,0.42)' },
  sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 28, maxHeight: '76%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D9CEC6', alignSelf: 'center', marginBottom: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 15, color: COLORS.ink, fontWeight: '600' },
  done: { fontSize: 14, color: COLORS.ink, fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '22%', aspectRatio: 0.82, borderRadius: 14, borderWidth: 1, borderColor: 'transparent', backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tileActive: { borderColor: COLORS.ink, backgroundColor: '#F1E9E4' },
  tileLabel: { fontSize: 10, color: COLORS.sub, marginTop: 2 },
  tileLabelActive: { color: COLORS.ink, fontWeight: '600' },

  section: { fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: COLORS.sub, marginTop: 20, marginBottom: 10 },
  variantRow: { gap: 10, paddingRight: 4 },
  variant: { width: 78, borderRadius: 14, borderWidth: 1, borderColor: 'transparent', backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 4 },
});
