import { Image, Platform, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { Line } from "@/components/ui/Line";
import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { useLocalSearchParams } from "expo-router";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { MenuOption } from "@/components/ui/MenuOption";
import * as Clipboard from "expo-clipboard";

export default function VaultScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const [searchText, setSearchText] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>("");

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
            <ThemedText fontSize={14}>stackoverflow.com</ThemedText>
            <DropdownMenu
              visible={dropdownVisible}
              handleOpen={() => setDropdownVisible(true)}
              handleClose={() => setDropdownVisible(false)}
              trigger={
                <Image
                  className="max-w-4 max-h-4 rotate-90"
                  source={require("@/assets/images/more.png")}
                />
              }
              pos="right"
            >
              <MenuOption
                onSelect={() => {
                  setDropdownVisible(false);
                  // setSettingsVisible(true);
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  View
                </ThemedText>
              </MenuOption>
              <MenuOption
                onSelect={() => {
                  setDropdownVisible(false);
                  // setSettingsVisible(true);
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  Edit
                </ThemedText>
              </MenuOption>
              <MenuOption
                onSelect={() => {
                  setDropdownVisible(false);
                  // setSettingsVisible(true);
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  Copy username
                </ThemedText>
              </MenuOption>
              <MenuOption
                onSelect={async () => {
                  await Clipboard.setStringAsync("{username}");
                  setDropdownVisible(false);
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  Copy password
                </ThemedText>
              </MenuOption>
              <MenuOption
                onSelect={async () => {
                  await Clipboard.setStringAsync("{password}");
                  setDropdownVisible(false);
                }}
              >
                <ThemedText fontSize={14} className="text-[#FF4646]">
                  Delete
                </ThemedText>
              </MenuOption>
            </DropdownMenu>
          </Pressable>

          <Line />

          <View className="flex flex-row items-center justify-between">
            <ThemedText fontSize={14}>stackoverflow.com</ThemedText>
            <Image
              className="max-w-4 max-h-4 rotate-90"
              source={require("@/assets/images/more.png")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
