import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiGet } from '@/constants/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AnalysisResultContent, type AnalysisResponse } from '@/components/analysis-result-content';

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

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
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
      <AnalysisResultContent
        data={data}
        onCtaPress={() => router.push('/ai/ar-tryon')}
      />
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
  loadingText: { marginTop: 12 },
  errorText: { color: '#888' },
});
