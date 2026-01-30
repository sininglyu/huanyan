import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiGet, getAuthToken } from '@/constants/api';

type ProfileTab = 'analysis' | 'favorites' | 'checkin';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const [tab, setTab] = useState<ProfileTab>('analysis');
  const [profile, setProfile] = useState<{ nickname?: string; currentStreak?: number; totalLikesReceived?: number } | null>(null);
  const [skinReports, setSkinReports] = useState<{ averageScore?: number; changePercent?: number } | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<Array<{ id: string; score?: number; createdAt?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [p, reports, history] = await Promise.all([
          apiGet<{ nickname: string; currentStreak: number; totalLikesReceived: number }>('/user/profile'),
          apiGet<{ averageScore: number; changePercent: number }>('/user/skin-reports?period=month'),
          apiGet<{ items: Array<{ id: string; score: number; createdAt: string }> }>('/analysis/history'),
        ]);
        setProfile(p);
        setSkinReports(reports);
        setAnalysisHistory(history.items ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]} />
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.nickname}>{profile?.nickname ?? '小仙女酱'}</ThemedText>
          <View style={[styles.badge, { backgroundColor: '#F97316' }]}>
            <ThemedText style={styles.badgeText}>LV.4 护肤达人</ThemedText>
          </View>
          <ThemedText style={styles.followers}>粉丝 850</ThemedText>
          <TouchableOpacity style={styles.settings} onPress={() => router.push('/profile/settings')}>
            <ThemedText>⚙</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={[styles.metrics, { backgroundColor: colors.primaryLight + '30' }]}>
          <View style={styles.metricItem}>
            <ThemedText type="title">82</ThemedText>
            <ThemedText style={styles.metricLabel}>当前指数</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText type="title">12</ThemedText>
            <ThemedText style={styles.metricLabel}>连续打卡</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText type="title">1205</ThemedText>
            <ThemedText style={styles.metricLabel}>获赞总数</ThemedText>
          </View>
        </View>
        <View style={styles.tabs}>
          {(['analysis', 'favorites', 'checkin'] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={styles.tab}>
              <ThemedText style={[styles.tabText, tab === t && { color: colors.primary, fontWeight: '600' }]}>
                {t === 'analysis' ? '分析记录' : t === 'favorites' ? '收藏' : '打卡'}
              </ThemedText>
              {tab === t && <View style={[styles.tabUnderline, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          ))}
        </View>
        {tab === 'analysis' && (
          <>
            <View style={styles.trendHeader}>
              <ThemedText type="defaultSemiBold">肤质评分趋势</ThemedText>
              <ThemedText style={{ color: colors.primary }}>
                {(skinReports?.changePercent ?? 0) >= 0 ? '上升' : '下降'} {Math.abs(skinReports?.changePercent ?? 5)}%
              </ThemedText>
            </View>
            <View style={[styles.chartPlaceholder, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f3f4f6' }]}>
              <ThemedText style={styles.placeholderText}>11.10  11.11  11.12  11.13  11.14  11.15</ThemedText>
            </View>
            <TouchableOpacity style={styles.recordCard} onPress={() => router.push('/profile/analysis/placeholder-id')}>
              <View style={[styles.recordThumb, { backgroundColor: colors.primaryLight }]} />
              <View style={styles.recordInfo}>
                <ThemedText>2023-11-20</ThemedText>
                <ThemedText type="defaultSemiBold">得分: 82</ThemedText>
                <ThemedText style={styles.recordIssue}>黑眼圈</ThemedText>
              </View>
              <ThemedText>›</ThemedText>
            </TouchableOpacity>
          </>
        )}
        {tab === 'favorites' && (
          <View style={styles.placeholder}>
            <ThemedText>暂无收藏</ThemedText>
          </View>
        )}
        {tab === 'checkin' && (
          <View style={styles.placeholder}>
            <ThemedText>打卡记录</ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  editBadge: { position: 'absolute', right: 0, bottom: 0, width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#fff' },
  nickname: { marginTop: 12 },
  badge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12 },
  followers: { marginTop: 8, fontSize: 14, opacity: 0.8 },
  settings: { position: 'absolute', top: 24, right: 16 },
  metrics: { flexDirection: 'row', marginHorizontal: 16, borderRadius: 12, padding: 16, justifyContent: 'space-around', marginBottom: 16 },
  metricItem: { alignItems: 'center' },
  metricLabel: { fontSize: 12, marginTop: 4, opacity: 0.8 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.08)' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 14 },
  tabUnderline: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2 },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  chartPlaceholder: { height: 120, marginHorizontal: 16, borderRadius: 8, justifyContent: 'flex-end', padding: 8 },
  placeholderText: { fontSize: 11, opacity: 0.6 },
  recordCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 16, marginTop: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12 },
  recordThumb: { width: 56, height: 56, borderRadius: 8 },
  recordInfo: { flex: 1, marginLeft: 12 },
  recordIssue: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  placeholder: { padding: 40, alignItems: 'center' },
});
