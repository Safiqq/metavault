import { ThemedText } from "@/components/ThemedText";
import { useAlert } from "@/contexts/AlertProvider";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { Button } from "../Button";
import { ModalHeader } from "../ModalHeader";

interface SecurityQuizModalProps {
  onClose: () => void;
  onContinue: () => void;
}

export const SecurityQuizModal: React.FC<SecurityQuizModalProps> = ({
  onClose,
  onContinue,
}) => {
  const [selectedAnswer1, setSelectedAnswer1] = useState<string | null>(null);
  const [selectedAnswer2, setSelectedAnswer2] = useState<string | null>(null);

  const { showAlert } = useAlert();

  const handleAnswer1Select = (answer: string) => {
    setSelectedAnswer1(answer);
    if (answer === "B") {
      showAlert(
        "Correct",
        "No one can help get your Seed Phrase back, so write it down, engrave it on metal, or keep it in multiple secret spots so you never lose it. If you lose it, it's gone forever."
      );
    }
  };

  const handleAnswer2Select = (answer: string) => {
    setSelectedAnswer2(answer);
    if (answer === "B") {
      showAlert(
        "Correct",
        "Sharing your Seed Phrase is never a good idea. Anyone claiming to need your Seed Phrase is lying to you. If you share it with them, they will steal your vaults."
      );
    }
  };

  const isAnswersTrue = () => {
    return selectedAnswer1 === "B" && selectedAnswer2 === "B";
  };

  return (
    <View
      className={`flex-1 w-full rounded-t-lg bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ModalHeader title="Security quiz" onClose={onClose} />

      <ScrollView>
        <View className="mx-6 my-5 gap-4">
          <View>
            <ThemedText fontSize={14} className="text-center">
              To reveal your Seed Phrase, you need to correctly answer two
              questions.
            </ThemedText>
          </View>

          <View className="gap-4">
            <View className="bg-[#EBEBEB] rounded-lg px-4 py-4">
              <View className="gap-2">
                <ThemedText fontSize={14} fontWeight={800}>
                  If you lose your Seed Phrase, MetaVault...
                </ThemedText>
                <View className="gap-1">
                  <Pressable
                    onPress={() => handleAnswer1Select("A")}
                    className={`py-4 px-3 border rounded-lg ${
                      selectedAnswer1 === "A" &&
                      "bg-red-100 border border-red-500"
                    }`}
                    disabled={selectedAnswer1 === "B"}
                  >
                    <ThemedText fontSize={14} className={""}>
                      A. can get it back for you
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => handleAnswer1Select("B")}
                    className={`py-4 px-3 border rounded-lg ${
                      selectedAnswer1 === "B" &&
                      "bg-blue-100 border border-blue-500"
                    }`}
                    disabled={selectedAnswer1 === "B"}
                  >
                    <ThemedText fontSize={14}>
                      B. can&apos;t help you
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>

            {selectedAnswer1 === "B" && (
              <View className="bg-[#EBEBEB] rounded-lg px-4 py-4">
                <View className="gap-2">
                  <ThemedText fontSize={14} fontWeight={800}>
                    If anyone asks for your Seed Phrase, ...
                  </ThemedText>
                  <View className="gap-1">
                    <Pressable
                      onPress={() => handleAnswer2Select("A")}
                      className={`py-4 px-3 border rounded-lg ${
                        selectedAnswer2 === "A" &&
                        "bg-red-100 border border-red-500"
                      }`}
                      disabled={selectedAnswer2 === "B"}
                    >
                      <ThemedText fontSize={14}>
                        A. you should give it to them
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={() => handleAnswer2Select("B")}
                      className={`py-4 px-3 border rounded-lg ${
                        selectedAnswer2 === "B" &&
                        "bg-blue-100 border border-blue-500"
                      }`}
                      disabled={selectedAnswer2 === "B"}
                    >
                      <ThemedText fontSize={14}>
                        B. you&apos;re being scammed
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </View>

          <Button
            text="Continue"
            onPress={() => {
              onClose();
              onContinue();
            }}
            disabled={!isAnswersTrue()}
          />
        </View>
      </ScrollView>
    </View>
  );
};
