import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, title: '我的' }}>
      <Stack.Screen name="edit" options={{ title: '编辑资料' }} />
      <Stack.Screen name="journey" options={{ title: '焕颜之旅' }} />
      <Stack.Screen name="plan" options={{ title: '我的方案' }} />
      <Stack.Screen name="favorites" options={{ title: '收藏项目' }} />
      <Stack.Screen name="activity" options={{ title: '我的活动' }} />
      <Stack.Screen name="settings" options={{ title: '设置' }} />
    </Stack>
  );
}
