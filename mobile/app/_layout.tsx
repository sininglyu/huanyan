import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { LogtoProvider, LogtoConfig, UserScope } from '@logto/rn';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';

// Logto configuration from environment variables
const logtoConfig: LogtoConfig = {
  endpoint: process.env.EXPO_PUBLIC_LOGTO_ENDPOINT ?? '',
  appId: process.env.EXPO_PUBLIC_LOGTO_APP_ID ?? '',
  scopes: [UserScope.Email],
  resources: [process.env.EXPO_PUBLIC_LOGTO_API_RESOURCE ?? ''],
};

export const unstable_settings = {
  initialRouteName: '(welcome)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isReady, isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Handle auth-based navigation (do not redirect when on welcome - user taps CTA to go to auth or tabs)
  React.useEffect(() => {
    if (!isReady || isLoading) {
      return;
    }

    const inWelcome = segments[0] === '(welcome)';
    const inAuthGroup = segments[0] === '(auth)';

    if (inWelcome) {
      return;
    }
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    }
  }, [isReady, isAuthenticated, isLoading, segments, router]);

  // Show loading indicator while checking auth state
  if (!isReady || isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(welcome)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ai" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <LogtoProvider config={logtoConfig}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </LogtoProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
