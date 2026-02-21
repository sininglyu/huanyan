import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { apiGet, getAuthToken } from '@/constants/api';

// Design tokens from HTML: primary #C69C6D, primary-dark #8C6B4B, background #fffaf9, accent #F5E6D3
const COMMUNITY_COLORS = {
  primary: '#C69C6D',
  primaryDark: '#8C6B4B',
  background: '#fffaf9',
  accent: '#F5E6D3',
  text: '#161412',
  subtitle: '#81766a',
  zinc400: '#a1a1aa',
  zinc500: '#71717a',
  border: 'rgba(198, 156, 109, 0.1)',
  cardBg: '#FFFFFF',
};

const GROUP_CARDS = [
  {
    label: '油皮战士',
    members: '2400 成员',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGzO4vibrIVycx--Qe8fd1txo7rLzn6XVmUlmBaPBSdojNJM0LNN6flXzpNwu2GBzX_cDaNAbMoFI7Uv-2FeoAB8ayeQOnneXRSy4064jgdaZy3yYN2jllHyndyMJHVjkSk_OPQ4BsWmX-5DISl3CEmI6fiI9MxtioZBYkSHxBApsFHKR4hY7mVTtJGAYk5sxyeRBk-LTRLJJLYXGks6VorARIzreF33BhYiZbpjF1Hc3-KYovDFmAlcsVWZk7N2bZf97vnPkhKV3T',
  },
  {
    label: '抗老先锋',
    members: '5100 成员',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRwPXfeLH3yq8ErR3yRPNXBl-nm7abTENaQZr_Q9KYAQdUzGCjndlNTl6CykFm35PBvk5w1g_UaO8-wjYkM1lJ8MjUe1iyMKMMr6hikkNz4oCrFbkFk-bN72c4p6Ije_8klqBAp_Rb0Yssli1t3hccqpvdE_RCp4Pn_nV973C2-gY7I_xbZ-hmjte5buBsgZxThnViZ-LsgJvWCHc-pVz8vUZ4x1y6LPHzdWxxcf3Y4sYCZIZ_pguJOFZpeqmXtJq4xydLw6_7fFyM',
  },
  {
    label: '祛痘历程',
    members: '1.2万 成员',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxNWwcGcV9yCzENGCGkb3JDmGRJJfJttSCAkCVd8cN-_vKrIBd7nYUbLmPe57rsBtcNlGHLOKsjB2HFzhDwWg5QAdhc__dKyljZy1My4OFWB2E_leAxE2oluKmiCKWoa2SF0XwIMg3eTR3wP9Tq5_2I6N8ATVhGMoDnG_PBd_Dt6qzu77SrWJ0r4gXSptpOIR78IQLTmeNWgBj-EutemWAm--ikOBHhxTqqcQSVsf1foOioMyj1KNQe1jAdMMZ4xVZpCUVAcmGhZ2Q',
  },
  {
    label: '敏肌呵护',
    members: '1800 成员',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTf2N6Bj0APcnS3SchyhQQQ7hazORHzl-7Opj7IzY3CDmixuVZB9hce5JWKrajaLDfIv37Wzlr-PfFEnE9LZ0WMCSeUGF8RGLIRHLz41kfwyCKyayZA6mkyUpU5efnZwtC5CyCh4cZo1qJluMrvQg_7hMeEtV1Dmbim4nZEDvJehh6jvVC33C_O-rRK_eveyv5oQXxLxYUdeQiDTWmgAAboldOxU-Yz53-PIXVCwnV_HoEu6HhtbRyoAqGwS92fF18W1xYqAEhxygg',
  },
];

const DISCUSSION_ICONS = ['flame.fill', 'spa', 'science', 'wb_sunny', 'spa'] as const;

export interface CommunityPost {
  id: string;
  title: string;
  content?: string | null;
  likeCount: number;
  commentCount: number;
  favoriteCount?: number;
  createdAt: string;
  author?: { id: string; nickname?: string; avatarUrl?: string | null };
}

const cardStyle = {
  backgroundColor: COMMUNITY_COLORS.cardBg,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: COMMUNITY_COLORS.border,
  ...Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
    android: { elevation: 3 },
  }),
};

const { width } = Dimensions.get('window');
const CARD_GAP = 16;
const PADDING = 16;
const GROUP_CARD_SIZE = (width - PADDING * 2 - CARD_GAP) / 2;

