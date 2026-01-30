import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <TouchableOpacity style={styles.row}>
          <ThemedText>编辑资料</ThemedText>
          <ThemedText style={{ color: colors.subtitle }}>›</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => {}}>
          <ThemedText>用户协议与隐私政策</ThemedText>
          <ThemedText style={{ color: colors.subtitle }}>›</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <ThemedText>数据使用说明</ThemedText>
          <ThemedText style={{ color: colors.subtitle }}>›</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <ThemedText>生物特征本地处理</ThemedText>
          <ThemedText style={[styles.hint, { color: colors.subtitle }]}>在设备上分析，不上传原图</ThemedText>
          <ThemedText style={{ color: colors.subtitle }}>›</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, styles.danger]}>
          <ThemedText style={styles.dangerText}>导出我的数据</ThemedText>
          <ThemedText style={{ color: colors.subtitle }}>›</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  hint: { flex: 1, fontSize: 12, marginLeft: 8 },
  danger: { marginTop: 24 },
  dangerText: { color: '#E91E8C' },
});
