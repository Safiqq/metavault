import { ArrowLeftIcon, SearchNormalIcon } from "@/assets/images/icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import Spacer from "../Spacer";
import { ThemedText } from "../ThemedText";
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
              {leftButtonBackImage && <ArrowLeftIcon width={16} height={16} />}
              <ThemedText
                fontSize={12}
                fontWeight={600}
                className="text-[#0099FF]"
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
            <SearchNormalIcon width={16} height={16} />
            <ThemedTextInput
              fontSize={14}
              className="flex-1 outline-none"
              placeholder="Search"
              value={searchText}
              onChangeText={onSearchTextChange}
            />
          </View>
        </>
      )}
    </View>
  );
};
