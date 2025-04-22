import { Image, Pressable, ScrollView, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useState } from "react";
import { Switch } from "../Switch";
import { Line } from "../Line";

export function GeneratorPassphrase() {
  const [passphraseGeneratorStates, setPassphraseGeneratorStates] = useState({
    wordsNumber: 15,
    wordsSeparator: "-",
    capitalize: false,
    includeNumber: false,
  });

  return (
    <ScrollView className="flex-1 mx-6 my-5">
      <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg flex flex-row items-center justify-between gap-4">
        <ThemedText fontSize={14}>
          Jumble-Coil
          <ThemedText fontSize={14} fontWeight={800}>
            6
          </ThemedText>
          -Copier-Lend-Krypton-Reassure-Guileless-Unreached-Entomb-Extradite-Resample-Retying
        </ThemedText>
        <Image
          className="max-w-4 max-h-4 -mt-1"
          source={require("@/assets/images/programming-arrows.png")}
        />
      </View>

      <Spacer size={8} />

      <View className="rounded-full bg-black py-2">
        <ThemedText
          fontSize={14}
          fontWeight={700}
          className="text-white text-center"
        >
          Copy
        </ThemedText>
      </View>

      <Spacer size={16} />

      <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-2">
        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Number of words</ThemedText>
          <View className="flex flex-row items-center gap-2">
            {passphraseGeneratorStates.wordsNumber === 8 ? (
              <Image
                className="max-w-5 max-h-5"
                source={require("@/assets/images/minus-circle-disabled.png")}
              />
            ) : (
              <Pressable
                onPress={() =>
                  setPassphraseGeneratorStates({
                    ...passphraseGeneratorStates,
                    wordsNumber: passphraseGeneratorStates.wordsNumber - 1,
                  })
                }
              >
                <Image
                  className="max-w-5 max-h-5"
                  source={require("@/assets/images/minus-circle.png")}
                />
              </Pressable>
            )}
            <ThemedText fontSize={14} className="w-5 text-center">
              {passphraseGeneratorStates.wordsNumber}
            </ThemedText>
            {passphraseGeneratorStates.wordsNumber === 24 ? (
              <Image
                className="max-w-5 max-h-5"
                source={require("@/assets/images/add-circle-disabled.png")}
              />
            ) : (
              <Pressable
                onPress={() =>
                  setPassphraseGeneratorStates({
                    ...passphraseGeneratorStates,
                    wordsNumber: passphraseGeneratorStates.wordsNumber + 1,
                  })
                }
              >
                <Image
                  className="max-w-5 max-h-5"
                  source={require("@/assets/images/add-circle.png")}
                />
              </Pressable>
            )}
          </View>
        </View>

        <Line />

        <View className="flex">
          <ThemedText fontSize={12} fontWeight={800}>
            Word separator
          </ThemedText>
          <ThemedText fontSize={14}>-</ThemedText>
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Capitalize</ThemedText>
          <Switch
            state={passphraseGeneratorStates.capitalize}
            callback={() =>
              setPassphraseGeneratorStates({
                ...passphraseGeneratorStates,
                capitalize: !passphraseGeneratorStates.capitalize,
              })
            }
          />
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Include number</ThemedText>
          <Switch
            state={passphraseGeneratorStates.includeNumber}
            callback={() =>
              setPassphraseGeneratorStates({
                ...passphraseGeneratorStates,
                includeNumber: !passphraseGeneratorStates.includeNumber,
              })
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}
