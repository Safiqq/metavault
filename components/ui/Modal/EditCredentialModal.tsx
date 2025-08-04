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

import {
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  MoreIcon,
} from "@/assets/images/icons";
import { LoadingIndicator } from "../LoadingIndicator";
import { ModalHeader } from "../ModalHeader";
import { useAppState } from "@/contexts/AppStateProvider";
import { useAuth } from "@/contexts/AuthProvider";

interface EditCredentialModalProps {
  onClose: () => void;
  onRefresh: () => void;
  itemType: "login" | "ssh_key";
  item?: DecryptedVaultItem;
}

export const EditCredentialModal: React.FC<EditCredentialModalProps> = ({
  onClose,
  onRefresh,
  itemType,
  item,
}) => {
  const [isMoreVisible, setIsMoreVisible] = useState<boolean>(false);
  const [isFolderVisible, setIsFolderVisible] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);
  const [folders, setFolders] = useState<FoldersRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [itemRaw, setItemRaw] = useState<DecryptedVaultItem>({
    id: item?.id ?? "",
    folder_id: item?.folder_id ?? "",
    folder_name: item?.folder_name ?? "",
    item_name: item?.item_name ?? "",
    item_type: item?.item_type ?? "login",

    username: item?.username ?? "",
    password: item?.password ?? "",

    fingerprint: item?.fingerprint ?? "",
    public_key: item?.public_key ?? "",
    private_key: item?.private_key ?? "",
  });

  const { showAlert } = useAlert();
  const { state } = useAppState();
  const { user } = useAuth();

  const handleSave = async () => {
    try {
      if (!state.mnemonic || !itemRaw.folder_id) return;
      const userId = user?.id;
      if (!userId) return;

      if (!item?.id) return;

      // Update via vaultManager using the credential item format
      const updatedCredential: Partial<DecryptedVaultItem> = {
        folder_id: itemRaw.folder_id,
        folder_name: itemRaw.folder_name,
        item_name: itemRaw.item_name,
        username: itemRaw.username,
        password: itemRaw.password,
        fingerprint: itemRaw.fingerprint,
        public_key: itemRaw.public_key,
        private_key: itemRaw.private_key,
      };

      await vaultManager.updateVaultItem(item.id, updatedCredential);

      onClose();
      showAlert(
        "Success",
        `Updated ${itemType === "login" ? "login" : "SSH key"} credential.`,
        [{ text: "OK", onPress: onRefresh }]
      );
    } catch (error) {
      console.error("Failed to save credential:", error);
      showAlert("Error", "Failed to save credential. Please try again.");
    }
  };

  const handleDelete = async () => {
    setIsMoreVisible(false);
    onClose();
    showAlert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          // Delete via vaultManager instead of direct database call
          if (item?.id) {
            await vaultManager.deleteVaultItem(item.id);
          }
          showAlert("Success", "Deleted a credential.", [
            { text: "OK", onPress: onRefresh },
          ]);
        },
      },
    ]);
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

        // Only set default folder if current folder_id is empty
        setItemRaw((prev) => {
          if (!prev.folder_id && data.length > 0) {
            return {
              ...prev,
              folder_id: data[0].id,
              folder_name: data[0].name,
            };
          }
          return prev;
        });
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
  }, [showAlert, user?.id]);

  return (
    <View
      className={`flex-1 w-full rounded-t-lg bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ModalHeader title="Edit credential" onClose={onClose}>
        <View className="flex flex-row items-center gap-3">
          <Pressable onPress={handleSave} disabled={!isComplete()}>
            <ThemedText
              fontSize={14}
              className={isComplete() ? "text-[#0099FF]" : "text-[#999999]"}
            >
              Save
            </ThemedText>
          </Pressable>
          <DropdownMenu
            visible={isMoreVisible}
            handleOpen={() => setIsMoreVisible(true)}
            handleClose={() => setIsMoreVisible(false)}
            trigger={
              <MoreIcon width={16} height={16} className="cursor-pointer" />
            }
            pos="right"
          >
            <MenuOption onSelect={handleDelete}>
              <ThemedText fontSize={14} className="text-[#FF4646]">
                Delete
              </ThemedText>
            </MenuOption>
          </DropdownMenu>
        </View>
      </ModalHeader>

      <ScrollView>
        <View className="mx-6">
          <Spacer size={20} />
          {isLoading ? (
            <LoadingIndicator text="Loading item..." />
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
                      <View className="flex flex-row gap-2 items-center justify-between">
                        <ThemedText fontSize={14}>
                          {itemRaw.folder_name}
                        </ThemedText>
                        <ArrowDownIcon
                          width={16}
                          height={16}
                          className="cursor-pointer"
                        />
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
                        className="flex-1 outline-none"
                        placeholder="Enter your username"
                        value={itemRaw.username || ""}
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
                          value={itemRaw.password || ""}
                          secureTextEntry={!showPassword}
                          onChangeText={(text) =>
                            setItemRaw({ ...itemRaw, password: text })
                          }
                        />
                        <Pressable
                          onPress={async () => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeSlashIcon width={16} />
                          ) : (
                            <EyeIcon width={16} />
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
                          value={itemRaw.public_key || ""}
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
                          value={itemRaw.private_key || ""}
                          secureTextEntry={!showPrivateKey}
                          onChangeText={(text) =>
                            setItemRaw({ ...itemRaw, private_key: text })
                          }
                        />
                        <Pressable
                          onPress={async () =>
                            setShowPrivateKey(!showPrivateKey)
                          }
                        >
                          {showPrivateKey ? (
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
                        value={itemRaw.fingerprint || ""}
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
    </View>
  );
};
