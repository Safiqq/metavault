import { ProgressSteps } from "@/components/ProgressSteps";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/AppConstants";
import { useAlert } from "@/contexts/AlertProvider";
import { useAppState } from "@/contexts/AppStateProvider";
import { useAuth } from "@/contexts/AuthProvider";
import { createHashedSecret, mnemonicToSeed } from "@/lib/bip39";
import { supabase } from "@/lib/supabase";
import { APP_STATES } from "@/lib/types";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// VerifySecretRecoveryPhraseScreen: User must re-enter their Seed Phrase to verify backup.
export default function VerifySecretRecoveryPhraseScreen() {
  const insets = useSafeAreaInsets();

  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [placedWords, setPlacedWords] = useState<(string | null)[]>(
    Array(12).fill(null)
  );
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const { showAlert } = useAlert();
  const { state, setState } = useAppState();
  const { user } = useAuth();

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

  // Checks if the placed words match the original mnemonic
  const isPhraseCorrect = () => {
    return placedWords.every((word, index) => {
      if (!state.mnemonic) {
        return false;
      }

      return word === state.mnemonic[index];
    });
  };

  // Handles the continue action after successful Seed Phrase verification
  const handleContinue = async () => {
    if (!state.mnemonic) {
      return;
    }

    const seed = await mnemonicToSeed(state.mnemonic);
    const hashedSecret = await createHashedSecret(seed);

    let { error } = await supabase
      .from("secrets")
      .insert({ user_id: user?.id, hashed_secret: hashedSecret });

    if (error) {
      showAlert("Error", error.message);
    } else {
      let { error } = await supabase
        .from("folders")
        .insert({ user_id: user?.id, name: "No folder" });

      if (error) {
        showAlert("Error", error.message);
      } else {
        setState({
          ...state,
          currentState: APP_STATES.CREATE_ACCOUNT_SEED_PHRASE_VERIFIED,
          mnemonicVerified: true,
          lastMnemonicVerification: new Date().toISOString(),
        });
        router.push(ROUTES.GUEST.CREATE_ACCOUNT.CONGRATS);
      }
    }
  };

  // On mount, randomize available words and set up slots
  useEffect(() => {
    const mnemonic: string[] = state.mnemonic || [];
    setAvailableWords([...mnemonic].sort(() => Math.random() - 0.5));
  }, [state.mnemonic]);

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`flex-1 w-full ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ScrollView className="flex-1 px-12">
        <ProgressSteps currentStep={3} />
        <View className="my-10">
          <ThemedText fontWeight={700} fontSize={24} className="text-center">
            Verify your Seed Phrase
          </ThemedText>

          <Spacer size={16} />

          <ThemedText className="text-center">
            Enter your Seed Phrase
          </ThemedText>

          <Spacer size={16} />

          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg -mx-6">
            <ThemedText fontSize={14}>
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
      <View className="px-12 pb-8">
        <Button
          text="Continue"
          onPress={handleContinue}
          disabled={!isPhraseCorrect()}
        />
      </View>
    </View>
  );
}
