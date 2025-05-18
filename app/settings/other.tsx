import { Image, Platform, Pressable, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import Spacer from "@/components/Spacer";

export default function OtherScreen() {
  const [isSync, setIsSync] = useState(true);

  return (
    <SafeAreaView
      className={`flex-1 w-full px-12 ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      <View className="p-6 border-b border-[#EBEBEB] flex flex-row items-center">
        <View className="flex-1">
          <Pressable
            className="flex flex-row items-center"
            onPress={() => {
              // return to Settings
            }}
          >
            <Image
              className="max-w-6 max-h-6"
              source={require("@/assets/images/arrow-left.png")}
            />
            <ThemedText
              fontSize={10}
              fontWeight={600}
              className="text-[#0099FF] -ml-1"
            >
              Settings
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1">
          <ThemedText fontSize={20} fontWeight={700} className="text-center">
            Other
          </ThemedText>
        </View>
        <View className="flex-1" />
      </View>
      <View className="mx-6 my-5 gap-4">
        <View className="bg-[#EBEBEB] rounded-lg px-4 py-3">
          <ThemedText fontSize={12} fontWeight={800}>
            Last sync
          </ThemedText>

          <Spacer size={4} />

          <ThemedText fontSize={14}>29/04/2025 08.35 UTC</ThemedText>
          <ThemedText fontSize={12}>(5 seconds ago)</ThemedText>

          <Spacer size={8} />

          <Pressable onPress={() => setIsSync(!isSync)}>
            {isSync ? (
              <View className="flex flex-row items-center justify-center gap-2 rounded-full bg-[#BBBBBB] py-2">
                <Image
                  className="max-w-4 max-h-4"
                  source={require("@/assets/images/refresh-2.png")}
                />
                <ThemedText
                  fontSize={14}
                  fontWeight={700}
                  className="text-white text-center"
                >
                  Currently syncing...
                </ThemedText>
              </View>
            ) : (
              <View className="rounded-full bg-black py-2">
                <ThemedText
                  fontSize={14}
                  fontWeight={700}
                  className="text-white text-center"
                >
                  Sync now
                </ThemedText>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
