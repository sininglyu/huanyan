import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Design tokens from HTML: primary #cfa577, background #f8f7f6, text #161412, subtitle #81766a, border #f4f2f1
const PLAN_COLORS = {
  primary: '#cfa577',
  background: '#f8f7f6',
  text: '#161412',
  subtitle: '#81766a',
  border: '#f4f2f1',
  track: '#e5e0db',
  cardBg: '#FFFFFF',
};

const MORNING_STEPS = [
  { title: '温和洁面', sub: '净澈泡沫洁面', done: true },
  { title: '维生素C精华', sub: '焕亮修护', done: true },
  { title: '补水爽肤水', sub: '玫瑰保湿喷雾', done: true },
  { title: '保湿霜', sub: '深层滋润', done: false, current: true, icon: 'water_drop' as const },
  { title: '防晒霜 SPF 50', sub: '抵御紫外线', done: false, icon: 'sunny' as const },
];

const EVENING_STEPS = [
  { title: '双重洁面', sub: '油/水基洁面', done: false, icon: 'nights_stay' as const },
  { title: '视黄醇护理', sub: '抗衰老精华', done: false, icon: 'science' as const },
];

const cardStyle = {
  backgroundColor: PLAN_COLORS.cardBg,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: PLAN_COLORS.border,
  ...Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
    android: { elevation: 3 },
  }),
};

export default function PlanScreen() {
  const router = useRouter();
  const doneCount = MORNING_STEPS.filter((s) => s.done).length;
  const progressPercent = (doneCount / MORNING_STEPS.length) * 100;

  return (
    <ThemedView style={[styles.container, { backgroundColor: PLAN_COLORS.background }]}>
      {/* Header: back, title, notifications */}
      <View style={[styles.header, { backgroundColor: PLAN_COLORS.background + 'CC', borderBottomColor: PLAN_COLORS.border }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={PLAN_COLORS.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: PLAN_COLORS.text }]}>我的方案</ThemedText>
        <TouchableOpacity style={styles.headerBtn}>
          <IconSymbol name="notifications" size={24} color={PLAN_COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Date + 晨间焕颜 + progress */}
        <View style={styles.morningIntro}>
          <View style={styles.morningIntroLeft}>
            <ThemedText style={[styles.date, { color: PLAN_COLORS.subtitle }]}>10月24日 星期四</ThemedText>
            <ThemedText style={[styles.morningTitle, { color: PLAN_COLORS.text }]}>晨间焕颜</ThemedText>
          </View>
          <View style={styles.morningCount}>
            <ThemedText style={[styles.morningCountNum, { color: PLAN_COLORS.primary }]}>{doneCount}</ThemedText>
            <ThemedText style={[styles.morningCountDen, { color: PLAN_COLORS.subtitle }]}>/5</ThemedText>
          </View>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: PLAN_COLORS.track }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%`, backgroundColor: PLAN_COLORS.primary },
            ]}
          />
        </View>

        {/* Morning steps */}
        <View style={styles.stepsBlock}>
          {MORNING_STEPS.map((step) => (
            <View
              key={step.title}
              style={[
                styles.stepCard,
                cardStyle,
                step.done && styles.stepCardDone,
                (step as { current?: boolean }).current && styles.stepCardCurrent,
                (step as { current?: boolean }).current && { borderColor: PLAN_COLORS.primary + '66' },
              ]}
            >
              {(step as { current?: boolean }).current && (
                <View style={[styles.stepCardBar, { backgroundColor: PLAN_COLORS.primary }]} />
              )}
              <View
                style={[
                  styles.stepIconWrap,
                  step.done
                    ? { backgroundColor: PLAN_COLORS.primary }
                    : { backgroundColor: PLAN_COLORS.primary + '1A' },
                ]}
              >
                {step.done ? (
                  <IconSymbol name="check" size={20} color="#fff" />
                ) : (
                  <IconSymbol
                    name={(step as { icon?: 'water_drop' | 'sunny' }).icon ?? 'water_drop'}
                    size={20}
                    color={PLAN_COLORS.primary}
                  />
                )}
              </View>
              <View style={styles.stepBody}>
                <ThemedText
                  style={[
                    styles.stepTitle,
                    { color: PLAN_COLORS.text },
                    step.done && styles.stepTitleDone,
                  ]}
                  numberOfLines={1}
                >
                  {step.title}
                </ThemedText>
                <ThemedText style={[styles.stepSub, { color: PLAN_COLORS.subtitle }]}>{step.sub}</ThemedText>
              </View>
              {step.done ? (
                <View style={styles.stepCheckWrap}>
                  <IconSymbol name="check_circle" size={24} color={PLAN_COLORS.primary} />
                </View>
              ) : (
                <TouchableOpacity style={[styles.stepCheckBtn, { borderColor: PLAN_COLORS.track }]}>
                  <IconSymbol name="check" size={18} color={PLAN_COLORS.track} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* 晚间呵护 */}
        <View style={styles.eveningHeader}>
          <ThemedText style={[styles.eveningTitle, { color: PLAN_COLORS.text }]}>晚间呵护</ThemedText>
          <ThemedText style={[styles.startLabel, { color: PLAN_COLORS.subtitle }]}>开始</ThemedText>
        </View>
        <View style={styles.stepsBlock}>
          {EVENING_STEPS.map((step) => (
            <View key={step.title} style={[styles.stepCard, cardStyle]}>
              <View style={[styles.stepIconWrap, { backgroundColor: PLAN_COLORS.text + '14' }]}>
                <IconSymbol name={step.icon} size={20} color={PLAN_COLORS.text} />
              </View>
              <View style={styles.stepBody}>
                <ThemedText style={[styles.stepTitle, { color: PLAN_COLORS.text }]}>{step.title}</ThemedText>
                <ThemedText style={[styles.stepSub, { color: PLAN_COLORS.subtitle }]}>{step.sub}</ThemedText>
              </View>
              <TouchableOpacity style={[styles.stepCheckBtn, { borderColor: PLAN_COLORS.track }]}>
                <IconSymbol name="check" size={18} color={PLAN_COLORS.track} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 28 },
  morningIntro: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  morningIntroLeft: {},
  date: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  morningTitle: { fontSize: 28, fontWeight: '700' },
  morningCount: { flexDirection: 'row', alignItems: 'baseline' },
  morningCountNum: { fontSize: 28, fontWeight: '700' },
  morningCountDen: { fontSize: 18, fontWeight: '500', marginLeft: 2 },
  progressTrack: {
    height: 6,
    borderRadius: 9999,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  progressFill: { height: '100%', borderRadius: 9999 },
  stepsBlock: { paddingHorizontal: 16 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  stepCardDone: { opacity: 0.8 },
  stepCardCurrent: {
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },
  stepCardBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  stepIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBody: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '700' },
  stepTitleDone: { textDecorationLine: 'line-through', textDecorationColor: PLAN_COLORS.primary + '80' },
  stepSub: { fontSize: 12, marginTop: 2 },
  stepCheckWrap: { padding: 4 },
  stepCheckBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eveningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 8,
  },
  eveningTitle: { fontSize: 20, fontWeight: '700' },
  startLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
});
