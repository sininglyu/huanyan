import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiGet, getUploadsUrl } from '@/constants/api';

interface AnalysisResult {
  skinType: string;
  issues: Array<{ type: string; label: string; severity: number }>;
  wrinkles: string[];
  pores: string[];
  score: number;
  skincareRoutine: { morning: string[]; evening: string[]; weekly: string[] };
  makeupStyles?: Array<{ id: string; name: string; steps: string[] }>;
}

interface AnalysisResponse {
  id: string;
  imagePath: string;
  result: AnalysisResult;
  score: number;
  createdAt: string;
}

export default function AnalysisDetailScreen() {
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

  const r = data.result;
  const score = data.score ?? r?.score ?? 0;
  const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString('zh-CN') : '';

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {data.imagePath ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: getUploadsUrl(data.imagePath) }} style={styles.photo} resizeMode="cover" />
          </View>
        ) : null}
        <View style={[styles.scoreCard, { backgroundColor: colors.primaryLight + '30' }]}>
          <ThemedText type="title">得分: {score}</ThemedText>
          <ThemedText style={[styles.date, { color: colors.subtitle }]}>{dateStr ? `分析记录 · ${dateStr}` : `分析记录 #${id}`}</ThemedText>
          <ThemedText style={[styles.meta, { color: colors.subtitle }]}>肤质: {r?.skinType ?? '-'}</ThemedText>
        </View>
        {r?.issues && r.issues.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>检测到的问题</ThemedText>
            {r.issues.map((i) => (
              <ThemedText key={i.type} style={styles.issue}>{i.label}{i.severity > 1 ? `（${i.severity === 2 ? '中度' : '较明显'}）` : ''}</ThemedText>
            ))}
          </View>
        )}
        {r?.wrinkles && r.wrinkles.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>细纹</ThemedText>
            <ThemedText style={styles.step}>{r.wrinkles.join(' · ')}</ThemedText>
          </View>
        )}
        {r?.pores && r.pores.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>毛孔</ThemedText>
            <ThemedText style={styles.step}>{r.pores.join(' · ')}</ThemedText>
          </View>
        )}
        {r?.skincareRoutine && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>护肤建议</ThemedText>
            <ThemedText style={styles.step}>早: {r.skincareRoutine.morning?.join(' → ') ?? '-'}</ThemedText>
            <ThemedText style={styles.step}>晚: {r.skincareRoutine.evening?.join(' → ') ?? '-'}</ThemedText>
            {r.skincareRoutine.weekly?.length ? <ThemedText style={styles.step}>周: {r.skincareRoutine.weekly.join(' · ')}</ThemedText> : null}
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
  scroll: { flex: 1, padding: 16 },
  loadingText: { marginTop: 12 },
  errorText: { color: '#888' },
  imageWrap: { width: '100%', height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  photo: { width: '100%', height: '100%' },
  scoreCard: { padding: 24, borderRadius: 16, marginBottom: 24 },
  date: { marginTop: 8 },
  meta: { marginTop: 4, fontSize: 14 },
  section: { marginBottom: 20 },
  sectionTitle: { marginBottom: 8 },
  issue: { fontSize: 14, opacity: 0.9, marginBottom: 4 },
  step: { fontSize: 14, opacity: 0.9, marginBottom: 4 },
  cta: { marginTop: 24, padding: 16, borderRadius: 12, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
