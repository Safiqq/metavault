// GeneratorScreen: Allows users to generate passwords, passphrases, and usernames.
import { Platform, Pressable, View } from "react-native";

import { MoreIcon } from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { GeneratorPassphrase } from "@/components/ui/Generator/Passphrase";
import { GeneratorPassword } from "@/components/ui/Generator/Password";
import { GeneratorUsername } from "@/components/ui/Generator/Username";
import { MenuOption } from "@/components/ui/MenuOption";
import { PasswordHistoryModal } from "@/components/ui/Modal/PasswordHistoryModal";
import React, { useState } from "react";
import ReactNativeModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GeneratorScreen() {
  const insets = useSafeAreaInsets();

  const [generatorState, setGeneratorState] = useState<string>("password");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: "white",
      }}
      className={`flex-1 w-full ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ReactNativeModal
        isVisible={settingsVisible}
        onSwipeComplete={async () => {
          setSettingsVisible(false);
        }}
        swipeDirection={["down"]}
        onBackdropPress={async () => {
          setSettingsVisible(false);
        }}
        style={{ margin: 0 }}
        animationInTiming={300}
        animationOutTiming={300}
      >
        <PasswordHistoryModal callback={() => setSettingsVisible(false)} />
      </ReactNativeModal>

      <View className="p-6 pb-5 border-b border-[#EBEBEB]">
        <View className="flex flex-row justify-between">
          <View className="w-8 h-8 bg-black rounded-full" />
          <DropdownMenu
            visible={dropdownVisible}
            handleOpen={() => setDropdownVisible(true)}
            handleClose={() => setDropdownVisible(false)}
            trigger={
              <MoreIcon width={24} height={24} className="cursor-pointer" />
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
            className={`rounded-full py-3 px-5 ${
              generatorState === "password" ? "bg-[#DBDBDB]" : ""
            }`}
            onPress={() => setGeneratorState("password")}
          >
            <ThemedText fontSize={14}>Password</ThemedText>
          </Pressable>
          <Pressable
            className={`rounded-full py-3 px-5 ${
              generatorState === "passphrase" ? "bg-[#DBDBDB]" : ""
            }`}
            onPress={() => setGeneratorState("passphrase")}
          >
            <ThemedText fontSize={14}>Passphrase</ThemedText>
          </Pressable>
          <Pressable
            className={`rounded-full py-3 px-5 ${
              generatorState === "username" ? "bg-[#DBDBDB]" : ""
            }`}
            onPress={() => setGeneratorState("username")}
          >
            <ThemedText fontSize={14}>Username</ThemedText>
          </Pressable>
        </View>
      </View>
      {generatorState === "password" && <GeneratorPassword />}
      {generatorState === "passphrase" && <GeneratorPassphrase />}
      {generatorState === "username" && <GeneratorUsername />}
    </View>
  );
}
