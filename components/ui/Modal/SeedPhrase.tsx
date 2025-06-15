import { EyeIcon, EyeSlashIcon } from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { useAppState } from "@/contexts/AppStateProvider";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Button } from "../Button";

interface SecretRecoveryPhraseProps {
  onClose: () => void;
}

export const SeedPhrase: React.FC<SecretRecoveryPhraseProps> = ({
  onClose,
}) => {
  const [visible, setVisible] = useState<boolean>(false);

  const { state } = useAppState();

  return (
    <View className="absolute bg-white w-full z-20 bottom-0 rounded-t-lg h-3/4">
      <View className="rounded-t-lg bg-[#EBEBEB] flex flex-row justify-between py-3 px-6">
        <View className="pr-4">
          <Pressable onPress={onClose}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Close
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1">
          <ThemedText
            fontSize={14}
            fontWeight={700}
            className="absolute w-full text-center"
          >
            Seed Phrase
          </ThemedText>
        </View>
        <View />
      </View>

      <ScrollView>
        <View className="mx-6 gap-3">
          <Spacer size={20} />
          <ThemedText fontSize={14} className="text-center">
            The Seed Phrase gives full access to your vault. Write it down on
            paper and keep it in a safe place.
          </ThemedText>

          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg items-center">
            {visible ? (
              <EyeIcon width={24} height={24} />
            ) : (
              <EyeSlashIcon width={24} height={24} />
            )}

            <Spacer size={16} />

            <ThemedText fontWeight={700}>
              Tap to {visible ? "hide" : "reveal"} your Seed Phrase
            </ThemedText>

            {visible ? (
              <Spacer size={16} />
            ) : (
              <>
                <Spacer size={8} />

                <ThemedText>
                  Make sure no one is watching your screen.
                </ThemedText>

                <Spacer size={24} />
              </>
            )}

            {visible && (
              <>
                <View className="flex flex-row gap-2 w-full justify-center">
                  {[0, 1].map((col) => (
                    <View key={col} className="flex-1 gap-2">
                      {state.mnemonic
                        .slice(col * 6, (col + 1) * 6)
                        .map((word, index) => (
                          <View
                            key={index}
                            className="border border-black rounded-xl py-2"
                          >
                            <ThemedText
                              fontWeight={700}
                              className="text-center"
                            >
                              {col * 6 + index + 1}. {word}
                            </ThemedText>
                          </View>
                        ))}
                    </View>
                  ))}
                </View>

                <Spacer size={24} />
              </>
            )}

            <Button
              text={visible ? "Hide" : "View"}
              type="primary"
              onPress={() => setVisible(!visible)}
            />
          </View>
          <Spacer size={20} />
        </View>
      </ScrollView>
    </View>
  );
};
