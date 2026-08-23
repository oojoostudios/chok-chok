import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, GOAL, ROLE } from '../theme';
import type { Frequency, Goal, Product, Role } from '../types';
import Silhouette from '../components/Silhouette';
import { FAMILIES, DEFAULT_ICON, familyOf, type Family, type IconId } from '../data/containerIcons';
import { iconFor } from '../data/formDefaults';
import { loadProducts, upsertProduct } from '../productStore';
import { allBrands, matchBrands, rememberBrand } from '../brandStore';

type ProductType = 'beauty' | 'wellness';

const ROLES = Object.keys(ROLE) as Role[];
const GOALS = Object.keys(GOAL) as Goal[];

const TYPES: { value: ProductType; label: string }[] = [
  { value: 'beauty', label: 'Beauty' },
  { value: 'wellness', label: 'Wellness' },
];

// Wellness starts on a capsule; every other container stays one tap away.
const WELLNESS_DEFAULT_FAMILY: Family = 'capsule';

const TIMINGS: { value: Frequency; label: string }[] = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
  { value: 'AM+PM', label: 'AM+PM' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as-needed', label: 'As-needed' },
];

const NOTES_MAX = 300;

// Muted terracotta — reads as "missing", not as an alarm.
const ERROR = '#C97A5A';

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, required && styles.fieldLabelRequired]}>
        {label}
        {required ? <Text style={styles.requiredMark}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

export default function AddProductScreen() {
  const router = useRouter();
  // An `id` param turns this screen into an editor for that existing product.
  // A `type` param is the cabinet tab the user tapped Add from.
  const { id, type: typeParam } = useLocalSearchParams<{ id?: string; type?: string }>();
  const editing = Boolean(id);

  const [existing, setExisting] = useState<Product | null>(null);
  const [hydrated, setHydrated] = useState(!id);
  const [type, setType] = useState<ProductType>(typeParam === 'wellness' ? 'wellness' : 'beauty');
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role | undefined>();
  const [goal, setGoal] = useState<Goal | undefined>();
  const [family, setFamily] = useState<Family | undefined>(
    typeParam === 'wellness' ? WELLNESS_DEFAULT_FAMILY : undefined
  );
  const [icon, setIcon] = useState<IconId | undefined>(
    typeParam === 'wellness' ? DEFAULT_ICON[WELLNESS_DEFAULT_FAMILY] : undefined
  );
  const [timing, setTiming] = useState<Frequency | undefined>();
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  // Curated list merged with brands the user has typed before.
  const [brandPool, setBrandPool] = useState<string[]>([]);
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  // Set by a save attempt that couldn't go through, so the gaps become visible.
  const [showErrors, setShowErrors] = useState(false);

  // Beauty suggests beauty brands, wellness suggests supplement brands.
  useEffect(() => {
    allBrands(type === 'wellness' ? 'wellness' : 'beauty').then(setBrandPool);
  }, [type]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    loadProducts().then((all) => {
      if (cancelled) return;
      const found = all.find((p) => p.id === id);
      if (found) {
        const existingIcon = iconFor(found);
        setExisting(found);
        setType(found.type);
        setBrand(found.brand);
        setName(found.name);
        setRole(found.role);
        setGoal(found.goal);
        setIcon(existingIcon);
        setFamily(familyOf(existingIcon));
        setTiming(found.timing ?? found.frequency);
        setDosage(found.dosage ?? '');
        setNotes(found.notes ?? '');
      }
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, [id]);

  // Container tiles take the chosen taxonomy's tint; neutral until one is picked.
  const picked = type === 'wellness' ? (goal ? GOAL[goal] : null) : (role ? ROLE[role] : null);
  const tint = picked?.tint ?? '#C3B7AE';

  // Switching to wellness lands on the capsule so the form is savable sooner.
  const pickType = (next: ProductType) => {
    setType(next);
    // The pool is about to change under them; drop suggestions from the old one.
    setBrandSuggestions([]);
    if (next === 'wellness' && !family) {
      setFamily(WELLNESS_DEFAULT_FAMILY);
      setIcon(DEFAULT_ICON[WELLNESS_DEFAULT_FAMILY]);
    }
  };

  // Second level: only the selected family's variants, and only when it has more than one.
  const variants = FAMILIES.find((f) => f.family === family)?.variants ?? [];

  const pickFamily = (f: Family) => {
    setFamily(f);
    setIcon(DEFAULT_ICON[f]);
  };

  const onChangeBrand = (text: string) => {
    setBrand(text);
    setBrandSuggestions(matchBrands(text, brandPool, 6));
  };
  const pickBrand = (b: string) => {
    setBrand(b);
    setBrandSuggestions([]);
  };
  // Once what's typed matches a suggestion outright, the list has nothing left to offer.
  const showBrandSuggestions =
    brandSuggestions.length > 0 &&
    !brandSuggestions.some((b) => b.toLowerCase() === brand.trim().toLowerCase());
  // Beauty needs a role, wellness needs a goal — the same slot on either axis.
  // One map drives both the Save gate and which fields get highlighted.
  const missing = {
    brand: !brand.trim(),
    name: !name.trim(),
    taxonomy: type === 'wellness' ? !goal : !role,
    icon: !icon,
    timing: !timing,
  };
  const canSave = !Object.values(missing).some(Boolean);
  // Highlights are derived, so each one clears as soon as its field is filled.
  const flag = (key: keyof typeof missing) => showErrors && missing[key];

  const onSave = async () => {
    if (!canSave) { setShowErrors(true); return; }
    const wellness = type === 'wellness';
    const product: Product = {
      // Spread first so fields this form doesn't cover (category, buyUrl,
      // concerns…) survive an edit instead of being wiped.
      ...existing,
      id: existing?.id ?? String(Date.now()),
      brand: brand.trim(),
      name: name.trim(),
      type,
      // Only the axis this type reads from is kept, so a product switched
      // between cabinets doesn't carry a stale role/goal/dosage.
      role: wellness ? undefined : role,
      goal: wellness ? goal : undefined,
      icon,
      timing: timing!,
      dosage: wellness ? dosage.trim() || undefined : undefined,
      notes: notes.trim() || undefined,
    };
    await upsertProduct(product);
    await rememberBrand(brand.trim());
    router.back();
  };

  const topbar = (
    <View style={styles.topbar}>
      <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backX}>‹</Text></Pressable>
      <Text style={styles.title}>{editing ? 'Edit product' : 'Add product'}</Text>
      {hydrated ? (
        // Stays tappable while incomplete — that tap is what reveals the gaps.
        <Pressable onPress={onSave} hitSlop={10}>
          <Text style={[styles.save, !canSave && styles.saveDisabled]}>Save</Text>
        </Pressable>
      ) : (
        <View style={{ width: 30 }} />
      )}
    </View>
  );

  // Hold the form back until the product is read, so fields don't flash empty.
  if (!hydrated) return <SafeAreaView style={styles.screen}>{topbar}</SafeAreaView>;

  return (
    <SafeAreaView style={styles.screen}>
      {topbar}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        {/* Tapping any dead space between fields closes the keyboard. On web
            there is no keyboard to close, and react-native-web fires this
            ancestor's onPress from the child input's own click — which would
            blur the field the moment it is focused. */}
        <Pressable onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss} accessible={false}>
          <Field label="TYPE">
            <View style={styles.pillWrap}>
              {TYPES.map((t) => {
                const active = t.value === type;
                return (
                  <Pressable
                    key={t.value}
                    onPress={() => pickType(t.value)}
                    style={[styles.pill, active && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label="BRAND" required>
            <TextInput
              value={brand}
              onChangeText={onChangeBrand}
              placeholder={type === 'wellness' ? 'e.g. Thorne' : 'e.g. Beauty of Joseon'}
              placeholderTextColor={COLORS.sub}
              style={[styles.input, flag('brand') && styles.inputError]}
              autoCorrect={false}
              autoCapitalize="words"
            />
            {showBrandSuggestions ? (
              <View style={styles.suggestions}>
                {brandSuggestions.map((b, i) => (
                  <Pressable
                    key={b}
                    onPress={() => pickBrand(b)}
                    style={[styles.suggestion, i > 0 && styles.suggestionDivider]}
                  >
                    <Text style={styles.suggestionText}>{b}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </Field>

          <Field label="PRODUCT" required>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={type === 'wellness' ? 'e.g. Magnesium Glycinate' : 'e.g. Relief Sun'}
              placeholderTextColor={COLORS.sub}
              style={[styles.input, flag('name') && styles.inputError]}
            />
          </Field>

          {type === 'wellness' ? (
            <Field label="GOAL" required>
              <View style={[styles.pillWrap, flag('taxonomy') && styles.groupError]}>
                {GOALS.map((g) => {
                  const active = g === goal;
                  const s = GOAL[g];
                  return (
                    <Pressable
                      key={g}
                      onPress={() => setGoal(g)}
                      style={[styles.pill, active && { backgroundColor: s.bg, borderColor: s.ink }]}
                    >
                      <Text style={[styles.pillText, active && { color: s.ink, fontWeight: '600' }]}>{s.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>
          ) : (
            <Field label="ROLE" required>
              <View style={[styles.pillWrap, flag('taxonomy') && styles.groupError]}>
                {ROLES.map((r) => {
                  const active = r === role;
                  const s = ROLE[r];
                  return (
                    <Pressable
                      key={r}
                      onPress={() => setRole(r)}
                      style={[styles.pill, active && { backgroundColor: s.bg, borderColor: s.ink }]}
                    >
                      <Text style={[styles.pillText, active && { color: s.ink, fontWeight: '600' }]}>{s.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>
          )}

          <Field label="CONTAINER" required>
            <View style={[styles.grid, flag('icon') && styles.groupError]}>
              {FAMILIES.map((f) => {
                const active = f.family === family;
                return (
                  <Pressable
                    key={f.family}
                    onPress={() => pickFamily(f.family)}
                    style={[styles.tile, active && styles.tileActive]}
                  >
                    <Silhouette icon={DEFAULT_ICON[f.family]} color={tint} size={44} />
                    <Text style={[styles.tileLabel, active && styles.tileLabelActive]} numberOfLines={1}>
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {variants.length > 1 ? (
              <>
                <Text style={styles.subLabel}>Shape</Text>
                <View style={styles.variantRow}>
                  {variants.map((v) => {
                    const active = v.id === icon;
                    return (
                      <Pressable
                        key={v.id}
                        onPress={() => setIcon(v.id)}
                        style={[styles.variant, active && styles.tileActive]}
                      >
                        <Silhouette icon={v.id} color={tint} size={40} />
                        <Text style={[styles.tileLabel, active && styles.tileLabelActive]} numberOfLines={1}>
                          {v.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}
          </Field>

          <Field label="TIMING" required>
            <View style={[styles.pillWrap, flag('timing') && styles.groupError]}>
              {TIMINGS.map((t) => {
                const active = t.value === timing;
                return (
                  <Pressable
                    key={t.value}
                    onPress={() => setTiming(t.value)}
                    style={[styles.pill, active && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          {type === 'wellness' ? (
            <Field label="DOSAGE (OPTIONAL)">
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g. 1 capsule, 400mg"
                placeholderTextColor={COLORS.sub}
                style={styles.input}
                autoCapitalize="none"
              />
              <Text style={styles.hint}>Kept private — dosage never appears on a shared routine.</Text>
            </Field>
          ) : null}

          <Field label="NOTES">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="How it works for you, texture, anything worth remembering."
              placeholderTextColor={COLORS.sub}
              style={[styles.input, styles.notes]}
              multiline
              maxLength={NOTES_MAX}
              textAlignVertical="top"
            />
            <Text style={styles.counter}>{notes.length}/{NOTES_MAX}</Text>
          </Field>
        </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  // Deep bottom padding so Notes clears the keyboard.
  scrollContent: { padding: 18, paddingBottom: 300 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 8, paddingBottom: 6 },
  back: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  backX: { fontSize: 26, color: COLORS.ink },
  title: { fontSize: 18, color: COLORS.ink, fontWeight: '600', flex: 1, textAlign: 'center' },
  save: { fontSize: 15, color: COLORS.ink, fontWeight: '600' },
  saveDisabled: { color: '#BFB3AB' },

  field: { marginBottom: 22 },
  fieldLabel: { fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: COLORS.sub, marginBottom: 10 },
  // Required labels sit a shade darker than optional ones.
  fieldLabelRequired: { color: COLORS.ink },
  requiredMark: { color: ERROR },
  input: { backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.ink, borderWidth: 1, borderColor: 'transparent' },
  inputError: { borderColor: ERROR },
  // Wraps a pill row / tile grid whose selection is still missing.
  groupError: { borderWidth: 1, borderColor: ERROR, borderRadius: 14, padding: 8 },
  notes: { minHeight: 96, paddingTop: 12 },

  suggestions: { marginTop: 6, backgroundColor: COLORS.card, borderRadius: 12, overflow: 'hidden' },
  suggestion: { paddingHorizontal: 14, paddingVertical: 11 },
  suggestionDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.line },
  suggestionText: { fontSize: 15, color: COLORS.ink },
  counter: { alignSelf: 'flex-end', fontSize: 11, color: COLORS.sub, marginTop: 6 },
  hint: { fontSize: 11, color: COLORS.sub, marginTop: 6 },

  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: 'transparent', backgroundColor: COLORS.card },
  pillActive: { backgroundColor: COLORS.chip, borderColor: COLORS.ink },
  pillText: { fontSize: 13, color: COLORS.sub },
  pillTextActive: { color: COLORS.ink, fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '22%', aspectRatio: 0.82, borderRadius: 14, borderWidth: 1, borderColor: 'transparent', backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tileActive: { borderColor: COLORS.ink, backgroundColor: '#F1E9E4' },
  tileLabel: { fontSize: 10, color: COLORS.sub, marginTop: 2 },
  tileLabelActive: { color: COLORS.ink, fontWeight: '600' },

  subLabel: { fontSize: 11, color: COLORS.sub, marginTop: 16, marginBottom: 8 },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  variant: { width: 76, borderRadius: 14, borderWidth: 1, borderColor: 'transparent', backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 4 },
});
