import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { supabase } from "@/lib/supabase";
import { DecryptedLoginItem, DecryptedSSHKeyItem } from "@/lib/types";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { Line } from "../Line";
import { MenuOption } from "../MenuOption";

import {
  CopyIcon,
  EyeIcon,
  EyeSlashIcon,
  MoreIcon,
} from "@/assets/images/icons";
import { useClipboard } from "@/lib/clipboard";

interface ViewCredentialProps {
  onClose: () => void;
  onEdit: () => void;
  itemType: "login" | "ssh_key";
  item?: DecryptedLoginItem | DecryptedSSHKeyItem;
}

export const ViewCredential: React.FC<ViewCredentialProps> = ({
  onClose,
  onEdit,
  itemType,
  item,
}) => {
  const [isMoreVisible, setIsMoreVisible] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");

  const { copyToClipboard } = useClipboard();

  const handleEdit = onEdit;

  const handleDelete = async () => {
    if (itemType === "login") {
      await supabase.from("logins").update("deleted_at");
    }
  };

  useEffect(() => {
    const getFolderName = async () => {
      if (!item || !item.folder_id) return;

      const { data, error } = await supabase
        .from("folders")
        .select()
        .eq("id", item.folder_id)
        .single();
      if (error) return;
      setFolderName(data.name);
    };
    getFolderName();
  }, [item]);

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
            View credential
          </ThemedText>
        </View>
        <View className="flex-1 items-end">
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
        </View>
      </View>

      <ScrollView>
      <View className="mx-6">
        <Spacer size={20} />
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
                  await copyToClipboard(item?.item_name ?? "", "Item name")
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
                  await copyToClipboard(folderName, "Folder name")
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
                    value={(item as DecryptedLoginItem).username}
                  />
                  <Pressable
                    onPress={async () =>
                      await copyToClipboard(
                        (item as DecryptedLoginItem).username,
                        "Username"
                      )
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
                    value={(item as DecryptedLoginItem).password}
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
                      await copyToClipboard(
                        (item as DecryptedLoginItem).password,
                        "Password"
                      )
                    }
                  >
                    <CopyIcon width={16} />
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
                <View className="flex flex-row gap-2 items-center">
                  <ThemedTextInput
                    fontSize={14}
                    className="flex-1 outline-none"
                    editable={false}
                    value={(item as DecryptedLoginItem).website}
                  />
                  <Pressable
                    onPress={async () =>
                      await copyToClipboard(
                        (item as DecryptedLoginItem).website ?? "",
                        "Website (URI)"
                      )
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
                    value={(item as DecryptedSSHKeyItem).public_key}
                  />
                  <Pressable
                    onPress={async () =>
                      await copyToClipboard(
                        (item as DecryptedSSHKeyItem).public_key,
                        "Public key"
                      )
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
                    value={(item as DecryptedSSHKeyItem).private_key}
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
                      await copyToClipboard(
                        (item as DecryptedSSHKeyItem).private_key,
                        "Private key"
                      )
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
                    value={(item as DecryptedSSHKeyItem).fingerprint}
                  />
                  <Pressable
                    onPress={async () =>
                      await copyToClipboard(
                        (item as DecryptedSSHKeyItem).fingerprint,
                        "Fingerprint"
                      )
                    }
                  >
                    <CopyIcon width={16} />
                  </Pressable>
                </View>
              </View>
            </View>
          </>
        )}
        <Spacer size={20} />
      </View>
      </ScrollView>
    </View>
  );
};
