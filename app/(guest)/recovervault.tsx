import { Platform, Pressable, ScrollView, View } from "react-native";

import { EyeIcon, EyeSlashIcon } from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { ROUTES } from "@/constants/AppConstants";
import { useAlert } from "@/contexts/AlertProvider";
import { useAppState } from "@/contexts/AppStateProvider";
import {
  createHashedSecret,
  mnemonicToSeed,
  validateMnemonic,
} from "@/lib/bip39";
import { supabase } from "@/lib/supabase";
import { APP_STATES } from "@/lib/types";
import { router } from "expo-router";
import React, { useState } from "react";
import * as passkey from "react-native-passkeys";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// RecoverVaultScreen: Allows users to import their vault using a Seed Phrase (Seed Phrase).
export default function RecoverVaultScreen() {
  const insets = useSafeAreaInsets();
  const isPasskeySupported = passkey.isSupported();

  const [mnemonic, setMnemonic] = useState<string>("");
  const [mnemonicHidden, setMnemonicHidden] = useState<boolean>(false);

  const { showAlert } = useAlert();

  const { state, setState } = useAppState();

  // Verifies the user's login using the hashed secret and updates app state on success
  async function verifyLogin(hashed_secret: string) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "verify-and-get-token",
        {
          body: { hashed_secret },
        }
      );

      if (error) throw error;

      // The edge function returns a full session if the hash is correct
      const { user, session } = data;

      // Use the returned session to sign the user in
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      showAlert("Success", `Logged in as ${user.email}`, [
        {
          text: "OK",
          onPress: () => {
            setState({
              ...state,
              currentState: APP_STATES.LOGGED_IN_NEED_SESSION_RENEWAL,
              lastMnemonicVerification: new Date().toISOString(),
              mnemonic: mnemonic?.split(" "),
              mnemonicVerified: true,
              email: user.email,
            });
            router.push(ROUTES.USER.LOCKED);
          },
        },
      ]);
    } catch (err) {
      console.error("Login verification failed:", err);
      showAlert("Error", "Failed to verify the user.");
    }
  }

  // Handles the import process: validates mnemonic, hashes, and verifies login
  const handleImport = async () => {
    if (mnemonic) {
      const mnemonicArr = mnemonic.split(" ");
      if (await validateMnemonic(mnemonicArr)) {
        const seed = await mnemonicToSeed(mnemonicArr);
        const hashedSecret = await createHashedSecret(seed);

        verifyLogin(hashedSecret);
      } else {
        showAlert("Error", "Failed to recover your vault.");
      }
    }
  };

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`flex-1 w-full bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <Header
        titleText="MetaVault"
        leftButtonText="Back"
        leftButtonBackImage={true}
      />
      <ScrollView className="flex-1 px-12">
        <View className="my-10">
          <ThemedText fontWeight={700} fontSize={28} className="text-black">
            Import from Seed Phrase
          </ThemedText>

          <Spacer size={24} />

          <View className="bg-gray-100 py-4 px-4 rounded-xl">
            <ThemedText fontSize={12} fontWeight={700} className="text-black">
              Seed Phrase
            </ThemedText>
            <Spacer size={8} />
            <View className="flex-row items-center">
              <ThemedTextInput
                fontSize={14}
                className="flex-1 outline-none text-black"
                placeholder="Enter your recovery phrase"
                placeholderTextColor="#9CA3AF"
                value={mnemonic}
                onChangeText={setMnemonic}
                secureTextEntry={!mnemonicHidden}
                editable={isPasskeySupported}
              />
              <Pressable
                onPress={() => setMnemonicHidden(!mnemonicHidden)}
                className="p-1 ml-3"
              >
                {!mnemonicHidden ? (
                  <EyeIcon width={20} height={20} />
                ) : (
                  <EyeSlashIcon width={20} height={20} />
                )}
              </Pressable>
            </View>
          </View>

          {!isPasskeySupported && (
            <>
              <Spacer size={16} />
              <View className="p-4 bg-gray-50 rounded-xl">
                <ThemedText className="text-gray-600 text-center">
                  Currently, there is no authentication method available for
                  your device.
                </ThemedText>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <View className="px-12 pb-8">
        {isPasskeySupported && (
          <Button
            text="Import"
            type="primary"
            onPress={handleImport}
            fontWeight={700}
            disabled={mnemonic === ""}
          />
        )}
      </View>
    </View>
  );
}
