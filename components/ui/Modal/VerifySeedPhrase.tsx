import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { useAlert } from "@/contexts/AlertProvider";
import { useAppState } from "@/contexts/AppStateProvider";
import { APP_STATES } from "@/lib/types";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

interface VerifySeedPhraseProps {
  onClose: () => void;
}

export const VerifySeedPhrase: React.FC<VerifySeedPhraseProps> = ({
  onClose,
}) => {
  const { state, setState } = useAppState();
  const { showAlert } = useAlert();

  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [placedWords, setPlacedWords] = useState<(string | null)[]>(
    Array(12).fill(null)
  );
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleWordSelect = (word: string) => {
    if (placedWords.includes(word)) return;

    if (selectedWord === word) {
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

  const isPhraseCorrect = useCallback(() => {
    return placedWords.every((word, index) => {
      if (!state.mnemonic) {
        return false;
      }

      return word === state.mnemonic[index];
    });
  }, [placedWords, state.mnemonic]);

  useEffect(() => {
    const mnemonic: string[] = state.mnemonic || [];
    setAvailableWords([...mnemonic].sort(() => Math.random() - 0.5));
  }, [state.mnemonic]);

  useEffect(() => {
    if (isPhraseCorrect()) {
      showAlert("Success", "You have verified your own Seed Phrase.", [
        {
          text: "OK",
          onPress: () => {
            setState({
              ...state,
              currentState: APP_STATES.LOGGED_IN,
              lastMnemonicVerification: new Date().toISOString(),
            });
            onClose();
          },
        },
      ]);
    }
  }, [placedWords, isPhraseCorrect, onClose, setState, showAlert, state]);

  return (
    <View className="absolute bg-white w-full z-20 bottom-0 rounded-t-lg h-3/4">
      <View className="rounded-t-lg bg-[#EBEBEB] flex flex-row justify-between py-3 px-6">
        <View className="flex-1">
          <Pressable
            onPress={onClose}
            disabled={
              state.currentState ===
              APP_STATES.LOGGED_IN_NEED_SEED_PHRASE_VERIFICATION
            }
          >
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Close
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1 items-center">
          <ThemedText
            fontSize={14}
            fontWeight={700}
            className="absolute w-full text-center"
          >
            Verify Seed Phrase
          </ThemedText>
        </View>
        <View className="flex-1" />
      </View>

      <ScrollView>
        <View className="mx-6 gap-3">
          <Spacer size={20} />
          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg">
            <ThemedText fontWeight={700} className="text-center">
              Seed Phrase
            </ThemedText>
            <ThemedText fontSize={14} className="text-center">
              {selectedWord
                ? "Tap a numbered slot to place the word, or tap the word again to cancel."
                : "frds from below and place them in the correct order. Tap a filled slot to remove its word."}
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
          <Spacer size={20} />
        </View>
      </ScrollView>
    </View>
  );
};
