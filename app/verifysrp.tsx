import React, { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Link, router } from "expo-router";
import { useMnemonicSetup } from "@/contexts/MnemonicSetupContext";

export default function VerifySecretRecoveryPhraseScreen() {
  const { mnemonic, clearMnemonic } = useMnemonicSetup();

  useEffect(() => {
    console.log(mnemonic);
    return () => clearMnemonic();
  }, []);

  const [availableWords] = useState(() => {
    return [...mnemonic].sort(() => Math.random() - 0.5);
  });
  const [placedWords, setPlacedWords] = useState(Array(12).fill(null));
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleWordSelect = (word: string) => {
    if (placedWords.includes(word)) return;

    if (selectedWord == word) {
      setSelectedWord(null);
    } else {
      setSelectedWord(word);
    }
  };

  const handleSlotClick = (index: number) => {
    if (selectedWord) {
      const newPlacedWords = [...placedWords];

      const existingIndex = newPlacedWords.indexOf(selectedWord);
      if (existingIndex !== -1) {
        newPlacedWords[existingIndex] = null;
      }

      newPlacedWords[index] = selectedWord;
      setPlacedWords(newPlacedWords);
      setSelectedWord(null);
    } else if (placedWords[index]) {
      const newPlacedWords = [...placedWords];
      newPlacedWords[index] = null;
      setPlacedWords(newPlacedWords);
    }
  };

  const isWordUsed = (word: string) => placedWords.includes(word);
  const isAllFilled = placedWords.every((word) => word !== null);

  const isPhraseCorrect = () => {
    return placedWords.every((word, index) => word === mnemonic[index]);
  };

  return (
    <SafeAreaView
      className={`flex-1 w-full ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      <ScrollView className="flex-1 px-12">
        <ProgressSteps currentStep={3} />
        <View className="mt-10 mb-8">
          <ThemedText fontWeight={700} fontSize={24} className="text-center">
            Verify your Secret Recovery Phrase
          </ThemedText>

          <Spacer size={16} />

          <ThemedText className="text-center">
            Enter your Secret Recover Phrase
          </ThemedText>

          <Spacer size={16} />

          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg -mx-6">
            <ThemedText fontWeight={700} className="text-center">
              Secret Recovery Phrase
            </ThemedText>
            <ThemedText fontSize={14} className="text-center">
              {selectedWord
                ? "Tap a numbered slot to place the word, or tap the word again to cancel."
                : "Select words from below and place them in the correct order. Tap a filled slot to remove its word."}
            </ThemedText>

            <Spacer size={16} />

            <View className="flex-row flex-wrap">
              {availableWords.map((word, index) => {
                const used = isWordUsed(word);
                const selected = selectedWord === word;

                return (
                  <Pressable
                    key={`${word}-${index}`}
                    onPress={() => handleWordSelect(word)}
                    disabled={used}
                    className="m-1"
                  >
                    <View
                      className={`
                        py-2 px-4 rounded-full
                        ${
                          selected
                            ? "bg-[#0099FF]"
                            : used
                            ? "bg-[#D9D9D9]"
                            : "bg-white"
                        }
                      `}
                    >
                      <ThemedText
                        fontWeight={600}
                        className={`
                          ${
                            selected
                              ? "text-white"
                              : used
                              ? "text-black/50"
                              : ""
                          }
                        `}
                      >
                        {word}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Spacer size={16} />

            <View className="flex flex-row gap-2 w-full justify-center">
              {[0, 1].map((col) => (
                <View key={col} className="flex-1 gap-2">
                  {Array.from({ length: 6 }, (_, i) => {
                    const index = col * 6 + i;
                    const word = placedWords[index];
                    return (
                      <Pressable
                        key={index}
                        onPress={() => handleSlotClick(index)}
                      >
                        <View
                          className={`border rounded-xl p-2 ${
                            isAllFilled && !isPhraseCorrect()
                              ? "bg-red-300"
                              : word
                              ? "bg-white border-black"
                              : "bg-blue-50 border-blue-400 border-dashed"
                          }`}
                        >
                          <ThemedText fontWeight={700} className="text-center">
                            {word
                              ? `${index + 1}. ${word}`
                              : `${index + 1}. ...`}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <View className="mt-4 mb-8 px-12">
        {isPhraseCorrect() ? (
          <Link href="/confirmsrp" asChild>
            <Pressable className="bg-black w-full py-3 rounded-xl">
              <ThemedText fontWeight={700} className="text-white text-center">
                Continue
              </ThemedText>
            </Pressable>
          </Link>
        ) : (
          <Pressable className="bg-black/25 cursor-default w-full py-3 rounded-xl">
            <ThemedText fontWeight={700} className="text-white text-center">
              Continue
            </ThemedText>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
