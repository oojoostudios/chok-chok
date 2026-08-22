import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput, Modal, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { COLORS, styleFor } from '../theme';
import type { Product, Routine } from '../types';
import { PRESETS, routineFromPreset, blankCustomRoutine, type Preset } from '../data/presetProtocols';
import { loadProducts } from '../productStore';
import { loadRoutines, upsertRoutine, deleteRoutine } from '../storage';
import RoutineCard from '../components/RoutineCard';
import Silhouette from '../components/Silhouette';
import { iconFor } from '../data/formDefaults';

export default function RoutinesScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'list' | 'view' | 'builder'>('list');
  const [draft, setDraft] = useState<Routine | null>(null);
  const [saved, setSaved] = useState<Routine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pickerStep, setPickerStep] = useState<number | null>(null);
  // Remembers whether the builder was entered from the finished card, so back
  // and save return there instead of dropping all the way out to the list.
  const [fromView, setFromView] = useState(false);
  const [sharing, setSharing] = useState(false);
  const shotRef = useRef<ViewShot>(null);

  useEffect(() => { loadRoutines().then(setSaved); }, []);

  // Products can change while we're away (add/edit/delete in the cabinet), so
  // the card and the picker reload on focus rather than once on mount.
  useFocusEffect(
    React.useCallback(() => { loadProducts().then(setProducts); }, [])
  );

  const openPreset = (p: Preset) => { setFromView(false); setDraft(routineFromPreset(p)); setMode('builder'); };
  const openCustom = () => { setFromView(false); setDraft(blankCustomRoutine()); setMode('builder'); };
  // Saved routines open on the finished card; Edit from there enters the builder.
  const openSaved = (r: Routine) => { setFromView(false); setDraft({ ...r, steps: r.steps.map((s) => ({ ...s })) }); setMode('view'); };

  const productById = (id?: string) => products.find((p) => p.id === id);

  // Captures the RoutineCard as a PNG and hands it to the system share sheet.
  const onShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const uri = await shotRef.current?.capture?.();
      if (!uri) throw new Error('capture returned no uri');
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing unavailable', 'This device can’t open the share sheet.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        UTI: 'public.png',
        dialogTitle: `${draft?.name ?? 'Routine'} · Dodam`,
      });
    } catch {
      Alert.alert('Couldn’t share', 'Something went wrong making the image. Try again.');
    } finally {
      setSharing(false);
    }
  };

  const setStepProduct = (i: number, productId: string) => {
    if (!draft) return;
    setDraft({ ...draft, steps: draft.steps.map((s, k) => (k === i ? { ...s, productId } : s)) });
    setPickerStep(null);
  };
  const clearStepProduct = (i: number) => {
    if (!draft) return;
    setDraft({ ...draft, steps: draft.steps.map((s, k) => (k === i ? { label: s.label } : s)) });
  };
  const updateStepLabel = (i: number, label: string) => {
    if (!draft) return;
    setDraft({ ...draft, steps: draft.steps.map((s, k) => (k === i ? { ...s, label } : s)) });
  };
  const addStep = () => {
    if (!draft) return;
    setDraft({ ...draft, steps: [...draft.steps, { label: `Step ${draft.steps.length + 1}` }] });
  };
  const removeStep = (i: number) => {
    if (!draft) return;
    setDraft({ ...draft, steps: draft.steps.filter((_, k) => k !== i) });
  };

  const save = async () => {
    if (!draft) return;
    const all = await upsertRoutine(draft);
    setSaved(all);
    // Editing an existing routine drops back onto its finished card.
    if (fromView) { setMode('view'); return; }
    setMode('list');
    setDraft(null);
  };
  const remove = async (id: string) => setSaved(await deleteRoutine(id));

  // Backing out of the builder discards the edits, so the card has to be shown
  // the last *saved* version rather than the abandoned draft.
  const leaveBuilder = () => {
    if (fromView && draft) {
      const pristine = saved.find((r) => r.id === draft.id);
      if (pristine) setDraft({ ...pristine, steps: pristine.steps.map((s) => ({ ...s })) });
      setMode('view');
      return;
    }
    setMode('list');
    setDraft(null);
  };

  // -------- LIST --------
  if (mode === 'list') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.topbar}>
          <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backX}>‹</Text></Pressable>
          <Text style={styles.title}>Routines</Text>
          <View style={{ width: 30 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
          <Text style={styles.section}>Preset Routine Protocols</Text>
          {PRESETS.map((p) => (
            <Pressable key={p.name} style={styles.row} onPress={() => openPreset(p)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{p.name}</Text>
                <Text style={styles.rowSub}>{p.stepLabels.join(' · ')}</Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          ))}

          <Pressable style={styles.customBtn} onPress={openCustom}>
            <Text style={styles.customBtnText}>+ Create custom protocol</Text>
          </Pressable>

          {saved.length > 0 && (
            <>
              <Text style={[styles.section, { marginTop: 26 }]}>My Protocols</Text>
              {saved.map((r) => {
                const filled = r.steps.filter((s) => s.productId).length;
                return (
                  <Pressable key={r.id} style={styles.row} onPress={() => openSaved(r)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowName}>{r.name}</Text>
                      <Text style={styles.rowSub}>{filled}/{r.steps.length} steps filled</Text>
                    </View>
                    <Pressable onPress={() => remove(r.id)} hitSlop={10}><Text style={styles.del}>Delete</Text></Pressable>
                  </Pressable>
                );
              })}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------- VIEW (finished card) --------
  if (mode === 'view') {
    const r = draft!;
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.topbar}>
          <Pressable
            onPress={() => { setFromView(false); setMode('list'); setDraft(null); }}
            style={styles.back}
          >
            <Text style={styles.backX}>‹</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>{r.name}</Text>
          <Pressable onPress={() => { setFromView(true); setMode('builder'); }} hitSlop={10}>
            <Text style={styles.save}>Edit</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.viewContent}>
          {/* ViewShot wraps only the card — capturing the ScrollView clips the image. */}
          <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }}>
            <RoutineCard routine={r} products={products} forShare />
          </ViewShot>

          <Pressable
            style={[styles.shareBtn, sharing && styles.shareBtnBusy]}
            onPress={onShare}
            disabled={sharing}
          >
            <Text style={styles.shareBtnText}>{sharing ? 'Preparing…' : 'Share routine'}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------- BUILDER --------
  const d = draft!;
  const isCustom = d.kind === 'custom';
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <Pressable onPress={leaveBuilder} style={styles.back}><Text style={styles.backX}>‹</Text></Pressable>
        <Text style={styles.title} numberOfLines={1}>{isCustom ? 'Custom Protocol' : d.name}</Text>
        <Pressable onPress={save} hitSlop={10}><Text style={styles.save}>Save</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        {isCustom && (
          <TextInput
            value={d.name}
            onChangeText={(t) => setDraft({ ...d, name: t })}
            placeholder="Protocol name"
            placeholderTextColor={COLORS.sub}
            style={styles.nameInput}
          />
        )}

        {d.steps.map((step, i) => {
          const product = productById(step.productId);
          const cat = product ? styleFor(product) : null;
          return (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>

              <View style={{ flex: 1 }}>
                {isCustom ? (
                  <TextInput value={step.label} onChangeText={(t) => updateStepLabel(i, t)} style={styles.stepLabelInput} />
                ) : (
                  <Text style={styles.stepLabel}>{step.label}</Text>
                )}

                {product && cat ? (
                  <Pressable style={[styles.chip, { backgroundColor: cat.bg }]} onPress={() => clearStepProduct(i)}>
                    <Silhouette icon={iconFor(product)} color={cat.tintStrong} size={18} />
                    <Text style={[styles.chipName, { color: cat.ink }]} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.chipClear}>✕</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.addSlot} onPress={() => setPickerStep(i)}>
                    <Text style={styles.addSlotText}>+ Add product</Text>
                  </Pressable>
                )}
              </View>

              {isCustom && (
                <Pressable onPress={() => removeStep(i)} hitSlop={8} style={styles.removeStep}>
                  <Text style={styles.removeStepText}>–</Text>
                </Pressable>
              )}
            </View>
          );
        })}

        {isCustom && (
          <Pressable style={styles.addStep} onPress={addStep}>
            <Text style={styles.addStepText}>+ Add step</Text>
          </Pressable>
        )}
      </ScrollView>

      <Modal visible={pickerStep !== null} transparent animationType="slide" onRequestClose={() => setPickerStep(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPickerStep(null)} />
        <View style={styles.picker}>
          <View style={styles.handle} />
          <Text style={styles.pickerTitle}>Choose a product</Text>
          <ScrollView style={{ maxHeight: 360 }}>
            {products.length === 0 ? (
              <Text style={styles.pickEmpty}>No products yet. Add one to your cabinet first.</Text>
            ) : null}
            {products.map((p) => {
              const cat = styleFor(p);
              return (
                <Pressable key={p.id} style={styles.pickRow} onPress={() => pickerStep !== null && setStepProduct(pickerStep, p.id)}>
                  <View style={[styles.pickThumb, { backgroundColor: cat.bg }]}>
                    <Silhouette icon={iconFor(p)} color={cat.tint} size={28} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickName}>{p.name}</Text>
                    <Text style={styles.pickCat}>{cat.label}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
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

  section: { fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: COLORS.sub, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 10 },
  rowName: { fontSize: 15, color: COLORS.ink, fontWeight: '600' },
  rowSub: { fontSize: 12, color: COLORS.sub, marginTop: 3 },
  chev: { fontSize: 20, color: COLORS.sub, marginLeft: 8 },
  del: { fontSize: 12, color: '#B5675A', fontWeight: '600' },

  // No horizontal padding: the card is a fixed 380pt wide for capture, so it is
  // centred and allowed to use the full screen width instead of being clipped.
  viewContent: { paddingVertical: 18, paddingBottom: 40, alignItems: 'center' },
  shareBtn: { marginTop: 22, backgroundColor: COLORS.ink, borderRadius: 20, paddingHorizontal: 26, paddingVertical: 12 },
  shareBtnBusy: { opacity: 0.6 },
  shareBtnText: { color: '#F6EFEA', fontSize: 14, fontWeight: '600' },

  customBtn: { borderWidth: 1, borderColor: '#C3B7AE', borderStyle: 'dashed', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 4 },
  customBtnText: { color: COLORS.ink, fontSize: 14, fontWeight: '600' },

  nameInput: { fontSize: 20, color: COLORS.ink, fontWeight: '600', backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 18 },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.chip, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepNumText: { fontSize: 11, color: '#5A4F49' },
  stepLabel: { fontSize: 14, color: COLORS.ink, marginBottom: 8 },
  stepLabelInput: { fontSize: 14, color: COLORS.ink, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.line, paddingVertical: 4, marginBottom: 8 },

  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 8 },
  chipName: { fontSize: 13, fontWeight: '600', flex: 1 },
  chipClear: { fontSize: 12, color: '#7C6F68' },

  addSlot: { borderWidth: 1, borderColor: '#C3B7AE', borderStyle: 'dashed', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  addSlotText: { color: COLORS.sub, fontSize: 13 },

  removeStep: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EFE7E1', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  removeStepText: { fontSize: 18, color: '#7C6F68', lineHeight: 20 },
  addStep: { alignItems: 'center', paddingVertical: 12 },
  addStepText: { color: COLORS.ink, fontSize: 14, fontWeight: '600' },

  backdrop: { flex: 1, backgroundColor: 'rgba(40,32,28,0.42)' },
  picker: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 30 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D9CEC6', alignSelf: 'center', marginBottom: 14 },
  pickerTitle: { fontSize: 15, color: COLORS.ink, fontWeight: '600', marginBottom: 10 },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  pickThumb: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pickName: { fontSize: 14, color: COLORS.ink, fontWeight: '600' },
  pickCat: { fontSize: 12, color: COLORS.sub, marginTop: 2 },
  pickEmpty: { fontSize: 13, color: COLORS.sub, textAlign: 'center', paddingVertical: 24 },
});
