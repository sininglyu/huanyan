/**
 * Discussion detail: title, content, author, comments, like, favorite, share.
 * Comment, favorite, share are persisted in backend.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { apiGet, apiPost, getAuthToken } from '@/constants/api';

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

interface PostDetail {
  id: string;
  title: string;
  content?: string | null;
  likeCount: number;
  commentCount: number;
  favoriteCount?: number;
  liked: boolean;
  favorited: boolean;
  author?: { id: string; nickname?: string; avatarUrl?: string | null };
  comments: Comment[];
  createdAt?: string;
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!id || !getAuthToken()) return;
    try {
      const p = await apiGet<PostDetail>(`/community/posts/${id}`);
      setPost(p);
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleComment = async () => {
    const content = commentInput.trim();
    if (!content || !getAuthToken()) return;
    setSubmittingComment(true);
    try {
      await apiPost(`/community/posts/${id}/comments`, { content });
      setCommentInput('');
      await fetchPost();
    } catch (e) {
      Alert.alert('发送失败', e instanceof Error ? e.message : '请稍后重试');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFavorite = async () => {
    if (!getAuthToken()) {
      Alert.alert('提示', '请先登录');
      return;
    }
    setTogglingFavorite(true);
    try {
      const res = await apiPost<{ favorited: boolean }>(`/community/posts/${id}/favorites`, {});
      setPost((prev) => (prev ? { ...prev, favorited: res.favorited } : null));
    } catch {
      Alert.alert('操作失败', '请稍后重试');
    } finally {
      setTogglingFavorite(false);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      const result = await Share.share({
        message: `${post.title}\n\n${post.content ?? ''}`,
        title: post.title,
      });
      if (result.action === Share.sharedAction && getAuthToken()) {
        await apiPost(`/community/posts/${id}/share`, {});
      }
    } catch {
      // Share cancelled or failed
    }
  };

  const handleLike = async () => {
    if (!getAuthToken()) return;
    try {
      const res = await apiPost<{ liked: boolean }>(`/community/posts/${id}/likes`, {});
      setPost((prev) =>
        prev
          ? {
              ...prev,
              liked: res.liked,
              likeCount: res.liked ? prev.likeCount + 1 : Math.max(0, prev.likeCount - 1),
            }
          : null
      );
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={[styles.loadingText, { color: colors.subtitle }]}>加载中...</ThemedText>
      </ThemedView>
    );
  }

  if (!post) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText style={[styles.errorText, { color: colors.subtitle }]}>讨论不存在或已删除</ThemedText>
      </ThemedView>
    );
  }

  const authorName = post.author?.nickname ?? '匿名用户';

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '40' }]}>
            {post.author?.avatarUrl ? (
              <Image source={{ uri: post.author.avatarUrl }} style={styles.avatarImg} />
            ) : null}
          </View>
          <View style={styles.author}>
            <ThemedText type="defaultSemiBold">{authorName}</ThemedText>
            <ThemedText style={[styles.meta, { color: colors.subtitle }]}>
              {post.createdAt ? new Date(post.createdAt).toLocaleString('zh-CN') : ''}
            </ThemedText>
          </View>
        </View>

        <ThemedText type="title" style={styles.title}>
          {post.title}
        </ThemedText>
        <ThemedText style={[styles.body, { color: colors.text }]}>{post.content ?? '暂无内容'}</ThemedText>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <MaterialIcons
              name="local-fire-department"
              size={20}
              color={post.liked ? '#e53935' : colors.subtitle}
            />
            <ThemedText style={[styles.actionText, { color: colors.text }]}>
              {post.likeCount > 0 ? post.likeCount : '点赞'}
            </ThemedText>
          </TouchableOpacity>
          <ThemedText style={[styles.actionText, { color: colors.subtitle }]}>
            {post.commentCount} 评论
          </ThemedText>
          <TouchableOpacity style={styles.actionBtn} onPress={handleFavorite} disabled={togglingFavorite}>
            <IconSymbol
              name="bookmark"
              size={20}
              color={post.favorited ? colors.primary : colors.subtitle}
            />
            <ThemedText style={[styles.actionText, { color: post.favorited ? colors.primary : colors.text }]}>
              {post.favorited ? '已收藏' : '收藏'}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <IconSymbol name="paperplane.fill" size={18} color={colors.subtitle} />
            <ThemedText style={[styles.actionText, { color: colors.text }]}>分享</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={[styles.commentInputWrap, { borderColor: colors.subtitle + '40' }]}>
          <TextInput
            style={[styles.commentInput, { color: colors.text }]}
            placeholder="写下你的评论..."
            placeholderTextColor={colors.subtitle}
            value={commentInput}
            onChangeText={setCommentInput}
            multiline
            maxLength={500}
            editable={!!getAuthToken()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            onPress={handleComment}
            disabled={!commentInput.trim() || submittingComment}
          >
            {submittingComment ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.sendBtnText}>发送</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.commentsSection, { borderTopColor: colors.subtitle + '20' }]}>
          <ThemedText type="defaultSemiBold" style={styles.commentsTitle}>
            评论 ({post.comments.length})
          </ThemedText>
          {post.comments.length === 0 ? (
            <ThemedText style={[styles.emptyComments, { color: colors.subtitle }]}>暂无评论</ThemedText>
          ) : (
            post.comments.map((c) => (
              <View key={c.id} style={[styles.commentItem, { borderBottomColor: colors.subtitle + '15' }]}>
                <ThemedText style={[styles.commentContent, { color: colors.text }]}>{c.content}</ThemedText>
                <ThemedText style={[styles.commentMeta, { color: colors.subtitle }]}>
                  {new Date(c.createdAt).toLocaleString('zh-CN')}
                </ThemedText>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorText: { fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  author: { flex: 1 },
  meta: { fontSize: 12, marginTop: 4 },
  title: { marginBottom: 12 },
  body: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13 },
  commentInputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  commentInput: {
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  sendBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  commentsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
  },
  commentsTitle: { marginBottom: 12, fontSize: 16 },
  emptyComments: { fontSize: 14, marginBottom: 16 },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  commentContent: { fontSize: 14, lineHeight: 20 },
  commentMeta: { fontSize: 11, marginTop: 4 },
});
