import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

export default function CameraScreen() {
    const { hasPermission, requestPermission } = useCameraPermission()

    const device = useCameraDevice('front');

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    if (!hasPermission) {
        return <ActivityIndicator />;
    }

    if (device == null) {
        return <Text>Loading camera...</Text>;
    }

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />

            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
            />
        </View>
    );
};

