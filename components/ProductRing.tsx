import React, { useState } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedScrollHandler, useAnimatedStyle,
  interpolate, Extrapolation, SharedValue,
} from 'react-native-reanimated';
import ProductCard from './ProductCard';
import { COLORS, CATEGORY } from '../theme';
import type { Product } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = 176;
const CARD_H = 232;
const ITEM_W = CARD_W + 18;              // snap interval
const SIDE = (SCREEN_W - ITEM_W) / 2;    // centers first & last card

function RingItem({ product, index, scrollX, onPress }:{
  product: Product; index: number; scrollX: SharedValue<number>; onPress: () => void;
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
          <ProductCard product={product} width={CARD_W} height={CARD_H} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

export default function ProductRing({ products, onSelect }:{
  products: Product[]; onSelect: (p: Product) => void;
}) {
  const scrollX = useSharedValue(0);
  const [active, setActive] = useState(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => { scrollX.value = e.contentOffset.x; },
  });

  const cat = CATEGORY[products[active]?.category] ?? CATEGORY.other;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.catLabel}>{cat.label}</Text>
        <Text style={styles.counter}>{active + 1} / {products.length}</Text>
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
          setActive(Math.max(0, Math.min(products.length - 1, i)));
        }}
        contentContainerStyle={{ paddingHorizontal: SIDE, alignItems: 'center', height: CARD_H + 40 }}
      >
        {products.map((p, i) => (
          <RingItem key={p.id} product={p} index={i} scrollX={scrollX} onPress={() => onSelect(p)} />
        ))}
      </Animated.ScrollView>

      <Text style={styles.hint}>swipe · tap a product for details</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 6 },
  catLabel: { fontSize: 20, color: COLORS.ink, fontWeight: '500' },
  counter: { fontSize: 12, color: COLORS.sub, marginTop: 2 },
  hint: { textAlign: 'center', fontSize: 12, color: COLORS.sub, marginTop: 8 },
});
