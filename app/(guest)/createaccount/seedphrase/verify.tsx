import { ProgressStepsHeader } from "@/components/ui/ProgressStepsHeader";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ROUTES } from "@/constants/AppConstants";
import { useAlert } from "@/contexts/AlertProvider";
import { useAppState } from "@/contexts/AppStateProvider";
import { useAuth } from "@/contexts/AuthProvider";
import { insertFolder } from "@/lib/supabase/database";
import { AUTH_NL_STATES } from "@/lib/types";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VerifySeedPhrase } from "@/components/ui/VerifySeedPhrase";

// VerifySecretRecoveryPhraseScreen: User must re-enter their Seed Phrase to verify backup.
export default function VerifySecretRecoveryPhraseScreen() {
  const insets = useSafeAreaInsets();

  const { showAlert } = useAlert();
  const { state, setState } = useAppState();
  const { user } = useAuth();

  const handleContinue = async () => {
    if (!state.mnemonic || !state.email) {
      return;
    }

    try {
      await insertFolder({ user_id: user?.id || "", name: "No folder" });

      setState({
        ...state,
        currentState: AUTH_NL_STATES.SEED_PHRASE_VERIFIED,
        lastMnemonicVerification: new Date().toISOString(),
      });
      router.push(ROUTES.GUEST.CONGRATS)
    } catch (error: any) {
      showAlert("Error", error.message || "Failed to verify seed phrase");
    }
  };

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`flex-1 w-full ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ProgressStepsHeader currentStep={3} />
      <ScrollView className="flex-1 px-12">
        <View className="mt-3 mb-10">
          <ThemedText fontWeight={700} fontSize={24} className="text-center">
            Verify your Seed Phrase
          </ThemedText>

          <Spacer size={16} />

          <ThemedText className="text-center">
            Enter your Seed Phrase
          </ThemedText>

          <Spacer size={16} />

          <View className="-mx-6">
            <VerifySeedPhrase onDone={handleContinue} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
