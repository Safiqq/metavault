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
import { AUTH_NL_STATES, AUTH_STATES } from "@/lib/types";
import { setSession } from "@/lib/supabase/database";
import { recoverVault } from "@/lib/vaultRecovery";
import {
  getWebAuthnRegisterOptions,
  verifyWebAuthnRegistration,
  getWebAuthnAuthenticateOptions,
  verifyWebAuthnAuthentication,
} from "@/lib/supabase/functions";
import { router } from "expo-router";
import React, { useState } from "react";
import * as passkey from "react-native-passkeys";
import {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "react-native-passkeys/src/ReactNativePasskeys.types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// RecoverVaultScreen: Allows users to import their vault using a Seed Phrase (Seed Phrase).
export default function RecoverVaultScreen() {
  const insets = useSafeAreaInsets();
  const isPasskeySupported = passkey.isSupported();

  const [mnemonic, setMnemonic] = useState<string>("");
  const [mnemonicHidden, setMnemonicHidden] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showPasskeyOptions, setShowPasskeyOptions] = useState<boolean>(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] =
    useState<boolean>(false);
  const [isAuthenticatingPasskey, setIsAuthenticatingPasskey] =
    useState<boolean>(false);
  // const [registerOptions, setRegisterOptions] =
  //   useState<PublicKeyCredentialCreationOptionsJSON | null>(null);
  // const [authenticateOptions, setAuthenticateOptions] =
  //   useState<PublicKeyCredentialRequestOptionsJSON | null>(null);

  const { showAlert } = useAlert();
  const { state, setState, resetState } = useAppState();

  // Handles passkey registration after vault recovery
  const handleRegisterPasskey = async () => {
    const registerOptions = await getWebAuthnRegisterOptions();

    setIsRegisteringPasskey(true);
    try {
      // 1. Create the passkey on the device
      const result: RegistrationResponseJSON | null = await passkey.create(
        registerOptions
      );
      if (!result) {
        throw new Error("Passkey registration failed.");
      }

      // 2. Verify the passkey with the server
      await verifyWebAuthnRegistration(result);

      showAlert(
        "Success!",
        "Passkey registered successfully! You are now logged in to your vault.",
        [
          {
            text: "Continue",
            onPress: () => {
              setState({
                ...state,
                authState: AUTH_STATES.NOT_LOGGED_IN,
                currentState: AUTH_NL_STATES.SEED_PHRASE_VERIFIED,
                lastSessionRenewal: new Date().toISOString(),
                lastMnemonicVerification: new Date().toISOString(),
              });
              router.push(ROUTES.GUEST.CONGRATS);
            },
          },
        ]
      );
    } catch (error: any) {
      // Handle cancellation silently
      if (error.message?.toLowerCase().includes("cancelled")) {
        return;
      }
      showAlert("Error", "Failed to register passkey. Please try again.");
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  // Handles passkey authentication after vault recovery
  const handleAuthenticatePasskey = async () => {
    const authenticateOptions = await getWebAuthnAuthenticateOptions();

    setIsAuthenticatingPasskey(true);
    try {
      // 1. Authenticate with existing passkey
      const result: AuthenticationResponseJSON | null = await passkey.get(
        authenticateOptions
      );
      if (!result) {
        throw new Error("Passkey authentication failed.");
      }

      // 2. Verify the authentication with the server
      const verification = await verifyWebAuthnAuthentication(result);

      if (verification.status) {
        showAlert(
          "Success!",
          "Authenticated successfully! You are now logged in to your vault.",
          [
            {
              text: "Continue",
              onPress: () => {
                setState({
                  ...state,
                  authState: AUTH_STATES.NOT_LOGGED_IN,
                  currentState: AUTH_NL_STATES.SEED_PHRASE_VERIFIED,
                  lastSessionRenewal: new Date().toISOString(),
                  lastMnemonicVerification: new Date().toISOString(),
                });
                router.push(ROUTES.GUEST.CONGRATS);
              },
            },
          ]
        );
      } else {
        throw new Error("Server could not verify the authentication.");
      }
    } catch (error: any) {
      // Handle cancellation silently
      if (error.message?.toLowerCase().includes("cancelled")) {
        return;
      }
      showAlert(
        "Error",
        "Failed to authenticate with passkey. Please try again."
      );
    } finally {
      setIsAuthenticatingPasskey(false);
    }
  };

  // Handles the vault recovery process: validates seed phrase, finds vault, and saves to state
  const handleRecovery = async () => {
    if (!mnemonic.trim()) {
      showAlert("Error", "Please enter your seed phrase.");
      return;
    }

    setIsProcessing(true);
    try {
      // Attempt to recover the vault using seed phrase only
      const result = await recoverVault(mnemonic);

      if (
        result.success &&
        result.email &&
        result.access_token &&
        result.refresh_token
      ) {
        // Vault found - save mnemonic and email to state
        const mnemonicArr = mnemonic.trim().split(/\s+/);

        setState({ ...state, email: result.email, mnemonic: mnemonicArr });

        try {
          // Set the session using the tokens from vault recovery
          await setSession(result.access_token, result.refresh_token);

          // Show passkey options instead of immediately navigating
          setShowPasskeyOptions(true);
        } catch (sessionError: any) {
          console.error("Failed to set session:", sessionError);
          showAlert(
            "Session Error",
            `Your vault was recovered but we couldn't establish your session. Please try signing in manually.`,
            [
              {
                text: "Sign In",
                onPress: () => router.push(ROUTES.GUEST.LOGIN),
              },
            ]
          );
        }
      } else {
        // Clear any stored states when recovery fails
        resetState();

        showAlert("Recovery Failed", result.message);
      }
    } catch (error: any) {
      // Clear any stored states on recovery error
      resetState();

      showAlert(
        "Error",
        error.message || "An error occurred during recovery. Please try again."
      );
    } finally {
      setIsProcessing(false);
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
        {!showPasskeyOptions ? (
          <View className="my-10">
            <ThemedText fontWeight={700} fontSize={28} className="text-black">
              Recover Your Vault
            </ThemedText>

            <Spacer size={8} />
            <ThemedText fontSize={14} className="text-gray-600">
              Enter your seed phrase to find and restore your vault
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
                  placeholder="Enter your 12-word seed phrase"
                  placeholderTextColor="#9CA3AF"
                  value={mnemonic}
                  onChangeText={setMnemonic}
                  secureTextEntry={!mnemonicHidden}
                  editable={isPasskeySupported && !isProcessing}
                  multiline
                />
                <Pressable
                  onPress={() => setMnemonicHidden(!mnemonicHidden)}
                  className="p-1 ml-3"
                  disabled={isProcessing}
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
        ) : (
          <View className="my-10">
            <ThemedText fontWeight={700} fontSize={28} className="text-black">
              Vault Recovered!
            </ThemedText>

            <Spacer size={8} />
            <ThemedText fontSize={14} className="text-gray-600">
              Your vault has been successfully recovered. Please choose how
              you&apos;d like to secure your account.
            </ThemedText>
          </View>
        )}
      </ScrollView>
      <View className="px-12 pb-8">
        {isPasskeySupported && !showPasskeyOptions && (
          <Button
            text={isProcessing ? "Recovering..." : "Recover Vault"}
            type="primary"
            onPress={handleRecovery}
            fontWeight={700}
            disabled={isProcessing || mnemonic.trim() === ""}
          />
        )}
        {isPasskeySupported && showPasskeyOptions && (
          <View className="space-y-3">
            <Button
              text={
                isRegisteringPasskey ? "Registering..." : "Register New Passkey"
              }
              type="primary"
              onPress={handleRegisterPasskey}
              fontWeight={700}
              disabled={isRegisteringPasskey || isAuthenticatingPasskey}
            />
            <Button
              text={
                isAuthenticatingPasskey
                  ? "Authenticating..."
                  : "Use Existing Passkey"
              }
              type="secondary"
              onPress={handleAuthenticatePasskey}
              disabled={isRegisteringPasskey || isAuthenticatingPasskey}
            />
          </View>
        )}
      </View>
    </View>
  );
}
