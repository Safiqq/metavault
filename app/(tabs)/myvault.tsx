import { Image, Platform, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { Line } from "@/components/ui/Line";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function MyVaultScreen() {
  const [searchText, setSearchText] = useState<string>("");
  const router = useRouter();

  return (
    <SafeAreaView
      className={`flex-1 w-full ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      <View className="p-6 pb-5 border-b border-[#EBEBEB]">
        <View className="flex flex-row justify-between">
          <View className="w-8 h-8 bg-black rounded-full" />
          <Image
            className="max-w-6 max-h-6"
            source={require("@/assets/images/more.png")}
          />
        </View>

        <Spacer size={16} />

        <ThemedText fontSize={20} fontWeight={700}>
          My Vault
        </ThemedText>

        <Spacer size={16} />

        <View className="bg-[#EBEBEB] rounded-xl flex flex-row items-center gap-3 py-2 px-3">
          <Image
            className="max-w-4 max-h-4"
            source={require("@/assets/images/search-normal.png")}
          />
          <ThemedTextInput
            fontSize={14}
            className="flex-1 outline-none"
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        </View>
      </View>
      <ScrollView className="flex-1 mx-6 my-5">
        <ThemedText fontSize={12} fontWeight={800}>
          TYPES (2)
        </ThemedText>
        
        <Spacer size={4} />

        <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-2">
          <Pressable
            className="flex flex-row items-center justify-between"
            onPress={() => router.push(`/myvault/Login`)}
          >
            <View className="flex flex-row items-center gap-3">
              <Image
                className="max-w-4 max-h-4"
                source={require("@/assets/images/global.png")}
              />
              <ThemedText fontSize={14}>Login</ThemedText>
            </View>
            <ThemedText fontSize={14}>9</ThemedText>
          </Pressable>

          <Line />

          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-3">
              <Image
                className="max-w-4 max-h-4"
                source={require("@/assets/images/key.png")}
              />
              <ThemedText fontSize={14}>SSH key</ThemedText>
            </View>
            <ThemedText fontSize={14}>12</ThemedText>
          </View>
        </View>

        <Spacer size={16} />

        <ThemedText fontSize={12} fontWeight={800}>
          FOLDERS (4)
        </ThemedText>
        <Spacer size={4} />
        <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-2">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-3">
              <Image
                className="max-w-4 max-h-4"
                source={require("@/assets/images/folder.png")}
              />
              <ThemedText fontSize={14}>Academic</ThemedText>
            </View>
            <ThemedText fontSize={14}>9</ThemedText>
          </View>

          <Line />

          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-3">
              <Image
                className="max-w-4 max-h-4"
                source={require("@/assets/images/folder.png")}
              />
              <ThemedText fontSize={14}>Games</ThemedText>
            </View>
            <ThemedText fontSize={14}>12</ThemedText>
          </View>

          <Line />

          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-3">
              <Image
                className="max-w-4 max-h-4"
                source={require("@/assets/images/folder.png")}
              />
              <ThemedText fontSize={14}>Social media</ThemedText>
            </View>
            <ThemedText fontSize={14}>4</ThemedText>
          </View>

          <Line />

          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-3">
              <Image
                className="max-w-4 max-h-4"
                source={require("@/assets/images/folder.png")}
              />
              <ThemedText fontSize={14}>No folder</ThemedText>
            </View>
            <ThemedText fontSize={14}>123</ThemedText>
          </View>
        </View>

        <Spacer size={16} />

        <ThemedText fontSize={12} fontWeight={800}>
          TRASH (1)
        </ThemedText>
        <Spacer size={4} />
        <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-3">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-3">
              <Image
                className="max-w-4 max-h-4"
                source={require("@/assets/images/trash.png")}
              />
              <ThemedText fontSize={14}>Trash</ThemedText>
            </View>
            <ThemedText fontSize={14}>0</ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
