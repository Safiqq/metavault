import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { Platform, ScrollView, View } from "react-native";
import { ModalHeader } from "../../ModalHeader";

interface SeedPhraseProps {
  callback: () => void;
}

export const SeedPhrase: React.FC<SeedPhraseProps> = ({ callback }) => {
  return (
    <View
      className={`flex-1 w-full rounded-t-lg bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ModalHeader title="Seed Phrase" onClose={callback} />

      <ScrollView>
        <View className="mx-6 my-5">
          <View>
            <ThemedText fontWeight={700} fontSize={18} className="text-black">
              The Master Key to Your Digital Assets
            </ThemedText>

            <Spacer size={8} />

            <ThemedText>
              A seed phrase, also known as a seed phrase or mnemonic phrase, is
              a list of 12 to 24 simple English words.
            </ThemedText>

            <Spacer size={8} />

            <ThemedText>
              When you create a vault, these words are generated and presented
              to you. This phrase is the single most important piece of
              information associated with your vault.
            </ThemedText>

            <Spacer size={8} />

            <ThemedText>
              It acts as the master key, a universal backup that allows you to
              restore complete access to your vault on any device, at any time.
              If your passkeys are lost, these words are your only path to
              recovery.
            </ThemedText>

            <Spacer size={8} />

            <ThemedText fontWeight={700} fontSize={18} className="text-black">
              The Underlying Technology
            </ThemedText>

            <Spacer size={8} />

            <ThemedText>
              While they look simple, these words are a human-readable
              representation of a very large and complex random number. This
              number, the &quot;seed,&quot; is fed into a cryptographic
              algorithm (the industry standard is called BIP-39).
            </ThemedText>

            <Spacer size={60} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
