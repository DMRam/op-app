import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="(tabs)" // This corresponds to the `app/(tabs)` directory
          options={{ headerShown: false }} // Hide the header for the tabs screen
        />
        <Stack.Screen
          name="+not-found" // This corresponds to the `app/+not-found.tsx` file
          options={{ headerShown: false }} // Hide the header for the not-found screen
        />
      </Stack>
    </GestureHandlerRootView>
  );
}