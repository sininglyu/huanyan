import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AnalysisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={[styles.scoreCard, { backgroundColor: colors.primaryLight + '30' }]}>
          <ThemedText type="title">得分: 82</ThemedText>
          <ThemedText style={[styles.date, { color: colors.subtitle }]}>分析记录 #{id}</ThemedText>
        </View>
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">肤质类型</ThemedText>
          <ThemedText>混合性</ThemedText>
        </View>
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">肤色与色调</ThemedText>
          <ThemedText>中性</ThemedText>
        </View>
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">检测到的问题</ThemedText>
          <ThemedText>黑眼圈（轻度）</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, padding: 16 },
  scoreCard: { padding: 24, borderRadius: 16, marginBottom: 24 },
  date: { marginTop: 8 },
  section: { marginBottom: 20 },
});
