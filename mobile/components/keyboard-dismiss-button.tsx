import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  View,
} from 'react-native';

const COLORS = {
  primary: '#cfa577',
  text: '#161412',
};

export function KeyboardDismissButton() {
  const [visible, setVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(80);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setVisible(true);
        const height = e.endCoordinates?.height ?? 300;
        setBottomOffset(height + 12);
      }
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (!visible) return null;

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.button}
        onPress={() => Keyboard.dismiss()}
        activeOpacity={0.8}
      >
        <Text style={styles.text}>关闭键盘</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
