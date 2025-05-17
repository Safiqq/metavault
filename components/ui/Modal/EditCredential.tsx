import { ThemedText } from "@/components/ThemedText";
import React, { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { MenuOption } from "../MenuOption";
import Spacer from "@/components/Spacer";
import { FolderRow, VaultItem } from "@/database.types";
import { Line } from "../Line";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { useAlert } from "@/contexts/AlertContext";

interface EditCredentialProps {
  item: VaultItem;
  leftCallback: () => void;
}

export const EditCredential: React.FC<EditCredentialProps> = ({
  item,
  leftCallback,
}) => {
  const [isMoreVisible, setIsMoreVisible] = useState(false);
  const [isFolderVisible, setIsFolderVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [folders, setFolders] = useState<FolderRow[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<VaultItem>(item);

  const { alert } = useAlert();

  const handleSave = async () => {};
  const handleDelete = async () => {};

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoading(true);

        const folderResponse = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/folders`,
          {
            headers: {
              apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
              "Content-Type": "application/json",
            },
          }
        );

        if (folderResponse.ok) {
          const folderData = await folderResponse.json();
          setFolders(folderData);
        }
      } catch (err) {
        alert("Error", "Failed to load vault items. Please try again.", [
          { text: "OK" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, []);

  return (
    <View className="absolute bg-white w-full z-20 bottom-0 rounded-t-lg h-3/4">
      <View className="rounded-t-lg bg-[#EBEBEB] flex flex-row justify-between py-3 px-6">
        <View className="flex-1">
          <Pressable onPress={leftCallback}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Close
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1">
          <ThemedText
            fontSize={14}
            fontWeight={700}
            className="absolute w-full text-center"
          >
            Edit {item.item_type == "login" ? "login" : "SSH key"}
          </ThemedText>
        </View>
        <View className="flex flex-row flex-1 justify-end items-center gap-3">
          <Pressable onPress={handleSave}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Save
            </ThemedText>
          </Pressable>
          <DropdownMenu
            visible={isMoreVisible}
            handleOpen={() => setIsMoreVisible(true)}
            handleClose={() => setIsMoreVisible(false)}
            trigger={
              <Image
                className="max-w-6 max-h-6"
                source={require("@/assets/images/more.png")}
              />
            }
            pos="right"
          >
            <MenuOption
              onSelect={() => {
                setIsMoreVisible(false);
                leftCallback();
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
      <View className="mx-6 my-5">
        {!loading ? (
          <>
            <ThemedText fontSize={12} fontWeight={800}>
              ITEM DETAILS
            </ThemedText>

            <Spacer size={4} />

            <View className="bg-[#EBEBEB] px-4 py-3 rounded-lg gap-2">
              <View>
                <ThemedText fontSize={12} fontWeight={800}>
                  Item name
                </ThemedText>
                <View className="flex flex-row gap-2 items-center">
                  {item.item_type == "login" ? (
                    <Image
                      className="max-w-4 max-h-4 w-4 h-4 rounded-md"
                      source={{
                        uri: `https://www.google.com/s2/favicons?sz=64&domain=${item.website}`,
                      }}
                    />
                  ) : (
                    <Image
                      className="max-w-4 max-h-4"
                      source={require("@/assets/images/key.png")}
                    />
                  )}
                  <ThemedText fontSize={14}>{item.item_name}</ThemedText>
                </View>
              </View>

              <Line />

              <View>
                <ThemedText fontSize={12} fontWeight={800}>
                  Folder
                </ThemedText>
                <View className="flex flex-row gap-2 items-center justify-between">
                  <ThemedText fontSize={14}>{newItem.folder_name}</ThemedText>
                  <DropdownMenu
                    visible={isFolderVisible}
                    handleOpen={() => setIsFolderVisible(true)}
                    handleClose={() => setIsFolderVisible(false)}
                    trigger={
                      <Image
                        className="max-w-6 max-h-6"
                        source={require("@/assets/images/more.png")}
                      />
                    }
                    pos="right"
                  >
                    {folders?.map((folder, index) => (
                      <MenuOption
                        key={index}
                        onSelect={() => {
                          setNewItem({
                            ...newItem,
                            folder_id: folder.id,
                            folder_name: folder.name,
                          });
                        }}
                      >
                        <ThemedText fontSize={14} className="text-[#FF4646]">
                          {folder.name}
                        </ThemedText>
                      </MenuOption>
                    ))}
                  </DropdownMenu>
                </View>
              </View>
            </View>

            {newItem.item_type == "login" && (
              <>
                <Spacer size={16} />

                <ThemedText fontSize={12} fontWeight={800}>
                  LOGIN CREDENTIALS
                </ThemedText>

                <Spacer size={4} />

                <View className="bg-[#EBEBEB] px-4 py-3 rounded-lg gap-2">
                  <View>
                    <ThemedText fontSize={12} fontWeight={800}>
                      Username
                    </ThemedText>
                    <ThemedTextInput
                      fontSize={14}
                      className="flex-1 outline-none"
                      placeholder="Enter your username"
                      value={newItem.username_hashed}
                      onChangeText={(text) =>
                        setNewItem({ ...newItem, username_hashed: text })
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
                        value={newItem.password_hashed}
                        onChangeText={(text) =>
                          setNewItem({ ...newItem, password_hashed: text })
                        }
                      />
                      <Pressable
                        onPress={async () => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <Image
                            className="max-w-4 max-h-4"
                            source={require("@/assets/images/eye.png")}
                          />
                        ) : (
                          <Image
                            className="max-w-4 max-h-4"
                            source={require("@/assets/images/eye-slash.png")}
                          />
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

                <View className="bg-[#EBEBEB] px-4 py-3 rounded-lg gap-2">
                  <View>
                    <ThemedText fontSize={12} fontWeight={800}>
                      Website (URI)
                    </ThemedText>
                    <ThemedTextInput
                      fontSize={14}
                      className="flex-1 outline-none"
                      placeholder="Enter your website (URI)"
                      value={newItem.website}
                      onChangeText={(text) =>
                        setNewItem({ ...newItem, website: text })
                      }
                    />
                  </View>
                </View>
              </>
            )}

            {newItem.item_type == "ssh_key" && (
              <>
                <Spacer size={16} />

                <ThemedText fontSize={12} fontWeight={800}>
                  SSH KEY
                </ThemedText>

                <Spacer size={4} />

                <View className="bg-[#EBEBEB] px-4 py-3 rounded-lg gap-2">
                  <View>
                    <ThemedText fontSize={12} fontWeight={800}>
                      Public key
                    </ThemedText>
                    <View className="flex flex-row gap-2 items-center justify-between">
                      <ThemedTextInput
                        fontSize={14}
                        className="flex-1 outline-none"
                        placeholder="Enter your public key"
                        value={newItem.public_key_hashed}
                        onChangeText={(text) =>
                          setNewItem({ ...newItem, public_key_hashed: text })
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
                        value={newItem.private_key_hashed}
                        onChangeText={(text) =>
                          setNewItem({ ...newItem, private_key_hashed: text })
                        }
                      />
                      <Pressable
                        onPress={async () => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <Image
                            className="max-w-4 max-h-4"
                            source={require("@/assets/images/eye.png")}
                          />
                        ) : (
                          <Image
                            className="max-w-4 max-h-4"
                            source={require("@/assets/images/eye-slash.png")}
                          />
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
                      value={newItem.fingerprint_hashed}
                      onChangeText={(text) =>
                        setNewItem({ ...newItem, fingerprint_hashed: text })
                      }
                    />
                  </View>
                </View>
              </>
            )}
          </>
        ) : (
          <ThemedText fontSize={14}>Loading item...</ThemedText>
        )}
      </View>
    </View>
  );
};
