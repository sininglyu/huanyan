import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Tab bar design from HTML: background-light/95, border zinc-200, labels 首页/社区/扫描/方案/个人
const TAB_BAR_BG = '#f8f7f6';
const TAB_BAR_BORDER = '#e4e4e7';
const TAB_INACTIVE = '#a1a1aa';
const SCAN_BTN_BORDER = '#f8f7f6';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarStyle: {
          backgroundColor: TAB_BAR_BG,
          borderTopColor: TAB_BAR_BORDER,
          borderTopWidth: 1,
          paddingTop: 12,
          paddingBottom: 24,
          paddingHorizontal: 8,
        },
        headerShown: false,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarButton: HapticTab,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: '社区',
          tabBarButton: HapticTab,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="groups" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: '扫描',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => router.push('/ai/capture')}
              style={[props.style, styles.scanTabButton]}
              activeOpacity={0.8}
            >
              <View style={styles.scanTabContent}>
                <View style={styles.scanButtonWrap}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[
                      styles.scanButton,
                      {
                        borderColor: TAB_BAR_BG,
                      },
                    ]}
                  >
                    <IconSymbol name="viewfinder" size={28} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={styles.scanLabel}>扫描</Text>
              </View>
            </TouchableOpacity>
          ),
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: '方案',
          tabBarButton: HapticTab,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="calendar_today" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '个人',
          tabBarButton: HapticTab,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  scanTabContent: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  scanButtonWrap: {
    marginTop: -40,
    marginBottom: 4,
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#cfa577',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  scanLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: TAB_INACTIVE,
  },
});
