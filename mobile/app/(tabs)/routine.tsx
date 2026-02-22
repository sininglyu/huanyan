import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function RoutineTabScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const LIGHT_BG = '#f8f7f6';

  return (
    <View style={[styles.container, { backgroundColor: LIGHT_BG }]}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight + '60' }]}>
          <IconSymbol name="doc.text.fill" size={48} color={colors.primary} />
        </View>
        <ThemedText type="title" style={styles.title}>
          护肤日程
        </ThemedText>
        <ThemedText style={[styles.hint, { color: colors.subtitle }]}>
          查看早晚护肤方案
        </ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/profile/plan')}
          activeOpacity={0.85}
        >
          <ThemedText style={styles.buttonText}>我的方案</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { marginBottom: 8 },
  hint: { fontSize: 14, marginBottom: 28 },
  button: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
