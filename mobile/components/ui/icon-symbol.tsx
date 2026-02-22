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
  'bell.fill': 'notifications',
  'flame.fill': 'local-fire-department',
  'camera.fill': 'camera-alt',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'sparkles': 'auto-awesome',
  'shopping_bag': 'shopping-bag',
  'bookmark': 'bookmark',
  'gearshape.fill': 'settings',
  'checkmark.seal.fill': 'verified-user',
  'menu': 'menu',
  'magnifyingglass': 'search',
  'arrow_drop_up': 'keyboard-arrow-up',
  'spa': 'spa',
  'science': 'science',
  'close': 'close',
  'drop.fill': 'water-drop',
  'sun.max.fill': 'wb-sunny',
  'play.fill': 'play-arrow',
  'check': 'check',
  'check_circle': 'check-circle',
  'sunny': 'wb-sunny',
  'nights_stay': 'nights-stay',
  'person.2.fill': 'groups',
  'calendar': 'calendar-today',
  'opacity': 'opacity',
  'plus': 'add',
  'arrow_back_ios_new': 'arrow-back',
  'favorite': 'favorite',
  'visibility': 'visibility',
  'thumb_up': 'thumb-up',
  'chat_bubble': 'chat-bubble',
  'add_photo_alternate': 'add-photo-alternate',
  'image': 'image',
  'location_on': 'location-on',
  'alternate_email': 'alternate-email',
  'sell': 'sell',
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
