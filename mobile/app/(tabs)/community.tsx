import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiGet } from '@/constants/api';
import { useAuth } from '@/contexts/auth-context';

type PostItem = { id: string; title: string; likeCount: number; commentCount: number; author?: { nickname: string } };

export default function CommunityScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, refreshToken } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ items: PostItem[] }>('/community/posts?limit=20');
      setPosts(res.items ?? []);
    } catch (error) {
      // If 401, try to refresh token
      if (error instanceof Error && error.message.includes('401')) {
        await refreshToken();
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

  // Fetch posts on mount and when auth state changes
  useEffect(() => {
    fetchPosts();
  }, [isAuthenticated, fetchPosts]);

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={[styles.search, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f3f4f6' }]}
          placeholder="搜索肤质、产品、技巧..."
          placeholderTextColor={colors.subtitle}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/community/create')}>
          <ThemedText style={styles.addButtonText}>+</ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        <TouchableOpacity style={[styles.categoryChip, { borderColor: colors.primary }]}>
          <ThemedText style={[styles.categoryText, { color: colors.primary }]}>全部</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryChip}>
          <ThemedText>新手区</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryChip}>
          <ThemedText>产品评测</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryChip}>
          <ThemedText>技巧分享</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryChip}>
          <ThemedText>今日热榜</ThemedText>
        </TouchableOpacity>
      </ScrollView>
      <ScrollView style={styles.content}>
        <View style={[styles.banner, { backgroundColor: colors.primaryLight + '40' }]}>
          <ThemedText type="subtitle">新人护肤第一课</ThemedText>
          <ThemedText style={styles.bannerSub}>避开测肤常见的3个误区</ThemedText>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 24 }} />
        ) : posts.length > 0 ? (
          posts.map((p) => (
            <TouchableOpacity key={p.id} style={styles.postCard} onPress={() => router.push(`/community/post/${p.id}`)}>
              <View style={styles.postHeader}>
                <View style={styles.postAuthor}>
                  <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]} />
                  <View>
                    <ThemedText type="defaultSemiBold">{p.author?.nickname ?? '用户'}</ThemedText>
                    <ThemedText style={styles.postMeta}>适合混合偏干肌肤</ThemedText>
                  </View>
                </View>
                <TouchableOpacity style={[styles.followBtn, { borderColor: colors.primary }]}>
                  <ThemedText style={{ color: colors.primary }}>+ 关注</ThemedText>
                </TouchableOpacity>
              </View>
              <ThemedText type="subtitle" style={styles.postTitle}>{p.title}</ThemedText>
              <View style={styles.postActions}>
                <ThemedText style={styles.actionItem}>♥ {p.likeCount}</ThemedText>
                <ThemedText style={styles.actionItem}>💬 {p.commentCount}</ThemedText>
                <ThemedText style={styles.actionItem}>分享</ThemedText>
                <ThemedText style={styles.actionItem}>收藏</ThemedText>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthor}>
                <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]} />
                <View>
                  <ThemedText type="defaultSemiBold">美妆博主小C</ThemedText>
                  <ThemedText style={styles.postMeta}>1小时前 · 适合混合偏干肌肤</ThemedText>
                </View>
              </View>
              <TouchableOpacity style={[styles.followBtn, { borderColor: colors.primary }]}>
                <ThemedText style={{ color: colors.primary }}>+ 关注</ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedText type="subtitle" style={styles.postTitle}>手把手教你画出呼吸感底妆</ThemedText>
            <ThemedText style={styles.postBody}>最近很多姐妹问我怎么让妆容看起来通透不假面...</ThemedText>
            <View style={styles.hashtags}>
              <ThemedText style={{ color: colors.primary }}>#底妆教程 </ThemedText>
              <ThemedText style={{ color: colors.primary }}>#自然妆容 </ThemedText>
              <ThemedText style={{ color: colors.primary }}>#新手必看</ThemedText>
            </View>
            <View style={styles.postActions}>
              <ThemedText style={styles.actionItem}>♥ 2450</ThemedText>
              <ThemedText style={styles.actionItem}>💬 188</ThemedText>
              <ThemedText style={styles.actionItem}>分享</ThemedText>
              <ThemedText style={styles.actionItem}>收藏</ThemedText>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  search: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E91E8C', alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#fff', fontSize: 24, fontWeight: '300' },
  categories: { maxHeight: 44, paddingHorizontal: 16, marginBottom: 8 },
  categoryChip: { marginRight: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  categoryText: {},
  content: { flex: 1, paddingHorizontal: 16 },
  banner: { borderRadius: 12, padding: 20, marginBottom: 16 },
  bannerSub: { marginTop: 4, opacity: 0.9 },
  postCard: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  postAuthor: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  postMeta: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  followBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  postTitle: { marginBottom: 8 },
  postBody: { fontSize: 14, opacity: 0.85, marginBottom: 8 },
  hashtags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  postActions: { flexDirection: 'row', gap: 20 },
  actionItem: { fontSize: 13, opacity: 0.8 },
});
