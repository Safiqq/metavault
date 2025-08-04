import { Platform, Pressable, ScrollView, View } from "react-native";

import { SecuritySafeIcon } from "@/assets/images/icons";
import { ProgressStepsHeader } from "@/components/ui/ProgressStepsHeader";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { SeedPhrase } from "@/components/ui/Modal/Information/SeedPhrase";
import { ROUTES } from "@/constants/AppConstants";
import { router } from "expo-router";
import { useState } from "react";
import ReactNativeModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SecureVaultScreen() {
  const insets = useSafeAreaInsets();

  const [seedPhraseVisible, setSeedPhraseVisible] = useState<boolean>(false);
  const [isFirstPage, setIsFirstPage] = useState<boolean>(true);

  const handleStart = () => {
    if (isFirstPage) {
      setIsFirstPage(false);
    } else {
      router.push(ROUTES.GUEST.CREATE_ACCOUNT.SEED_PHRASE.INDEX)
    }
  };

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`flex-1 w-full ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ReactNativeModal
        isVisible={seedPhraseVisible}
        onSwipeComplete={async () => {
          setSeedPhraseVisible(false);
        }}
        swipeDirection={["down"]}
        onBackdropPress={async () => {
          setSeedPhraseVisible(false);
        }}
        style={{ margin: 0 }}
        animationInTiming={300}
        animationOutTiming={300}
      >
        <SeedPhrase callback={() => setSeedPhraseVisible(false)} />
      </ReactNativeModal>

      <ScrollView className="flex-1 px-12">
        <ProgressStepsHeader currentStep={3} />
        {isFirstPage ? (
          <View className="my-10">
            <ThemedText fontWeight={700} fontSize={24} className="text-center">
              Secure your vault
            </ThemedText>

            <Spacer size={16} />

            <SecuritySafeIcon width={160} height={160} className="mx-auto" />

            <Spacer size={16} />

            <ThemedText>
              <ThemedText>
                Don&apos;t risk losing your credentials. Protect your vault by
                saving your{" "}
              </ThemedText>
              <Pressable onPress={() => setSeedPhraseVisible(true)}>
                <ThemedText fontWeight={600} className="text-black underline">
                  Seed Phrase
                </ThemedText>
              </Pressable>
              <ThemedText> in a place you trust. </ThemedText>
              <ThemedText fontWeight={700}>
                It&apos;s the only way to recover your wallet if you get locked
                out of the app or get a new device.
              </ThemedText>
            </ThemedText>
          </View>
        ) : (
          <View className="my-10">
            <SecuritySafeIcon width={40} height={40} className="mx-auto" />

            <Spacer size={16} />

            <ThemedText fontWeight={700} fontSize={24} className="text-center">
              Secure your vault
            </ThemedText>

            <Spacer size={16} />

            <ThemedText className="text-center">
              <ThemedText>Secure your vault&apos;s </ThemedText>
              <Pressable onPress={() => setSeedPhraseVisible(true)}>
                <ThemedText fontWeight={600} className="text-black underline">
                  Seed Phrase.
                </ThemedText>
              </Pressable>
            </ThemedText>

            <Spacer size={16} />

            <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg -mx-6">
              <ThemedText fontWeight={700}>Manual</ThemedText>

              <Spacer size={8} />

              <ThemedText>
                Write down your Seed Phrase on a piece of paper and
                store in a safe place.
              </ThemedText>

              <Spacer size={12} />

              <ThemedText>Security level: Very strong</ThemedText>

              <Spacer size={4} />

              <View className="flex flex-row gap-0.5">
                <View className="bg-[#0099FF] w-9 h-2" />
                <View className="bg-[#0099FF] w-9 h-2" />
                <View className="bg-[#0099FF] w-9 h-2" />
              </View>

              <Spacer size={12} />

              <ThemedText>Risks are:</ThemedText>
              <ThemedText> - You lose it</ThemedText>
              <ThemedText> - You forget where you put it</ThemedText>
              <ThemedText> - Someone else finds it</ThemedText>

              <Spacer size={12} />

              <ThemedText>
                Other options: Doesn&apos;t have to be paper!
              </ThemedText>

              <Spacer size={12} />

              <ThemedText>Tips:</ThemedText>
              <ThemedText> - Store in bank vault</ThemedText>
              <ThemedText> - Store in a safe</ThemedText>
              <ThemedText> - Store in multiple secret places</ThemedText>
            </View>
          </View>
        )}
      </ScrollView>
      <View className="mb-8 px-12">
        <Button type="primary" text="Start" onPress={handleStart} />
      </View>
    </View>
  );
}
