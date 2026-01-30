import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CreatePostScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <TextInput
          style={[styles.titleInput, { color: colors.text }]}
          placeholder="标题"
          placeholderTextColor={colors.subtitle}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.contentInput, { color: colors.text }]}
          placeholder="分享你的护肤心得..."
          placeholderTextColor={colors.subtitle}
          value={content}
          onChangeText={setContent}
          multiline
        />
        <ThemedText style={[styles.hint, { color: colors.subtitle }]}>可添加 #今日妆容 #护肤打卡 等标签</ThemedText>
        <TouchableOpacity style={[styles.submit, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <ThemedText style={styles.submitText}>发布</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, padding: 16 },
  titleInput: { fontSize: 18, fontWeight: '600', marginBottom: 12, paddingVertical: 8 },
  contentInput: { fontSize: 14, minHeight: 120, textAlignVertical: 'top', marginBottom: 12 },
  hint: { fontSize: 12, marginBottom: 24 },
  submit: { padding: 16, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
