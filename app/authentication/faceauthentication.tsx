import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { useState, useEffect } from "react";
import { largeSecureStore } from "@/lib/supabase";

export default function FaceAuthenticationScreen() {
  const { availableAuthMethods, email, name } = useLocalSearchParams();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();

  const handleFaceAuthentication = async () => {
    try {
      setIsAuthenticating(true);

      // Attempt authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authenticate with ${
          Platform.OS === "android" ? "face authentication" : "Face ID"
        }`,
        disableDeviceFallback: true, // Disable fallback to PIN/pattern/password
        cancelLabel: "Cancel",
      });

      if (result.success) {
        // Authentication successful - save preference and navigate
        await saveFaceAuthPreference(true);

        Alert.alert(
          "Success!",
          `${
            Platform.OS === "android" ? "Face authentication" : "Face ID"
          } has been enabled for MetaVault.`,
          [
            {
              text: "Continue",
              onPress: () => {
                // Navigate to next step
                if (availableAuthMethods.includes("2")) {
                  router.push(
                    `/authentication/fingerprint?availableAuthMethods=${availableAuthMethods}&email=${email}&name=${name}`
                  );
                  // } else {
                  //   router.push(
                  //     `/authentication/sqrl?availableAuthMethods=${availableAuthMethods}&email=${email}&name=${name}`
                  //   );
                }
              },
            },
          ]
        );
      } else {
        // Authentication failed or was cancelled
        if (result.error === "UserCancel") {
          // console.log('User cancelled authentication');
        } else if (result.error === "UserFallback") {
          // console.log('User chose fallback authentication');
        } else {
          Alert.alert(
            "Authentication Failed",
            "Unable to authenticate. Please try again."
          );
        }
      }
    } catch (error) {
      // console.error('Authentication error:', error);
      Alert.alert(
        "Error",
        "An error occurred during authentication. Please try again."
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const saveFaceAuthPreference = async (enabled: boolean) => {
    try {
      await largeSecureStore.setItem(
        "faceAuthEnabled",
        JSON.stringify({
          enabled,
          timestamp: Date.now(),
          platform: Platform.OS,
        })
      );
    } catch (error) {
      throw error;
    }
  };

  const handleSkip = () => {
    // Navigate to next step without enabling face auth
    if (availableAuthMethods.includes("2")) {
      router.push(
        `/authentication/fingerprint?availableAuthMethods=${availableAuthMethods}&email=${email}&name=${name}`
      );
      // } else {
      //   router.push(
      //     `/authentication/sqrl?availableAuthMethods=${availableAuthMethods}&email=${email}&name=${name}`
      //   );
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 w-full px-12 ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      <ScrollView className="flex-1 px-12">
        <ProgressSteps currentStep={2} />
        <View className="mt-10">
          <Image
            className="max-w-15 max-h-15"
            source={require("@/assets/images/scanning.png")}
          />

          <Spacer size={16} />

          <ThemedText fontWeight={700} fontSize={24}>
            Use {Platform.OS == "android" ? "face authentication" : "Face ID"}{" "}
            to unlock MetaVault on this device?
          </ThemedText>

          <Spacer size={16} />

          <ThemedText>
            Unlock this app even faster with{" "}
            {Platform.OS == "android" ? "face authentication" : "Face ID"}. You
            can manage this in your MetaVault security settings at any time.
          </ThemedText>
        </View>
      </ScrollView>
      <View className="mb-8 px-12">
        <Link
          href={
            // Go to fingerprint first
            availableAuthMethods.includes("2")
              ? `/authentication/fingerprint?availableAuthMethods=${availableAuthMethods}&email=${email}&name=${name}`
              : // Go to sqrl if no fingerprint available
                "/securevault"
            // `/authentication/sqrl?availableAuthMethods=${availableAuthMethods}&email=${email}&name=${name}`
          }
          asChild
        >
          <Pressable
            className={`w-full py-3 rounded-xl ${
              isAuthenticating ? "bg-[#BBBBBB]" : "bg-black"
            }`}
            onPress={handleFaceAuthentication}
            disabled={isAuthenticating}
          >
            <ThemedText fontWeight={700} className="text-white text-center">
              {isAuthenticating
                ? "Authenticating..."
                : `Use ${
                    Platform.OS == "android" ? "face authentication" : "Face ID"
                  }`}
            </ThemedText>
          </Pressable>
        </Link>
        <Spacer size={8} />
        <Pressable
          className="bg-[#D9D9D9] w-full py-3 rounded-xl"
          onPress={handleSkip}
          disabled={isAuthenticating}
        >
          <ThemedText className="text-center">Skip for now</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
