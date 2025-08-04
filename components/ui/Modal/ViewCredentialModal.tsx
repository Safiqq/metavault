import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { vaultManager } from "@/lib/vaultManager";
import { DecryptedVaultItem } from "@/lib/types";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { Line } from "../Line";
import { MenuOption } from "../MenuOption";
import { ModalHeader } from "../ModalHeader";

import {
  CopyIcon,
  EyeIcon,
  EyeSlashIcon,
  MoreIcon,
} from "@/assets/images/icons";
import { useClipboard } from "@/lib/clipboard";
import { getFolderName } from "@/lib/supabase/database";

interface ViewCredentialModalProps {
  onClose: () => void;
  onEdit: () => void;
  itemType: "login" | "ssh_key";
  item?: DecryptedVaultItem;
}

export const ViewCredentialModal: React.FC<ViewCredentialModalProps> = ({
  onClose,
  onEdit,
  itemType,
  item,
}) => {
  console.log("itemtype", itemType);
  console.log("item", item);
  const [isMoreVisible, setIsMoreVisible] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");

  const { copyToClipboard } = useClipboard();

  const handleEdit = onEdit;

  const handleDelete = async () => {
    if (itemType === "login" && item && "id" in item && item.id) {
      // await updateLoginDeletedAt(item.id);
      await vaultManager.deleteVaultItem(item.id);
    }
  };

  useEffect(() => {
    const getFolderName_ = async () => {
      if (!item || !item.folder_id) return;

      const name = await getFolderName(item.folder_id);

      setFolderName(name);
    };
    getFolderName_();
  }, [item]);

  return (
    <View
      className={`flex-1 w-full rounded-t-lg bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ModalHeader title="View credential" onClose={onClose}>
        <View className="flex flex-row items-center gap-3">
          <Pressable onPress={handleEdit}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Edit
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
            <MenuOption
              onSelect={() => {
                setIsMoreVisible(false);
                onClose();
                handleDelete();
              }}
            >
              <ThemedText fontSize={14} className="text-[#FF4646]">
                Delete
              </ThemedText>
            </MenuOption>
          </DropdownMenu>
        </View>
      </ModalHeader>

      <ScrollView>
        <View className="mx-6 py-5">
          <View>
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
                    editable={false}
                    value={item?.item_name}
                  />
                  <Pressable
                    onPress={async () =>
                      await copyToClipboard(item?.item_name ?? "")
                    }
                  >
                    <CopyIcon width={16} />
                  </Pressable>
                </View>
              </View>

              <Line />

              <View>
                <ThemedText fontSize={12} fontWeight={800}>
                  Folder
                </ThemedText>
                <View className="flex flex-row gap-2 items-center justify-between">
                  <ThemedText fontSize={14}>{folderName}</ThemedText>
                  <Pressable
                    onPress={async () =>
                      await copyToClipboard(folderName)
                    }
                  >
                    <CopyIcon width={16} />
                  </Pressable>
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
                    <View className="flex flex-row gap-2 items-center">
                      <ThemedTextInput
                        fontSize={14}
                        className="flex-1 outline-none"
                        editable={false}
                        value={item?.username}
                      />
                      <Pressable
                        onPress={async () =>
                          item?.username &&
                          (await copyToClipboard(item.username))
                        }
                      >
                        <CopyIcon width={16} />
                      </Pressable>
                    </View>
                  </View>

                  <Line />

                  <View>
                    <ThemedText fontSize={12} fontWeight={800}>
                      Password
                    </ThemedText>
                    <View className="flex flex-row gap-2 items-center">
                      <ThemedTextInput
                        fontSize={14}
                        className="flex-1 outline-none"
                        secureTextEntry={showPassword}
                        editable={false}
                        value={item?.password}
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
                      <Pressable
                        onPress={async () =>
                          item?.password &&
                          (await copyToClipboard(item.password))
                        }
                      >
                        <CopyIcon width={16} />
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
                    <View className="flex flex-row gap-2 items-center">
                      <ThemedTextInput
                        fontSize={14}
                        className="flex-1 outline-none"
                        editable={false}
                        value={item?.public_key}
                      />
                      <Pressable
                        onPress={async () =>
                          item?.public_key &&
                          (await copyToClipboard(item.public_key))
                        }
                      >
                        <CopyIcon width={16} />
                      </Pressable>
                    </View>
                  </View>

                  <Line />

                  <View>
                    <ThemedText fontSize={12} fontWeight={800}>
                      Private key
                    </ThemedText>
                    <View className="flex flex-row gap-2 items-center">
                      <ThemedTextInput
                        fontSize={14}
                        className="flex-1 outline-none"
                        editable={false}
                        value={item?.private_key}
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
                      <Pressable
                        onPress={async () =>
                          item?.private_key &&
                          (await copyToClipboard(
                            item.private_key
                          ))
                        }
                      >
                        <CopyIcon width={16} />
                      </Pressable>
                    </View>
                  </View>

                  <Line />

                  <View>
                    <ThemedText fontSize={12} fontWeight={800}>
                      Fingerprint
                    </ThemedText>
                    <View className="flex flex-row gap-2 items-center">
                      <ThemedTextInput
                        fontSize={14}
                        className="flex-1 outline-none"
                        editable={false}
                        value={item?.fingerprint}
                      />
                      <Pressable
                        onPress={async () =>
                          item?.fingerprint &&
                          (await copyToClipboard(
                            item.fingerprint
                          ))
                        }
                      >
                        <CopyIcon width={16} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </>
            )}

            <Spacer size={16} />

            <ThemedText fontSize={12} fontWeight={800}>
              TIMESTAMPS
            </ThemedText>

            <Spacer size={4} />

            <View className="bg-[#EBEBEB] px-4 py-4 rounded-lg gap-2">
              <View>
                <ThemedText fontSize={12} fontWeight={800}>
                  Created
                </ThemedText>

                <Spacer size={4} />

                <ThemedText fontSize={14}>
                  {item?.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : "Unknown"}
                </ThemedText>
              </View>

              <Line />

              <View>
                <ThemedText fontSize={12} fontWeight={800}>
                  Last updated
                </ThemedText>

                <Spacer size={4} />

                <ThemedText fontSize={14}>
                  {item?.updated_at
                    ? new Date(item.updated_at).toLocaleString()
                    : "Unknown"}
                </ThemedText>
              </View>

              {item?.deleted_at && (
                <>
                  <Line />
                  <View>
                    <ThemedText fontSize={12} fontWeight={800}>
                      Deleted
                    </ThemedText>

                    <Spacer size={4} />

                    <ThemedText fontSize={14}>
                      {new Date(item.deleted_at).toLocaleString()}
                    </ThemedText>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
