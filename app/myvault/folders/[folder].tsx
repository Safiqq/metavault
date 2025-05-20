import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { Line } from "@/components/ui/Line";
import React, { useEffect, useState } from "react";
import { Header } from "@/components/ui/Header";
import { useLocalSearchParams } from "expo-router";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { MenuOption } from "@/components/ui/MenuOption";
import { ViewCredential } from "@/components/ui/Modal/ViewCredential";
import { LoginRow, SshKeyRow, VaultItem } from "@/database.types";
import { useClipboard } from "@/utils/clipboard";
import { useAlert } from "@/contexts/AlertContext";
import { EditCredential } from "@/components/ui/Modal/EditCredential";

export default function VaultScreen() {
  const { folder } = useLocalSearchParams<{ folder: string }>();
  const [searchText, setSearchText] = useState<string>("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<VaultItem | null>();

  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [folderName, setFolderName] = useState<string>("");
  const [viewCredentialVisible, setViewCredentialVisible] =
    useState<boolean>(false);
  const [editCredentialVisible, setEditCredentialVisible] =
    useState<boolean>(false);

  const { alert } = useAlert();

  const { copyToClipboard } = useClipboard();

  useEffect(() => {
    const fetchVaultItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const folderResponse = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/folders?id=eq.${folder}`,
          {
            headers: {
              apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
              "Content-Type": "application/json",
            },
          }
        );

        if (folderResponse.ok) {
          const folderData = await folderResponse.json();
          if (folderData.length > 0) {
            setFolderName(folderData[0].name || `Folder ${folder}`);
          }
        }

        // Fetch from both logins and ssh_keys tables with folder_id filter
        const loginUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/logins?folder_id=eq.${folder}`;
        const sshKeysUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/ssh_keys?folder_id=eq.${folder}`;

        const [loginResponse, sshKeysResponse] = await Promise.all([
          fetch(loginUrl, {
            headers: {
              apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
              "Content-Type": "application/json",
            },
          }),
          fetch(sshKeysUrl, {
            headers: {
              apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!loginResponse.ok) {
          throw new Error(
            `Failed to fetch login items: ${loginResponse.statusText}`
          );
        }

        if (!sshKeysResponse.ok) {
          throw new Error(
            `Failed to fetch SSH key items: ${sshKeysResponse.statusText}`
          );
        }

        const loginData = await loginResponse.json();
        const sshKeysData = await sshKeysResponse.json();

        const combinedData = [
          ...loginData.map((item: LoginRow) => ({
            ...item,
            item_type: "login",
          })),
          ...sshKeysData.map((item: SshKeyRow) => ({
            ...item,
            item_type: "ssh_key",
          })),
        ];

        setVaultItems(combinedData);
      } catch (err) {
        alert("Error", "Failed to load vault items. Please try again.", [
          { text: "OK" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (folder) {
      fetchVaultItems();
    }
  }, [folder]);

  const filteredItems = vaultItems.filter((item) =>
    item.item_name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = async (item: VaultItem) => {
    alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const tableName =
              item.item_type === "login" ? "logins" : "ssh_keys";
            const response = await fetch(
              `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/${tableName}?id=eq.${item.id}`,
              {
                method: "DELETE",
                headers: {
                  apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.ok) {
              // Remove item from local state
              setVaultItems((prev) =>
                prev.filter((vaultItem) => vaultItem.id !== item.id)
              );
              alert("Success", "Item deleted successfully", [], 2000);
            } else {
              throw new Error("Failed to delete item");
            }
          } catch (error) {
            alert("Error", "Failed to delete item", [], 2000);
          }
        },
      },
    ]);
  };

  const renderVaultItem = (item: VaultItem) => {
    console.log(
      `https://www.google.com/s2/favicons?sz=64&domain=${item.website}`
    );

    return (
      <Pressable key={item.id} className="flex flex-row items-center">
        <View className="flex-1 flex-row items-center justify-start gap-2">
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
          <ThemedText fontSize={14} className="-mt-0.5">
            {item.item_name || "Unnamed Item"}
          </ThemedText>
        </View>

        <DropdownMenu
          visible={openDropdownId === item.id}
          handleOpen={() => setOpenDropdownId(item.id)}
          handleClose={() => setOpenDropdownId(null)}
          trigger={
            <Image
              className="max-w-4 max-h-4 rotate-90"
              source={require("@/assets/images/more.png")}
            />
          }
          pos="right"
        >
          <MenuOption
            onSelect={() => {
              setOpenDropdownId(null);
              setViewCredentialVisible(true);
              setOpenModal({ ...item, folder_name: folderName });
            }}
          >
            <ThemedText fontSize={14} className="text-white">
              View
            </ThemedText>
          </MenuOption>

          <MenuOption
            onSelect={() => {
              setOpenDropdownId(null);
              setEditCredentialVisible(true);
              setOpenModal({ ...item, folder_name: folderName });
            }}
          >
            <ThemedText fontSize={14} className="text-white">
              Edit
            </ThemedText>
          </MenuOption>

          {item.item_type === "login" && (
            <>
              <MenuOption
                onSelect={async () => {
                  await copyToClipboard(item.username_hashed || "", "Username");
                  setOpenDropdownId(null);
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  Copy username
                </ThemedText>
              </MenuOption>

              <MenuOption
                onSelect={async () => {
                  await copyToClipboard(item.password_hashed || "", "Password");
                  setOpenDropdownId(null);
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  Copy password
                </ThemedText>
              </MenuOption>
            </>
          )}

          {item.item_type === "ssh_key" && (
            <>
              <MenuOption
                onSelect={async () => {
                  await copyToClipboard(
                    item.public_key_hashed || "",
                    "Public Key"
                  );
                  setOpenDropdownId(null);
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  Copy public key
                </ThemedText>
              </MenuOption>
              <MenuOption
                onSelect={async () => {
                  await copyToClipboard(
                    item.private_key_hashed || "",
                    "Private Key"
                  );
                  setOpenDropdownId(null);
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  Copy private key
                </ThemedText>
              </MenuOption>
              <MenuOption
                onSelect={async () => {
                  await copyToClipboard(
                    item.fingerprint_hashed || "",
                    "Fingerprint"
                  );
                  setOpenDropdownId(null);
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  Copy fingerprint
                </ThemedText>
              </MenuOption>
            </>
          )}

          <MenuOption
            onSelect={() => {
              handleDelete(item);
              setOpenDropdownId(null);
            }}
          >
            <ThemedText fontSize={14} className="text-[#FF4646]">
              Delete
            </ThemedText>
          </MenuOption>
        </DropdownMenu>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      className={`flex-1 w-full px-12 ${
        Platform.OS == "web" && "max-w-2xl mx-auto"
      }`}
    >
      {viewCredentialVisible && openModal && (
        <>
          <ViewCredential
            item={openModal}
            leftCallback={() => setViewCredentialVisible(false)}
            rightCallback={() => {
              setViewCredentialVisible(false);
              setEditCredentialVisible(true);
            }}
          />
          <View className="bg-black/50 absolute w-full h-full z-10" />
        </>
      )}

      {editCredentialVisible && openModal && (
        <>
          <EditCredential
            item={openModal}
            leftCallback={() => setEditCredentialVisible(false)}
          />
          <View className="bg-black/50 absolute w-full h-full z-10" />
        </>
      )}

      <Header
        titleText={`Folder ${folderName}`}
        leftButtonText="My Vault"
        leftButtonBackImage={true}
        searchText={searchText}
        onSearchTextChange={setSearchText}
      />

      <ScrollView className="flex-1 mx-6 my-5">
        <ThemedText fontSize={12} fontWeight={800}>
          ITEMS ({loading ? "..." : filteredItems.length})
        </ThemedText>

        <Spacer size={4} />

        {loading ? (
          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg items-center">
            <ThemedText fontSize={14} className="text-gray-600">
              Loading items...
            </ThemedText>
          </View>
        ) : error ? (
          <View className="bg-[#FFE6E6] py-3 px-4 rounded-lg items-center">
            <ThemedText fontSize={14} className="text-red-600">
              Error loading items
            </ThemedText>
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg items-center">
            <ThemedText fontSize={14} className="text-gray-600">
              {searchText
                ? "No items match your search"
                : "No items in this folder"}
            </ThemedText>
          </View>
        ) : (
          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-2 mb-3">
            {filteredItems.map(renderVaultItem)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
