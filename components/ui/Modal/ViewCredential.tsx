import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { MenuOption } from "../MenuOption";
import Spacer from "@/components/Spacer";
import { VaultItem } from "@/database.types";
import { Line } from "../Line";
import { useClipboard } from "@/utils/clipboard";
import { ThemedTextInput } from "@/components/ThemedTextInput";

interface ViewCredentialProps {
  item: VaultItem;
  leftCallback: () => void;
  rightCallback: () => void;
}

export const ViewCredential: React.FC<ViewCredentialProps> = ({
  item,
  leftCallback,
  rightCallback,
}) => {
  const [isMoreVisible, setIsMoreVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { copyToClipboard } = useClipboard();

  const handleDelete = async () => {};

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
            View {item.item_type == "login" ? "login" : "SSH key"}
          </ThemedText>
        </View>
        <View className="flex flex-row flex-1 justify-end items-center gap-3">
          <Pressable onPress={rightCallback}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Edit
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
              <ThemedText fontSize={14}>{item.folder_name}</ThemedText>
              <Pressable
                onPress={async () =>
                  await copyToClipboard(item.folder_name || "", "Folder name")
                }
              >
                <Image
                  className="max-w-4 max-h-4"
                  source={require("@/assets/images/copy.png")}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {item.item_type == "login" && (
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
                <View className="flex flex-row gap-2 items-center justify-between">
                  <ThemedText fontSize={14}>{item.username_hashed}</ThemedText>
                  <Pressable
                    onPress={async () =>
                      await copyToClipboard(
                        item.username_hashed || "",
                        "Username"
                      )
                    }
                  >
                    <Image
                      className="max-w-4 max-h-4"
                      source={require("@/assets/images/copy.png")}
                    />
                  </Pressable>
                </View>
              </View>

              <Line />

              <View>
                <ThemedText fontSize={12} fontWeight={800}>
                  Password
                </ThemedText>
                <View className="flex flex-row gap-2 items-center justify-between">
                  <ThemedTextInput
                    className="outline-none"
                    fontSize={14}
                    secureTextEntry={!showPassword}
                    value={item.password_hashed}
                    editable={false}
                  />
                  <View className="flex flex-row gap-2 items-center">
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
                    <Pressable
                      onPress={async () =>
                        await copyToClipboard(
                          item.password_hashed || "",
                          "Password"
                        )
                      }
                    >
                      <Image
                        className="max-w-4 max-h-4"
                        source={require("@/assets/images/copy.png")}
                      />
                    </Pressable>
                  </View>
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
                <View className="flex flex-row gap-2 items-center justify-between">
                  <ThemedText fontSize={14}>{item.website}</ThemedText>
                  <Pressable
                    onPress={async () =>
                      await copyToClipboard(item.website || "", "Website")
                    }
                  >
                    <Image
                      className="max-w-4 max-h-4"
                      source={require("@/assets/images/copy.png")}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </>
        )}

        {item.item_type == "ssh_key" && (
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
                  <ThemedText fontSize={14}>
                    {item.public_key_hashed}
                  </ThemedText>
                  <Pressable
                    onPress={async () =>
                      await copyToClipboard(
                        item.public_key_hashed || "",
                        "Public key"
                      )
                    }
                  >
                    <Image
                      className="max-w-4 max-h-4"
                      source={require("@/assets/images/copy.png")}
                    />
                  </Pressable>
                </View>
              </View>

              <Line />

              <View>
                <ThemedText fontSize={12} fontWeight={800}>
                  Private key
                </ThemedText>
                <View className="flex flex-row gap-2 items-center justify-between">
                  <ThemedTextInput
                    className="flex-1 outline-none"
                    fontSize={14}
                    secureTextEntry={!showPassword}
                    value={item.private_key_hashed}
                    editable={false}
                  />
                  <View className="flex flex-row gap-2 items-center">
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
                    <Pressable
                      onPress={async () =>
                        await copyToClipboard(
                          item.private_key_hashed || "",
                          "Private key"
                        )
                      }
                    >
                      <Image
                        className="max-w-4 max-h-4"
                        source={require("@/assets/images/copy.png")}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              <Line />

              <View>
                <ThemedText fontSize={12} fontWeight={800}>
                  Fingerprint
                </ThemedText>
                <View className="flex flex-row gap-2 items-center justify-between">
                  <ThemedText fontSize={14}>
                    {item.fingerprint_hashed}
                  </ThemedText>
                  <Pressable
                    onPress={async () =>
                      await copyToClipboard(
                        item.fingerprint_hashed || "",
                        "Fingerprint"
                      )
                    }
                  >
                    <Image
                      className="max-w-4 max-h-4"
                      source={require("@/assets/images/copy.png")}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};
