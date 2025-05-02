import { Image, Platform, Pressable, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import React, { useState } from "react";
import { Line } from "@/components/ui/Line";

export default function AccountSecurityScreen() {
  return (
    <SafeAreaView
      className={`flex-1 w-full ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      <View className="p-6 pb-5 border-b border-[#EBEBEB]">
        <View className="flex flex-row justify-between">
          <View className="w-8 h-8 bg-black rounded-full" />
        </View>

        <Spacer size={16} />

        <ThemedText fontSize={20} fontWeight={700}>
          Settings
        </ThemedText>
      </View>
      <View className="mx-6 my-5 px-4 py-3 bg-[#EBEBEB] rounded-lg gap-2">
        <View className="flex flex-row items-center gap-3">
          <Image
            className="max-w-5 max-h-5"
            source={require("@/assets/images/profile-circle.png")}
          />
          <ThemedText fontSize={14}>My account</ThemedText>
        </View>

        <Line />

        <View className="flex flex-row items-center gap-3">
          <Image
            className="max-w-5 max-h-5"
            source={require("@/assets/images/shield-tick.png")}
          />
          <ThemedText fontSize={14}>Account security</ThemedText>
        </View>

        <Line />

        <View className="flex flex-row items-center gap-3">
          <Image
            className="max-w-5 max-h-5"
            source={require("@/assets/images/strongbox.png")}
          />
          <ThemedText fontSize={14}>Vault</ThemedText>
        </View>

        <Line />

        <View className="flex flex-row items-center gap-3">
          <Image
            className="max-w-5 max-h-5"
            source={require("@/assets/images/element-3.png")}
          />
          <ThemedText fontSize={14}>Other</ThemedText>
        </View>

        <Line />

        <View className="flex flex-row items-center gap-3">
          <Image
            className="max-w-5 max-h-5"
            source={require("@/assets/images/info-circle.png")}
          />
          <ThemedText fontSize={14}>About</ThemedText>
        </View>
      </View>
    </SafeAreaView>
  );
}
