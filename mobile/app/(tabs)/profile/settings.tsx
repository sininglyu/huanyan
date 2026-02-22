import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLogto } from '@logto/rn';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setAuthToken } from '@/constants/api';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signOut } = useLogto();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      '退出登录',
      '确定要退出当前账号吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              setSigningOut(true);
              // Clear local token first
              setAuthToken(null);
              // Sign out from Logto
              await signOut();
              // Navigation will be handled by auth guard in root layout
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('错误', '退出登录失败，请重试');
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const LIGHT_BG = '#f8f7f6';

  return (
    <View style={[styles.container, { backgroundColor: LIGHT_BG }]}>
      <ScrollView style={styles.scroll}>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/(tabs)/profile/edit')}>
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

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.row, styles.signOutRow]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <ThemedText style={styles.signOutText}>退出登录</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  hint: { flex: 1, fontSize: 12, marginLeft: 8 },
  danger: { marginTop: 24 },
  dangerText: { color: '#E91E8C' },
  signOutRow: { marginTop: 32, justifyContent: 'center', borderBottomWidth: 0 },
  signOutText: { color: '#EF4444', fontSize: 16, fontWeight: '500' },
});
