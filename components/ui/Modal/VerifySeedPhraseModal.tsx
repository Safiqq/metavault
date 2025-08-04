import React from "react";
import { Platform, ScrollView, View } from "react-native";
import { ModalHeader } from "../ModalHeader";
import { VerifySeedPhrase } from "../VerifySeedPhrase";

interface VerifySeedPhraseModalProps {
  onClose: () => void;
  onCloseDisabled?: boolean;
}

export const VerifySeedPhraseModal: React.FC<VerifySeedPhraseModalProps> = ({
  onClose,
  onCloseDisabled = false,
}) => {
  return (
    <View
      className={`flex-1 w-full rounded-t-lg bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ModalHeader
        title="Verify Seed Phrase"
        onClose={onClose}
        onCloseDisabled={onCloseDisabled}
      />

      <ScrollView>
        <View className="mx-6 py-5">
          <VerifySeedPhrase onDone={onClose} />
        </View>
      </ScrollView>
    </View>
  );
};
