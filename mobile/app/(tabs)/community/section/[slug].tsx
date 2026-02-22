/**
 * Community subsection: hero, tabs (UI only), discussion list by section.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { apiGet, getAvatarFromUser } from '@/constants/api';

const COLORS = {
  primary: '#C69C6D',
  primaryDark: '#8C6B4B',
  background: '#fffaf9',
  text: '#161412',
  zinc400: '#a1a1aa',
  zinc500: '#71717a',
  peach: '#F9F3EA',
  border: 'rgba(198, 156, 109, 0.2)',
  cardBg: '#FFFFFF',
};

const SECTION_META: Record<string, { members: string; imageUri: string; subtitle: string }> = {
  '油皮战士': {
    members: '2,400 成员',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGzO4vibrIVycx--Qe8fd1txo7rLzn6XVmUlmBaPBSdojNJM0LNN6flXzpNwu2GBzX_cDaNAbMoFI7Uv-2FeoAB8ayeQOnneXRSy4064jgdaZy3yYN2jllHyndyMJHVjkSk_OPQ4BsWmX-5DISl3CEmI6fiI9MxtioZBYkSHxBApsFHKR4hY7mVTtJGAYk5sxyeRBk-LTRLJJLYXGks6VorARIzreF33BhYiZbpjF1Hc3-KYovDFmAlcsVWZk7N2bZf97vnPkhKV3T',
    subtitle: '控油 · 祛痘 · 清爽',
  },
  '抗老先锋': {
    members: '5,100 成员',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRwPXfeLH3yq8ErR3yRPNXBl-nm7abTENaQZr_Q9KYAQdUzGCjndlNTl6CykFm35PBvk5w1g_UaO8-wjYkM1lJ8MjUe1iyMKMMr6hikkNz4oCrFbkFk-bN72c4p6Ije_8klqBAp_Rb0Yssli1t3hccqpvdE_RCp4Pn_nV973C2-gY7I_xbZ-hmjte5buBsgZxThnViZ-LsgJvWCHc-pVz8vUZ4x1y6LPHzdWxxcf3Y4sYCZIZ_pguJOFZpeqmXtJq4xydLw6_7fFyM',
    subtitle: '抗初老 · 成分党',
  },
  '祛痘历程': {
    members: '1.2万 成员',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxNWwcGcV9yCzENGCGkb3JDmGRJJfJttSCAkCVd8cN-_vKrIBd7nYUbLmPe57rsBtcNlGHLOKsjB2HFzhDwWg5QAdhc__dKyljZy1My4OFWB2E_leAxE2oluKmiCKWoa2SF0XwIMg3eTR3wP9Tq5_2I6N8ATVhGMoDnG_PBd_Dt6qzu77SrWJ0r4gXSptpOIR78IQLTmeNWgBj-EutemWAm--ikOBHhxTqqcQSVsf1foOioMyj1KNQe1jAdMMZ4xVZpCUVAcmGhZ2Q',
    subtitle: '刷酸 · 祛痘 · 修护',
  },
  '敏肌呵护': {
    members: '1,800 成员',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTf2N6Bj0APcnS3SchyhQQQ7hazORHzl-7Opj7IzY3CDmixuVZB9hce5JWKrajaLDfIv37Wzlr-PfFEnE9LZ0WMCSeUGF8RGLIRHLz41kfwyCKyayZA6mkyUpU5efnZwtC5CyCh4cZo1qJluMrvQg_7hMeEtV1Dmbim4nZEDvJehh6jvVC33C_O-rRK_eveyv5oQXxLxYUdeQiDTWmgAAboldOxU-Yz53-PIXVCwnV_HoEu6HhtbRyoAqGwS92fF18W1xYqAEhxygg',
    subtitle: '温和 · 修护 · 维稳',
  },
};

interface SectionPost {
  id: string;
  title: string;
  content?: string | null;
  likeCount: number;
  commentCount: number;
  viewCount?: number;
  createdAt: string;
  imageUrls?: string[] | null;
  author?: { id: string; nickname?: string; avatarUrl?: string | null };
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffD > 0) return `${diffD}天前`;
  if (diffH > 0) return `${diffH}小时前`;
  if (diffM > 0) return `${diffM}分钟前`;
  return '刚刚';
}

const { width } = Dimensions.get('window');
const HERO_HEIGHT = Math.min((width * 9) / 16, 256);

export default function CommunitySectionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const sectionTitle = slug ? decodeURIComponent(slug) : '';
  const meta = sectionTitle ? SECTION_META[sectionTitle] : null;
  const [posts, setPosts] = useState<SectionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const fetchPosts = useCallback(async () => {
    if (!sectionTitle) return;
    setLoading(true);
    try {
      const res = await apiGet<{ items: SectionPost[] }>(
        `/community/posts?limit=30&section=${encodeURIComponent(sectionTitle)}&sort=${activeTab === 0 ? 'hot' : 'recent'}`
      );
      setPosts(res.items ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [sectionTitle, activeTab]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (!sectionTitle || !meta) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText style={{ color: COLORS.zinc500 }}>专题不存在</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios-new" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: COLORS.primary }]}>专题详情</ThemedText>
        <TouchableOpacity style={styles.headerBtn}>
          <MaterialIcons name="more-horiz" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.hero, { height: HERO_HEIGHT }]}>
        <ImageBackground source={{ uri: meta.imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover">
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <ThemedText style={styles.heroTitle}>{sectionTitle}</ThemedText>
            <View style={styles.heroMeta}>
              <MaterialIcons name="group" size={14} color="rgba(255,255,255,0.9)" />
              <ThemedText style={styles.heroMembers}>{meta.members}</ThemedText>
              <ThemedText style={styles.heroDot}>•</ThemedText>
              <ThemedText style={styles.heroSubtitle}>{meta.subtitle}</ThemedText>
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={[styles.tabs, { borderBottomColor: COLORS.border }]}>
        {['热门讨论', '最新发布', '精华贴'].map((label, i) => (
          <TouchableOpacity
            key={label}
            style={[styles.tab, i === activeTab && styles.tabActive]}
            onPress={() => setActiveTab(i)}
          >
            <ThemedText style={[styles.tabText, i === activeTab && { color: COLORS.primary, fontWeight: '700' }]}>
              {label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          <>
            {posts.length === 0 ? (
              <ThemedText style={[styles.empty, { color: COLORS.zinc500 }]}>暂无讨论</ThemedText>
            ) : (
              posts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={[styles.card, { backgroundColor: COLORS.cardBg, borderColor: COLORS.border }]}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/community/post/${post.id}`)}
                >
                  <View style={styles.cardMain}>
                    <View style={styles.cardTop}>
                      {(() => {
                        const u = getAvatarFromUser(post.author);
                        return u ? (
                        <Image source={{ uri: u }} style={styles.cardAvatar} resizeMode="cover" />
                      ) : (
                        <View style={[styles.cardAvatar, styles.avatarPlaceholder]} />
                      ); })()}
                      <View>
                        <ThemedText style={[styles.cardAuthorName, { color: COLORS.zinc500 }]}>
                          {post.author?.nickname ?? '用户'}
                        </ThemedText>
                        <ThemedText style={[styles.cardTime, { color: COLORS.zinc400 }]}>
                          {formatTime(post.createdAt)}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText style={[styles.cardTitle, { color: COLORS.text }]} numberOfLines={2}>
                      {post.title}
                    </ThemedText>
                    {post.content ? (
                      <ThemedText style={[styles.cardExcerpt, { color: COLORS.zinc500 }]} numberOfLines={2}>
                        {post.content}
                      </ThemedText>
                    ) : null}
                    {post.imageUrls && post.imageUrls.length > 0 && (
                      <View style={styles.cardThumbs}>
                        {post.imageUrls.slice(0, 2).map((url, i) => (
                          <Image key={i} source={{ uri: url }} style={styles.thumb} />
                        ))}
                      </View>
                    )}
                    <View style={styles.cardStats}>
                      <View style={styles.cardStat}>
                        <MaterialIcons name="chat-bubble-outline" size={16} color={COLORS.zinc400} />
                        <ThemedText style={[styles.cardStatText, { color: COLORS.zinc400 }]}>{post.commentCount}</ThemedText>
                      </View>
                      <View style={styles.cardStat}>
                        <MaterialIcons name="visibility" size={16} color={COLORS.zinc400} />
                        <ThemedText style={[styles.cardStatText, { color: COLORS.zinc400 }]}>
                          {(post.viewCount ?? 0) >= 1000 ? `${((post.viewCount ?? 0) / 1000).toFixed(1)}k` : post.viewCount ?? 0}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.upvoteCol, { backgroundColor: COLORS.background }]}>
                    <MaterialIcons name="keyboard-arrow-up" size={24} color={COLORS.primary} />
                    <ThemedText style={[styles.upvoteNum, { color: COLORS.primary }]}>{post.likeCount}</ThemedText>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.fabWrap}>
        <View style={styles.fab}>
          <IconSymbol name="plus" size={20} color="#fff" />
          <ThemedText style={styles.fabText}>加入社区</ThemedText>
        </View>
      </View>
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
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 48, height: 48, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  hero: { width: '100%', overflow: 'hidden' },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroMembers: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  heroDot: { color: 'rgba(255,255,255,0.6)' },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
  },
  tab: { flex: 1, paddingBottom: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.zinc500 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  loadingWrap: { paddingVertical: 24, alignItems: 'center' },
  empty: { textAlign: 'center', paddingVertical: 48 },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  cardMain: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardAvatar: { width: 20, height: 20, borderRadius: 10 },
  avatarPlaceholder: { backgroundColor: COLORS.zinc400 + '40' },
  cardAuthorName: { fontSize: 10, fontWeight: '600' },
  cardTime: { fontSize: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardExcerpt: { fontSize: 12, marginBottom: 8 },
  cardThumbs: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  cardStats: { flexDirection: 'row', gap: 16 },
  cardStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardStatText: { fontSize: 10 },
  upvoteCol: {
    width: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  upvoteNum: { fontSize: 12, fontWeight: '700' },
  fabWrap: { position: 'absolute', bottom: 96, right: 16 },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    backgroundColor: COLORS.primary,
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  fabText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
