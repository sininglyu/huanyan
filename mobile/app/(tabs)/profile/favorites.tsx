/**
 * User's favorited discussions.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { apiGet, getAuthToken } from '@/constants/api';

interface PostItem {
  id: string;
  title: string;
  content?: string | null;
  commentCount?: number;
  likeCount?: number;
  createdAt?: string;
}

const FAV_COLORS = {
  primary: '#cfa577',
  background: '#f8f7f6',
  text: '#161412',
  subtitle: '#81766a',
  cardBg: '#FFFFFF',
  border: '#f4f2f1',
};

const CONTENT_TOP_PADDING = Platform.OS === 'ios' ? 56 : 16;

export default function FavoritesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [items, setItems] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!getAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiGet<{ items: PostItem[] }>('/user/favorites');
      setItems(res.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useFocusEffect(
    useCallback(() => {
      if (getAuthToken()) {
        // Refetch when returning from post detail so newly favorited posts appear
        const t = setTimeout(() => fetchFavorites(), 50);
        return () => clearTimeout(t);
      }
    }, [fetchFavorites])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: FAV_COLORS.background }]}>
        <ActivityIndicator size="large" color={FAV_COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: FAV_COLORS.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: CONTENT_TOP_PADDING }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={FAV_COLORS.primary} />
        }
      >
        {items.length === 0 ? (
          <View style={styles.empty}>
            <IconSymbol name="bookmark" size={48} color={colors.subtitle + '80'} />
            <ThemedText style={[styles.emptyText, { color: colors.subtitle }]}>暂无收藏</ThemedText>
            <ThemedText style={[styles.emptyHint, { color: colors.subtitle }]}>
              在社区讨论中点击「收藏」即可收藏
            </ThemedText>
          </View>
        ) : (
          items.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={[styles.card, { backgroundColor: FAV_COLORS.cardBg, borderColor: FAV_COLORS.border }]}
              onPress={() => router.push(`/community/post/${post.id}`)}
              activeOpacity={0.8}
            >
              <View style={[styles.cardIcon, { backgroundColor: FAV_COLORS.primary + '20' }]}>
                <IconSymbol name="bookmark" size={20} color={FAV_COLORS.primary} />
              </View>
              <View style={styles.cardBody}>
                <ThemedText style={[styles.cardTitle, { color: FAV_COLORS.text }]} numberOfLines={2}>
                  {post.title}
                </ThemedText>
                <ThemedText style={[styles.cardMeta, { color: colors.subtitle }]}>
                  {(post.commentCount ?? 0)} 评论 · {(post.likeCount ?? 0)} 点赞
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.subtitle} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, marginTop: 16 },
  emptyHint: { fontSize: 13, marginTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 12, marginTop: 4 },
});
