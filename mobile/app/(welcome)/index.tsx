import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/auth-context';

const SPLASH_DURATION_MS = 2000;
const FADE_DURATION_MS = 400;

const SPLASH_BG = '#F5F0E8';
const SPLASH_CIRCLE = '#C4A77D';
const SPLASH_TITLE = '#5C4033';
const SPLASH_TAG = '#8B7355';
const SPLASH_FOOTER = '#9E9E9E';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [phase, setPhase] = useState<'splash' | 'onboarding'>('splash');
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(() => setPhase('onboarding'));
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, [splashOpacity]);

  const handleCta = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/sign-in');
    }
  };

  if (phase === 'splash') {
    return (
      <View style={[styles.fullScreen, { backgroundColor: SPLASH_BG }]}>
        <StatusBar barStyle="dark-content" backgroundColor={SPLASH_BG} />
        <Animated.View style={[styles.splashWrap, { opacity: splashOpacity }]}>
          <View style={styles.splashIconCircle}>
            <View style={styles.splashIconInner}>
              <IconSymbol name="viewfinder" size={56} color="#fff" />
            </View>
          </View>
          <Text style={[styles.splashTitle, { color: SPLASH_TITLE }]}>焕颜</Text>
          <Text style={[styles.splashTagline, { color: SPLASH_TAG }]}>焕发你的光彩</Text>
          <View style={styles.splashDivider} />
          <Text style={[styles.splashFooter, { color: SPLASH_FOOTER }]}>
            你的个人美肤之旅从这里开始
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.fullScreen, { backgroundColor: SPLASH_BG }]}>
      <StatusBar barStyle="dark-content" backgroundColor={SPLASH_BG} />
      <View style={styles.onboardingContainer}>
        <View style={styles.onboardingHeader}>
          <Text style={[styles.onboardingTitle, { color: SPLASH_TITLE }]}>焕颜</Text>
          <Text style={[styles.onboardingTagline, { color: SPLASH_TITLE }]}>你肌肤的新闺蜜</Text>
          <Text style={[styles.onboardingSub, { color: SPLASH_TAG }]}>
            基于科学,为你独特的肤色定制护肤方案
          </Text>
        </View>
        <View style={styles.featureList}>
          <View style={styles.featureRow}>
            <View style={[styles.featureIconCircle, { borderColor: SPLASH_TAG }]}>
              <IconSymbol name="viewfinder" size={24} color={SPLASH_CIRCLE} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>AI 扫描</Text>
              <Text style={[styles.featureDesc, { color: SPLASH_TAG }]}>即时专业分析</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureIconCircle, { borderColor: SPLASH_TAG }]}>
              <IconSymbol name="doc.text.fill" size={24} color={SPLASH_CIRCLE} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>定制方案</Text>
              <Text style={[styles.featureDesc, { color: SPLASH_TAG }]}>个性化分步护理</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureIconCircle, { borderColor: SPLASH_TAG }]}>
              <IconSymbol name="person.2.fill" size={24} color={SPLASH_CIRCLE} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>社区中心</Text>
              <Text style={[styles.featureDesc, { color: SPLASH_TAG }]}>
                与他人分享你的美肤历程
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleCta}
          activeOpacity={0.85}
          style={[styles.ctaButtonWrap, { width: width - 48 }]}
        >
          <LinearGradient
            colors={['#E8B86D', '#8B4513']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaButtonText}>分析我的皮肤 ✨</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={[styles.tos, { color: SPLASH_FOOTER }]}>
          By continuing, you agree to our Terms of Service
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  splashWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  splashIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: SPLASH_CIRCLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  splashIconInner: { alignItems: 'center', justifyContent: 'center' },
  splashTitle: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  splashTagline: { fontSize: 16, marginBottom: 32 },
  splashDivider: {
    width: 48,
    height: 2,
    backgroundColor: SPLASH_CIRCLE,
    borderRadius: 1,
    marginBottom: 24,
    opacity: 0.6,
  },
  splashFooter: { fontSize: 12 },
  onboardingContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  onboardingHeader: { alignItems: 'center', marginBottom: 28 },
  onboardingTitle: { fontSize: 28, fontWeight: '700' },
  onboardingTagline: { fontSize: 20, marginTop: 8 },
  onboardingSub: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  featureList: { flex: 1, gap: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '600', color: SPLASH_TITLE },
  featureDesc: { fontSize: 13, marginTop: 2 },
  ctaButtonWrap: { alignSelf: 'center', marginBottom: 16, borderRadius: 28, overflow: 'hidden' },
  ctaButton: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  tos: { fontSize: 11, textAlign: 'center', marginBottom: 32 },
});
