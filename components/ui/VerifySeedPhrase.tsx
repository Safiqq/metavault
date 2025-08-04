import { Pressable, View } from "react-native";
import { ThemedText } from "../ThemedText";
import Spacer from "../Spacer";
import { useCallback, useEffect, useState } from "react";
import { useAppState } from "@/contexts/AppStateProvider";
import { useAlert } from "@/contexts/AlertProvider";

interface VerifySeedPhraseProps {
  onDone: () => void;
}

export const VerifySeedPhrase: React.FC<VerifySeedPhraseProps> = ({
  onDone,
}) => {
  const { state } = useAppState();
  const { showAlert } = useAlert();

  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [placedWords, setPlacedWords] = useState<(string | null)[]>(
    Array(12).fill(null)
  );

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [hasShownSuccess, setHasShownSuccess] = useState(false);

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
    if (isPhraseCorrect() && !hasShownSuccess) {
      setHasShownSuccess(true);
      showAlert("Success", "You have verified your own Seed Phrase.", [
        {
          text: "OK",
          onPress: onDone,
        },
      ]);
    }
  }, [isPhraseCorrect, onDone, showAlert, hasShownSuccess]);

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

  return (
    <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg">
      <ThemedText fontSize={14}>
        {selectedWord
          ? "Tap a numbered slot to place/replace the word, or tap the word again to cancel."
          : "Select words from below and place them in the correct order. Tap again to remove."}
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
                            ? "bg-black"
                            : used
                            ? "bg-[#D9D9D9]"
                            : "bg-white"
                        }
                      `}
              >
                <ThemedText
                  fontWeight={600}
                  fontSize={14}
                  className={`
                          ${
                            selected
                              ? "text-white"
                              : used
                              ? "text-[#808080]"
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
                <Pressable key={index} onPress={() => handleSlotClick(index)}>
                  <View
                    className={`border rounded-xl p-2 ${
                      isAllFilled && !isPhraseCorrect()
                        ? "bg-red-300"
                        : word
                        ? "bg-white border-black"
                        : "bg-blue-50 border-blue-400 border-dashed"
                    }`}
                  >
                    <ThemedText
                      fontWeight={700}
                      fontSize={14}
                      className="text-center"
                    >
                      {word ? `${index + 1}. ${word}` : `${index + 1}. ...`}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};
