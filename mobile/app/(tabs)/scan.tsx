import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ScanTabScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight + '60' }]}>
          <IconSymbol name="viewfinder" size={64} color={colors.primary} />
        </View>
        <ThemedText type="title" style={styles.title}>
          皮肤扫描
        </ThemedText>
        <ThemedText style={[styles.hint, { color: colors.subtitle }]}>
          点击下方按钮开始分析
        </ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/ai/capture')}
          activeOpacity={0.85}
        >
          <ThemedText style={styles.buttonText}>开始扫描</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { marginBottom: 8 },
  hint: { fontSize: 14, marginBottom: 32 },
  button: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 24 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
