import { Pressable, ScrollView, View } from "react-native";

import {
  AddCircleIcon,
  MinusCircleIcon,
  ProgrammingArrowsIcon,
} from "@/assets/images/icons";
import { BIP39_WORDLISTS } from "@/assets/wordlists";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import ThemedTextWithBoldNumbers from "@/components/ThemedTextWithBoldNumbers";
import { APP_CONSTANTS } from "@/constants/AppConstants";
import { useAppState } from "@/contexts/AppStateProvider";
import { useClipboard } from "@/lib/clipboard";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../Button";
import { Line } from "../Line";
import { Switch } from "../Switch";

export function GeneratorPassphrase() {
  const MIN_PASSPHRASE_WORDS = APP_CONSTANTS.MIN_PASSPHRASE_WORDS;
  const MAX_PASSPHRASE_WORDS = APP_CONSTANTS.MAX_PASSPHRASE_WORDS;

  const [passphraseGeneratorStates, setPassphraseGeneratorStates] = useState<{
    wordsNumber: number;
    wordsSeparator: string;
    capitalize: boolean;
    includeNumber: boolean;
  }>({
    wordsNumber: APP_CONSTANTS.DEFAULT_PASSPHRASE_LENGTH,
    wordsSeparator: "-",
    capitalize: false,
    includeNumber: false,
  });
  const [passphrase, setPassphrase] = useState<string>("");

  const { copyToClipboard } = useClipboard();
  const { state, setState } = useAppState();

  // Function to generate the passphrase
  const generatePassphrase = useCallback(() => {
    const words: string[] = [];

    for (let i = 0; i < passphraseGeneratorStates.wordsNumber; i++) {
      const randomIndex = Math.floor(Math.random() * BIP39_WORDLISTS.length);
      let word = BIP39_WORDLISTS[randomIndex];

      if (word && passphraseGeneratorStates.capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }

      if (word) {
        words.push(word);
      }
    }

    let generatedPassphrase = words.join(
      passphraseGeneratorStates.wordsSeparator
    );

    if (passphraseGeneratorStates.includeNumber) {
      const randomNumber = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      generatedPassphrase += randomNumber;
    }

    setPassphrase(generatedPassphrase);
  }, [passphraseGeneratorStates]);

  const handleCopyPassphrase = useCallback(() => {
    copyToClipboard(passphrase);
    setState({
      ...state,
      generatorData: [
        ...state.generatorData,
        {
          text: passphrase,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }, [passphrase, copyToClipboard, setState, state]);

  // Effect to generate passphrase whenever relevant states change
  useEffect(() => {
    generatePassphrase();
  }, [generatePassphrase]);

  return (
    <ScrollView className="flex-1 px-6 py-5">
      <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg">
        <View className="flex flex-row items-start gap-4">
          <View className="flex-1">
            <ThemedTextWithBoldNumbers text={passphrase} />
          </View>
          <Pressable onPress={generatePassphrase}>
            <ProgrammingArrowsIcon width={20} height={20} />
          </Pressable>
        </View>
      </View>

      <Spacer size={8} />

      <Button
        text="Copy"
        type="primary-rounded"
        onPress={handleCopyPassphrase}
      />

      <Spacer size={16} />

      <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg gap-3">
        <View className="flex flex-row items-center gap-4 justify-between">
          <ThemedText fontSize={14}>Words</ThemedText>
          <View className="flex flex-row items-center gap-2">
            <Pressable
              disabled={passphraseGeneratorStates.wordsNumber <= MIN_PASSPHRASE_WORDS}
              onPress={() =>
                setPassphraseGeneratorStates((prev) => ({
                  ...prev,
                  wordsNumber: Math.max(MIN_PASSPHRASE_WORDS, prev.wordsNumber - 1),
                }))
              }
            >
              <MinusCircleIcon
                width={24}
                height={24}
                color={
                  passphraseGeneratorStates.wordsNumber <= MIN_PASSPHRASE_WORDS
                    ? "#BBBBBB"
                    : "#000000"
                }
              />
            </Pressable>
            <ThemedText fontSize={14} className="w-6 text-center">
              {passphraseGeneratorStates.wordsNumber}
            </ThemedText>
            <Pressable
              disabled={passphraseGeneratorStates.wordsNumber >= MAX_PASSPHRASE_WORDS}
              onPress={() =>
                setPassphraseGeneratorStates((prev) => ({
                  ...prev,
                  wordsNumber: Math.min(MAX_PASSPHRASE_WORDS, prev.wordsNumber + 1),
                }))
              }
            >
              <AddCircleIcon
                width={24}
                height={24}
                color={
                  passphraseGeneratorStates.wordsNumber >= MAX_PASSPHRASE_WORDS
                    ? "#BBBBBB"
                    : "#000000"
                }
              />
            </Pressable>
          </View>
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Separator</ThemedText>
          <ThemedTextInput
            value={passphraseGeneratorStates.wordsSeparator}
            onChangeText={(text) =>
              setPassphraseGeneratorStates((prev) => ({
                ...prev,
                wordsSeparator: text || "-",
              }))
            }
            className="w-16 outline-none text-black text-right"
            fontSize={14}
            placeholder="-"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Capitalize</ThemedText>
          <Switch
            state={passphraseGeneratorStates.capitalize}
            callback={() =>
              setPassphraseGeneratorStates((prev) => ({
                ...prev,
                capitalize: !prev.capitalize,
              }))
            }
          />
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Include number</ThemedText>
          <Switch
            state={passphraseGeneratorStates.includeNumber}
            callback={() =>
              setPassphraseGeneratorStates((prev) => ({
                ...prev,
                includeNumber: !prev.includeNumber,
              }))
            }
          />
        </View>
      </View>

      <Spacer size={16} />

      <Spacer size={32} />
    </ScrollView>
  );
}
