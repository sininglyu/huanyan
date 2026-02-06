import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiGet, getAuthToken } from '@/constants/api';

interface HistoryItem {
  id: string;
  score?: number | null;
  createdAt?: string;
  imagePath?: string;
}

export default function JourneyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!getAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiGet<{ items: HistoryItem[] }>('/analysis/history?limit=50');
      setItems(res.items ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useFocusEffect(
    useCallback(() => {
      if (getAuthToken()) fetchHistory();
    }, [fetchHistory])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={[styles.loadingText, { color: colors.subtitle }]}>
              加载分析记录...
            </ThemedText>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centered}>
            <ThemedText style={[styles.emptyText, { color: colors.subtitle }]}>
              暂无分析记录
            </ThemedText>
            <ThemedText style={[styles.emptyHint, { color: colors.subtitle }]}>
              去首页「分析我的皮肤」拍摄照片获取分析
            </ThemedText>
          </View>
        ) : (
          items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { backgroundColor: colors.primaryLight + '15' }]}
              onPress={() => router.push(`/profile/analysis/${item.id}`)}
              activeOpacity={0.8}
            >
              <View style={[styles.thumb, { backgroundColor: colors.primaryLight + '50' }]} />
              <View style={styles.cardBody}>
                <ThemedText type="defaultSemiBold">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '分析记录'}
                </ThemedText>
                <ThemedText style={[styles.scoreText, { color: colors.subtitle }]}>
                  得分: {item.score ?? '-'} / 100
                </ThemedText>
              </View>
              <ThemedText style={[styles.chevron, { color: colors.subtitle }]}>›</ThemedText>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  centered: { paddingVertical: 48, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorText: { color: '#888', fontSize: 14 },
  emptyText: { fontSize: 16 },
  emptyHint: { fontSize: 13, marginTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  cardBody: { flex: 1, marginLeft: 14 },
  scoreText: { fontSize: 13, marginTop: 4 },
  chevron: { fontSize: 24, fontWeight: '300' },
});