function formatPostMeta(post: CommunityPost): string {
  const count = post.commentCount ?? 0;
  const date = post.createdAt ? new Date(post.createdAt) : null;
  if (!date) return `${count} 评论`;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  const timeAgo = diffD > 0 ? `${diffD}天前` : diffH > 0 ? `${diffH}小时前` : diffM > 0 ? `${diffM}分钟前` : '刚刚';
  return `${count} 评论 · ${timeAgo}`;
}

export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchPosts = useCallback(async (q?: string) => {
    try {
      const url = q?.trim() ? `/community/posts?limit=50&q=${encodeURIComponent(q.trim())}` : '/community/posts?limit=50';
      const res = await apiGet<{ items: CommunityPost[] }>(url);
      setPosts(res.items ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getAuthToken()) {
      setLoading(true);
      fetchPosts();
    } else {
      fetchPosts();
    }
  }, [fetchPosts]);

  const onSearchSubmit = () => {
    const q = searchInput.trim();
    if (q) {
      router.push(`/community/search?q=${encodeURIComponent(q)}`);
      return;
    }
    setSearchQuery('');
    setLoading(true);
    fetchPosts();
  };

  const onNewPost = () => {
    router.push('/(tabs)/community/create');
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: COMMUNITY_COLORS.background }]}>
      {/* Sticky header: menu, title (cursive/primary), notifications */}
      <View style={[styles.header, { backgroundColor: COMMUNITY_COLORS.background + 'CC', borderBottomColor: COMMUNITY_COLORS.border }]}>
        <TouchableOpacity style={styles.headerBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <IconSymbol name="menu" size={24} color={COMMUNITY_COLORS.primary} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: COMMUNITY_COLORS.primary }]}>
          焕颜社区中心
        </ThemedText>
        <TouchableOpacity style={styles.headerBtn}>
          <IconSymbol name="bell.fill" size={24} color={COMMUNITY_COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchWrap, cardStyle]}>
          <IconSymbol name="search" size={20} color={COMMUNITY_COLORS.subtitle} />
          <TextInput
            style={[styles.searchInput, { color: COMMUNITY_COLORS.text }]}
            placeholder="搜索讨论标题"
            placeholderTextColor={COMMUNITY_COLORS.subtitle}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
            editable={true}
          />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 社区中心 */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: COMMUNITY_COLORS.text }]}>社区中心</ThemedText>
          <ThemedText style={[styles.viewAll, { color: COMMUNITY_COLORS.primary }]}>查看全部</ThemedText>
        </View>

        <View style={styles.groupGrid}>
          {GROUP_CARDS.map((g) => (
            <TouchableOpacity
              key={g.label}
              style={[styles.groupCard, { width: GROUP_CARD_SIZE, height: GROUP_CARD_SIZE }]}
              activeOpacity={0.9}
              onPress={() => router.push(`/community/section/${encodeURIComponent(g.label)}`)}
            >
              <ImageBackground
                source={{ uri: g.imageUri }}
                style={styles.groupCardBg}
                imageStyle={styles.groupCardBgImage}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.groupCardContent}>
                  <ThemedText style={styles.groupCardTitle}>{g.label}</ThemedText>
                  <View style={styles.memberPill}>
                    <ThemedText style={styles.memberPillText}>{g.members}</ThemedText>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>

        {/* 热门讨论 */}
        <ThemedText style={[styles.discussSectionTitle, { color: COMMUNITY_COLORS.text }]}>
          {searchQuery.trim() ? '搜索结果' : '热门讨论'}
        </ThemedText>

        {loading ? (
          <View style={styles.discussLoading}>
            <ActivityIndicator size="small" color={COMMUNITY_COLORS.primary} />
            <ThemedText style={[styles.loadingText, { color: COMMUNITY_COLORS.subtitle }]}>加载中...</ThemedText>
          </View>
        ) : (
          <View style={styles.discussList}>
            {posts.map((post, i) => (
              <TouchableOpacity
                key={post.id}
                style={[styles.discussCard, cardStyle]}
                activeOpacity={0.8}
                onPress={() => router.push(`/community/post/${post.id}`)}
              >
                <View style={[styles.discussIconWrap, { backgroundColor: COMMUNITY_COLORS.primary + '1A' }]}>
                  <IconSymbol name={DISCUSSION_ICONS[i % DISCUSSION_ICONS.length]} size={22} color={COMMUNITY_COLORS.primary} />
                </View>
                <View style={styles.discussBody}>
                  <ThemedText style={[styles.discussTitle, { color: COMMUNITY_COLORS.text }]} numberOfLines={2}>{post.title}</ThemedText>
                  <ThemedText style={[styles.discussMeta, { color: COMMUNITY_COLORS.zinc500 }]}>{formatPostMeta(post)}</ThemedText>
                </View>
                <View style={styles.discussUpCol}>
                  <IconSymbol name="arrow_drop_up" size={20} color={COMMUNITY_COLORS.zinc400} />
                  <ThemedText style={[styles.discussUp, { color: COMMUNITY_COLORS.primary }]}>
                    {(post.likeCount ?? 0) >= 1000 ? `${((post.likeCount ?? 0) / 1000).toFixed(1)}k` : String(post.likeCount ?? 0)}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
            {posts.length === 0 && !loading && (
              <ThemedText style={[styles.emptyText, { color: COMMUNITY_COLORS.subtitle }]}>
                {searchQuery.trim() ? '暂无相关讨论' : '暂无讨论'}
              </ThemedText>
            )}
          </View>
        )}

        {/* 寻找你的焕颜伙伴 */}
        <View style={styles.bannerWrap}>
          <LinearGradient
            colors={[COMMUNITY_COLORS.primary, COMMUNITY_COLORS.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerBlur} />
            <TouchableOpacity style={styles.bannerClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <IconSymbol name="close" size={22} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
            <View style={styles.bannerTopRow}>
              <View style={styles.bannerIconWrap}>
                <ThemedText style={styles.bannerEmoji}>🤝</ThemedText>
              </View>
            </View>
            <View style={styles.bannerTextBlock}>
              <ThemedText style={styles.bannerTitle}>寻找你的焕颜伙伴</ThemedText>
              <ThemedText style={styles.bannerSub}>
                与拥有相同肤质的人联系，获取互相激励和护肤贴士。
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.bannerBtn, { backgroundColor: '#fff' }]}
              activeOpacity={0.9}
            >
              <ThemedText style={[styles.bannerBtnText, { color: COMMUNITY_COLORS.primary }]}>
                开始匹配
              </ThemedText>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* FAB: new post */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={onNewPost}>
        <LinearGradient
          colors={[COMMUNITY_COLORS.primary, COMMUNITY_COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <IconSymbol name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
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
  headerBtn: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '600', flex: 1, textAlign: 'center', letterSpacing: -0.5 },
  searchSection: { paddingHorizontal: 16, paddingVertical: 12 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingLeft: 16,
    paddingRight: 16,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  viewAll: { fontSize: 14, fontWeight: '600' },
  groupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    padding: 16,
  },
  groupCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },
  groupCardBg: { flex: 1 },
  groupCardBgImage: { borderRadius: 12 },
  groupCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    gap: 12,
  },
  groupCardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  memberPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  memberPillText: { color: 'rgba(255,255,255,0.9)', fontSize: 10 },
  discussSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
  },
  discussLoading: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 24, justifyContent: 'center' },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 14, padding: 24, textAlign: 'center' },
  discussList: { paddingHorizontal: 16, gap: 12 },
  discussCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 16,
  },
  discussIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discussBody: { flex: 1 },
  discussTitle: { fontSize: 14, fontWeight: '700' },
  discussMeta: { fontSize: 11, marginTop: 4, letterSpacing: 0.5, fontWeight: '600' },
  discussUpCol: { alignItems: 'center' },
  discussUp: { fontSize: 12, fontWeight: '700' },
  bannerWrap: { padding: 16, paddingBottom: 28 },
  banner: {
    borderRadius: 16,
    padding: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: COMMUNITY_COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  bannerBlur: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ translateX: 24 }, { translateY: -48 }],
  },
  bannerClose: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
  bannerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerIconWrap: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 8,
    borderRadius: 8,
  },
  bannerEmoji: { fontSize: 24 },
  bannerTextBlock: { marginTop: 16 },
  bannerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  bannerSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 },
  bannerBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  bannerBtnText: { fontSize: 14, fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 88,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    zIndex: 1000,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
    ...Platform.select({
      ios: { shadowColor: COMMUNITY_COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
      android: { elevation: 12 },
    }),
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
