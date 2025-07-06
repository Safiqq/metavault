import { MoreIcon } from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Header } from "@/components/ui/Header";
import { MenuOption } from "@/components/ui/MenuOption";
import { AddCredential } from "@/components/ui/Modal/AddCredential";
import { AddItem } from "@/components/ui/Modal/AddItem";
import { EditCredential } from "@/components/ui/Modal/EditCredential";
import { ViewCredential } from "@/components/ui/Modal/ViewCredential";
import { useAlert } from "@/contexts/AlertProvider";
import { useAppState } from "@/contexts/AppStateProvider";
import { decryptVault, deriveKeys, mnemonicToSeed } from "@/lib/bip39";
import { useClipboard } from "@/lib/clipboard";
import { supabase } from "@/lib/supabase";
import { DecryptedLoginItem, DecryptedSSHKeyItem } from "@/lib/types";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Line } from "react-native-svg";

export default function MyVaultFolderScreen() {
  const insets = useSafeAreaInsets();

  const { folder } = useLocalSearchParams<{ folder: string }>();
  const [folderName, setFolderName] = useState<string>("");

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [addCredentialVisible, setAddCredentialVisible] =
    useState<boolean>(false);
  const [addCredentialType, setAddCredentialType] = useState<
    "login" | "ssh_key"
  >("login");

  const [vaultData, setVaultData] = useState<
    (DecryptedLoginItem | DecryptedSSHKeyItem)[]
  >([]);
  const [searchText, setSearchText] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<{
    [key: string]: boolean;
  }>({});

  const [filteredItems, setFilteredItems] = useState<
    (DecryptedLoginItem | DecryptedSSHKeyItem)[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedItem, setSelectedItem] = useState<
    DecryptedLoginItem | DecryptedSSHKeyItem
  >();
  const [viewCredentialVisible, setViewCredentialVisible] =
    useState<boolean>(false);
  const [editCredentialVisible, setEditCredentialVisible] =
    useState<boolean>(false);

  const { showAlert } = useAlert();
  const { state } = useAppState();
  const { copyToClipboard } = useClipboard();

  const fetchFolderName = useCallback(async () => {
    const { data, error } = await supabase
      .from("folders")
      .select()
      .eq("id", folder)
      .single();
    if (error) return;
    setFolderName(data.name);
  }, [folder]);

  const fetchVaultItems = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: loginsData, error: loginsError } = await supabase
        .from("logins")
        .select()
        .eq("folder_id", folder)
        .is("deleted_at", null);
      if (loginsError) return;

      const { data: sshKeysData, error: sshKeysError } = await supabase
        .from("ssh_keys")
        .select()
        .eq("folder_id", folder)
        .is("deleted_at", null);
      if (sshKeysError) return;

      const data = [...loginsData, ...sshKeysData];

      const decryptedAndParsedData = await Promise.all(
        data.map(async (item) => {
          if (item.encrypted_payload) {
            if (!state.mnemonic) return;

            const seed = await mnemonicToSeed(state.mnemonic);
            const derivedKeys = await deriveKeys(seed);
            const decryptedString = await decryptVault(
              item.encrypted_payload,
              derivedKeys
            );
            const parsedPayload = JSON.parse(decryptedString);

            if ("username" in parsedPayload) {
              const loginItem: DecryptedLoginItem = {
                ...item,
                item_name: parsedPayload.item_name,
                username: parsedPayload.username,
                password: parsedPayload.password,
                website: parsedPayload.website,
              };
              return loginItem;
            } else if ("public_key" in parsedPayload) {
              const sshKeyItem: DecryptedSSHKeyItem = {
                ...item,
                item_name: parsedPayload.item_name,
                public_key: parsedPayload.public_key,
                private_key: parsedPayload.private_key,
              };
              return sshKeyItem;
            }
          }
          return item;
        })
      );
      const sortedData = decryptedAndParsedData.sort((a, b) => {
        return a.item_name.localeCompare(b.item_name);
      });

      setVaultData(sortedData as (DecryptedLoginItem | DecryptedSSHKeyItem)[]);
    } catch (err) {
      console.error("Failed to load vault items:", err);
      showAlert("Error", "Failed to load vault items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [folder, showAlert, state.mnemonic]);

  useEffect(() => {
    setIsLoading(true);
    fetchFolderName();
    fetchVaultItems().finally(() => setIsLoading(false));
  }, [fetchFolderName, fetchVaultItems]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchVaultItems();
    setIsRefreshing(false);
  }, [fetchVaultItems]);

  useEffect(() => {
    const lowercasedSearchText = searchText.toLowerCase();
    const filtered = vaultData.filter((item) => {
      // 'item' is now correctly typed
      if (
        item.item_name &&
        item.item_name.toLowerCase().includes(lowercasedSearchText)
      ) {
        return true;
      }
      // Check for type-specific properties
      if (
        "username" in item &&
        item.username &&
        item.username.toLowerCase().includes(lowercasedSearchText)
      ) {
        return true;
      }
      if (
        "website" in item &&
        item.website &&
        item.website.toLowerCase().includes(lowercasedSearchText)
      ) {
        return true;
      }
      if (
        "public_key" in item &&
        item.public_key &&
        item.public_key.toLowerCase().includes(lowercasedSearchText)
      ) {
        return true;
      }
      return false;
    });
    setFilteredItems(filtered);
  }, [searchText, vaultData, folder]);

  // Handle dropdown visibility for each item
  const toggleDropdown = (itemId: string) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const closeDropdown = (itemId: string) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [itemId]: false,
    }));
  };

  const handleDelete = async (itemId: string) => {
    showAlert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (!selectedItem) return;

            const { error } = await supabase
              .from("username" in selectedItem ? "logins" : "ssh_keys")
              .update({ deleted_at: new Date().toISOString() })
              .eq("id", itemId);

            if (error) {
              throw new Error("Failed to delete item from database.");
            }

            setVaultData((prevVaultData) =>
              prevVaultData.filter((item) => item.id !== itemId)
            );
            showAlert("Success", "Item deleted successfully");
          } catch (error) {
            console.error("Failed to delete item:", error);
            showAlert("Error", "Failed to delete item");
          }
        },
      },
    ]);
  };

  const renderVaultItem = (item: any) => (
    <Pressable
      key={item.id}
      className="flex flex-row items-center justify-between"
      onPress={() => {
        setViewCredentialVisible(true);
        setSelectedItem(item);
      }}
    >
      <View className="flex-1">
        <ThemedText fontSize={14}>{item.item_name}</ThemedText>
      </View>

      <DropdownMenu
        visible={dropdownVisible[item.id] || false}
        handleOpen={() => toggleDropdown(item.id)}
        handleClose={() => closeDropdown(item.id)}
        trigger={<MoreIcon width={16} height={16} className="cursor-pointer" />}
        pos="right"
      >
        <MenuOption
          onSelect={() => {
            closeDropdown(item.id);
            setSelectedItem(item);
            setViewCredentialVisible(true);
          }}
        >
          <ThemedText fontSize={14} className="text-white">
            View
          </ThemedText>
        </MenuOption>

        <MenuOption
          onSelect={() => {
            closeDropdown(item.id);
            setSelectedItem(item);
            setEditCredentialVisible(true);
          }}
        >
          <ThemedText fontSize={14} className="text-white">
            Edit
          </ThemedText>
        </MenuOption>

        <MenuOption
          onSelect={async () => {
            await copyToClipboard(item.username, "Username"); // Use item.username directly
            closeDropdown(item.id);
          }}
        >
          <ThemedText fontSize={14} className="text-white">
            Copy username
          </ThemedText>
        </MenuOption>

        <MenuOption
          onSelect={async () => {
            await copyToClipboard(item.password, "Password"); // Use item.password directly
            closeDropdown(item.id);
          }}
        >
          <ThemedText fontSize={14} className="text-white">
            Copy password
          </ThemedText>
        </MenuOption>

        <MenuOption
          onSelect={() => {
            closeDropdown(item.id);
            handleDelete(item.id);
          }}
        >
          <ThemedText fontSize={14} className="text-[#FF4646]">
            Delete
          </ThemedText>
        </MenuOption>
      </DropdownMenu>
    </Pressable>
  );

  if (isLoading) {
    return <View />;
  }

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`flex-1 w-full ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ReactNativeModal
        isVisible={addCredentialVisible}
        onSwipeComplete={() => setAddCredentialVisible(false)}
        swipeDirection={["down"]}
        onBackdropPress={() => setAddCredentialVisible(false)}
        style={{ margin: 0 }}
        animationInTiming={300}
        animationOutTiming={300}
      >
        <AddCredential
          itemType={addCredentialType}
          onClose={() => setAddCredentialVisible(false)}
          onRefresh={async () => await fetchVaultItems()}
        />
      </ReactNativeModal>

      {selectedItem && (
        <>
          <ReactNativeModal
            isVisible={viewCredentialVisible}
            onSwipeComplete={() => setViewCredentialVisible(false)}
            swipeDirection={["down"]}
            onBackdropPress={() => setViewCredentialVisible(false)}
            style={{ margin: 0 }}
            animationInTiming={300}
            animationOutTiming={300}
          >
            <ViewCredential
              itemType={"username" in selectedItem ? "login" : "ssh_key"}
              onClose={() => setViewCredentialVisible(false)}
              onEdit={() => {
                setViewCredentialVisible(false);
                setEditCredentialVisible(true);
              }}
              item={selectedItem}
            />
          </ReactNativeModal>

          <ReactNativeModal
            isVisible={editCredentialVisible}
            onSwipeComplete={() => setEditCredentialVisible(false)}
            swipeDirection={["down"]}
            onBackdropPress={() => setEditCredentialVisible(false)}
            style={{ margin: 0 }}
            animationInTiming={300}
            animationOutTiming={300}
          >
            <EditCredential
              itemType={"username" in selectedItem ? "login" : "ssh_key"}
              onClose={() => setEditCredentialVisible(false)}
              onRefresh={async () => await fetchVaultItems()}
              item={selectedItem}
            />
          </ReactNativeModal>
        </>
      )}

      <Header
        titleText={folderName}
        leftButtonText="My Vault"
        leftButtonBackImage={true}
        searchText={searchText}
        onSearchTextChange={setSearchText}
      />

      <ScrollView
        className="flex-1 px-6 pt-4"
        refreshControl={
          Platform.OS !== "web" ? (
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          ) : (
            <></>
          )
        }
      >
        <ThemedText fontSize={12} fontWeight={800}>
          ITEMS ({isLoading ? "..." : filteredItems.length})
        </ThemedText>

        <Spacer size={4} />

        {isLoading ? (
          <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg items-center">
            <ThemedText fontSize={14} className="text-gray-600">
              Loading items...
            </ThemedText>
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg items-center">
            <ThemedText fontSize={14} className="text-gray-600">
              {searchText
                ? "No items match your search."
                : "No items in this type."}
            </ThemedText>
          </View>
        ) : (
          <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg gap-2">
            {filteredItems.map((item, index) => (
              <React.Fragment key={index}>
                {renderVaultItem(item)}
                {index < filteredItems.length - 1 && <Line />}
              </React.Fragment>
            ))}
          </View>
        )}

        <Spacer size={80} />
      </ScrollView>
      <View className="absolute bottom-0 right-0 px-12 pb-8">
        <AddItem
          dropdownVisible={dropdownVisible["add_item"] || false}
          callback={(e) => {
            if (e === "login" || e === "ssh_key") {
              setAddCredentialVisible(true);
              setAddCredentialType(e);
            }
          }}
          onlyCredential
        />
      </View>
    </View>
  );
}
