import {
  PlusJakartaSans_200ExtraLight,
  PlusJakartaSans_200ExtraLight_Italic,
  PlusJakartaSans_300Light,
  PlusJakartaSans_300Light_Italic,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_400Regular_Italic,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_500Medium_Italic,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_600SemiBold_Italic,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_700Bold_Italic,
  PlusJakartaSans_800ExtraBold,
  PlusJakartaSans_800ExtraBold_Italic,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

import { AlertProvider } from "@/contexts/AlertProvider";
import { AppStateProvider } from "@/contexts/AppStateProvider";
import { AuthProvider } from "@/contexts/AuthProvider";

// Root layout for the app. Handles font loading, splash screen, and wraps the app in all necessary providers.
// Font configuration for better maintainability
const FONT_CONFIG = {
  PlusJakartaSans_200ExtraLight,
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  PlusJakartaSans_200ExtraLight_Italic,
  PlusJakartaSans_300Light_Italic,
  PlusJakartaSans_400Regular_Italic,
  PlusJakartaSans_500Medium_Italic,
  PlusJakartaSans_600SemiBold_Italic,
  PlusJakartaSans_700Bold_Italic,
  PlusJakartaSans_800ExtraBold_Italic,
} as const;

// Stack screen options for consistency
const STACK_SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: { backgroundColor: "white" },
} as const;

export default function RootLayout(): React.JSX.Element | null {
  // Load all custom fonts before rendering the app
  const [fontsLoaded, fontError] = useFonts(FONT_CONFIG);

  // Hide the splash screen once fonts are loaded or if there's a font loading error
  const handleSplashScreen = useCallback(async () => {
    if (fontsLoaded || fontError) {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn("Failed to hide splash screen:", error);
      }
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    handleSplashScreen();
  }, [handleSplashScreen]);

  // Don't render the app UI until fonts are ready or errored
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // App provider tree: SafeArea > Theme > Auth > AppState > Alert > Main Stack
  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <AuthProvider>
          <AppStateProvider>
            <AlertProvider>
              <Stack screenOptions={STACK_SCREEN_OPTIONS} />
              <StatusBar style="auto" />
            </AlertProvider>
          </AppStateProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
