import { Platform, Pressable, ScrollView, View } from "react-native";

import { MoreIcon } from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Header } from "@/components/ui/Header";
import { Line } from "@/components/ui/Line";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ROUTES } from "@/constants/AppConstants";

export default function MyVaultNameScreen() {
  const insets = useSafeAreaInsets();

  const { name } = useLocalSearchParams<{ name: string }>();
  const [searchText, setSearchText] = useState<string>("");

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`flex-1 w-full ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <Header
        titleText={name}
        leftButtonText="My Vault"
        leftButtonBackImage={true}
        leftButtonTarget={ROUTES.USER.MY_VAULT.INDEX}
        searchText={searchText}
        onSearchTextChange={setSearchText}
      />
      <ScrollView className="flex-1 mx-6">
        <Spacer size={20} />
        <ThemedText fontSize={12} fontWeight={800}>
          ITEMS (2)
        </ThemedText>

        <Spacer size={4} />

        <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg gap-2">
          <Pressable className="flex flex-row items-center justify-between">
            <ThemedText fontSize={14}>Login</ThemedText>
            <View className="flex flex-row items-center gap-3">
              <ThemedText fontSize={14}>9</ThemedText>
              <MoreIcon width={16} height={16} className="rotate-90" />
            </View>
          </Pressable>

          <Line />

          <View className="flex flex-row items-center justify-between">
            <ThemedText fontSize={14}>SSH key</ThemedText>
            <View className="flex flex-row items-center gap-3">
              <ThemedText fontSize={14}>12</ThemedText>
              <MoreIcon width={16} height={16} className="rotate-90" />
            </View>
          </View>
        </View>
        <Spacer size={20} />
      </ScrollView>
    </View>
  );
}
