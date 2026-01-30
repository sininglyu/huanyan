import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ARTryonScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [intensity, setIntensity] = useState<'natural' | 'strong'>('natural');

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={[styles.previewArea, { backgroundColor: colors.primaryLight + '30' }]}>
          <ThemedText style={styles.placeholderText}>试妆预览区域</ThemedText>
          <ThemedText style={styles.placeholderSub}>上传照片 + 选择妆容后将显示效果</ThemedText>
        </View>
        <View style={styles.controls}>
          <ThemedText type="defaultSemiBold" style={styles.label}>妆容强度</ThemedText>
          <View style={styles.segmented}>
            <TouchableOpacity
              style={[styles.segItem, intensity === 'natural' && { backgroundColor: colors.primary }]}
              onPress={() => setIntensity('natural')}
            >
              <ThemedText style={intensity === 'natural' && styles.segTextActive}>自然版</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segItem, intensity === 'strong' && { backgroundColor: colors.primary }]}
              onPress={() => setIntensity('strong')}
            >
              <ThemedText style={intensity === 'strong' && styles.segTextActive}>浓妆版</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <ThemedText style={styles.saveBtnText}>保存并分享</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, padding: 16 },
  previewArea: { height: 280, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  placeholderText: { fontSize: 16 },
  placeholderSub: { marginTop: 8, fontSize: 13, opacity: 0.7 },
  controls: { marginBottom: 24 },
  label: { marginBottom: 12 },
  segmented: { flexDirection: 'row', gap: 12 },
  segItem: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  segTextActive: { color: '#fff' },
  saveBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
