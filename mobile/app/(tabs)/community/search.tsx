/**
 * Search results: query from param, list posts with relevance %, excerpt, stats.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { apiGet, getAvatarFromUser } from '@/constants/api';

const COLORS = {
  primary: '#C69C6D',
  primaryDark: '#8C6B4B',
  text: '#161412',
  textMuted: '#71717a',
  zinc400: '#a1a1aa',
  zinc500: '#71717a',
  border: 'rgba(198, 156, 109, 0.2)',
  cardBg: '#FFFFFF',
};

interface SearchItem {
  id: string;
  title: string;
  excerpt: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  relevancePercent: number;
  createdAt: string;
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

function formatStat(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function relevanceBadgeStyle(pct: number): { backgroundColor: string; borderColor: string; color: string } {
  if (pct >= 90) return { backgroundColor: '#dcfce7', borderColor: '#bbf7d0', color: '#166534' };
  if (pct >= 75) return { backgroundColor: 'rgba(198, 156, 109, 0.15)', borderColor: COLORS.border, color: COLORS.primaryDark };
  return { backgroundColor: '#fef9c3', borderColor: '#fde047', color: '#854d0e' };
}

export default function CommunitySearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const router = useRouter();
  const [query, setQuery] = useState(decodeURIComponent(q ?? ''));
  const [input, setInput] = useState(decodeURIComponent(q ?? ''));
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const search = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiGet<{ items: SearchItem[]; total: number }>(
        `/community/search?q=${encodeURIComponent(keyword.trim())}`
      );
      setItems(res.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setQuery(decodeURIComponent(q ?? ''));
    setInput(decodeURIComponent(q ?? ''));
    search(decodeURIComponent(q ?? ''));
  }, [q, search]);

  const onSearchSubmit = () => {
    const trimmed = input.trim();
    if (trimmed) {
      setQuery(trimmed);
      search(trimmed);
    }
  };

  const clearSearch = () => {
    setInput('');
    setQuery('');
    setItems([]);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#fffaf9' }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: COLORS.primary }]}>搜索结果</ThemedText>
        <TouchableOpacity style={styles.headerBtn}>
          <MaterialIcons name="filter-list" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { borderColor: COLORS.border, backgroundColor: COLORS.cardBg }]}>
          <IconSymbol name="search" size={20} color={COLORS.primary} />
          <TextInput
            style={[styles.searchInput, { color: COLORS.text }]}
            placeholder="搜索群组或讨论"
            placeholderTextColor={COLORS.zinc500}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
          />
          {input.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
              <MaterialIcons name="close" size={16} color={COLORS.zinc400} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.chipRow}>
          <TouchableOpacity style={[styles.chip, { backgroundColor: COLORS.primary }]}>
            <ThemedText style={styles.chipTextActive}>综合</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, styles.chipInactive]}>
            <ThemedText style={[styles.chipTextInactive, { color: COLORS.zinc500 }]}>帖子</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, styles.chipInactive]}>
            <ThemedText style={[styles.chipTextInactive, { color: COLORS.zinc500 }]}>用户</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, styles.chipInactive]}>
            <ThemedText style={[styles.chipTextInactive, { color: COLORS.zinc500 }]}>群组</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {!query.trim() ? (
          <ThemedText style={[styles.hint, { color: COLORS.zinc500 }]}>输入关键词搜索</ThemedText>
        ) : loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <ThemedText style={[styles.loadingText, { color: COLORS.zinc500 }]}>搜索中...</ThemedText>
          </View>
        ) : (
          <>
            <ThemedText style={[styles.resultCount, { color: COLORS.zinc500 }]}>
              找到 <ThemedText style={{ color: COLORS.primary, fontWeight: '700' }}>{items.length}</ThemedText> 个关于 "{query}" 的结果
            </ThemedText>
            {items.map((item) => {
              const badge = relevanceBadgeStyle(item.relevancePercent);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.card, { backgroundColor: COLORS.cardBg, borderColor: COLORS.border }]}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/community/post/${item.id}`)}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.cardAuthor}>
                      {(() => {
                        const u = getAvatarFromUser(item.author);
                        return u ? (
                        <Image source={{ uri: u }} style={styles.avatar} resizeMode="cover" />
                      ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]} />
                      ); })()}
                      <View>
                        <ThemedText style={[styles.authorName, { color: COLORS.text }]}>
                          {item.author?.nickname ?? '用户'}
                        </ThemedText>
                        <ThemedText style={[styles.authorTime, { color: COLORS.zinc400 }]}>
                          {formatTime(item.createdAt)}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={[styles.relevanceBadge, badge]}>
                      <ThemedText style={[styles.relevanceText, { color: badge.color }]}>
                        {item.relevancePercent}% 匹配
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.cardTitle, { color: COLORS.text }]} numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={[styles.cardExcerpt, { color: COLORS.zinc500 }]} numberOfLines={2}>
                    {item.excerpt}
                  </ThemedText>
                  <View style={styles.cardStats}>
                    <View style={styles.statItem}>
                      <MaterialIcons name="favorite" size={16} color={COLORS.zinc400} />
                      <ThemedText style={[styles.statText, { color: COLORS.zinc400 }]}>
                        {formatStat(item.likeCount)}
                      </ThemedText>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialIcons name="chat-bubble-outline" size={16} color={COLORS.zinc400} />
                      <ThemedText style={[styles.statText, { color: COLORS.zinc400 }]}>
                        {formatStat(item.commentCount)}
                      </ThemedText>
                    </View>
                    <View style={[styles.statItem, styles.statItemEnd]}>
                      <MaterialIcons name="visibility" size={16} color={COLORS.zinc400} />
                      <ThemedText style={[styles.statText, { color: COLORS.zinc400 }]}>
                        {formatStat(item.viewCount)}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
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
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 48, height: 48, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 12,
  },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 8 },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e4e4e7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  chipInactive: { backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: '#e4e4e7' },
  chipTextActive: { color: '#fff', fontSize: 12, fontWeight: '700' },
  chipTextInactive: { fontSize: 12 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  hint: { fontSize: 14, textAlign: 'center', paddingVertical: 48 },
  loadingWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 24, justifyContent: 'center' },
  loadingText: { fontSize: 14 },
  resultCount: { fontSize: 12, marginBottom: 16, paddingHorizontal: 4 },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  avatarPlaceholder: { backgroundColor: COLORS.zinc400 + '40' },
  authorName: { fontSize: 12, fontWeight: '700' },
  authorTime: { fontSize: 10 },
  relevanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  relevanceText: { fontSize: 10, fontWeight: '700' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  cardExcerpt: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statItemEnd: { marginLeft: 'auto' },
  statText: { fontSize: 12 },
});
