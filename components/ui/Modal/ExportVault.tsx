import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { MenuOption } from "../MenuOption";

interface ExportVaultProps {
  callback: () => void;
}

export const ExportVault: React.FC<ExportVaultProps> = ({ callback }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fileFormat, setFileFormat] = useState(".json");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  return (
    <View className="absolute bg-white w-full z-20 bottom-0 rounded-t-lg h-3/4">
      <View className="rounded-t-lg bg-[#EBEBEB] flex flex-row justify-between py-3 px-6">
        <View className="flex-1">
          <Pressable onPress={callback}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Cancel
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1">
          <ThemedText
            fontSize={14}
            fontWeight={700}
            className="absolute w-full text-center"
          >
            Export vault
          </ThemedText>
        </View>
        <View className="flex-1">
          <Pressable onPress={callback}>
            <ThemedText fontSize={14} className="text-[#0099FF] text-end">
              Export
            </ThemedText>
          </Pressable>
        </View>
      </View>
      <View className="mx-6 my-5 gap-2">
        <View className="bg-[#EBEBEB] px-4 py-3 rounded-lg">
          <ThemedText fontSize={12} fontWeight={800}>
            File format
          </ThemedText>
          <DropdownMenu
            visible={dropdownVisible}
            handleOpen={() => setDropdownVisible(true)}
            handleClose={() => setDropdownVisible(false)}
            trigger={
              <View className="flex flex-row justify-between items-center">
                <ThemedText fontSize={14}>{fileFormat}</ThemedText>
                <Image
                  className="max-w-4 max-h-4 -mt-1"
                  source={require("@/assets/images/arrow-down.png")}
                />
              </View>
            }
          >
            <MenuOption
              onSelect={() => {
                setDropdownVisible(false);
                setFileFormat(".json");
              }}
            >
              <ThemedText fontSize={14} className="text-white">
                .json
              </ThemedText>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                setDropdownVisible(false);
                setFileFormat(".csv");
              }}
            >
              <ThemedText fontSize={14} className="text-white">
                .csv
              </ThemedText>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                setDropdownVisible(false);
                setFileFormat(".json (Password protected)");
              }}
            >
              <ThemedText fontSize={14} className="text-white">
                .json (Password protected)
              </ThemedText>
            </MenuOption>
          </DropdownMenu>
        </View>
        {fileFormat == ".json (Password protected)" && (
          <>
            <View className="row bg-[#EBEBEB] px-4 py-3 rounded-lg">
              <ThemedText fontSize={12} fontWeight={800}>
                File password
              </ThemedText>
              <View className="flex flex-row justify-between gap-4 items-center">
                <ThemedText fontSize={14}>*</ThemedText>
                <Image
                  className="max-w-4 max-h-4"
                  source={require("@/assets/images/eye.png")}
                />
              </View>
            </View>
            <View className="row bg-[#EBEBEB] px-4 py-3 rounded-lg">
              <ThemedText fontSize={12} fontWeight={800}>
                Confirm file password
              </ThemedText>
              <View className="flex flex-row justify-between gap-4 items-center">
                <ThemedText fontSize={14}>a</ThemedText>
                <Image
                  className="max-w-4 max-h-4"
                  source={require("@/assets/images/eye-slash.png")}
                />
              </View>
            </View>
          </>
        )}
        {isAuthenticated ? (
          <View className="flex flex-row items-center justify-center rounded-full bg-[#BBBBBB] py-2 gap-2">
            <Image
              className="max-w-6 max-h-6"
              source={require("@/assets/images/tick-circle.png")}
            />
            <ThemedText
              fontSize={14}
              fontWeight={700}
              className="text-white text-center"
            >
              Authenticated
            </ThemedText>
          </View>
        ) : (
          <View className="rounded-full bg-black py-2">
            <ThemedText
              fontSize={14}
              fontWeight={700}
              className="text-white text-center"
            >
              Authenticate
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};
