import { Stack } from 'expo-router';

export default function AILayout() {
  return (
    <Stack screenOptions={{ headerShown: true, title: 'AI 测肤' }}>
      <Stack.Screen name="result/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
