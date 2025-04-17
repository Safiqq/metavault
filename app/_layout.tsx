import {
  useFonts,
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
} from "@expo-google-fonts/plus-jakarta-sans";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../global.css";
import { MnemonicSetupProvider } from "@/contexts/MnemonicSetupContext";
import { AuthenticationSetupProvider } from "@/contexts/AuthenticationSetupContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  let [fontsLoaded] = useFonts({
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
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthenticationSetupProvider>
        <MnemonicSetupProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "white" },
            }}
          >
            {/* Authentication screens with AuthenticationSetupProvider */}
            <Stack.Screen name="authentication/faceauthentication" />
            <Stack.Screen name="authentication/fingerprint" />
            <Stack.Screen name="authentication/sqrl" />

            <Stack.Screen name="settings/accountsecurity" />
            <Stack.Screen name="settings/other" />
            <Stack.Screen name="settings/vault" />

            {/* Main app screens */}
            <Stack.Screen name="confirmsrp" />
            <Stack.Screen name="createaccount" />
            <Stack.Screen name="folders" />
            <Stack.Screen name="generator" />
            <Stack.Screen name="index" />
            <Stack.Screen name="locked" />
            <Stack.Screen name="myvault" />
            <Stack.Screen name="securevault" />
            <Stack.Screen name="securevault2" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="srp" />
            <Stack.Screen name="verifysrp" />

            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </MnemonicSetupProvider>
      </AuthenticationSetupProvider>
    </ThemeProvider>
  );
}
