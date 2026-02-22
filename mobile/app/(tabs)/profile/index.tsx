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
import { apiGet, getAuthToken, getAvatarFromUser } from '@/constants/api';
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
  /** Brownish bar color for weekly skin score chart */
  chartBar: '#9C7355',
  chartBarToday: '#7D5A3E',
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

/** 周一至周日固定标签，与后端 calendarWeekFromToday 顺序一致 */
const WEEK_DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

/** 当前日历周（周一至周日）UTC 日期字符串，与后端 calendarWeekFromToday(0) 一致 */
function getCalendarWeekDates(): string[] {
  const now = new Date();
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - daysSinceMonday);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/** 今天在周一~周日中的索引（0=周一, 6=周日） */
function getTodayWeekIndex(): number {
  return (new Date().getUTCDay() + 6) % 7;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, refreshToken } = useAuth();
  const [profile, setProfile] = useState<{
    nickname?: string;
    avatarUrl?: string;
    gender?: string | null;
    age?: number | null;
    currentStreak?: number;
  } | null>(null);
  const [skinReports, setSkinReports] = useState<{ averageScore?: number; changePercent?: number } | null>(null);
  const [weeklySkinReports, setWeeklySkinReports] = useState<{
    averageScore?: number;
    changePercent?: number;
    dailyScores?: Array<{ date: string; score: number | null }>;
  } | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<
    Array<{ id: string; score?: number | null; createdAt?: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (silent = false) => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      setProfile(null);
      setSkinReports(null);
      setWeeklySkinReports(null);
      setAnalysisHistory([]);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const historyRes = await apiGet<{
        items?: Array<{ id: string; score?: number | null; createdAt?: string }>;
      }>('/analysis/history');
      setAnalysisHistory(Array.isArray(historyRes?.items) ? historyRes.items : []);
      const [p, reports, weekReports] = await Promise.all([
        apiGet<{ nickname?: string; avatarUrl?: string; gender?: string | null; age?: number | null; currentStreak?: number }>('/user/profile').catch(() => null),
        apiGet<{ averageScore?: number; changePercent?: number }>('/user/skin-reports?period=month').catch(() => null),
        apiGet<{ averageScore?: number; changePercent?: number; dailyScores?: Array<{ date: string; score: number | null }> }>('/user/skin-reports?period=week').catch(() => null),
      ]);
      if (p != null) setProfile(p);
      if (reports != null) setSkinReports(reports);
      if (weekReports != null) setWeeklySkinReports(weekReports);
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
        fetchData(true);
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

  const displayName = profile?.nickname ?? '焕颜用户';
  const profileAvatarUri = getAvatarFromUser(profile);
  const streak = profile?.currentStreak ?? 0;
  const scanCount = analysisHistory?.length ?? 0;
  const rawWeek = weeklySkinReports as
    | { averageScore?: number; dailyScores?: Array<{ date: string; score: number | null }>; daily_scores?: Array<{ date: string; score: number | null }> }
    | null
    | undefined;
  const dailyList = Array.isArray(rawWeek?.dailyScores) ? rawWeek.dailyScores : Array.isArray(rawWeek?.daily_scores) ? rawWeek.daily_scores : [];
  const dateToScore = new Map<string, number>();
  for (const d of dailyList) {
    const dateStr = typeof d?.date === 'string' ? d.date : '';
    if (!dateStr) continue;
    const raw = d?.score;
    const num = raw != null ? (typeof raw === 'number' ? raw : Number(raw)) : null;
    if (num != null && !Number.isNaN(num) && num >= 0 && num <= 100) dateToScore.set(dateStr, num);
  }
  const CHART_HEIGHT_PX = 100;
  const weekDates = getCalendarWeekDates();
  /** Weekly average = average of Mon–Sun daily scores (only days with tests) */
  const scoresInWeek = weekDates
    .map((d) => dateToScore.get(d))
    .filter((s): s is number => s != null);
  /** Displayed score: average of week (Mon–Sun, days with tests only), or fallback */
  const score =
    scoresInWeek.length > 0
      ? Math.round(scoresInWeek.reduce((a, b) => a + b, 0) / scoresInWeek.length)
      : (weeklySkinReports?.averageScore ?? skinReports?.averageScore ?? analysisHistory?.[0]?.score ?? 0);
  const changePercent = weeklySkinReports?.changePercent ?? skinReports?.changePercent ?? 0;
  const todayIndex = getTodayWeekIndex();
  /** Each bar: brownish if test taken that day, none if not; height = day's average score (0–100) */
  const barData = weekDates.map((dateStr, i) => {
    const dayScore = dateToScore.get(dateStr);
    const hasTest = dayScore != null;
    const percent = hasTest ? Math.min(100, Math.max(0, Number(dayScore))) : 0;
    return {
      label: WEEK_DAY_LABELS[i],
      hasTest,
      percent,
      isToday: i === todayIndex,
    };
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: PROFILE_COLORS.background }]}>
      <View style={[styles.header, { backgroundColor: PROFILE_COLORS.background + 'CC', borderBottomColor: PROFILE_COLORS.border }]}>
        <TouchableOpacity style={styles.headerBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <IconSymbol name="chevron.left" size={24} color={PROFILE_COLORS.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: PROFILE_COLORS.text }]}>个人中心</ThemedText>
        <TouchableOpacity style={styles.headerBtn}>
          <IconSymbol name="bell.fill" size={22} color={PROFILE_COLORS.text} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, cardStyle]}>
          <View style={styles.profileTop}>
            <TouchableOpacity
              style={[styles.avatarWrap, { borderColor: PROFILE_COLORS.primary + '33' }]}
              onPress={() => router.push('/profile/edit')}
              activeOpacity={0.9}
            >
              {profileAvatarUri ? (
                <Image source={{ uri: profileAvatarUri }} style={styles.avatarImg} resizeMode="cover" />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: PROFILE_COLORS.primary + '20' }]}>
                  <IconSymbol name="photo.fill" size={28} color={PROFILE_COLORS.subtitle} />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <ThemedText style={[styles.nickname, { color: PROFILE_COLORS.text }]}>{displayName}</ThemedText>
              <ThemedText style={[styles.profileDetail, { color: PROFILE_COLORS.subtitle }]}>
                {[profile?.gender, profile?.age != null ? `${profile.age} 岁` : null].filter(Boolean).join(' · ') || '未设置'}
              </ThemedText>
              <View style={[styles.badge, { backgroundColor: PROFILE_COLORS.primary + '1A' }]}>
                <IconSymbol name="checkmark.seal.fill" size={12} color={PROFILE_COLORS.primary} />
                <ThemedText style={[styles.badgeText, { color: PROFILE_COLORS.primary }]}>金牌会员</ThemedText>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: PROFILE_COLORS.primary }]}
            activeOpacity={0.9}
            onPress={() => router.push('/profile/edit')}
          >
            <ThemedText style={styles.editBtnText}>编辑资料</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, cardStyle]}>
            <IconSymbol name="flame.fill" size={22} color={PROFILE_COLORS.primary} />
            <ThemedText style={[styles.statLabel, { color: PROFILE_COLORS.subtitle }]}>连续打卡</ThemedText>
            <ThemedText style={[styles.statValue, { color: PROFILE_COLORS.text }]}>{streak} 天</ThemedText>
          </View>
          <View style={[styles.statCard, cardStyle]}>
            <IconSymbol name="camera.fill" size={22} color={PROFILE_COLORS.primary} />
            <ThemedText style={[styles.statLabel, { color: PROFILE_COLORS.subtitle }]}>扫描次数</ThemedText>
            <ThemedText style={[styles.statValue, { color: PROFILE_COLORS.text }]}>{scanCount}</ThemedText>
          </View>
          <View style={[styles.statCard, cardStyle]}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={22} color={PROFILE_COLORS.primary} />
            <ThemedText style={[styles.statLabel, { color: PROFILE_COLORS.subtitle }]}>进度</ThemedText>
            <ThemedText style={[styles.statValue, { color: PROFILE_COLORS.text }]}>85%</ThemedText>
          </View>
        </View>

        <View style={styles.journeySectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: PROFILE_COLORS.text }]}>焕颜之旅</ThemedText>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile/journey')}>
            <ThemedText style={[styles.viewDetailLink, { color: PROFILE_COLORS.primary }]}>查看详情</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={[styles.journeyCard, cardStyle]}>
          <View style={styles.journeyScoreBlock}>
            <ThemedText style={[styles.journeyLabel, { color: PROFILE_COLORS.subtitle }]}>周皮肤评分</ThemedText>
            <View style={styles.journeyScoreRow}>
              <ThemedText style={[styles.journeyScore, { color: PROFILE_COLORS.text }]} numberOfLines={1}>
                {score}/100
              </ThemedText>
              <ThemedText
                style={[
                  styles.journeyChange,
                  { color: changePercent >= 0 ? PROFILE_COLORS.green : '#c62828' },
                ]}
                numberOfLines={1}
              >
                较上周 {changePercent >= 0 ? '+' : ''}{changePercent}%
              </ThemedText>
            </View>
          </View>
          <View style={[styles.barChartRow, { height: CHART_HEIGHT_PX + 28 }]}>
            {barData.map((item, i) => (
              <View key={`${item.label}-${i}`} style={[styles.barCol, item.isToday && styles.barColToday]}>
                <View style={[styles.barTray, { height: CHART_HEIGHT_PX }]}>
                  {item.hasTest && (
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(6, (item.percent / 100) * CHART_HEIGHT_PX),
                          backgroundColor: item.isToday ? PROFILE_COLORS.chartBarToday : PROFILE_COLORS.chartBar,
                        },
                      ]}
                    />
                  )}
                </View>
                <ThemedText
                  style={[
                    styles.barLabel,
                    { color: PROFILE_COLORS.primary },
                    item.isToday && styles.barLabelToday,
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <ThemedText style={[styles.prefsTitle, { color: PROFILE_COLORS.text }]}>偏好设置</ThemedText>

        <TouchableOpacity
          style={[styles.prefRow, cardStyle]}
          onPress={() => router.push('/(tabs)/profile/plan')}
          activeOpacity={0.8}
        >
          <View style={[styles.prefIconWrap, { backgroundColor: PROFILE_COLORS.primary + '1A' }]}>
            <IconSymbol name="sparkles" size={22} color={PROFILE_COLORS.primary} />
          </View>
          <View style={styles.prefBody}>
            <ThemedText style={[styles.prefTitle, { color: PROFILE_COLORS.text }]}>我的方案</ThemedText>
            <ThemedText style={[styles.prefSub, { color: PROFILE_COLORS.subtitle }]}>早晚护肤日程</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={20} color={PROFILE_COLORS.subtitle} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.prefRow, cardStyle]}
          onPress={() => router.push('/(tabs)/profile/activity')}
          activeOpacity={0.8}
        >
          <View style={[styles.prefIconWrap, { backgroundColor: PROFILE_COLORS.primary + '1A' }]}>
            <IconSymbol name="bubble.left.and.bubble.right.fill" size={22} color={PROFILE_COLORS.primary} />
          </View>
          <View style={styles.prefBody}>
            <ThemedText style={[styles.prefTitle, { color: PROFILE_COLORS.text }]}>我的活动</ThemedText>
            <ThemedText style={[styles.prefSub, { color: PROFILE_COLORS.subtitle }]}>我参与评论的讨论</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={20} color={PROFILE_COLORS.subtitle} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.prefRow, cardStyle]}
          onPress={() => router.push('/(tabs)/profile/favorites')}
          activeOpacity={0.8}
        >
          <View style={[styles.prefIconWrap, { backgroundColor: PROFILE_COLORS.primary + '1A' }]}>
            <IconSymbol name="bookmark" size={22} color={PROFILE_COLORS.primary} />
          </View>
          <View style={styles.prefBody}>
            <ThemedText style={[styles.prefTitle, { color: PROFILE_COLORS.text }]}>收藏项目</ThemedText>
            <ThemedText style={[styles.prefSub, { color: PROFILE_COLORS.subtitle }]}>我收藏的讨论</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={20} color={PROFILE_COLORS.subtitle} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.prefRow, cardStyle]}
          onPress={() => router.push('/(tabs)/profile/settings')}
          activeOpacity={0.8}
        >
          <View style={[styles.prefIconWrap, { backgroundColor: PROFILE_COLORS.primary + '1A' }]}>
            <IconSymbol name="gearshape.fill" size={22} color={PROFILE_COLORS.primary} />
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
  headerTitle: { fontSize: 24, fontWeight: '600', flex: 1, textAlign: 'center', lineHeight: 32 },
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
  statLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, lineHeight: 14 },
  statValue: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, lineHeight: 26 },
  journeySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  viewDetailLink: { fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  journeyCard: {
    padding: 24,
    marginBottom: 24,
  },
  journeyScoreBlock: { marginBottom: 24, minHeight: 56 },
  journeyLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, lineHeight: 16 },
  journeyScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'nowrap' },
  journeyScore: { fontSize: 28, fontWeight: '700', minWidth: 72, lineHeight: 36 },
  journeyChange: { fontSize: 12, fontWeight: '700', flexShrink: 0, lineHeight: 16 },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    minWidth: 24,
  },
  barColToday: {
    backgroundColor: PROFILE_COLORS.primary + '15',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  barTray: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    minWidth: 8,
    borderRadius: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.06, shadowRadius: 2 },
      android: { elevation: 1 },
    }),
  },
  barLabel: { fontSize: 9, fontWeight: '700', lineHeight: 14 },
  barLabelToday: { fontWeight: '800', fontSize: 10 },
  prefsTitle: { fontSize: 18, fontWeight: '700', lineHeight: 24, paddingHorizontal: 4, paddingTop: 16, marginBottom: 12 },
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
  prefTitle: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  prefSub: { fontSize: 12, marginTop: 2 },
});
