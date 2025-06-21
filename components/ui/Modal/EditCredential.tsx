import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { useAlert } from "@/contexts/AlertProvider";
import { supabase } from "@/lib/supabase";
import {
  CredentialItem,
  DecryptedLoginItem,
  DecryptedSSHKeyItem,
  FoldersRow,
  LoginsUpdate,
  SshKeysUpdate,
} from "@/lib/types";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { Line } from "../Line";
import { MenuOption } from "../MenuOption";

import {
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  MoreIcon,
} from "@/assets/images/icons";
import { useAppState } from "@/contexts/AppStateProvider";
import { useAuth } from "@/contexts/AuthProvider";
import { deriveKeys, encryptVault, mnemonicToSeed } from "@/lib/bip39";

interface EditCredentialProps {
  onClose: () => void;
  onRefresh: () => void;
  itemType: "login" | "ssh_key";
  item?: DecryptedLoginItem | DecryptedSSHKeyItem;
}

export const EditCredential: React.FC<EditCredentialProps> = ({
  onClose,
  onRefresh,
  itemType,
  item,
}) => {
  const [isMoreVisible, setIsMoreVisible] = useState<boolean>(false);
  const [isFolderVisible, setIsFolderVisible] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [folders, setFolders] = useState<FoldersRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [itemRaw, setItemRaw] = useState<CredentialItem>({
    folder_id: item?.folder_id ?? "",
    folder_name: "",
    item_name: item?.item_name ?? "",

    username: (item as DecryptedLoginItem).username,
    password: (item as DecryptedLoginItem).password,
    website: (item as DecryptedLoginItem).website ?? "",

    fingerprint: (item as DecryptedSSHKeyItem).fingerprint,
    public_key: (item as DecryptedSSHKeyItem).public_key,
    private_key: (item as DecryptedSSHKeyItem).private_key,
  });

  const { showAlert } = useAlert();
  const { state } = useAppState();
  const { user } = useAuth();

  const handleSave = async () => {
    try {
      if (!state.mnemonic || !itemRaw.folder_id) return;
      const userId = user?.id;
      if (!userId) return;

      if (itemType === "login") {
        const data = {
          item_name: itemRaw.item_name,
          username: itemRaw.username,
          password: itemRaw.password,
          website: itemRaw.website,
        };
        const seed = await mnemonicToSeed(state.mnemonic);
        const derivedKeys = await deriveKeys(seed);
        const payload: LoginsUpdate = {
          folder_id: itemRaw.folder_id,
          encrypted_payload: await encryptVault(
            JSON.stringify(data),
            derivedKeys
          ),
        };
        const { error } = await supabase
          .from("logins")
          .update(payload)
          .eq("id", item?.id);
        if (error) throw error;

        onClose();
        showAlert("Success", "Updated a login credential.", [
          { text: "OK", onPress: onRefresh },
        ]);
      } else if (itemType === "ssh_key" && itemRaw.fingerprint) {
        const data = {
          item_name: itemRaw.item_name,
          public_key: itemRaw.public_key,
          private_key: itemRaw.private_key,
        };
        const seed = await mnemonicToSeed(state.mnemonic);
        const derivedKeys = await deriveKeys(seed);
        const payload: SshKeysUpdate = {
          folder_id: itemRaw.folder_id,
          fingerprint: itemRaw.fingerprint,
          encrypted_payload: await encryptVault(
            JSON.stringify(data),
            derivedKeys
          ),
        };
        const { error } = await supabase
          .from("ssh_keys")
          .update(payload)
          .eq("id", item?.id);
        if (error) throw error;

        onClose();
        showAlert("Success", "Updated a login credential.", [
          { text: "OK", onPress: onRefresh },
        ]);
      }
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
          await supabase
            .from(itemType === "login" ? "logins" : "ssh_keys")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", item?.id);
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
        const { data, error } = await supabase.from("folders").select();
        if (error) {
          return;
        }
        setFolders(data);

        setItemRaw({
          ...itemRaw,
          folder_id: data[0].id,
          folder_name: data[0].name,
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
  }, [itemRaw, showAlert]);

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
            Edit credential
          </ThemedText>
        </View>
        <View className="flex-1 items-end">
          <View className="flex flex-row items-center gap-3">
            <Pressable onPress={handleSave} disabled={!isComplete()}>
              <ThemedText
                fontSize={14}
                className={isComplete() ? "text-[#0099FF]" : "text-black/40"}
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
        </View>
      </View>

      <ScrollView>
      <View className="mx-6">
        <Spacer size={20} />
        {isLoading ? (
          <ThemedText fontSize={14}>Loading item...</ThemedText>
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
                <View className="flex flex-row gap-2 items-center justify-between">
                  <ThemedText fontSize={14}>{itemRaw.folder_name}</ThemedText>
                  <DropdownMenu
                    visible={isFolderVisible}
                    handleOpen={() => setIsFolderVisible(true)}
                    handleClose={() => setIsFolderVisible(false)}
                    trigger={<ArrowDownIcon width={16} height={16} className="cursor-pointer" />}
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
                        secureTextEntry={showPassword}
                        onChangeText={(text) =>
                          setItemRaw({ ...itemRaw, password: text })
                        }
                      />
                      <Pressable
                        onPress={async () => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeIcon width={16} />
                        ) : (
                          <EyeSlashIcon width={16} />
                        )}
                      </Pressable>
                    </View>
                  </View>
                </View>

                <Spacer size={16} />

                <ThemedText fontSize={12} fontWeight={800}>
                  AUTOFILL OPTIONS
                </ThemedText>

                <Spacer size={4} />

                <View className="bg-[#EBEBEB] px-4 py-4 rounded-lg gap-2">
                  <View>
                    <ThemedText fontSize={12} fontWeight={800}>
                      Website (URI)
                    </ThemedText>
                    <ThemedTextInput
                      fontSize={14}
                      className="flex-1 outline-none"
                      placeholder="Enter your website (URI)"
                      value={itemRaw.website}
                      onChangeText={(text) =>
                        setItemRaw({ ...itemRaw, website: text })
                      }
                    />
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
                        onChangeText={(text) =>
                          setItemRaw({ ...itemRaw, private_key: text })
                        }
                      />
                      <Pressable
                        onPress={async () => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
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
    </View>
  );
};
