import { Platform, ScrollView, View } from "react-native";

import { ProgressStepsHeader } from "@/components/ui/ProgressStepsHeader";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/AppConstants";
import { useAppState } from "@/contexts/AppStateProvider";
import { generateMnemonic } from "@/lib/bip39";
import { AUTH_NL_STATES } from "@/lib/types";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ViewSeedPhrase } from "@/components/ui/ViewSeedPhrase";

// SecretRecoveryPhraseScreen: Generates and displays a new Seed Phrase for the user to back up.
export default function SecretRecoveryPhraseScreen() {
  const insets = useSafeAreaInsets();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [mnemonic, setMnemonic] = useState<string[]>([]);

  const { state, setState } = useAppState();

  // On mount, generate a new mnemonic (Seed Phrase)
  useEffect(() => {
    async function generateSeedPhrase() {
      const mnemonic = await generateMnemonic();
      setMnemonic(mnemonic);

      setIsLoading(false);
    }

    generateSeedPhrase();
  }, []);

  // Handles continue to Seed Phrase verification
  const handleContinue = async () => {
    setState({
      ...state,
      currentState: AUTH_NL_STATES.SEED_PHRASE_GENERATED,
      mnemonic: mnemonic,
    });
    router.push(ROUTES.GUEST.CREATE_ACCOUNT.SEED_PHRASE.VERIFY);
  };

  if (isLoading) {
    return <View />;
  }

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`flex-1 w-full ${Platform.OS === "web" && "max-w-2xl mx-auto"}`}
    >
      <ScrollView className="flex-1 px-12">
        <ProgressStepsHeader currentStep={3} />
        <View className="my-10">
          <ThemedText fontWeight={700} fontSize={24} className="text-center">
            Write down your Seed Phrase
          </ThemedText>

          <Spacer size={16} />

          <ThemedText className="text-center">
            This is your Seed Phrase. Write it down on paper and keep
            it in a safe place. You&apos;ll be asked to re-enter this phrase (in
            order) on the next step.
          </ThemedText>

          <Spacer size={16} />

          <ViewSeedPhrase
            mnemonic={mnemonic}
            isVisible={isVisible}
            setIsVisible={setIsVisible}
          />
        </View>
      </ScrollView>
      <View className="px-12 pb-8">
        <Button
          text="Continue"
          type="primary"
          onPress={handleContinue}
          fontWeight={700}
          disabled={!isVisible}
        />
      </View>
    </View>
  );
}
