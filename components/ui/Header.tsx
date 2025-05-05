import { View, Pressable } from "react-native";
import { ThemedText } from "../ThemedText";
import { Image } from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import Spacer from "../Spacer";
import { ThemedTextInput } from "../ThemedTextInput";

interface HeaderProps {
  leftButtonText?: string;
  leftButtonBackImage?: boolean;
  titleText: string;
  rightButtonText?: string;
  rightButtonCallback?: () => void;
  searchText?: string;
  onSearchTextChange?: (text: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  leftButtonText,
  leftButtonBackImage,
  titleText,
  rightButtonText,
  rightButtonCallback,
  searchText = "",
  onSearchTextChange,
}) => {
  const router = useRouter();

  return (
    <View className="p-6 border-b border-[#EBEBEB]">
      <View className="flex flex-row justify-between items-center">
        {(leftButtonText || rightButtonText) && (
          <View className="flex-1">
            <Pressable
              className="flex flex-row items-center"
              onPress={() => {
                if (leftButtonBackImage) {
                  router.back();
                }
              }}
            >
              {leftButtonBackImage && (
                <Image
                  className="max-w-6 max-h-6"
                  source={require("@/assets/images/arrow-left.png")}
                />
              )}
              <ThemedText
                fontSize={10}
                fontWeight={600}
                className="text-[#0099FF] -ml-1"
              >
                {leftButtonText}
              </ThemedText>
            </Pressable>
          </View>
        )}
        <View className="flex-1">
          <ThemedText fontSize={20} fontWeight={700} className="text-center">
            {titleText}
          </ThemedText>
        </View>
        {(leftButtonText || rightButtonText) && (
          <View className="flex-1">
            <Pressable
              className="flex flex-row items-center"
              onPress={rightButtonCallback}
            >
              <ThemedText
                fontSize={10}
                fontWeight={600}
                className="text-[#0099FF]"
              >
                {rightButtonText}
              </ThemedText>
            </Pressable>
          </View>
        )}
      </View>

      {onSearchTextChange && (
        <>
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
              onChangeText={onSearchTextChange}
              autoFocus
            />
          </View>
        </>
      )}
    </View>
  );
};
