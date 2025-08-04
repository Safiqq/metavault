import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { useAlert } from "@/contexts/AlertProvider";
import { getFoldersForSelect } from "@/lib/supabase/database";
import { vaultManager } from "@/lib/vaultManager";
import { DecryptedVaultItem, FoldersRow } from "@/lib/types";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { Line } from "../Line";
import { MenuOption } from "../MenuOption";

import { ArrowDownIcon, EyeIcon, EyeSlashIcon } from "@/assets/images/icons";
import { useAuth } from "@/contexts/AuthProvider";
import { ModalHeader } from "../ModalHeader";
import { LoadingIndicator } from "../LoadingIndicator";
import * as Crypto from "expo-crypto";

interface AddCredentialModalProps {
  onClose: () => void;
  onRefresh: () => void;
  itemType: "login" | "ssh_key";
}

export const AddCredentialModal: React.FC<AddCredentialModalProps> = ({
  onClose,
  onRefresh,
  itemType,
}) => {
  const [isFolderVisible, setIsFolderVisible] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [folders, setFolders] = useState<FoldersRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [itemRaw, setItemRaw] = useState<DecryptedVaultItem>({
    id: "",
    folder_id: "",
    folder_name: "",
    item_name: "",
    item_type: itemType,

    username: "",
    password: "",

    fingerprint: "",
    public_key: "",
    private_key: "",
  });

  const { user } = useAuth();
  const { showAlert } = useAlert();

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Get folder name for the credential item
      const selectedFolder = folders.find((f) => f.id === itemRaw.folder_id);
      if (!selectedFolder) {
        throw new Error("Folder not found");
      }

      // Create a credential item for vaultManager
      const credentialItem: DecryptedVaultItem = {
        id: Crypto.randomUUID(),
        folder_id: itemRaw.folder_id,
        folder_name: selectedFolder.name,
        item_name: itemRaw.item_name,
        item_type: itemType,

        // Login fields
        username: itemRaw.username || "",
        password: itemRaw.password || "",

        // SSH Key fields
        fingerprint: itemRaw.fingerprint || "",
        public_key: itemRaw.public_key || "",
        private_key: itemRaw.private_key || "",
      };

      // Save using vaultManager
      await vaultManager.upsertVaultItem(credentialItem);

      onClose();
      showAlert(
        "Success",
        `Added a new ${itemType === "login" ? "login" : "SSH key"} credential.`,
        [{ text: "OK", onPress: onRefresh }]
      );
    } catch (error) {
      console.error("Failed to save credential:", error);
      showAlert("Error", "Failed to save credential. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isComplete = () => {
    if (
      itemRaw.folder_id === "" ||
      itemRaw.folder_name === "" ||
      itemRaw.item_name === ""
    ) {
      return false;
    }

    if (itemType === "login") {
      return itemRaw.username !== "" && itemRaw.password !== "";
    } else if (itemType === "ssh_key") {
      return (
        itemRaw.fingerprint !== "" &&
        itemRaw.public_key !== "" &&
        itemRaw.private_key !== ""
      );
    }

    return false;
  };

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const data = await getFoldersForSelect(user?.id || "");
        setFolders(data);

        // Only set the folder if it's the first load (folder_id is empty)
        if (data.length > 0) {
          setItemRaw((prev) => ({
            ...prev,
            folder_id: prev.folder_id || data[0].id,
            folder_name: prev.folder_name || data[0].name,
          }));
        }
      } catch (err) {
        console.error("Failed to load folders:", err);
        showAlert("Error", "Failed to load vault items. Please try again.", [
          { text: "OK" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, [showAlert, user?.id]); // Removed itemRaw from dependencies to prevent infinite loop

  return (
    <View
      className={`flex-1 w-full rounded-t-lg bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ModalHeader
        title={`Add new ${itemType === "login" ? "login" : "SSH key"}`}
        onClose={onClose}
      >
        <Pressable onPress={handleSave} disabled={!isComplete()}>
          <ThemedText
            fontSize={14}
            className={isComplete() ? "text-[#0099FF]" : "text-[#999999]"}
          >
            Save
          </ThemedText>
        </Pressable>
      </ModalHeader>

      <ScrollView>
        <View className="mx-6">
          <Spacer size={20} />
          {isLoading ? (
            <LoadingIndicator text="Loading folders..." />
          ) : (
            <>
              <ThemedText fontSize={12} fontWeight={800}>
                ITEM DETAILS
              </ThemedText>

              <Spacer size={4} />

              <View className="bg-[#EBEBEB] px-4 py-4 rounded-lg gap-2">
                <View>
                  <ThemedText fontSize={12} fontWeight={800}>
                    Item name
                  </ThemedText>
                  <View className="flex flex-row gap-2 items-center">
                    <ThemedTextInput
                      fontSize={14}
                      className="flex-1 outline-none"
                      placeholder="Enter your item name"
                      value={itemRaw.item_name}
                      onChangeText={(e) =>
                        setItemRaw({ ...itemRaw, item_name: e })
                      }
                    />
                  </View>
                </View>

                <Line />

                <View>
                  <ThemedText fontSize={12} fontWeight={800}>
                    Folder
                  </ThemedText>
                  <Spacer size={8} />
                  <DropdownMenu
                    visible={isFolderVisible}
                    handleOpen={() => setIsFolderVisible(true)}
                    handleClose={() => setIsFolderVisible(false)}
                    trigger={
                      <View className="flex flex-row gap-2 items-center justify-between cursor-pointer">
                        <ThemedText fontSize={14}>
                          {itemRaw.folder_name}
                        </ThemedText>
                        <ArrowDownIcon width={16} height={16} />
                      </View>
                    }
                    pos="right"
                  >
                    {folders.map((folder, index) => (
                      <MenuOption
                        key={index}
                        onSelect={() => {
                          setItemRaw({
                            ...itemRaw,
                            folder_id: folder.id,
                            folder_name: folder.name,
                          });
                          setIsFolderVisible(false);
                        }}
                      >
                        <ThemedText fontSize={14} className="text-white">
                          {folder.name}
                        </ThemedText>
                      </MenuOption>
                    ))}
                  </DropdownMenu>
                </View>
              </View>

              {itemType === "login" && (
                <>
                  <Spacer size={16} />

                  <ThemedText fontSize={12} fontWeight={800}>
                    LOGIN CREDENTIALS
                  </ThemedText>

                  <Spacer size={4} />

                  <View className="bg-[#EBEBEB] px-4 py-4 rounded-lg gap-2">
                    <View>
                      <ThemedText fontSize={12} fontWeight={800}>
                        Username
                      </ThemedText>
                      <ThemedTextInput
                        fontSize={14}
                        className="outline-none"
                        placeholder="Enter your username"
                        value={itemRaw.username}
                        onChangeText={(text) =>
                          setItemRaw({ ...itemRaw, username: text })
                        }
                      />
                    </View>

                    <Line />

                    <View>
                      <ThemedText fontSize={12} fontWeight={800}>
                        Password
                      </ThemedText>
                      <View className="flex flex-row gap-2 items-center justify-between">
                        <ThemedTextInput
                          fontSize={14}
                          className="flex-1 outline-none"
                          placeholder="Enter your password"
                          value={itemRaw.password}
                          secureTextEntry={!showPassword}
                          onChangeText={(text) =>
                            setItemRaw({ ...itemRaw, password: text })
                          }
                        />
                        <Pressable
                          onPress={async () => setShowPassword(!showPassword)}
                        >
                          {!showPassword ? (
                            <EyeIcon width={16} />
                          ) : (
                            <EyeSlashIcon width={16} />
                          )}
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </>
              )}

              {itemType === "ssh_key" && (
                <>
                  <Spacer size={16} />

                  <ThemedText fontSize={12} fontWeight={800}>
                    SSH KEY
                  </ThemedText>

                  <Spacer size={4} />

                  <View className="bg-[#EBEBEB] px-4 py-4 rounded-lg gap-2">
                    <View>
                      <ThemedText fontSize={12} fontWeight={800}>
                        Public key
                      </ThemedText>
                      <View className="flex flex-row gap-2 items-center justify-between">
                        <ThemedTextInput
                          fontSize={14}
                          className="flex-1 outline-none"
                          placeholder="Enter your public key"
                          value={itemRaw.public_key}
                          onChangeText={(text) =>
                            setItemRaw({ ...itemRaw, public_key: text })
                          }
                        />
                      </View>
                    </View>

                    <Line />

                    <View>
                      <ThemedText fontSize={12} fontWeight={800}>
                        Private key
                      </ThemedText>
                      <View className="flex flex-row gap-2 items-center justify-between">
                        <ThemedTextInput
                          fontSize={14}
                          className="flex-1 outline-none"
                          placeholder="Enter your private key"
                          value={itemRaw.private_key}
                          secureTextEntry={!showPassword}
                          onChangeText={(text) =>
                            setItemRaw({ ...itemRaw, private_key: text })
                          }
                        />
                        <Pressable
                          onPress={async () => setShowPassword(!showPassword)}
                        >
                          {!showPassword ? (
                            <EyeIcon width={16} height={16} />
                          ) : (
                            <EyeSlashIcon width={16} height={16} />
                          )}
                        </Pressable>
                      </View>
                    </View>

                    <Line />

                    <View>
                      <ThemedText fontSize={12} fontWeight={800}>
                        Fingerprint
                      </ThemedText>
                      <ThemedTextInput
                        fontSize={14}
                        className="flex-1 outline-none"
                        placeholder="Enter your fingerprint"
                        value={itemRaw.fingerprint}
                        onChangeText={(text) =>
                          setItemRaw({ ...itemRaw, fingerprint: text })
                        }
                      />
                    </View>
                  </View>
                </>
              )}
            </>
          )}
          <Spacer size={20} />
        </View>
      </ScrollView>

      {isSaving && (
        <LoadingIndicator
          overlay
          text={`Saving ${itemType === "login" ? "login" : "SSH key"}...`}
        />
      )}
    </View>
  );
};
