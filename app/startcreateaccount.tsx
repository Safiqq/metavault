import { Image, Platform, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import {
  hasHardwareAsync,
  supportedAuthenticationTypesAsync,
  AuthenticationType,
  isEnrolledAsync,
} from "expo-local-authentication";
// import { useCameraPermissions } from "expo-camera";
import React, { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Header } from "@/components/ui/Header";
import { largeSecureStore } from "@/lib/supabase";
import { AvailableAuthMethods } from "@/lib/types";

export default function StartCreateAccountScreen() {
  const [availableAuthMethods, setAvailableAuthMethods] = useState<
    AvailableAuthMethods[]
  >([]);
  // const [hasCamera, setHasCamera] = useState(false);
  // const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const handleGetStarted = () => {
    largeSecureStore.setItem(
      "availableAuthMethods",
      JSON.stringify(availableAuthMethods)
    );
    router.push("/createaccount");
  };

  useEffect(() => {
    async function checkBiometrics() {
      try {
        const compatible = await hasHardwareAsync();
        console.log("compatible", compatible);

        if (compatible) {
          const types = await supportedAuthenticationTypesAsync();

          const isEnrolled = await isEnrolledAsync();

          const authMethods = [];

          if (isEnrolled && types.includes(AuthenticationType.FINGERPRINT)) {
            authMethods.push(AvailableAuthMethods.FINGERPRINT);
          }

          if (
            isEnrolled &&
            types.includes(AuthenticationType.FACIAL_RECOGNITION)
          ) {
            if (Platform.OS === "ios") {
              authMethods.push(AvailableAuthMethods.FACE_ID);
            } else {
              authMethods.push(AvailableAuthMethods.FACE_AUTHENTICATION);
            }
          }

          setAvailableAuthMethods(authMethods);
        }

        // Check if camera can be used
        // if (permission && permission.granted) {
        //   setHasCamera(true);
        //   setAvailableAuthMethods([
        //     ...availableAuthMethods,
        //     AvailableAuthMethods["Secure, Quick, Reliable Login (SQRL)"],
        //   ]);
        // }

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }

    checkBiometrics();
  }, []);

  // Loading state
  if (loading) {
    return <View />;
  }

  return (
    <SafeAreaView
      className={`flex-1 w-full px-12 ${
        Platform.OS == "web" && "max-w-2xl mx-auto"
      }`}
    >
      <Header
        titleText="MetaVault"
        leftButtonText="Back"
        leftButtonBackImage={true}
      />
      <ScrollView className="flex-1 px-12">
        <View className="mt-10">
          <ThemedText fontWeight={700} fontSize={28}>
            Create an account without a Master Password
          </ThemedText>

          <Spacer size={16} />

          <View className="bg-[#EBEBEB] py-3 px-2 flex flex-row items-start gap-4">
            <Image
              className="max-w-4 max-h-4"
              source={require("@/assets/images/info-circle.png")}
            />
            <View className="flex-1 -mt-1 mr-4">
              <ThemedText paddingVertical={0}>
                <ThemedText fontSize={14}>
                  Master passwords, which are a{" "}
                </ThemedText>
                <ThemedText fontSize={14} fontWeight={700}>
                  'something you know'
                </ThemedText>
                <ThemedText fontSize={14}>
                  , type of authentication factor, are vulnerable, especially
                  since hardware capabilities are increasing exponentially.
                </ThemedText>
              </ThemedText>
            </View>
          </View>

          <Spacer size={16} />

          <ThemedText>
            <ThemedText>
              Go passwordless and use another authentication factor (such as{" "}
            </ThemedText>
            <ThemedText fontWeight={700}>'something you have'</ThemedText>
            <ThemedText> or </ThemedText>
            <ThemedText fontWeight={700}>'something you are'</ThemedText>
            <ThemedText>) to log in.</ThemedText>
          </ThemedText>

          {availableAuthMethods.length > 0 ? (
            <>
              <Spacer size={12} />
              <ThemedText fontWeight={600}>
                Available authentication method(s) for your device:
              </ThemedText>
              {availableAuthMethods.map((method, index) => (
                <ThemedText key={index}>
                  {" "}
                  • {AvailableAuthMethods[method]}
                </ThemedText>
              ))}
            </>
          ) : (
            <ThemedText>
              Currently, there is no authentication method available for your
              device.
            </ThemedText>
          )}
        </View>
      </ScrollView>
      <View className="mb-8 px-12">
        <Pressable
          className={`bg-black w-full py-3 rounded-xl ${
            availableAuthMethods.length === 0 && "hidden"
          }`}
          disabled={availableAuthMethods.length === 0}
          onPress={handleGetStarted}
        >
          <ThemedText fontWeight={700} className="text-white text-center">
            Get started
          </ThemedText>
        </Pressable>

        <Spacer size={8} />

        <Pressable className="bg-[#D9D9D9] w-full py-3 rounded-xl">
          <ThemedText className="text-center">Learn more</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
