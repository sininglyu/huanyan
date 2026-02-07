// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'viewfinder': 'center-focus-strong',
  'person.fill': 'person',
  'bubble.left.and.bubble.right.fill': 'chat',
  'doc.text.fill': 'description',
  'person.2.fill': 'people',
  'bolt.fill': 'flash-on',
  'photo.fill': 'photo-library',
  'arrow.back.ios': 'arrow-back',
  'notifications': 'notifications',
  'local_fire_department': 'local-fire-department',
  'camera_front': 'camera-alt',
  'monitoring': 'trending-up',
  'auto_awesome': 'auto-awesome',
  'shopping_bag': 'shopping-bag',
  'bookmark': 'bookmark',
  'settings': 'settings',
  'verified': 'verified-user',
  'menu': 'menu',
  'search': 'search',
  'arrow_drop_up': 'keyboard-arrow-up',
  'spa': 'spa',
  'science': 'science',
  'close': 'close',
  'water_drop': 'water-drop',
  'wb_sunny': 'wb-sunny',
  'play_arrow': 'play-arrow',
  'check': 'check',
  'check_circle': 'check-circle',
  'sunny': 'wb-sunny',
  'nights_stay': 'nights-stay',
  'groups': 'groups',
  'calendar_today': 'calendar-today',
  'opacity': 'opacity',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
