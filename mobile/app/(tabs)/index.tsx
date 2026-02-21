import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Design tokens from HTML: primary #cfa577, background #f8f7f6, text #161412, subtitle #81766a, border #f4f2f1
const HOME_COLORS = {
  primary: '#cfa577',
  background: '#f8f7f6',
  text: '#161412',
  subtitle: '#81766a',
  border: '#f4f2f1',
  cardBg: '#FFFFFF',
};

const TIP_IMAGE_URI = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_LF-xnXfq0Glhip1FcLhPEqJHIoAgXMwyihZXUpex3nmpJ0JvEmnJnJ_BDcSV_HXhYUptiM5x9F-FJ9t7gk1yLTW3aCyzwSpI0yoF8bKSuL3MDn-Intg6CktTqfJ4GpzKUSQSI57atD0AX_ntmh9cwIEA-x_wQb9PcDOXP_rL7WJCvQElS9jFS0KhIHCsJUuHTlUKgHWOCSfbQGa6v74sg4yDcDrnJCNBcJV-jGnv2oOLKUuSf1h_2xi_QVxLhsQuJd6WwFebfNjn';

const RECOMMENDATIONS = [
  {
    tag: '产品',
    title: '温和洁面泡沫',
    desc: '富含芦荟精华，敏感肌首选。',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqPrG9WpJ73qCvfpCzgauOum-69BBQuyDAsEPp4oiVtah09BKHRVaf2r6F1CaS6UguyH7SJQkfmBL1AZNkofHWh47onAD9hQR9uTIwHyGG0ffx_1mHK6DtJBV0PFNcUDY60dXGuYbOSq0Eye9KtJM2WybEp9QSYe_0_JHqSmNlehFZYehIJuh_ekhW1hE4Zz7OgTcS1XJwb32R5xh5SzctaXIs3OYYVm2IFTJyRJrAXEJoqG7KYhlL5b6jrJgpSzIash0jX9GQB10',
  },
  {
    tag: '文章',
    title: '十步护肤指南',
    desc: '了解打造水光肌的韩式护肤法。',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmadOvCUSzV4pwu8aW_cs1N-0074ZXQnVLpJnIfaeFIxq6PHIkWOUoO8yVqNwY1P3AT96Nqk5MJFEwNpWz8GBBvcm8QoZeB61clnERIa-6KdInn9nE_4St9aeA-FplCCSQSOvDmGy_64zU_zdZc2eCVzDAnp2KxAKZKsRXP7qqANVIRoFQ1aIPCV4JMTka-4IZyc2paiUQvaud3uN9jJAzYDcDpIxJxpZyjjN7KIuX-5ZXbFy3-ef1V7YCnf1cdCzA8i-8HQH8eH8',
  },
];

