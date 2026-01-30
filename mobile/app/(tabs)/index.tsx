import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AISkinEntryScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>焕颜 AI</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.subtitle }]}>
          上传照片,获取大师级定制美肤方案
        </ThemedText>
      </View>
      <TouchableOpacity
        style={[styles.uploadArea, { borderColor: colors.primary }]}
        onPress={() => router.push('/ai/capture')}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight + '60' }]}>
          <IconSymbol name="viewfinder" size={48} color={colors.primary} />
        </View>
        <ThemedText type="subtitle" style={styles.cta}>开启 AI 测肤</ThemedText>
        <ThemedText style={[styles.hint, { color: colors.subtitle }]}>
          精准识别 100+ 面部锚点,分析肤质、肤色及潜在问题
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
  },
  uploadArea: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cta: {
    marginBottom: 12,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
