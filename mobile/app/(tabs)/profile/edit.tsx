/**
 * Edit profile: nickname, gender, age, profile picture.
 * Saves to backend so the same account sees the same data everywhere.
 */
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiGet, apiPatch, apiUploadFormData, getAuthToken } from '@/constants/api';

const PROFILE_EDIT_COLORS = {
  primary: '#cfa577',
  background: '#f8f7f6',
  text: '#161412',
  subtitle: '#81766a',
  border: '#f4f2f1',
  cardBg: '#FFFFFF',
};

const GENDER_OPTIONS = [
  { value: '男', label: '男' },
  { value: '女', label: '女' },
  { value: '其他', label: '其他' },
] as const;

function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [age, setAge] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarUrlFromServer, setAvatarUrlFromServer] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<{ uri: string; type?: string } | null>(null);

  const loadProfile = async () => {
    if (!getAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      const p = await apiGet<{
        nickname: string;
        avatarUrl?: string | null;
        gender?: string | null;
        age?: number | null;
      }>('/user/profile');
      setNickname(p.nickname ?? '');
      setGender(p.gender ?? null);
      setAge(p.age != null ? String(p.age) : '');
      setAvatarUrlFromServer(p.avatarUrl ?? null);
    } catch {
      setNickname('');
      setGender(null);
      setAge('');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要相册权限才能选择头像');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setPendingAvatarFile({ uri: result.assets[0].uri, type: result.assets[0].mimeType ?? 'image/jpeg' });
    }
  };

  const save = async () => {
    const token = getAuthToken();
    if (!token) {
      Alert.alert('提示', '请先登录');
      return;
    }
    const nick = nickname.trim();
    if (!nick) {
      Alert.alert('提示', '请输入用户名');
      return;
    }
    setSaving(true);
    try {
      let avatarUrl: string | null = avatarUrlFromServer;
      if (pendingAvatarFile) {
        const formData = new FormData();
        formData.append('image', {
          uri: pendingAvatarFile.uri,
          type: pendingAvatarFile.type ?? 'image/jpeg',
          name: 'avatar.jpg',
        } as unknown as Blob);
        const res = await apiUploadFormData<{ avatarUrl: string }>('/user/avatar', formData);
        avatarUrl = res.avatarUrl ?? null;
      }
      await apiPatch('/user/profile', {
        nickname: nick,
        gender: gender || null,
        age: age.trim() ? Math.min(150, Math.max(1, parseInt(age, 10) || 0)) : null,
        avatarUrl,
      });
      router.back();
    } catch (e) {
      Alert.alert('保存失败', e instanceof Error ? e.message : '请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered, { backgroundColor: PROFILE_EDIT_COLORS.background }]}>
        <ActivityIndicator size="large" color={PROFILE_EDIT_COLORS.primary} />
      </ThemedView>
    );
  }

  const displayAvatar = avatarUri ?? avatarUrlFromServer;

  return (
    <ThemedView style={[styles.container, { backgroundColor: PROFILE_EDIT_COLORS.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.avatarWrap} onPress={pickImage} activeOpacity={0.9}>
          {displayAvatar ? (
            <Image source={{ uri: displayAvatar }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: PROFILE_EDIT_COLORS.primary + '30' }]}>
              <ThemedText style={[styles.avatarPlaceholderText, { color: PROFILE_EDIT_COLORS.subtitle }]}>
                点击上传
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: PROFILE_EDIT_COLORS.subtitle }]}>用户名</ThemedText>
          <TextInput
            style={[styles.input, { color: PROFILE_EDIT_COLORS.text, borderColor: PROFILE_EDIT_COLORS.border }]}
            value={nickname}
            onChangeText={setNickname}
            placeholder="请输入用户名"
            placeholderTextColor={PROFILE_EDIT_COLORS.subtitle}
            maxLength={64}
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: PROFILE_EDIT_COLORS.subtitle }]}>性别</ThemedText>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.genderBtn,
                  {
                    borderColor: PROFILE_EDIT_COLORS.border,
                    backgroundColor: gender === opt.value ? PROFILE_EDIT_COLORS.primary + '25' : PROFILE_EDIT_COLORS.cardBg,
                  },
                ]}
                onPress={() => setGender(opt.value)}
              >
                <ThemedText style={[styles.genderBtnText, { color: PROFILE_EDIT_COLORS.text }]}>{opt.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: PROFILE_EDIT_COLORS.subtitle }]}>年龄</ThemedText>
          <TextInput
            style={[styles.input, { color: PROFILE_EDIT_COLORS.text, borderColor: PROFILE_EDIT_COLORS.border }]}
            value={age}
            onChangeText={(t) => setAge(t.replace(/\D/g, '').slice(0, 3))}
            placeholder="选填"
            placeholderTextColor={PROFILE_EDIT_COLORS.subtitle}
            keyboardType="number-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: PROFILE_EDIT_COLORS.primary }]}
          onPress={save}
          disabled={saving}
          activeOpacity={0.9}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.saveBtnText}>保存</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },
  avatarWrap: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 32,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: { fontSize: 12 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  genderBtnText: { fontSize: 15, fontWeight: '600' },
  saveBtn: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
