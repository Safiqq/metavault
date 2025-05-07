import { Image, Platform, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { Line } from "@/components/ui/Line";
import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { useLocalSearchParams } from "expo-router";

export default function VaultScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const [searchText, setSearchText] = useState<string>("");

  return (
    <SafeAreaView
      className={`flex-1 w-full ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      <Header
        titleText={category}
        leftButtonText="My Vault"
        leftButtonBackImage={true}
        searchText={searchText}
        onSearchTextChange={setSearchText}
      />
      <ScrollView className="flex-1 mx-6 my-5">
        <ThemedText fontSize={12} fontWeight={800}>
          ITEMS (2)
        </ThemedText>

        <Spacer size={4} />

        <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-2">
          <Pressable className="flex flex-row items-center justify-between">
            <ThemedText fontSize={14}>Login</ThemedText>
            <View className="flex flex-row items-center gap-3">
              <ThemedText fontSize={14}>9</ThemedText>
              <Image
                className="max-w-4 max-h-4 rotate-90"
                source={require("@/assets/images/more.png")}
              />
            </View>
          </Pressable>

          <Line />

          <View className="flex flex-row items-center justify-between">
            <ThemedText fontSize={14}>SSH key</ThemedText>
            <View className="flex flex-row items-center gap-3">
              <ThemedText fontSize={14}>12</ThemedText>
              <Image
                className="max-w-4 max-h-4 rotate-90"
                source={require("@/assets/images/more.png")}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