const cardStyle = {
  backgroundColor: HOME_COLORS.cardBg,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: HOME_COLORS.border,
  ...Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
    android: { elevation: 3 },
  }),
};

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={[styles.container, { backgroundColor: HOME_COLORS.background }]}>
      {/* Sticky header: greeting + name, search + notifications (with badge) */}
      <View style={[styles.header, { backgroundColor: HOME_COLORS.background + 'CC', borderBottomColor: HOME_COLORS.border }]}>
        <View>
          <ThemedText style={[styles.greeting, { color: HOME_COLORS.subtitle }]}>早上好</ThemedText>
          <ThemedText style={[styles.userName, { color: HOME_COLORS.text }]}>Sarah Jenkins</ThemedText>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={[styles.headerIconBtn, cardStyle]}>
            <IconSymbol name="magnifyingglass" size={22} color={HOME_COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerIconBtn, cardStyle, styles.notifBtn]}>
            <IconSymbol name="bell.fill" size={22} color={HOME_COLORS.text} />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Daily tip card: image + gradient + overlay content */}
        <TouchableOpacity
          style={styles.tipCard}
          onPress={() => router.push('/ai/capture')}
          activeOpacity={0.95}
        >
          <ImageBackground
            source={{ uri: TIP_IMAGE_URI }}
            style={styles.tipCardBg}
            imageStyle={styles.tipCardBgImage}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.tipCardContent}>
              <View style={styles.tipBadge}>
                <ThemedText style={styles.tipBadgeText}>每日小贴士</ThemedText>
              </View>
              <ThemedText style={styles.tipTitle}>补水是亮泽肌肤的关键</ThemedText>
              <ThemedText style={styles.tipLink}>阅读今日建议 →</ThemedText>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Two metric cards: 水润度, 紫外线指数 */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, cardStyle]}>
            <View style={styles.metricCardInner}>
              <View style={styles.metricCardHeader}>
                <IconSymbol name="drop.fill" size={20} color={HOME_COLORS.primary} />
                <ThemedText style={[styles.metricLabel, { color: HOME_COLORS.subtitle }]}>水润度</ThemedText>
              </View>
              <ThemedText style={[styles.metricValue, { color: HOME_COLORS.text }]}>良好</ThemedText>
              <ThemedText style={[styles.metricDetail, { color: HOME_COLORS.subtitle }]}>水分 45%</ThemedText>
            </View>
            <View style={[styles.metricRingBg, { borderColor: HOME_COLORS.primary + '1A' }]} />
            <View
              style={[
                styles.metricRingProgress,
                {
                  borderTopColor: HOME_COLORS.primary,
                  borderLeftColor: HOME_COLORS.primary,
                  borderRightColor: HOME_COLORS.primary,
                  borderBottomColor: 'transparent',
                  transform: [{ rotate: '-90deg' }],
                },
              ]}
            />
          </View>
          <View style={[styles.metricCard, cardStyle]}>
            <View style={styles.metricCardInner}>
              <View style={styles.metricCardHeader}>
                <IconSymbol name="sun.max.fill" size={20} color={HOME_COLORS.primary} />
                <ThemedText style={[styles.metricLabel, { color: HOME_COLORS.subtitle }]}>紫外线指数</ThemedText>
              </View>
              <ThemedText style={[styles.metricValue, { color: HOME_COLORS.text }]}>低</ThemedText>
              <ThemedText style={[styles.metricDetail, { color: HOME_COLORS.subtitle }]}>无需防护</ThemedText>
            </View>
            <View style={[styles.metricRingBg, { borderColor: HOME_COLORS.primary + '1A' }]} />
            <View
              style={[
                styles.metricRingProgress,
                {
                  borderLeftColor: HOME_COLORS.primary + '66',
                  borderTopColor: HOME_COLORS.primary + '66',
                  borderRightColor: 'transparent',
                  borderBottomColor: 'transparent',
                  transform: [{ rotate: '12deg' }],
                },
              ]}
            />
          </View>
        </View>

        {/* 晨间方案 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: HOME_COLORS.text }]}>晨间方案</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile/plan')}>
              <ThemedText style={[styles.viewAll, { color: HOME_COLORS.primary }]}>查看全部</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={[styles.routineCard, cardStyle]}>
            <View style={styles.routineProgressWrap}>
              <View style={[styles.routineProgressBg, { borderColor: HOME_COLORS.primary + '33' }]} />
              <View
                style={[
                  styles.routineProgressFill,
                  {
                    borderTopColor: HOME_COLORS.primary,
                    borderLeftColor: HOME_COLORS.primary,
                    borderRightColor: HOME_COLORS.primary,
                    borderBottomColor: 'transparent',
                  },
                ]}
              />
              <ThemedText style={[styles.routineProgressText, { color: HOME_COLORS.primary }]}>3/4</ThemedText>
            </View>
            <View style={styles.routineBody}>
              <ThemedText style={[styles.routineStatus, { color: HOME_COLORS.text }]}>即将完成</ThemedText>
              <ThemedText style={[styles.routineNext, { color: HOME_COLORS.subtitle }]}>下一步：涂抹防晒霜</ThemedText>
            </View>
            <TouchableOpacity style={[styles.playBtn, { backgroundColor: HOME_COLORS.primary }]} activeOpacity={0.9}>
              <IconSymbol name="play.fill" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 为你推荐 */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitleStandalone, { color: HOME_COLORS.text }]}>为你推荐</ThemedText>
          {RECOMMENDATIONS.map((r, i) => (
            <TouchableOpacity key={i} style={[styles.recommendCard, cardStyle]} activeOpacity={0.8}>
              <ImageBackground
                source={{ uri: r.imageUri }}
                style={styles.recommendThumb}
                imageStyle={styles.recommendThumbImage}
              />
              <View style={styles.recommendBody}>
                <ThemedText style={[styles.recommendTag, { color: HOME_COLORS.primary }]}>{r.tag}</ThemedText>
                <ThemedText style={[styles.recommendTitle, { color: HOME_COLORS.text }]}>{r.title}</ThemedText>
                <ThemedText style={[styles.recommendDesc, { color: HOME_COLORS.subtitle }]} numberOfLines={2}>{r.desc}</ThemedText>
              </View>
            </TouchableOpacity>
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
  greeting: { fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  userName: { fontSize: 22, fontWeight: '700', marginTop: 2 },
  headerIcons: { flexDirection: 'row', gap: 12 },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBtn: { position: 'relative' },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: HOME_COLORS.cardBg,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 28 },
  tipCard: {
    height: 192,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  tipCardBg: { flex: 1 },
  tipCardBgImage: { borderRadius: 16 },
  tipCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  tipBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tipBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  tipTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  tipLink: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  metricCard: {
    flex: 1,
    height: 128,
    padding: 16,
    overflow: 'hidden',
  },
  metricCardInner: { zIndex: 10 },
  metricCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  metricLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  metricValue: { fontSize: 22, fontWeight: '700' },
  metricDetail: { fontSize: 12, marginTop: 4 },
  metricRingBg: {
    position: 'absolute',
    right: -16,
    bottom: -16,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 6,
  },
  metricRingProgress: {
    position: 'absolute',
    right: -16,
    bottom: -16,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 6,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionTitleStandalone: { fontSize: 18, fontWeight: '700', paddingHorizontal: 4, marginBottom: 12 },
  viewAll: { fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  routineProgressWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineProgressBg: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
  },
  routineProgressFill: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  routineProgressText: { fontSize: 10, fontWeight: '700' },
  routineBody: { flex: 1 },
  routineStatus: { fontSize: 14, fontWeight: '700' },
  routineNext: { fontSize: 12, marginTop: 2 },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  recommendCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    gap: 16,
  },
  recommendThumb: { width: 96, height: 96, borderRadius: 12 },
  recommendThumbImage: { borderRadius: 12 },
  recommendBody: { flex: 1, justifyContent: 'center', paddingVertical: 4 },
  recommendTag: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  recommendTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  recommendDesc: { fontSize: 12 },
});
