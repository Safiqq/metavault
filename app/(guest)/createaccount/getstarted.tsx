// GetStartedScreen: Explains passwordless account creation and starts the flow.
import { Platform, ScrollView, View } from "react-native";

import { InfoCircleIcon } from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { router } from "expo-router";
import React from "react";
import * as passkey from "react-native-passkeys";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ROUTES } from "@/constants/AppConstants";

export default function GetStartedScreen() {
  const insets = useSafeAreaInsets();
  const isPasskeySupported = passkey.isSupported();

  const handleGetStarted = () => {
    router.push(ROUTES.GUEST.CREATE_ACCOUNT.INDEX);
  };

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`flex-1 w-full ${Platform.OS === "web" && "max-w-2xl mx-auto"}`}
    >
      <Header
        titleText="MetaVault"
        leftButtonText="Back"
        leftButtonBackImage={true}
      />
      <ScrollView className="flex-1 px-12">
        <View className="my-10">
          <ThemedText fontWeight={700} fontSize={28}>
            Create an account without a Master Password
          </ThemedText>

          <Spacer size={16} />

          <View className="bg-[#EBEBEB] py-3 px-2 flex flex-row items-start gap-4">
            <InfoCircleIcon width={16} height={16} />
            <View className="flex-1 mr-4">
              <ThemedText>
                <ThemedText fontSize={14}>
                  Master passwords, which are a{" "}
                </ThemedText>
                <ThemedText fontSize={14} fontWeight={700}>
                  &apos;something you know&apos;
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
            <ThemedText fontWeight={700}>&apos;something you have&apos;</ThemedText>
            <ThemedText> or </ThemedText>
            <ThemedText fontWeight={700}>&apos;something you are&apos;</ThemedText>
            <ThemedText>) to log in.</ThemedText>
          </ThemedText>
        </View>
      </ScrollView>
      <View className="px-12 pb-8">
        <Button
          text="Get started"
          type={isPasskeySupported ? "primary" : "secondary"}
          onPress={handleGetStarted}
          disabled={!isPasskeySupported}
          fontWeight={isPasskeySupported ? 700 : 400}
        />
      </View>
    </View>
  );
}
