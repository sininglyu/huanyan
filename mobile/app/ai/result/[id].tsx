import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
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
  const LIGHT_BG = '#F5F0E8';
  const DARK_TEXT = '#5C4033';
  const DARK_SUBTITLE = '#6B5B4F';

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
      <View style={[styles.container, styles.centered, { backgroundColor: LIGHT_BG }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={[styles.loadingText, { color: DARK_TEXT }]}>加载分析结果...</ThemedText>
      </View>
    );
  }
  if (error || !data) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: LIGHT_BG }]}>
        <ThemedText style={[styles.errorText, { color: DARK_TEXT }]}>{error ?? '未找到分析结果'}</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: LIGHT_BG }]}>
      <View style={[styles.header, { borderBottomColor: DARK_SUBTITLE + '40' }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={DARK_TEXT} />
        </TouchableOpacity>
        <ThemedText type="defaultSemiBold" style={[styles.headerTitle, { color: DARK_TEXT }]}>
          分析结果
        </ThemedText>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
          <IconSymbol name="paperplane.fill" size={22} color={DARK_TEXT} />
        </TouchableOpacity>
      </View>
      <AnalysisResultContent
        data={data}
        onCtaPress={() => router.push('/ai/ar-tryon')}
        forceLightBackground
      />
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: { padding: 8, marginLeft: 8, marginRight: 8 },
  headerTitle: { fontSize: 18 },
  loadingText: { marginTop: 12 },
  errorText: { fontSize: 16 },
});
