import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import notificationService from '../services/notificationService';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    const init = async () => {
      try {
        const granted = await notificationService.requestPermissions();
        if (granted) {
          await notificationService.setupNotificationChannel();
        }
      } catch {}
      SplashScreen.hideAsync();
    };
    init();

    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        try {
          const granted = await notificationService.ensureEnabled();
          if (granted) {
            await notificationService.setupNotificationChannel();
          }
        } catch {}
      }
    });

    return () => {
      sub.remove();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="landing" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
