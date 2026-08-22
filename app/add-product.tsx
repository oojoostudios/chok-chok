import React, { useState } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, ROLE } from '../theme';
import type { Frequency, Product, Role } from '../types';
import Silhouette from '../components/Silhouette';
import { FAMILIES, DEFAULT_ICON, type IconId } from '../data/containerIcons';
import { upsertProduct } from '../productStore';

const ROLES = Object.keys(ROLE) as Role[];

const TIMINGS: { value: Frequency; label: string }[] = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
  { value: 'AM+PM', label: 'AM+PM' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as-needed', label: 'As-needed' },
];

const NOTES_MAX = 300;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export default function AddProductScreen() {
  const router = useRouter();
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role | undefined>();
  const [icon, setIcon] = useState<IconId | undefined>();
  const [timing, setTiming] = useState<Frequency | undefined>();
  const [notes, setNotes] = useState('');

  // Container tiles take the chosen role's tint; neutral until a role is picked.
  const tint = role ? ROLE[role].tint : '#C3B7AE';
  const canSave = Boolean(brand.trim() && name.trim() && role && icon && timing);

  const onSave = async () => {
    if (!canSave) return;
    const product: Product = {
      id: String(Date.now()),
      brand: brand.trim(),
      name: name.trim(),
      type: 'beauty',
      role,
      icon,
      timing: timing!,
      notes: notes.trim() || undefined,
    };
    await upsertProduct(product);
    router.back();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backX}>‹</Text></Pressable>
        <Text style={styles.title}>Add product</Text>
        <Pressable onPress={onSave} hitSlop={10} disabled={!canSave}>
          <Text style={[styles.save, !canSave && styles.saveDisabled]}>Save</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Field label="BRAND">
            <TextInput
              value={brand}
              onChangeText={setBrand}
              placeholder="e.g. Beauty of Joseon"
              placeholderTextColor={COLORS.sub}
              style={styles.input}
            />
          </Field>

          <Field label="PRODUCT">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Relief Sun"
              placeholderTextColor={COLORS.sub}
              style={styles.input}
            />
          </Field>

          <Field label="ROLE">
            <View style={styles.pillWrap}>
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

          <Field label="CONTAINER">
            <View style={styles.grid}>
              {FAMILIES.map((f) => {
                const familyIcon = DEFAULT_ICON[f.family];
                const active = icon === familyIcon;
                return (
                  <Pressable
                    key={f.family}
                    onPress={() => setIcon(familyIcon)}
                    style={[styles.tile, active && styles.tileActive]}
                  >
                    <Silhouette icon={familyIcon} color={tint} size={44} />
                    <Text style={[styles.tileLabel, active && styles.tileLabelActive]} numberOfLines={1}>
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label="TIMING">
            <View style={styles.pillWrap}>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 8, paddingBottom: 6 },
  back: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  backX: { fontSize: 26, color: COLORS.ink },
  title: { fontSize: 18, color: COLORS.ink, fontWeight: '600', flex: 1, textAlign: 'center' },
  save: { fontSize: 15, color: COLORS.ink, fontWeight: '600' },
  saveDisabled: { color: '#BFB3AB' },

  field: { marginBottom: 22 },
  fieldLabel: { fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: COLORS.sub, marginBottom: 10 },
  input: { backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.ink },
  notes: { minHeight: 96, paddingTop: 12 },
  counter: { alignSelf: 'flex-end', fontSize: 11, color: COLORS.sub, marginTop: 6 },

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
});
