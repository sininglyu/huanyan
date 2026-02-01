import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { apiUploadFormData, getAuthToken } from '@/constants/api';

export default function CaptureScreen() {
  const router = useRouter();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const cameraRef = useRef<Camera>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const uploadAndAnalyze = async (uri: string) => {
    const formData = new FormData();
    formData.append('image', {
      uri,
      name: 'image.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
    const res = await apiUploadFormData<{ analysisId: string }>('/analysis/upload', formData);
    router.replace(`/ai/result/${res.analysisId}`);
  };

  const handleAnalyze = async () => {
    if (!cameraRef.current || analyzing) return;
    const token = getAuthToken();
    if (!token) {
      Alert.alert('提示', '请先登录');
      return;
    }
    setAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePhoto({ quality: 90 });
      const uri = Platform.OS === 'android' && !photo.path.startsWith('file://') ? `file://${photo.path}` : photo.path;
      await uploadAndAnalyze(uri);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '分析失败，请重试';
      const friendlyMsg = /face|人脸/i.test(msg) ? '未检测到人脸，请确保面部清晰、光线充足' : msg;
      Alert.alert('分析失败', friendlyMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePickFromGallery = async () => {
    if (analyzing) return;
    const token = getAuthToken();
    if (!token) {
      Alert.alert('提示', '请先登录');
      return;
    }
    try {
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('提示', '需要相册权限才能选择照片');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
      });
      if (result.canceled || !result.assets?.[0]) return;
      setAnalyzing(true);
      try {
        const uri = result.assets[0].uri;
        await uploadAndAnalyze(uri);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '分析失败，请重试';
        let friendlyMsg = msg;
        if (/face|人脸/i.test(msg)) friendlyMsg = '未检测到人脸，请确保面部清晰、光线充足';
        else if (/jpeg|jpg|png|format|格式/i.test(msg)) friendlyMsg = '请选择 JPG/JPEG 格式的照片';
        Alert.alert('分析失败', friendlyMsg);
      } finally {
        setAnalyzing(false);
      }
    } catch (loadErr) {
      Alert.alert(
        '功能不可用',
        '请重新构建应用以使用相册功能：\n\nnpx expo run:android\n\n或\n\nnpx expo run:ios'
      );
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.hint}>请求相机权限...</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.centered}>
        <Text>加载相机...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} isActive={!analyzing} photo />
      <View style={styles.overlay}>
        {analyzing ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.captureBtn} onPress={handleAnalyze}>
              <Text style={styles.captureText}>拍照分析</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryBtn} onPress={handlePickFromGallery}>
              <Text style={styles.galleryText}>从相册选择</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hint: { marginTop: 12 },
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48 },
  buttons: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  captureBtn: { backgroundColor: '#E91E8C', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 24 },
  captureText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  galleryBtn: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 24, borderWidth: 2, borderColor: '#fff' },
  galleryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
