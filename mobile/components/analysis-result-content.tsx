/**
 * Shared analysis result body: overall skin health card, 详细指标 grid, CTA.
 * Used by ai/result/[id] and profile/analysis/[id].
 */

import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, SectionBoxShadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getUploadsUrl } from '@/constants/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

export interface IndicatorItem {
  id: string;
  label: string;
  percent: number;
}

export interface AnalysisResultData {
  skinType?: string;
  overallScore?: number;
  score?: number;
  skinColor?: string;
  indicators?: IndicatorItem[];
}

export interface AnalysisResponse {
  id: string;
  imagePath: string;
  result: AnalysisResultData;
  score: number;
  createdAt: string;
}

function getScoreLabel(score: number): string {
  if (score >= 85) return '极佳';
  if (score >= 70) return '良好';
  if (score >= 50) return '一般';
  return '待改善';
}

function getScoreDescription(score: number, skinType: string): string {
  if (score >= 85) return `您今天的皮肤屏障很强韧。肤质为${skinType}，保持当前护理即可。`;
  if (score >= 70) return `整体状态不错。肤质${skinType}，注意补水和防晒。`;
  if (score >= 50) return `检测到一些可改善项。建议根据肤质${skinType}调整护肤步骤。`;
  return `建议加强护理。针对${skinType}肤质定制方案，坚持一段时间会有改善。`;
}

