import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { useAlert } from "@/contexts/AlertProvider";
import { supabase } from "@/lib/supabase";
import {
  getWebAuthnRegisterOptions,
  verifyWebAuthnRegistration,
} from "@/lib/supabase/functions";
import { TrashIcon } from "@/assets/images/icons";
import { ModalHeader } from "../ModalHeader";
import { formatDate } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, View, TextInput, Platform } from "react-native";
import {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from "react-native-passkeys/src/ReactNativePasskeys.types";
import * as passkey from "react-native-passkeys";

interface ViewPasskeyModalProps {
  onClose: () => void;
}

export const ViewPasskeyModal: React.FC<ViewPasskeyModalProps> = ({
  onClose,
}) => {
  const [passkeys, setPasskeys] = useState<
    {
      credential_id: string;
      created_at: string;
      name: string | null;
      last_used_at: string | null;
      device_info: any;
    }[]
  >([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(
    null
  );
  const [editingPasskeyId, setEditingPasskeyId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  // State to hold the registration options fetched from the server
  const [passkeyRequest, setPasskeyRequest] =
    useState<PublicKeyCredentialCreationOptionsJSON | null>(null);

  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchPasskeys = async () => {
      try {
        const { data, error } = await supabase
          .from("passkeys")
          .select("credential_id,created_at,name,last_used_at,device_info");

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
        const data = await getWebAuthnRegisterOptions();
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

    fetchPasskeys();
    fetchRegistrationOptions();
  }, [showAlert]);

  // Handles passkey deletion
  const handleDeletePasskey = async (credentialId: string) => {
    if (passkeys.length <= 1) {
      showAlert(
        "Cannot Delete",
        "You must have at least one passkey for account access. Add another passkey before deleting this one."
      );
      return;
    }

    showAlert(
      "Delete Passkey",
      "Are you sure you want to delete this passkey? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingPasskeyId(credentialId);
            try {
              const { error } = await supabase
                .from("passkeys")
                .delete()
                .eq("credential_id", credentialId);

              if (error) {
                throw new Error(error.message);
              }

              // Remove from local state
              setPasskeys((prev) =>
                prev.filter((p) => p.credential_id !== credentialId)
              );

              showAlert("Success", "Passkey deleted successfully.");
            } catch (error: any) {
              showAlert(
                "Delete Failed",
                error.message || "Failed to delete passkey. Please try again."
              );
            } finally {
              setDeletingPasskeyId(null);
            }
          },
        },
      ]
    );
  };

  // Handles passkey name update
  const handleUpdatePasskeyName = async (
    credentialId: string,
    newName: string
  ) => {
    try {
      const { error } = await supabase
        .from("passkeys")
        .update({ name: newName.trim() || null })
        .eq("credential_id", credentialId);

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      setPasskeys((prev) =>
        prev.map((p) =>
          p.credential_id === credentialId
            ? { ...p, name: newName.trim() || null }
            : p
        )
      );

      setEditingPasskeyId(null);
      setEditingName("");
    } catch (error: any) {
      showAlert(
        "Update Failed",
        error.message || "Failed to update passkey name. Please try again."
      );
    }
  };

  const startEditingName = (credentialId: string, currentName: string) => {
    setEditingPasskeyId(credentialId);
    setEditingName(currentName || "");
  };

  const cancelEditing = () => {
    setEditingPasskeyId(null);
    setEditingName("");
  };

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
      if (!result) {
        throw new Error("Passkey registration failed.");
      }

      // 2. Verify the passkey with the server
      await verifyWebAuthnRegistration(result);

      // Refresh passkeys list
      const { data: updatedPasskeys, error: fetchError } = await supabase
        .from("passkeys")
        .select("credential_id,created_at,name,last_used_at,device_info");

      if (!fetchError && updatedPasskeys) {
        setPasskeys(updatedPasskeys);
      }

      showAlert(
        "Success!",
        "A Passkey has been successfully registered for MetaVault on this device."
      );
    } catch (error: any) {
      // Handle cancellation or device-side errors from Passkey.create()
      if (
        error.message.toLowerCase().includes("cancelled") ||
        error.message.toLowerCase().includes("failed on the device")
      ) {
      } else {
        // Handle verification errors or other exceptions
        showAlert(
          "Registration Failed",
          "An error occurred during Passkey registration. Please try again."
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View
      className={`flex-1 w-full rounded-t-lg bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ModalHeader title="Passkeys" onClose={onClose}>
        <Pressable onPress={handleRegisterPasskey} disabled={isProcessing}>
          <ThemedText
            fontSize={14}
            className={!isProcessing ? "text-[#0099FF]" : "text-[#999999]"}
          >
            Add
          </ThemedText>
        </Pressable>
      </ModalHeader>

      <ScrollView>
        <View className="mx-6">
          <Spacer size={20} />

          {passkeys.length > 0 ? (
            <View className="bg-[#EBEBEB] px-4 py-3 rounded-lg gap-3">
              {passkeys.map((passkey, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center"
                >
                  <View className="flex-1 gap-1">
                    {editingPasskeyId === passkey.credential_id ? (
                      <View className="flex-row gap-2 items-center">
                        <TextInput
                          value={editingName}
                          onChangeText={setEditingName}
                          placeholder="Enter passkey name"
                          className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 text-sm"
                          autoFocus
                          onSubmitEditing={() =>
                            handleUpdatePasskeyName(
                              passkey.credential_id,
                              editingName
                            )
                          }
                        />
                        <Pressable
                          onPress={() =>
                            handleUpdatePasskeyName(
                              passkey.credential_id,
                              editingName
                            )
                          }
                        >
                          <ThemedText fontSize={14} className="text-blue-500">
                            Save
                          </ThemedText>
                        </Pressable>
                        <Pressable onPress={cancelEditing}>
                          <ThemedText fontSize={14} className="text-gray-500">
                            Cancel
                          </ThemedText>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() =>
                          startEditingName(
                            passkey.credential_id,
                            passkey.name || ""
                          )
                        }
                      >
                        <ThemedText fontWeight={700} fontSize={14}>
                          {passkey.name || `Passkey ${index + 1}`}
                        </ThemedText>
                      </Pressable>
                    )}
                    <ThemedText fontSize={12} className="text-gray-600">
                      ID: {passkey.credential_id.substring(0, 20)}...
                    </ThemedText>
                    <ThemedText fontSize={12} className="text-gray-600">
                      Created: {formatDate(passkey.created_at)}
                    </ThemedText>
                    {passkey.last_used_at && (
                      <ThemedText fontSize={12} className="text-gray-600">
                        Last used: {formatDate(passkey.last_used_at)}
                      </ThemedText>
                    )}
                    {typeof passkey.device_info === "object" &&
                      passkey.device_info?.user_agent && (
                        <ThemedText fontSize={11} className="text-gray-500">
                          Device:{" "}
                          {(passkey.device_info as any)?.user_agent?.split(
                            " "
                          )[0] || "Unknown"}
                        </ThemedText>
                      )}
                  </View>
                  <Pressable
                    onPress={() => handleDeletePasskey(passkey.credential_id)}
                    disabled={
                      deletingPasskeyId === passkey.credential_id ||
                      passkeys.length <= 1
                    }
                    className={`p-2 ${
                      deletingPasskeyId === passkey.credential_id ||
                      passkeys.length <= 1
                        ? "opacity-30"
                        : ""
                    }`}
                  >
                    <TrashIcon
                      width={20}
                      height={20}
                      color={passkeys.length <= 1 ? "#CCCCCC" : "#FF4444"}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-[#EBEBEB] px-4 py-8 rounded-lg items-center">
              <ThemedText fontSize={14} className="text-gray-600 text-center">
                No passkeys registered yet.
                {"\n"}Tap &quot;Add&quot; to register your first passkey.
              </ThemedText>
            </View>
          )}
          <Spacer size={20} />
        </View>
      </ScrollView>
    </View>
  );
};
