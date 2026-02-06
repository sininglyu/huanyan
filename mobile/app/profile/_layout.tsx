import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, title: '我的' }}>
      <Stack.Screen name="journey" options={{ title: '焕颜之旅' }} />
      <Stack.Screen name="plan" options={{ title: '我的方案' }} />
    </Stack>
  );
}
