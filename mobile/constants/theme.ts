/**
 * Theme colors - 焕颜 design: warm beige/brown palette from UI mockups.
 * Section boxes: white/light background with shadow so each section stands out from page background.
 */

import { Platform, ViewStyle } from 'react-native';

const primaryBrown = '#C4A77D';
const primaryDark = '#8B7355';
const tintLight = primaryBrown;
const tintDark = '#E8DCC8';

export const Colors = {
  light: {
    text: '#5C4033',
    background: '#F5F0E8',
    tint: tintLight,
    icon: '#8B7355',
    tabIconDefault: '#8B7355',
    tabIconSelected: primaryBrown,
    primary: primaryBrown,
    primaryLight: '#E8DCC8',
    primaryDark: '#8B4513',
    subtitle: '#6B5B4F',
  },
  dark: {
    text: '#E8DCC8',
    background: '#2A2520',
    tint: tintDark,
    icon: '#C4A77D',
    tabIconDefault: '#8B7355',
    tabIconSelected: tintDark,
    primary: primaryBrown,
    primaryLight: '#5C4033',
    primaryDark: '#8B4513',
    subtitle: '#9E9E9E',
  },
};

/** Section card: white background, subtle shadow, rounded. Use for all section boxes (not theme-colored). */
export const SectionBoxShadow: ViewStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
