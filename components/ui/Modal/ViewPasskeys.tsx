import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ROUTES } from "@/constants/AppConstants";
import { useAlert } from "@/contexts/AlertProvider";
import { supabase } from "@/lib/supabase";
import { APP_STATES } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from "react-native-passkeys/src/ReactNativePasskeys.types";
import * as passkey from "react-native-passkeys";

interface ViewPasskeyProps {
  onClose: () => void;
}

export const ViewPasskey: React.FC<ViewPasskeyProps> = ({ onClose }) => {
  const [passkeys, setPasskeys] = useState<any[]>([]);

  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  // State to hold the registration options fetched from the server
  const [passkeyRequest, setPasskeyRequest] =
    useState<PublicKeyCredentialCreationOptionsJSON | null>(null);

  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchPasskeys = async () => {
      try {
        const { data, error } = await supabase
          .from("passkeys")
          .select("credential_id,created_at");

        if (error) {
          console.error("Failed to fetch passkeys:", error);
          return;
        }

        setPasskeys(data || []);
      } catch (err) {
        console.error("Error fetching passkeys:", err);
      }
    };

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
        console.log("isproecssing false");
      }
    };

    fetchPasskeys();
    fetchRegistrationOptions();
  }, []);

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
    <View className="absolute bg-white w-full z-20 bottom-0 rounded-t-lg h-3/4">
      <View className="rounded-t-lg bg-[#EBEBEB] flex flex-row justify-between py-4 px-6 items-center">
        <View className="flex-1">
          <Pressable onPress={onClose}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Close
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1 items-center">
          <ThemedText fontSize={14} fontWeight={700}>
            Passkeys
          </ThemedText>
        </View>
        <View className="flex-1 items-end">
          <Pressable onPress={handleRegisterPasskey} disabled={isProcessing}>
            <ThemedText
              fontSize={14}
              className={!isProcessing ? "text-[#0099FF]" : "text-black/40"}
            >
              Add
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView>
        <View className="mx-6">
          <Spacer size={20} />

          <View className="bg-[#EBEBEB] px-4 py-3 rounded-lg gap-2">
            {passkeys.map((passkey, index) => (
              <View className="gap-2" key={index}>
                <ThemedText fontWeight={700} fontSize={14}>
                  {passkey.credential_id.substring(0, 10)}{" "}
                </ThemedText>
                <ThemedText fontSize={12}>
                  Created at {formatDate(passkey.created_at)}
                </ThemedText>
              </View>
            ))}
          </View>
          <Spacer size={20} />
        </View>
      </ScrollView>
    </View>
  );
};
