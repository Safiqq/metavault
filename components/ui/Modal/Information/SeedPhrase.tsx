import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

interface SeedPhraseProps {
  callback: () => void;
}

export const SeedPhrase: React.FC<SeedPhraseProps> = ({ callback }) => {
  return (
    <View className="absolute bg-white w-full z-20 bottom-0 rounded-t-lg h-3/4">
      <View className="rounded-t-lg bg-[#EBEBEB] flex flex-row justify-between py-3 px-6 items-center">
        <View className="flex-1">
          <Pressable onPress={callback}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Close
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1 items-center">
          <ThemedText fontSize={14} fontWeight={700}>
           Seed Phrase
          </ThemedText>
        </View>
        <View className="flex-1" />
      </View>

      <ScrollView contentContainerClassName="p-6">
        <ThemedText fontWeight={700} fontSize={18} className="text-black">
          Privacy Policy
        </ThemedText>
        <Spacer size={8} />
        <ThemedText fontSize={12} className="text-gray-600">
          Last updated: July 28, 2025
        </ThemedText>
        <Spacer size={24} />
      </ScrollView>
    </View>
  );
};
