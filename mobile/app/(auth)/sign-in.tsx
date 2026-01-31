import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useLogto } from '@logto/rn';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const REDIRECT_URI = 'huanyan://callback';

export default function SignInScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const { signIn, isAuthenticated } = useLogto();
  const [loading, setLoading] = React.useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn(REDIRECT_URI);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Top gradient decoration */}
      <LinearGradient
        colors={['#FFE4F3', '#FFF5FB', 'transparent']}
        style={styles.topGradient}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>欢迎回来</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.subtitle }]}>
            使用邮箱登录您的 GlowAI 账号
          </ThemedText>
        </View>

        {/* Decorative form (actual auth happens on Logto page) */}
        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f8f8' }]}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="邮箱地址"
              placeholderTextColor={colors.subtitle}
              editable={false}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f8f8' }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="密码"
              placeholderTextColor={colors.subtitle}
              secureTextEntry
              editable={false}
            />
            <TouchableOpacity style={styles.eyeIcon}>
              <Ionicons name="eye-outline" size={20} color={colors.subtitle} />
            </TouchableOpacity>
          </View>

          {/* Links row */}
          <View style={styles.linksRow}>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
              <ThemedText style={[styles.link, { color: colors.primary }]}>
                没有账号？立即注册
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity>
              <ThemedText style={[styles.link, { color: colors.subtitle }]}>
                忘记密码？
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Sign in button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.text }]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>登录</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.subtitle + '30' }]} />
          <ThemedText style={[styles.dividerText, { color: colors.subtitle }]}>
            其他方式登录
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: colors.subtitle + '30' }]} />
        </View>

        {/* Social login icons (decorative - Logto handles these) */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={[styles.socialButton, { borderColor: colors.subtitle + '30' }]} onPress={handleSignIn}>
            <Ionicons name="logo-wechat" size={24} color="#07C160" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, { borderColor: colors.subtitle + '30' }]} onPress={handleSignIn}>
            <Ionicons name="logo-github" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, { borderColor: colors.subtitle + '30' }]} onPress={handleSignIn}>
            <Ionicons name="logo-google" size={24} color="#4285F4" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.subtitle }]}>
            登录即代表您已阅读并同意{' '}
          </ThemedText>
          <TouchableOpacity>
            <ThemedText style={[styles.footerLink, { color: colors.primary }]}>
              《用户协议》
            </ThemedText>
          </TouchableOpacity>
          <ThemedText style={[styles.footerText, { color: colors.subtitle }]}>
            {' '}与{' '}
          </ThemedText>
          <TouchableOpacity>
            <ThemedText style={[styles.footerLink, { color: colors.primary }]}>
              《隐私政策》
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  link: {
    fontSize: 14,
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 12,
  },
  footerLink: {
    fontSize: 12,
  },
});
