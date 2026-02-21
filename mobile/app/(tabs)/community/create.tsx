/**
 * New post page: title, content, tags (add/remove preset + custom), images, location/mention placeholders.
 * 取消 -> back to community tab; 发布 -> POST and back.
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { apiPost, apiUploadFormData, getAuthToken } from '@/constants/api';

const COLORS = {
  primary: '#C69C6D',
  primaryDark: '#8C6B4B',
  background: '#fffaf9',
  textMain: '#4A4238',
  textSub: '#81766a',
  peach: '#F9F3EA',
  border: 'rgba(198, 156, 109, 0.2)',
};

const PRESET_TAGS = ['护肤心得', '新品评测', '干皮救星', '晚间护肤'];

export interface CreatePostScreenProps {
  /** When set, screen is used inside a modal; cancel/success call this instead of router */
  onClose?: () => void;
  /** Called after successful publish when in modal mode (e.g. to refetch list) */
  onPublishSuccess?: () => void;
}

export default function CreatePostScreen({ onClose, onPublishSuccess }: CreatePostScreenProps = {}) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([...PRESET_TAGS]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showCustomTag, setShowCustomTag] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const addCustomTag = () => {
    const name = customTagInput.trim().replace(/^#/, '');
    if (name && !selectedTags.includes(name)) {
      setSelectedTags((prev) => [...prev, name]);
      setCustomTagInput('');
      setShowCustomTag(false);
    }
  };

  const pickImage = async () => {
    if (!getAuthToken()) {
      Alert.alert('提示', '请先登录');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要权限', '请允许访问相册以上传图片');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    setUploadingImage(true);
    try {
      const uri = result.assets[0].uri;
      const formData = new FormData();
      (formData as unknown as { append: (a: string, b: { uri: string; name: string; type: string }) => void }).append('image', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: 'image.jpg',
        type: 'image/jpeg',
      });
      const res = await apiUploadFormData<{ url: string }>('/community/upload-image', formData);
      if (res?.url) setImageUrls((prev) => [...prev, res.url]);
    } catch (e) {
      Alert.alert('上传失败', e instanceof Error ? e.message : '请稍后重试');
    } finally {
      setUploadingImage(false);
    }
  };

  const onCancel = () => {
    if (onClose) onClose();
    else router.back();
  };

  const onPublish = async () => {
    const t = title.trim();
    if (!t) {
      Alert.alert('提示', '请输入标题');
      return;
    }
    if (!getAuthToken()) {
      Alert.alert('提示', '请先登录');
      return;
    }
    setPublishing(true);
    try {
      await apiPost('/community/posts', {
        title: t,
        content: content.trim() || undefined,
        imageUrls: imageUrls.length ? imageUrls : undefined,
        tagNames: selectedTags.length ? selectedTags : undefined,
      });
      if (onClose) {
        onPublishSuccess?.();
        onClose();
      } else {
        router.replace('/(tabs)/community');
      }
    } catch (e) {
      Alert.alert('发布失败', e instanceof Error ? e.message : '请稍后重试');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
          <TouchableOpacity onPress={onCancel} style={styles.headerBtn}>
            <ThemedText style={[styles.cancelText, { color: COLORS.textSub }]}>取消</ThemedText>
          </TouchableOpacity>
          <ThemedText style={[styles.headerTitle, { color: COLORS.textMain }]}>发布帖子</ThemedText>
          <TouchableOpacity onPress={onPublish} disabled={publishing} style={styles.headerBtn}>
            {publishing ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <ThemedText style={[styles.publishText, { color: COLORS.primary }]}>发布</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TextInput
            style={[styles.titleInput, { color: COLORS.textMain }]}
            placeholder="起个吸引人的标题吧..."
            placeholderTextColor={COLORS.textSub + '80'}
            value={title}
            onChangeText={setTitle}
          />
          <View style={[styles.divider, { backgroundColor: COLORS.border }]} />
          <TextInput
            style={[styles.contentInput, { color: COLORS.textMain }]}
            placeholder="分享你的护肤心得、产品评测或疑问..."
            placeholderTextColor={COLORS.textSub + '80'}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.tagSection}>
            <View style={styles.tagSectionHeader}>
              <IconSymbol name="sell" size={20} color={COLORS.primary} />
              <ThemedText style={[styles.tagSectionTitle, { color: COLORS.textMain }]}>添加标签</ThemedText>
            </View>
            <View style={styles.tagRow}>
              {selectedTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, { backgroundColor: COLORS.peach, borderColor: COLORS.border }]}
                  onPress={() => removeTag(tag)}
                >
                  <ThemedText style={[styles.tagChipText, { color: COLORS.primaryDark }]}>#{tag}</ThemedText>
                  <ThemedText style={[styles.tagRemove, { color: COLORS.primaryDark }]}> ×</ThemedText>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.tagAddBtn, { borderColor: COLORS.primary + '66' }]}
                onPress={() => setShowCustomTag(true)}
              >
                <IconSymbol name="add" size={18} color={COLORS.primaryDark} />
              </TouchableOpacity>
            </View>
          </View>

          {imageUrls.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageStrip}>
              {imageUrls.map((url, i) => (
                <View key={i} style={styles.imageWrap}>
                  <Image source={{ uri: url }} style={styles.thumb} />
                </View>
              ))}
            </ScrollView>
          )}
        </ScrollView>

        <View style={[styles.bottomBar, { borderTopColor: COLORS.border }]}>
          <TouchableOpacity style={[styles.bottomIcon, { backgroundColor: COLORS.peach }]} onPress={pickImage} disabled={uploadingImage}>
            {uploadingImage ? <ActivityIndicator size="small" color={COLORS.primary} /> : <IconSymbol name="image" size={28} color={COLORS.primary} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomIcon}>
            <IconSymbol name="location_on" size={26} color={COLORS.textSub} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomIcon}>
            <IconSymbol name="alternate_email" size={26} color={COLORS.textSub} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showCustomTag} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCustomTag(false)}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>自定义标签</ThemedText>
            <TextInput
              style={[styles.customInput, { color: COLORS.textMain }]}
              placeholder="输入标签名（无需 #）"
              placeholderTextColor={COLORS.textSub}
              value={customTagInput}
              onChangeText={setCustomTagInput}
              maxLength={20}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setShowCustomTag(false)}>
                <ThemedText style={{ color: COLORS.textSub }}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={addCustomTag}>
                <ThemedText style={{ color: '#fff', fontWeight: '600' }}>添加</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { minWidth: 60, alignItems: 'center' },
  cancelText: { fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  publishText: { fontSize: 14, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  titleInput: { fontSize: 20, fontWeight: '700', paddingVertical: 8 },
  divider: { height: 1, width: '100%', marginBottom: 16 },
  contentInput: { fontSize: 16, minHeight: 200 },
  tagSection: { marginTop: 24, marginBottom: 16 },
  tagSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tagSectionTitle: { fontSize: 14, fontWeight: '700' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagChipText: { fontSize: 12, fontWeight: '600' },
  tagRemove: { fontSize: 14 },
  tagAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStrip: { flexDirection: 'row', gap: 8, marginTop: 8 },
  imageWrap: { width: 96, height: 96, borderRadius: 8, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    gap: 16,
  },
  bottomIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: COLORS.textMain },
  customInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  modalBtnPrimary: { backgroundColor: COLORS.primary, borderRadius: 8 },
});
