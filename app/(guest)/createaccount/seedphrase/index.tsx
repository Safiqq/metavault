import { Platform, ScrollView, View } from "react-native";

import { EyeIcon, EyeSlashIcon } from "@/assets/images/icons";
import { ProgressSteps } from "@/components/ProgressSteps";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/AppConstants";
import { useAppState } from "@/contexts/AppStateProvider";
import { generateMnemonic } from "@/lib/bip39";
import { APP_STATES } from "@/lib/types";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// SecretRecoveryPhraseScreen: Generates and displays a new Seed Phrase for the user to back up.
export default function SecretRecoveryPhraseScreen() {
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState<boolean>(false);
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
      currentState: APP_STATES.CREATE_ACCOUNT_SEED_PHRASE_GENERATED,
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
        <ProgressSteps currentStep={3} />
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

          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg items-center -mx-6">
            {visible ? (
              <EyeIcon width={24} height={24} />
            ) : (
              <EyeSlashIcon width={24} height={24} />
            )}

            <Spacer size={16} />

            <ThemedText fontWeight={700}>
              Tap to {visible ? "hide" : "reveal"} your Seed Phrase
            </ThemedText>

            {visible ? (
              <Spacer size={16} />
            ) : (
              <>
                <Spacer size={8} />

                <ThemedText>
                  Make sure no one is watching your screen.
                </ThemedText>

                <Spacer size={24} />
              </>
            )}

            {visible && (
              <>
                <View className="flex flex-row gap-2 w-full justify-center">
                  {[0, 1].map((col) => (
                    <View key={col} className="flex-1 gap-2">
                      {mnemonic
                        .slice(col * 6, (col + 1) * 6)
                        .map((word, index) => (
                          <View
                            key={index}
                            className="border border-black rounded-xl py-2"
                          >
                            <ThemedText
                              fontWeight={700}
                              className="text-center"
                            >
                              {col * 6 + index + 1}. {word}
                            </ThemedText>
                          </View>
                        ))}
                    </View>
                  ))}
                </View>

                <Spacer size={24} />
              </>
            )}

            <Button
              text={visible ? "Hide" : "View"}
              type="primary-rounded"
              onPress={() => setVisible(!visible)}
              fontWeight={700}
            />
          </View>
        </View>
      </ScrollView>
      <View className="px-12 pb-8">
        <Button
          text="Continue"
          type="primary"
          onPress={handleContinue}
          fontWeight={700}
          disabled={!visible}
        />
      </View>
    </View>
  );
}
