import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, SectionBoxShadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiGet, getUploadsUrl } from '@/constants/api';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface IndicatorItem {
  id: string;
  label: string;
  percent: number;
}

interface AnalysisResultLegacy {
  skinType: string;
  issues?: Array<{ type: string; label: string; severity: number }>;
  wrinkles?: string[];
  pores?: string[];
  score: number;
  skincareRoutine?: { morning: string[]; evening: string[]; weekly: string[] };
  makeupStyles?: Array<{ id: string; name: string; steps: string[] }>;
}

interface AnalysisResultAdvanced {
  overallScore?: number;
  score: number;
  skinType: string;
  skinColor?: string;
  indicators?: IndicatorItem[];
  skincareRoutine?: { morning: string[]; evening: string[]; weekly: string[] };
  makeupStyles?: Array<{ id: string; name: string; steps: string[] }>;
}

type AnalysisResult = AnalysisResultLegacy & Partial<AnalysisResultAdvanced>;

interface AnalysisResponse {
  id: string;
  imagePath: string;
  result: AnalysisResult;
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

const INDICATOR_COLORS: Record<string, string> = {
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

export default function AnalysisResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiGet<AnalysisResponse>(`/analysis/${id}`)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (!data) return;
    try {
      await Share.share({
        message: `我的焕颜皮肤分析得分：${data.score}分，肤质：${data.result?.skinType ?? '-'}`,
        title: '焕颜分析结果',
      });
    } catch {
      Alert.alert('提示', '分享取消或失败');
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>加载分析结果...</ThemedText>
      </ThemedView>
    );
  }
  if (error || !data) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText style={styles.errorText}>{error ?? '未找到分析结果'}</ThemedText>
      </ThemedView>
    );
  }

  const r = data.result as AnalysisResult;
  const score = data.score ?? r?.overallScore ?? r?.score ?? 0;
  const indicators: IndicatorItem[] =
    Array.isArray(r?.indicators) && r.indicators.length > 0
      ? r.indicators
      : [];

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#F5F0E8' }]}>
      <View style={[styles.header, { borderBottomColor: colors.subtitle + '30' }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
          分析结果
        </ThemedText>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
          <IconSymbol name="paperplane.fill" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.scoreCard, SectionBoxShadow]}>
          <View style={styles.scoreCardRow}>
            <ThemedText type="defaultSemiBold" style={styles.scoreCardTitle}>
              整体皮肤健康
            </ThemedText>
            {data.imagePath ? (
              <Image
                source={{ uri: getUploadsUrl(data.imagePath) }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.subtitle + '30' }]} />
            )}
          </View>
          <View style={styles.circleRow}>
            <View style={[styles.circleOuter, { borderColor: colors.primary }]}>
              <View style={styles.circleInner}>
                <ThemedText style={[styles.scoreNumber, { color: colors.text }]}>
                  {score}
                </ThemedText>
                <ThemedText style={[styles.scoreLabel, { color: colors.subtitle }]}>
                  {getScoreLabel(score)}
                </ThemedText>
              </View>
            </View>
          </View>
          <ThemedText style={[styles.scoreDesc, { color: colors.subtitle }]}>
            {getScoreDescription(score, r?.skinType ?? '未知')}
          </ThemedText>
        </View>

        <View style={styles.indicatorsSection}>
          <View style={styles.indicatorsHeader}>
            <ThemedText type="defaultSemiBold" style={styles.indicatorsTitle}>
              详细指标
            </ThemedText>
            <ThemedText style={[styles.indicatorsDate, { color: colors.subtitle }]}>
              {data.createdAt
                ? new Date(data.createdAt).toLocaleString('zh-CN', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </ThemedText>
          </View>
          {indicators.length > 0 ? (
            <View style={styles.indicatorsGrid}>
              {indicators.map((ind) => (
                <View
                  key={ind.id}
                  style={[styles.indicatorCard, SectionBoxShadow]}
                >
                  <View
                    style={[
                      styles.indicatorIconWrap,
                      { backgroundColor: (INDICATOR_COLORS[ind.id] ?? colors.primary) + '25' },
                    ]}
                  >
                    <View style={styles.indicatorIcon} />
                  </View>
                  <ThemedText style={styles.indicatorPercent}>{ind.percent}%</ThemedText>
                  <ThemedText style={[styles.indicatorLabel, { color: colors.subtitle }]}>
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
            <View style={[styles.legacySection, SectionBoxShadow]}>
              <ThemedText style={[styles.meta, { color: colors.subtitle }]}>
                肤质: {r?.skinType ?? '-'}
                {r?.skinColor ? ` · ${r.skinColor}` : ''}
              </ThemedText>
              <ThemedText style={[styles.meta, { color: colors.subtitle }]}>
                得分: {score}
              </ThemedText>
            </View>
          )}
        </View>

        {r?.skincareRoutine && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              护肤建议
            </ThemedText>
            <ThemedText style={[styles.step, { color: colors.subtitle }]}>
              早: {r.skincareRoutine.morning?.join(' → ') ?? '-'}
            </ThemedText>
            <ThemedText style={[styles.step, { color: colors.subtitle }]}>
              晚: {r.skincareRoutine.evening?.join(' → ') ?? '-'}
            </ThemedText>
            {r.skincareRoutine.weekly?.length ? (
              <ThemedText style={[styles.step, { color: colors.subtitle }]}>
                周: {r.skincareRoutine.weekly.join(' · ')}
              </ThemedText>
            ) : null}
          </View>
        )}
        {r?.makeupStyles && r.makeupStyles.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              推荐妆容
            </ThemedText>
            <ThemedText style={[styles.step, { color: colors.subtitle }]}>
              {r.makeupStyles.map((m) => m.name).join(' · ')}
            </ThemedText>
          </View>
        )}
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/ai/ar-tryon')}
        >
          <ThemedText style={styles.ctaText}>AR 试妆</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: { padding: 8, marginLeft: 8, marginRight: 8 },
  headerTitle: { fontSize: 18 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  loadingText: { marginTop: 12 },
  errorText: { color: '#888' },
  scoreCard: {
    padding: 20,
    marginBottom: 20,
  },
  scoreCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreCardTitle: { fontSize: 16 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18 },
  circleRow: { alignItems: 'center', marginVertical: 8 },
  circleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleInner: { alignItems: 'center', justifyContent: 'center' },
  scoreNumber: { fontSize: 36, fontWeight: '700' },
  scoreLabel: { fontSize: 14, marginTop: 4 },
  scoreDesc: { fontSize: 14, lineHeight: 22, marginTop: 12, paddingHorizontal: 8 },
  indicatorsSection: { marginBottom: 20 },
  indicatorsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  indicatorsTitle: { fontSize: 16 },
  indicatorsDate: { fontSize: 12 },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  indicatorCard: {
    width: '47%',
    padding: 14,
  },
  indicatorIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  indicatorIcon: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.2)' },
  indicatorPercent: { fontSize: 20, fontWeight: '700' },
  indicatorLabel: { fontSize: 13, marginTop: 2 },
  indicatorBarBg: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  indicatorBarFill: { height: '100%', borderRadius: 3 },
  legacySection: { padding: 16 },
  meta: { fontSize: 14, marginBottom: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { marginBottom: 8 },
  step: { fontSize: 14, marginBottom: 4 },
  cta: { marginTop: 24, padding: 16, borderRadius: 12, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
