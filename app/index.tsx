import { Image, Platform, Pressable, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { Line } from "@/components/ui/Line";
import Spacer from "@/components/Spacer";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { MenuOption } from "@/components/ui/MenuOption";
import { Header } from "@/components/ui/Header";
import { Link } from "expo-router";

export default function LandingScreen() {
  return (
    <SafeAreaView
      className={`flex-1 w-full ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      <Header titleText="MetaVault" />
      <View className="mt-10 items-center">
        <Image
          className="max-w-40 max-h-40"
          source={require("@/assets/images/strongbox-fill.png")}
        />

        <Spacer size={16} />

        <ThemedText fontSize={24} fontWeight={700}>
          Vault setup
        </ThemedText>

        <Spacer size={16} />

        <ThemedText>Import an existing vault or create a new one</ThemedText>
      </View>
      <View className="mt-4 mb-8">
              <Link href="/main" asChild>
                <Pressable className="bg-black w-full py-3 rounded-xl">
                  <ThemedText fontWeight={700} className="text-white text-center">
                    Done
                  </ThemedText>
                </Pressable>
              </Link>
            </View>
    </SafeAreaView>
  );
}
