import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { apiUploadFormData, getAuthToken } from '@/constants/api';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CaptureScreen() {
  const router = useRouter();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const cameraRef = useRef<Camera>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

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
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!analyzing}
        photo
        torch={torchOn ? 'on' : 'off'}
      />
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.topBarBtn}
          onPress={handlePickFromGallery}
          disabled={analyzing}
        >
          <IconSymbol name="photo.fill" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.realtimePill}>
          <View style={styles.redDot} />
          <Text style={styles.realtimeText}>实时扫描</Text>
        </View>
        <TouchableOpacity
          style={styles.topBarBtn}
          onPress={() => setTorchOn((v) => !v)}
          disabled={analyzing}
        >
          <IconSymbol name="bolt.fill" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.faceGuideOverlay} pointerEvents="none">
        <View style={styles.faceOvalWrap}>
          <View style={styles.faceOval} />
          <View style={[styles.faceOvalLine, styles.faceOvalLineTop]} />
          <View style={[styles.faceOvalLine, styles.faceOvalLineMid]} />
          <View style={[styles.faceOvalLine, styles.faceOvalLineBottom]} />
        </View>
      </View>
      <View style={styles.bottomOverlay} pointerEvents="box-none">
        {analyzing ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            <Text style={styles.alignText}>对准面部</Text>
            <Text style={styles.alignHint}>请将面部置于框内并确保光线充足</Text>
            <TouchableOpacity style={styles.captureButton} onPress={handleAnalyze}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hint: { marginTop: 12, color: '#fff' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  topBarBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  realtimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f44' },
  realtimeText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  faceGuideOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceOvalWrap: {
    width: 220,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceOval: {
    ...StyleSheet.absoluteFillObject,
    width: 220,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
  },
  faceOvalLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,152,0,0.8)',
    height: 2,
  },
  faceOvalLineTop: { width: 120, top: 50, left: 50, marginLeft: -60 },
  faceOvalLineMid: { width: 180, top: 138, left: 20, marginTop: -1 },
  faceOvalLineBottom: { width: 100, top: 226, left: 60, marginLeft: -50 },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  alignText: { color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 8 },
  alignHint: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 24 },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
