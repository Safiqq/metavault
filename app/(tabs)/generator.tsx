import { Image, Platform, Pressable, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import React, { useState } from "react";
import { GeneratorPassword } from "@/components/ui/Generator/Password";
import { GeneratorPassphrase } from "@/components/ui/Generator/Passphrase";
import { GeneratorUsername } from "@/components/ui/Generator/Username";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { MenuOption } from "@/components/ui/MenuOption";
import { PasswordHistory } from "@/components/ui/Modal/PasswordHistory";

export default function GeneratorScreen() {
  const [generatorState, setGeneratorState] = useState("password");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <SafeAreaView
      className={`flex-1 w-full px-12 ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      {settingsVisible && (
        <>
          <PasswordHistory callback={() => setSettingsVisible(false)} />
          <View className="bg-black/50 absolute w-full h-full z-10" />
        </>
      )}
      <View className="p-6 pb-5 border-b border-[#EBEBEB]">
        <View className="flex flex-row justify-between">
          <View className="w-8 h-8 bg-black rounded-full" />
          <DropdownMenu
            visible={dropdownVisible}
            handleOpen={() => setDropdownVisible(true)}
            handleClose={() => setDropdownVisible(false)}
            trigger={
              <Image
                className="max-w-6 max-h-6"
                source={require("@/assets/images/more.png")}
              />
            }
            pos="right"
          >
            <MenuOption
              onSelect={() => {
                setDropdownVisible(false);
                setSettingsVisible(true);
              }}
            >
              <ThemedText fontSize={14} className="text-white">
                Password history
              </ThemedText>
            </MenuOption>
          </DropdownMenu>
        </View>

        <Spacer size={16} />

        <ThemedText fontSize={20} fontWeight={700}>
          Generator
        </ThemedText>

        <Spacer size={16} />

        <View className="bg-[#EBEBEB] rounded-full flex flex-row items-center justify-between">
          <Pressable
            className={`rounded-full py-2 px-5 ${
              generatorState == "password" ? "bg-[#DBDBDB]" : ""
            }`}
            onPress={() => setGeneratorState("password")}
          >
            <ThemedText fontSize={14}>Password</ThemedText>
          </Pressable>
          <Pressable
            className={`rounded-full py-2 px-5 ${
              generatorState == "passphrase" ? "bg-[#DBDBDB]" : ""
            }`}
            onPress={() => setGeneratorState("passphrase")}
          >
            <ThemedText fontSize={14}>Passphrase</ThemedText>
          </Pressable>
          <Pressable
            className={`rounded-full py-2 px-5 ${
              generatorState == "username" ? "bg-[#DBDBDB]" : ""
            }`}
            onPress={() => setGeneratorState("username")}
          >
            <ThemedText fontSize={14}>Username</ThemedText>
          </Pressable>
        </View>
      </View>
      {generatorState == "password" && <GeneratorPassword />}
      {generatorState == "passphrase" && <GeneratorPassphrase />}
      {generatorState == "username" && <GeneratorUsername />}
    </SafeAreaView>
  );
}
