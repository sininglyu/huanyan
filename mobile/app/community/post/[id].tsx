import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]} />
          <View style={styles.author}>
            <ThemedText type="defaultSemiBold">作者</ThemedText>
            <ThemedText style={[styles.meta, { color: colors.subtitle }]}>帖子 #{id}</ThemedText>
          </View>
          <TouchableOpacity style={[styles.followBtn, { borderColor: colors.primary }]}>
            <ThemedText style={{ color: colors.primary }}>+ 关注</ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedText type="title" style={styles.title}>帖子标题</ThemedText>
        <ThemedText style={styles.body}>帖子内容占位...</ThemedText>
        <View style={styles.actions}>
          <TouchableOpacity><ThemedText>♥ 点赞</ThemedText></TouchableOpacity>
          <TouchableOpacity><ThemedText>💬 评论</ThemedText></TouchableOpacity>
          <TouchableOpacity><ThemedText>收藏</ThemedText></TouchableOpacity>
        </View>
        <View style={styles.comments}>
          <ThemedText type="defaultSemiBold" style={styles.commentsTitle}>评论</ThemedText>
          <ThemedText style={[styles.meta, { color: colors.subtitle }]}>暂无评论</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  author: { flex: 1 },
  meta: { fontSize: 12, marginTop: 4 },
  followBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  title: { marginBottom: 12 },
  body: { fontSize: 14, opacity: 0.9, marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 24, marginBottom: 24 },
  comments: { paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)' },
  commentsTitle: { marginBottom: 12 },
});
