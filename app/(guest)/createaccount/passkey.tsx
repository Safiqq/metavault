import { ScanningIcon } from "@/assets/images/icons";
import { ProgressSteps } from "@/components/ProgressSteps";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/AppConstants";
import { useAlert } from "@/contexts/AlertProvider";
import { useAppState } from "@/contexts/AppStateProvider";
import { supabase } from "@/lib/supabase";
import { APP_STATES } from "@/lib/types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import * as passkey from "react-native-passkeys";
import {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from "react-native-passkeys/src/ReactNativePasskeys.types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { startRegistration } from "@simplewebauthn/browser";

// PasskeyAuthenticationScreen: Handles passkey registration for passwordless authentication.
export default function PasskeyAuthenticationScreen() {
  const insets = useSafeAreaInsets();
  // isProcessing now handles fetching options and verifying the passkey
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  // State to hold the registration options fetched from the server
  const [passkeyRequest, setPasskeyRequest] =
    useState<PublicKeyCredentialCreationOptionsJSON | null>(null);

  const { showAlert } = useAlert();
  const { state, setState } = useAppState();

  // Fetch registration options from the server on mount
  useEffect(() => {
    const fetchRegistrationOptions = async () => {
      setIsProcessing(true);
      try {
        // Invoke the Supabase Edge Function to get registration options
        const { data, error } = await supabase.functions.invoke(
          "webauthn-register-options"
        );

        if (error) {
          throw error;
        }

        setPasskeyRequest(data);
      } catch (error: any) {
        showAlert(
          "Setup Error",
          error.message ||
            "Could not prepare for Passkey registration. Please try again."
        );
      } finally {
        setIsProcessing(false);
      }
    };

    fetchRegistrationOptions();
  }, [state.email]); // Rerun if email changes

  // Handles passkey registration and server verification
  const handleRegisterPasskey = async () => {
    if (!passkeyRequest) {
      showAlert(
        "Error",
        "Passkey registration options not loaded. Please wait or try again."
      );
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create the passkey on the device using options from the server
      const result: RegistrationResponseJSON | null = await passkey.create(
        passkeyRequest
      );

      // 2. Verify the passkey with the server
      const { error: verificationError } = await supabase.functions.invoke(
        "webauthn-verify-registration",
        { body: { data: result } }
      );

      if (verificationError) {
        throw verificationError;
      }

      showAlert(
        "Success!",
        "A Passkey has been successfully registered for MetaVault on this device.",
        [
          {
            text: "Continue",
            onPress: () => {
              setState({
                ...state,
                currentState: APP_STATES.CREATE_ACCOUNT_PASSKEY_VERIFIED,
                passkeyVerified: true,
              });
              router.push(ROUTES.GUEST.CREATE_ACCOUNT.SECURE_VAULT);
            },
          },
        ]
      );
    } catch (error: any) {
      // Handle cancellation or device-side errors from Passkey.create()
      if (
        error.message.includes("cancelled") ||
        error.message.includes("failed on the device")
      ) {
        showAlert(
          "Registration Cancelled",
          "Passkey registration was cancelled by the user."
        );
      } else {
        // Handle verification errors or other exceptions
        showAlert(
          "Registration Failed",
          error.message ||
            "An error occurred during Passkey registration. Please try again."
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`flex-1 w-full ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ScrollView className="flex-1 px-12">
        <ProgressSteps currentStep={2} />
        <View className="my-10">
          <ScanningIcon width={60} height={60} />

          <Spacer size={16} />

          <ThemedText fontWeight={700} fontSize={24}>
            Use Passkeys to unlock MetaVault on this device?
          </ThemedText>

          <Spacer size={16} />

          <ThemedText>
            Unlock this app even faster and more securely with Passkeys. You can
            manage this in your MetaVault security settings at any time.
          </ThemedText>
        </View>
      </ScrollView>
      <View className="px-12 pb-8">
        <Button
          text={isProcessing ? "Preparing..." : "Register Passkey"}
          type="primary"
          onPress={handleRegisterPasskey}
          disabled={isProcessing}
          fontWeight={700}
        />
      </View>
    </View>
  );
}
