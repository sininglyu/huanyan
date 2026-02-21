/**
 * Post detail: viewPostPage layout — back + heart (favorite), real stats, comments with reply, bottom bar.
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
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { apiGet, apiPost, getAuthToken, getUploadsUrl } from '@/constants/api';

const COLORS = {
  primary: '#C69C6D',
  primaryDark: '#8C6B4B',
  background: '#fffaf9',
  text: '#161412',
  textMuted: '#71717a',
  zinc400: '#a1a1aa',
  zinc500: '#71717a',
  peach: '#F9F3EA',
  border: 'rgba(0,0,0,0.06)',
};

function resolveAvatarUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl || !avatarUrl.trim()) return null;
  return avatarUrl.startsWith('http') ? avatarUrl : getUploadsUrl(avatarUrl);
}

interface CommentAuthor {
  id: string;
  nickname?: string;
  avatarUrl?: string | null;
}

interface Comment {
  id: string;
  content: string;
  userId: string;
  parentId?: string | null;
  createdAt: string;
  author?: CommentAuthor;
}

interface PostDetail {
  id: string;
  title: string;
  content?: string | null;
  likeCount: number;
  commentCount: number;
  viewCount?: number;
  favoriteCount?: number;
  liked?: boolean;
  favorited: boolean;
  author?: CommentAuthor;
  tags?: string[];
  comments: Comment[];
  createdAt?: string;
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

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!id) return;
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
    if (!content) return;
    if (!getAuthToken()) {
      Alert.alert('提示', '请先登录');
      return;
    }
    setSubmittingComment(true);
    try {
      await apiPost(`/community/posts/${id}/comments`, {
        content,
        parentId: replyTo?.id ?? undefined,
      });
      setCommentInput('');
      setReplyTo(null);
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <ThemedText style={[styles.loadingText, { color: COLORS.zinc500 }]}>加载中...</ThemedText>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: COLORS.background }]}>
        <ThemedText style={[styles.errorText, { color: COLORS.zinc500 }]}>讨论不存在或已删除</ThemedText>
      </View>
    );
  }

  const authorAvatarUri = resolveAvatarUrl(post.author?.avatarUrl ?? null);

  const authorName = post.author?.nickname ?? '匿名用户';
  const firstTag = post.tags?.[0];
  const topLevelComments = post.comments?.filter((c) => !c.parentId) ?? [];
  const getReplies = (parentId: string) => post.comments?.filter((c) => c.parentId === parentId) ?? [];

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex} keyboardVerticalOffset={0}>
        <View style={[styles.header, { borderBottomColor: COLORS.border, backgroundColor: COLORS.background }]}>
          <TouchableOpacity style={styles.headerBack} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios-new" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.heartBtn, { backgroundColor: post.favorited ? COLORS.primary + '20' : 'transparent' }]}
              onPress={handleFavorite}
              disabled={togglingFavorite}
            >
              <MaterialIcons name={post.favorited ? 'favorite' : 'favorite-border'} size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.authorRow}>
            <View style={[styles.avatarWrap, { borderColor: COLORS.primary + '33' }]}>
              {authorAvatarUri ? (
                <Image source={{ uri: authorAvatarUri }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primary + '30' }]} />
              )}
            </View>
            <View style={styles.authorMeta}>
              <ThemedText style={[styles.authorName, { color: COLORS.text }]}>{authorName}</ThemedText>
              <ThemedText style={[styles.authorTime, { color: COLORS.zinc500 }]}>
                {post.createdAt ? formatTime(post.createdAt) : ''}
                {firstTag ? ` • ${firstTag}` : ''}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={[styles.title, { color: COLORS.text }]}>{post.title}</ThemedText>
          <ThemedText style={[styles.body, { color: COLORS.textMuted }]}>{post.content ?? '暂无内容'}</ThemedText>

          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagRow}>
              {post.tags.map((tag) => (
                <View key={tag} style={[styles.tagChip, { backgroundColor: COLORS.peach }]}>
                  <ThemedText style={[styles.tagText, { color: COLORS.primaryDark }]}>#{tag}</ThemedText>
                </View>
              ))}
            </View>
          )}

          <View style={[styles.statsRow, { borderTopColor: COLORS.border }]}>
            <View style={styles.statItem}>
              <MaterialIcons name="visibility" size={18} color={COLORS.zinc500} />
              <ThemedText style={[styles.statText, { color: COLORS.zinc500 }]}>{formatStat(post.viewCount ?? 0)}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="thumb-up" size={18} color={COLORS.primary} />
              <ThemedText style={[styles.statText, { color: COLORS.primary }]}>{formatStat(post.likeCount ?? 0)}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="chat-bubble-outline" size={18} color={COLORS.zinc500} />
              <ThemedText style={[styles.statText, { color: COLORS.zinc500 }]}>{formatStat(post.commentCount ?? 0)}</ThemedText>
            </View>
          </View>

          <View style={[styles.commentsBlock, { borderTopColor: COLORS.border }]}>
            <ThemedText style={[styles.commentsTitle, { color: COLORS.text }]}>
              评论 ({post.commentCount ?? 0})
            </ThemedText>
            {topLevelComments.length === 0 ? (
              <ThemedText style={[styles.emptyComments, { color: COLORS.zinc500 }]}>暂无评论</ThemedText>
            ) : (
              topLevelComments.map((c) => {
                const commentAvatarUri = resolveAvatarUrl(c.author?.avatarUrl);
                return (
                <View key={c.id} style={styles.commentBlock}>
                  <View style={styles.commentRow}>
                    <View style={styles.commentAvatarWrap}>
                      {commentAvatarUri ? (
                        <Image source={{ uri: commentAvatarUri }} style={styles.commentAvatar} />
                      ) : (
                        <View style={[styles.commentAvatar, { backgroundColor: COLORS.zinc400 + '40' }]} />
                      )}
                    </View>
                    <View style={styles.commentBody}>
                      <View style={styles.commentHead}>
                        <ThemedText style={[styles.commentAuthor, { color: COLORS.text }]}>
                          {c.author?.nickname ?? '用户'}
                        </ThemedText>
                      </View>
                      <ThemedText style={[styles.commentContent, { color: COLORS.textMuted }]}>{c.content}</ThemedText>
                      <View style={styles.commentFooter}>
                        <ThemedText style={[styles.commentTime, { color: COLORS.zinc400 }]}>{formatTime(c.createdAt)}</ThemedText>
                        <TouchableOpacity onPress={() => setReplyTo(c)}>
                          <ThemedText style={[styles.replyBtn, { color: COLORS.zinc500 }]}>回复</ThemedText>
                        </TouchableOpacity>
                      </View>
                      {getReplies(c.id).map((r) => {
                        const replyAvatarUri = resolveAvatarUrl(r.author?.avatarUrl);
                        return (
                        <View key={r.id} style={[styles.replyWrap, { borderLeftColor: COLORS.border }]}>
                          <View style={styles.replyRow}>
                            {replyAvatarUri ? (
                              <Image source={{ uri: replyAvatarUri }} style={styles.replyAvatar} />
                            ) : (
                              <View style={[styles.replyAvatar, { backgroundColor: COLORS.zinc400 + '40' }]} />
                            )}
                            <View style={styles.replyBody}>
                              <ThemedText style={[styles.replyAuthor, { color: COLORS.text }]}>
                                {r.author?.nickname ?? '用户'}
                              </ThemedText>
                              <ThemedText style={[styles.replyContent, { color: COLORS.textMuted }]}>{r.content}</ThemedText>
                              <ThemedText style={[styles.replyTime, { color: COLORS.zinc400 }]}>{formatTime(r.createdAt)}</ThemedText>
                            </View>
                          </View>
                        </View>
                      ); })}
                    </View>
                  </View>
                </View>
              ); })
            )}
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { borderTopColor: COLORS.border, backgroundColor: COLORS.background }]}>
          <TouchableOpacity style={styles.bottomIcon}>
            <MaterialIcons name="add-photo-alternate" size={20} color={COLORS.zinc400} />
          </TouchableOpacity>
          <TextInput
            style={[styles.commentInput, { color: COLORS.text }]}
            placeholder={replyTo ? `回复 @${replyTo.author?.nickname ?? '用户'}` : '说点什么...'}
            placeholderTextColor={COLORS.zinc400}
            value={commentInput}
            onChangeText={setCommentInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: COLORS.primary }]}
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorText: { fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBack: { width: 48, height: 48, justifyContent: 'center' },
  headerRight: { width: 48, alignItems: 'flex-end', justifyContent: 'center' },
  heartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%' },
  authorMeta: { marginLeft: 12 },
  authorName: { fontSize: 14, fontWeight: '700' },
  authorTime: { fontSize: 12, marginTop: 2 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  body: { fontSize: 15, lineHeight: 24, marginBottom: 16 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tagText: { fontSize: 12 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 12, fontWeight: '600' },
  commentsBlock: {
    paddingHorizontal: 0,
    paddingTop: 24,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  emptyComments: { fontSize: 14 },
  commentsTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  commentBlock: { marginBottom: 24 },
  commentRow: { flexDirection: 'row' },
  commentAvatarWrap: { marginRight: 12 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16 },
  commentBody: { flex: 1 },
  commentHead: { flexDirection: 'row', justifyContent: 'space-between' },
  commentAuthor: { fontSize: 14, fontWeight: '700' },
  commentContent: { fontSize: 13, marginTop: 4, lineHeight: 20 },
  commentFooter: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  commentTime: { fontSize: 10 },
  replyBtn: { fontSize: 10, fontWeight: '600' },
  replyWrap: { marginTop: 12, marginLeft: 12, paddingLeft: 12, borderLeftWidth: 2 },
  replyRow: { flexDirection: 'row' },
  replyAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  replyBody: { flex: 1 },
  replyAuthor: { fontSize: 12, fontWeight: '700' },
  replyContent: { fontSize: 12, marginTop: 2, color: COLORS.textMuted },
  replyTime: { fontSize: 10, marginTop: 4 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1,
    gap: 12,
  },
  bottomIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f4f4f5',
  },
  sendBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
