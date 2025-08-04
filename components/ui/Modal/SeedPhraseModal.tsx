import { ThemedText } from "@/components/ThemedText";
import { useAppState } from "@/contexts/AppStateProvider";
import React, { useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { ModalHeader } from "../ModalHeader";
import { ViewSeedPhrase } from "../ViewSeedPhrase";

interface SeedPhraseModalProps {
  onClose: () => void;
}

export const SeedPhraseModal: React.FC<SeedPhraseModalProps> = ({
  onClose,
}) => {
  const [visible, setVisible] = useState<boolean>(false);

  const { state } = useAppState();

  return (
    <View
      className={`flex-1 w-full rounded-t-lg bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ModalHeader title="Seed Phrase" onClose={onClose} />

      <ScrollView>
        <View className="mx-6 my-5 gap-3">
          <ThemedText fontSize={14} className="text-center">
            The Seed Phrase gives full access to your vault. Write it down on
            paper and keep it in a safe place.
          </ThemedText>

          <View className="px-4">
            <ViewSeedPhrase
              mnemonic={state.mnemonic}
              isVisible={visible}
              setIsVisible={setVisible}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