/** Format createdAt for 详细指标 header: "今天, 上午 9:41" or "M/D HH:mm" */
function formatTimestamp(createdAt: string): string {
  const d = new Date(createdAt);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const timeStr = d.toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  if (isToday) {
    const period = d.getHours() < 12 ? '上午' : '下午';
    const hour = d.getHours() <= 12 ? d.getHours() : d.getHours() - 12;
    const min = d.getMinutes();
    return `今天, ${period} ${hour}:${min.toString().padStart(2, '0')}`;
  }
  return d.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const INDICATOR_COLORS: Record<string, string> = {
  moisture: '#5B9BD5',
  oil: '#E8B86D',
  pores: '#9B7EBD',
  blackhead: '#6B7280',
  acne: '#E91E8C',
  spots: '#C4A77D',
  wrinkles: '#D4A574',
  sensitivity: '#E07C7C',
  closed: '#8B7355',
  eye: '#7B9ACC',
};

/** Material Icons names for indicator cards (direct mapping so icons always render). */
const INDICATOR_MATERIAL_ICONS: Record<string, ComponentProps<typeof MaterialIcons>['name']> = {
  moisture: 'water-drop',
  oil: 'opacity',
  pores: 'spa',
  blackhead: 'science',
  acne: 'close',
  spots: 'auto-awesome',
  wrinkles: 'person',
  closed: 'check',
  eye: 'center-focus-strong',
  sensitivity: 'science',
};

const CIRCLE_SIZE = 192;
const STROKE_WIDTH = 8;

interface AnalysisResultContentProps {
  data: AnalysisResponse;
  onCtaPress: () => void;
}

export function AnalysisResultContent({ data, onCtaPress }: AnalysisResultContentProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const r = data.result;
  const score = data.score ?? r?.overallScore ?? r?.score ?? 0;
  const indicators: IndicatorItem[] = Array.isArray(r?.indicators) ? r.indicators : [];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Overall skin health card */}
      <View
        style={[
          styles.scoreCard,
          SectionBoxShadow,
          { backgroundColor: colorScheme === 'dark' ? '#2a241e' : '#FFFFFF' },
        ]}
      >
        <View style={styles.faceIconBg}>
          <IconSymbol name="person.fill" size={96} color={colors.subtitle} />
        </View>
        <ThemedText type="defaultSemiBold" style={styles.scoreCardTitle}>
          整体皮肤健康
        </ThemedText>
        <View style={styles.scoreCardRow}>
          {data.imagePath ? (
            <Image source={{ uri: getUploadsUrl(data.imagePath) }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.subtitle + '30' }]} />
          )}
        </View>
        <View style={styles.circleWrap}>
          <View
            style={[
              styles.circleTrack,
              {
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                borderRadius: CIRCLE_SIZE / 2,
                borderWidth: STROKE_WIDTH,
                borderColor: colorScheme === 'dark' ? '#3a322a' : '#f4f2f1',
              },
            ]}
          />
          <View
            style={[
              styles.circleProgress,
              {
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                borderRadius: CIRCLE_SIZE / 2,
                borderWidth: STROKE_WIDTH,
                borderColor: 'transparent',
                borderLeftColor: score > 0 ? colors.primary : 'transparent',
                borderTopColor: score > 25 ? colors.primary : 'transparent',
                borderRightColor: score > 50 ? colors.primary : 'transparent',
                borderBottomColor: score > 75 ? colors.primary : 'transparent',
                transform: [{ rotate: '-90deg' }],
              },
            ]}
          />
          <View style={styles.circleCenter}>
            <ThemedText style={[styles.scoreNumber, { color: colors.text }]}>{score}</ThemedText>
          </View>
        </View>
        <View style={styles.scoreBadgeWrap}>
          <View style={[styles.scoreBadge, { backgroundColor: colors.primary + '20' }]}>
            <ThemedText style={[styles.scoreBadgeText, { color: colors.primary }]}>
              {getScoreLabel(score)}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.scoreDesc, { color: colors.subtitle }]} numberOfLines={3}>
          {getScoreDescription(score, r?.skinType ?? '未知')}
        </ThemedText>
      </View>

      {/* 详细指标 */}
      <View style={styles.indicatorsSection}>
        <View style={styles.indicatorsHeader}>
          <ThemedText type="defaultSemiBold" style={styles.indicatorsTitle}>
            详细指标
          </ThemedText>
          <ThemedText style={[styles.indicatorsDate, { color: colors.subtitle }]}>
            {data.createdAt ? formatTimestamp(data.createdAt) : ''}
          </ThemedText>
        </View>
        {indicators.length > 0 ? (
          <View style={styles.indicatorsGrid}>
            {indicators.map((ind) => (
              <View
                key={ind.id}
                style={[
                  styles.indicatorCard,
                  SectionBoxShadow,
                  { backgroundColor: colorScheme === 'dark' ? '#2a241e' : '#FFFFFF' },
                ]}
              >
                <View style={styles.indicatorCardTop}>
                  <View
                    style={[
                      styles.indicatorIconWrap,
                      { backgroundColor: (INDICATOR_COLORS[ind.id] ?? colors.primary) + '25' },
                    ]}
                  >
                    <MaterialIcons
                      name={INDICATOR_MATERIAL_ICONS[ind.id] ?? 'spa'}
                      size={22}
                      color={INDICATOR_COLORS[ind.id] ?? colors.primary}
                    />
                  </View>
                  <ThemedText style={[styles.indicatorPercent, { color: colors.text }]}>
                    {ind.percent}%
                  </ThemedText>
                </View>
                <ThemedText type="defaultSemiBold" style={[styles.indicatorLabel, { color: colors.text }]}>
                  {ind.label}
                </ThemedText>
                <View style={[styles.indicatorBarBg, { backgroundColor: colors.subtitle + '20' }]}>
                  <View
                    style={[
                      styles.indicatorBarFill,
                      {
                        width: `${Math.min(100, ind.percent)}%`,
                        backgroundColor: INDICATOR_COLORS[ind.id] ?? colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <ThemedText style={[styles.emptyIndicators, { color: colors.subtitle }]}>
            暂无详细指标
          </ThemedText>
        )}
      </View>

      <TouchableOpacity
        style={[styles.cta, { backgroundColor: colors.primary }]}
        onPress={onCtaPress}
        activeOpacity={0.9}
      >
        <IconSymbol name="sparkles" size={20} color="#fff" />
        <ThemedText style={styles.ctaText}>生成护肤方案更新</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  scoreCard: {
    padding: 24,
    marginBottom: 24,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  faceIconBg: {
    position: 'absolute',
    top: -16,
    right: -16,
    opacity: 0.06,
  },
  scoreCardTitle: { fontSize: 20, marginBottom: 16, textAlign: 'center' },
  scoreCardRow: { marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18 },
  circleWrap: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  circleTrack: {
    position: 'absolute',
  },
  circleProgress: {
    position: 'absolute',
  },
  circleCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  scoreNumber: { fontSize: 48, fontWeight: '800' },
  scoreBadgeWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  scoreBadgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  scoreDesc: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 260,
  },
  indicatorsSection: { marginBottom: 24 },
  indicatorsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  indicatorsTitle: { fontSize: 18 },
  indicatorsDate: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  indicatorCard: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  indicatorCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  indicatorIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorPercent: { fontSize: 18, fontWeight: '700' },
  indicatorLabel: { fontSize: 14, marginBottom: 8 },
  indicatorBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  indicatorBarFill: { height: '100%', borderRadius: 3 },
  emptyIndicators: { fontSize: 14, paddingVertical: 16 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#C4A77D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
