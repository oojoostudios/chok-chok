import React, { useState } from 'react';
import { View, Text, Pressable, useWindowDimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedScrollHandler, useAnimatedStyle,
  interpolate, Extrapolation, SharedValue,
} from 'react-native-reanimated';
import ProductCard from './ProductCard';
import AddProductCard from './AddProductCard';
import { COLORS, styleFor } from '../theme';
import type { Product } from '../types';

// The Add card always leads the ring; product cards follow.
const ADD_ID = '__add__';
type Entry = { id: typeof ADD_ID } | { id: string; product: Product };
const isAdd = (e: Entry): e is { id: typeof ADD_ID } => e.id === ADD_ID;

const CARD_W = 176;
const CARD_H = 232;
const ITEM_W = CARD_W + 18;              // snap interval

// Padding that lets the first and last card reach dead center. It has to be a
// real number — a center-snapping carousel can't get this from flex alone — so
// it's derived from the live viewport width at render, never captured once.
// Clamped at 0: below ITEM_W the raw formula goes negative and clips the strip.
const sidePadding = (viewportW: number) => Math.max(0, (viewportW - ITEM_W) / 2);

function RingItem({ entry, index, scrollX, onPress }:{
  entry: Entry; index: number; scrollX: SharedValue<number>; onPress: () => void;
}) {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * ITEM_W, index * ITEM_W, (index + 1) * ITEM_W];
    const scale      = interpolate(scrollX.value, input, [0.84, 1, 0.84], Extrapolation.CLAMP);
    const rotateY    = interpolate(scrollX.value, input, [34, 0, -34], Extrapolation.CLAMP);
    const translateX = interpolate(scrollX.value, input, [22, 0, -22], Extrapolation.CLAMP);
    const opacity    = interpolate(scrollX.value, input, [0.5, 1, 0.5], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ perspective: 800 }, { rotateY: `${rotateY}deg` }, { scale }, { translateX }],
    };
  });

  return (
    <View style={{ width: ITEM_W, alignItems: 'center' }}>
      <Pressable onPress={onPress}>
        <Animated.View style={style}>
          {isAdd(entry) ? (
            <AddProductCard width={CARD_W} height={CARD_H} />
          ) : (
            <ProductCard product={entry.product} width={CARD_W} height={CARD_H} />
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

export default function ProductRing({ products, onSelect, onAdd }:{
  products: Product[]; onSelect: (p: Product) => void; onAdd: () => void;
}) {
  const scrollX = useSharedValue(0);
  const [active, setActive] = useState(0);
  // Re-renders on browser resize / device rotation, so the ring re-centers
  // instead of holding the width it happened to launch at.
  const { width: viewportW } = useWindowDimensions();

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => { scrollX.value = e.contentOffset.x; },
  });

  const entries: Entry[] = [{ id: ADD_ID }, ...products.map((p) => ({ id: p.id, product: p }))];
  const current = entries[active];
  const onAddCard = !current || isAdd(current);

  return (
    <View>
      <View style={styles.header}>
        {/* On the Add card this label would only repeat the card's own
            "Add product", so it is dropped there and the count line carries the
            header alone. The header keeps its full height either way, so the
            ring does not shift as the label comes and goes mid-swipe. */}
        {!onAddCard && (
          <Text style={styles.catLabel}>{styleFor(current.product).label}</Text>
        )}
        <Text style={styles.counter}>
          {onAddCard
            ? (products.length === 0 ? 'Cabinet is empty' : `${products.length} in cabinet`)
            : `${active} / ${products.length}`}
        </Text>
      </View>

      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_W}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / ITEM_W);
          setActive(Math.max(0, Math.min(entries.length - 1, i)));
        }}
        contentContainerStyle={{
          // flexGrow + justifyContent center the strip whenever it is narrower
          // than the viewport — the empty-cabinet case, where the Add card is
          // the only card. Cards keep their width (flexShrink defaults to 0).
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: sidePadding(viewportW),
          alignItems: 'center',
          height: CARD_H + 40,
        }}
      >
        {entries.map((entry, i) => (
          <RingItem
            key={entry.id}
            entry={entry}
            index={i}
            scrollX={scrollX}
            onPress={() => (isAdd(entry) ? onAdd() : onSelect(entry.product))}
          />
        ))}
      </Animated.ScrollView>

      {/* Nothing to swipe to or tap when the only card is Add product. */}
      {products.length > 0 && (
        <Text style={styles.hint}>swipe · tap a product for details</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // minHeight reserves the space the category label occupies (24 + 2 + 16), and
  // flex-end pins the count line to the bottom of it, so the count sits at the
  // same y whether or not the label above it is rendered. Both line heights are
  // explicit to keep that sum exact across platforms.
  header: { alignItems: 'center', justifyContent: 'flex-end', minHeight: 42, marginBottom: 6 },
  catLabel: { fontSize: 20, lineHeight: 24, color: COLORS.ink, fontWeight: '500' },
  counter: { fontSize: 12, lineHeight: 16, color: COLORS.sub, marginTop: 2 },
  hint: { textAlign: 'center', fontSize: 12, color: COLORS.sub, marginTop: 8 },
});
