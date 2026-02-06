import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiGet, getAuthToken } from '@/constants/api';
import { useAuth } from '@/contexts/auth-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Design tokens from HTML (primary #cfa577, background #f8f7f6, text #161412, subtitle #81766a, border #f4f2f1)
const PROFILE_COLORS = {
  primary: '#cfa577',
  background: '#f8f7f6',
  text: '#161412',
  subtitle: '#81766a',
  border: '#f4f2f1',
  green: '#07880e',
  cardBg: '#FFFFFF',
};

const cardStyle = {
  backgroundColor: PROFILE_COLORS.cardBg,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: PROFILE_COLORS.border,
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: { elevation: 3 },
  }),
};

const WEEK_BAR_HEIGHTS = [30, 45, 60, 25, 90, 40, 35];
const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const TODAY_INDEX = 4;

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, refreshToken } = useAuth();
  const [profile, setProfile] = useState<{
    nickname?: string;
    avatarUrl?: string;
    currentStreak?: number;
  } | null>(null);
  const [skinReports, setSkinReports] = useState<{ averageScore?: number; changePercent?: number } | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<
    Array<{ id: string; score?: number | null; createdAt?: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const historyRes = await apiGet<{
        items: Array<{ id: string; score?: number | null; createdAt?: string }>;
      }>('/analysis/history');
      setAnalysisHistory(historyRes.items ?? []);
      try {
        const [p, reports] = await Promise.all([
          apiGet<{ nickname: string; avatarUrl?: string; currentStreak: number }>('/user/profile'),
          apiGet<{ averageScore: number; changePercent: number }>('/user/skin-reports?period=month'),
        ]);
        setProfile(p);
        setSkinReports(reports);
      } catch {
        // Optional endpoints may not exist
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        await refreshToken();
      }
      setAnalysisHistory([]);
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchData]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && getAuthToken()) {
        fetchData();
      }
    }, [isAuthenticated, fetchData])
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered, { backgroundColor: PROFILE_COLORS.background }]}>
        <ActivityIndicator size="large" color={PROFILE_COLORS.primary} />
      </ThemedView>
    );
  }

  const displayName = profile?.nickname ?? 'Sarah Jenkins';
  const streak = profile?.currentStreak ?? 14;
  const scanCount = analysisHistory.length || 42;
  const score = skinReports?.averageScore ?? analysisHistory[0]?.score ?? 78;
  const changePercent = skinReports?.changePercent ?? 5;

  return (
    <ThemedView style={[styles.container, { backgroundColor: PROFILE_COLORS.background }]}>
      {/* Sticky header: back, title, notifications */}
      <View style={[styles.header, { backgroundColor: PROFILE_COLORS.background + 'CC', borderBottomColor: PROFILE_COLORS.border }]}>
        <TouchableOpacity style={styles.headerBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <IconSymbol name="chevron.left" size={24} color={PROFILE_COLORS.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: PROFILE_COLORS.text }]}>个人中心</ThemedText>
        <TouchableOpacity style={styles.headerBtn}>
          <IconSymbol name="notifications" size={22} color={PROFILE_COLORS.text} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={[styles.profileCard, cardStyle]}>
          <View style={styles.profileTop}>
            <View style={[styles.avatarWrap, { borderColor: PROFILE_COLORS.primary + '33' }]}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: PROFILE_COLORS.primary + '20' }]} />
              )}
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={[styles.nickname, { color: PROFILE_COLORS.text }]}>{displayName}</ThemedText>
              <ThemedText style={[styles.profileDetail, { color: PROFILE_COLORS.subtitle }]}>
                油性 - 混合性 | 28 岁
              </ThemedText>
              <View style={[styles.badge, { backgroundColor: PROFILE_COLORS.primary + '1A' }]}>
                <IconSymbol name="verified" size={12} color={PROFILE_COLORS.primary} />
                <ThemedText style={[styles.badgeText, { color: PROFILE_COLORS.primary }]}>金牌会员</ThemedText>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: PROFILE_COLORS.primary }]}
            activeOpacity={0.9}
          >
            <ThemedText style={styles.editBtnText}>编辑资料</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Stats row: 连续打卡, 扫描次数, 进度 */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, cardStyle]}>
            <IconSymbol name="local_fire_department" size={22} color={PROFILE_COLORS.primary} />
            <ThemedText style={[styles.statLabel, { color: PROFILE_COLORS.subtitle }]}>连续打卡</ThemedText>
            <ThemedText style={[styles.statValue, { color: PROFILE_COLORS.text }]}>{streak} 天</ThemedText>
          </View>
          <View style={[styles.statCard, cardStyle]}>
            <IconSymbol name="camera_front" size={22} color={PROFILE_COLORS.primary} />
            <ThemedText style={[styles.statLabel, { color: PROFILE_COLORS.subtitle }]}>扫描次数</ThemedText>
            <ThemedText style={[styles.statValue, { color: PROFILE_COLORS.text }]}>{scanCount}</ThemedText>
          </View>
          <View style={[styles.statCard, cardStyle]}>
            <IconSymbol name="monitoring" size={22} color={PROFILE_COLORS.primary} />
            <ThemedText style={[styles.statLabel, { color: PROFILE_COLORS.subtitle }]}>进度</ThemedText>
            <ThemedText style={[styles.statValue, { color: PROFILE_COLORS.text }]}>85%</ThemedText>
          </View>
        </View>

        {/* 焕颜之旅 section header */}
        <View style={styles.journeySectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: PROFILE_COLORS.text }]}>焕颜之旅</ThemedText>
          <TouchableOpacity onPress={() => router.push('/profile/journey')}>
            <ThemedText style={[styles.viewDetailLink, { color: PROFILE_COLORS.primary }]}>查看详情</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Journey card: 周皮肤评分 + bar chart */}
        <View style={[styles.journeyCard, cardStyle]}>
          <View style={styles.journeyScoreBlock}>
            <ThemedText style={[styles.journeyLabel, { color: PROFILE_COLORS.subtitle }]}>周皮肤评分</ThemedText>
            <View style={styles.journeyScoreRow}>
              <ThemedText style={[styles.journeyScore, { color: PROFILE_COLORS.text }]}>{score}/100</ThemedText>
              <ThemedText style={[styles.journeyChange, { color: PROFILE_COLORS.green }]}>
                较上周 +{changePercent}%
              </ThemedText>
            </View>
          </View>
          <View style={styles.barChartRow}>
            {WEEK_DAYS.map((day, i) => (
              <View key={day} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${WEEK_BAR_HEIGHTS[i]}%`,
                      backgroundColor: i === TODAY_INDEX ? PROFILE_COLORS.primary : PROFILE_COLORS.primary + '33',
                    },
                  ]}
                />
                <ThemedText
                  style={[
                    styles.barLabel,
                    { color: i === TODAY_INDEX ? PROFILE_COLORS.primary : PROFILE_COLORS.subtitle },
                  ]}
                >
                  {day}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* 偏好设置 */}
        <ThemedText style={[styles.prefsTitle, { color: PROFILE_COLORS.text }]}>偏好设置</ThemedText>

        <TouchableOpacity
          style={[styles.prefRow, cardStyle]}
          onPress={() => router.push('/profile/plan')}
          activeOpacity={0.8}
        >
          <View style={[styles.prefIconWrap, { backgroundColor: PROFILE_COLORS.primary + '1A' }]}>
            <IconSymbol name="auto_awesome" size={22} color={PROFILE_COLORS.primary} />
          </View>
          <View style={styles.prefBody}>
            <ThemedText style={[styles.prefTitle, { color: PROFILE_COLORS.text }]}>我的方案</ThemedText>
            <ThemedText style={[styles.prefSub, { color: PROFILE_COLORS.subtitle }]}>早晚护肤日程</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={20} color={PROFILE_COLORS.subtitle} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.prefRow, cardStyle]} activeOpacity={0.8}>
          <View style={[styles.prefIconWrap, { backgroundColor: PROFILE_COLORS.primary + '1A' }]}>
            <IconSymbol name="shopping_bag" size={22} color={PROFILE_COLORS.primary} />
          </View>
          <View style={styles.prefBody}>
            <ThemedText style={[styles.prefTitle, { color: PROFILE_COLORS.text }]}>订单记录</ThemedText>
            <ThemedText style={[styles.prefSub, { color: PROFILE_COLORS.subtitle }]}>查看订单物流</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={20} color={PROFILE_COLORS.subtitle} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.prefRow, cardStyle]} activeOpacity={0.8}>
          <View style={[styles.prefIconWrap, { backgroundColor: PROFILE_COLORS.primary + '1A' }]}>
            <IconSymbol name="bookmark" size={22} color={PROFILE_COLORS.primary} />
          </View>
          <View style={styles.prefBody}>
            <ThemedText style={[styles.prefTitle, { color: PROFILE_COLORS.text }]}>收藏项目</ThemedText>
            <ThemedText style={[styles.prefSub, { color: PROFILE_COLORS.subtitle }]}>您收藏的产品和贴士</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={20} color={PROFILE_COLORS.subtitle} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.prefRow, cardStyle]}
          onPress={() => router.push('/profile/settings')}
          activeOpacity={0.8}
        >
          <View style={[styles.prefIconWrap, { backgroundColor: PROFILE_COLORS.primary + '1A' }]}>
            <IconSymbol name="settings" size={22} color={PROFILE_COLORS.primary} />
          </View>
          <View style={styles.prefBody}>
            <ThemedText style={[styles.prefTitle, { color: PROFILE_COLORS.text }]}>设置</ThemedText>
            <ThemedText style={[styles.prefSub, { color: PROFILE_COLORS.subtitle }]}>账户与通知设置</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={20} color={PROFILE_COLORS.subtitle} />
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 48, height: 48, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 24, fontWeight: '600', flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  profileCard: {
    padding: 24,
    marginBottom: 16,
  },
  profileTop: { alignItems: 'center', marginBottom: 20 },
  avatarWrap: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%' },
  profileInfo: { alignItems: 'center' },
  nickname: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  profileDetail: { fontSize: 14, marginTop: 4 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  editBtn: {
    alignSelf: 'center',
    minWidth: 140,
    maxWidth: 220,
    width: '100%',
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  editBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    minWidth: 100,
    flex: 1,
    padding: 16,
    gap: 4,
  },
  statLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  statValue: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  journeySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  viewDetailLink: { fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  journeyCard: {
    padding: 24,
    marginBottom: 24,
  },
  journeyScoreBlock: { marginBottom: 24 },
  journeyLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  journeyScoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  journeyScore: { fontSize: 30, fontWeight: '700' },
  journeyChange: { fontSize: 12, fontWeight: '700' },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 128,
    gap: 4,
    paddingHorizontal: 4,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 8 },
  bar: {
    width: '100%',
    minHeight: 8,
    borderRadius: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.06, shadowRadius: 2 },
      android: { elevation: 1 },
    }),
  },
  barLabel: { fontSize: 9, fontWeight: '700' },
  prefsTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 4, paddingTop: 16, marginBottom: 12 },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    gap: 16,
  },
  prefIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefBody: { flex: 1 },
  prefTitle: { fontSize: 14, fontWeight: '700' },
  prefSub: { fontSize: 12, marginTop: 2 },
});
