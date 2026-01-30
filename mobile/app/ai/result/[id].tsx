import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AnalysisResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.scoreCard}>
          <ThemedText type="title">得分: 82</ThemedText>
          <ThemedText style={[styles.meta, { color: colors.subtitle }]}>肤质: 混合性 · 肤色: 中性</ThemedText>
        </View>
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>检测到的问题</ThemedText>
          <ThemedText style={styles.issue}>黑眼圈（轻度）</ThemedText>
        </View>
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>推荐妆容</ThemedText>
          <ThemedText style={styles.step}>日常 · 职场 · 约会</ThemedText>
        </View>
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>护肤建议</ThemedText>
          <ThemedText style={styles.step}>早晚流程与周期护理</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/ai/ar-tryon')}
        >
          <ThemedText style={styles.ctaText}>AR 试妆</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, padding: 16 },
  scoreCard: { padding: 20, borderRadius: 12, backgroundColor: 'rgba(233,30,140,0.1)', marginBottom: 24 },
  meta: { marginTop: 8, fontSize: 14 },
  section: { marginBottom: 20 },
  sectionTitle: { marginBottom: 8 },
  issue: { fontSize: 14, opacity: 0.9 },
  step: { fontSize: 14, opacity: 0.9 },
  cta: { marginTop: 24, padding: 16, borderRadius: 12, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
