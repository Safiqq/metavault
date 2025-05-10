import { Image, Platform, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import {
  hasHardwareAsync,
  supportedAuthenticationTypesAsync,
  AuthenticationType,
} from "expo-local-authentication";
// import { useCameraPermissions } from "expo-camera";
import React, { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Header } from "@/components/ui/Header";
import { Switch } from "@/components/ui/Switch";
import { ThemedTextInput } from "@/components/ThemedTextInput";

enum AvailableAuthMethods {
  "face authentication" = 1,
  "Face ID" = 1,
  fingerprint = 2,
  // "SQRL" = 4,
}

type AuthMethodName = keyof typeof AvailableAuthMethods;
type UnlockStates = Record<AuthMethodName, boolean>;

export default function ImportFromSRPScreen() {
  const [availableAuthMethods, setAvailableAuthMethods] = useState<
    AvailableAuthMethods[]
  >([]);
  // const [hasCamera, setHasCamera] = useState(false);
  // const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(true);
  const [unlockWithStates, setUnlockWithStates] = useState<UnlockStates>({
    fingerprint: false,
    "face authentication": false,
    "Face ID": false,
    // SQRL: false,
  });
  const [srp, setSrp] = useState<string>();
  const [showSrp, setShowSrp] = useState<boolean>(false);

  useEffect(() => {
    async function checkBiometrics() {
      try {
        const compatible = await hasHardwareAsync();

        if (compatible) {
          const types = await supportedAuthenticationTypesAsync();

          const authMethods = [];

          if (types.includes(AuthenticationType.FINGERPRINT)) {
            authMethods.push(AvailableAuthMethods.fingerprint);
          }

          if (types.includes(AuthenticationType.FACIAL_RECOGNITION)) {
            if (Platform.OS === "ios") {
              authMethods.push(AvailableAuthMethods["Face ID"]);
            } else {
              authMethods.push(AvailableAuthMethods["face authentication"]);
            }
          }

          setAvailableAuthMethods(authMethods);
        }

        // Check if camera can be used
        // if (permission && permission.granted) {
        //   setHasCamera(true);
        //   setAvailableAuthMethods([
        //     ...availableAuthMethods,
        //     AvailableAuthMethods["SQRL"],
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
      className={`flex-1 w-full ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      <Header
        titleText="MetaVault"
        leftButtonText="Back"
        leftButtonBackImage={true}
      />
      <ScrollView className="flex-1 px-12">
        <View className="mt-10">
          <ThemedText fontWeight={700} fontSize={28}>
            Import from Secret Recovery Phrase
          </ThemedText>

          <Spacer size={24} />

          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-2">
            <View className="flex">
              <ThemedText fontSize={12} fontWeight={800}>
                Secret Recovery Phrase
              </ThemedText>
              <View className="flex flex-row justify-between items-center">
                <ThemedTextInput
                  fontSize={14}
                  className="flex-1 outline-none"
                  placeholder="Enter your recovery phrase"
                  value={srp}
                  onChangeText={setSrp}
                  secureTextEntry={!showSrp}
                  autoFocus
                />
                <Pressable onPress={() => setShowSrp(!showSrp)}>
                  <Image
                    className="max-w-4 max-h-4 -mt-1 ml-2"
                    source={
                      showSrp
                        ? require("@/assets/images/eye.png")
                        : require("@/assets/images/eye-slash.png")
                    }
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {availableAuthMethods.length > 0 ? (
            <>
              <Spacer size={12} />
              <ThemedText fontWeight={600}>
                Available authentication method(s) for your device:
              </ThemedText>
              {availableAuthMethods.map((method, index) => {
                const methodName = AvailableAuthMethods[
                  method
                ] as AuthMethodName;
                return (
                  <View
                    key={index}
                    className="flex flex-row items-center justify-between"
                  >
                    <ThemedText fontSize={14}>
                      Unlock with {AvailableAuthMethods[method]}?
                    </ThemedText>
                    <Switch
                      state={unlockWithStates[methodName]}
                      callback={() =>
                        setUnlockWithStates({
                          ...unlockWithStates,
                          [methodName]: !unlockWithStates[methodName],
                        })
                      }
                    />
                  </View>
                );
              })}
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
        <Link href="/confirmsrp" asChild>
          <Pressable
            className="bg-black w-full py-3 rounded-xl"
            disabled={availableAuthMethods.length === 0}
          >
            <ThemedText fontWeight={700} className="text-white text-center">
              Import
            </ThemedText>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
