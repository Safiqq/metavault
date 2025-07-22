// LandingScreen: Entry point for guests to import or create a vault.
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StrongboxIcon2 } from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { ROUTES } from "@/constants/AppConstants";

export default function LandingScreen() {
  const insets = useSafeAreaInsets();

  const handleImportVault = () => router.push(ROUTES.GUEST.RECOVER_VAULT);
  const handleCreateVault = () =>
    router.push(ROUTES.GUEST.CREATE_ACCOUNT.GET_STARTED);

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`flex-1 w-full bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <Header titleText="MetaVault" />
      <ScrollView className="flex-1 px-12">
        <View className="flex-1 justify-center items-center py-10">
          <StrongboxIcon2 width={160} height={160} />
          <Spacer size={24} />
          <ThemedText 
            fontSize={28} 
            fontWeight={700} 
            className="text-center text-black"
          >
            Vault setup
          </ThemedText>
          <Spacer size={16} />
          <ThemedText 
            fontSize={16} 
            className="text-center text-gray-600 px-4"
          >
            Import an existing vault or create a new one
          </ThemedText>
        </View>
      </ScrollView>
      <View className="px-12 pb-8 gap-3">
        <Button
          text="Recover your vault"
          type="primary"
          onPress={handleImportVault}
          fontWeight={700}
        />
        <Button
          text="Create a new vault"
          type="secondary"
          onPress={handleCreateVault}
        />
      </View>
    </View>
  );
}
