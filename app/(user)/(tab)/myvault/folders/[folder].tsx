import { MoreIcon } from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Header } from "@/components/ui/Header";
import { MenuOption } from "@/components/ui/MenuOption";
import { AddCredentialModal } from "@/components/ui/Modal/AddCredentialModal";
import { AddItemModal } from "@/components/ui/Modal/AddItemModal";
import { EditCredentialModal } from "@/components/ui/Modal/EditCredentialModal";
import { ViewCredentialModal } from "@/components/ui/Modal/ViewCredentialModal";
import { FullScreenLoadingOverlay } from "@/components/ui/FullScreenLoadingOverlay";
import { RefreshableScrollView } from "@/components/ui/RefreshableScrollView";
import { useAlert } from "@/contexts/AlertProvider";
import { useClipboard } from "@/lib/clipboard";
import { DecryptedVaultItem } from "@/lib/types";
import { getFolders, getCurrentUser } from "@/lib/supabase/database";
import { vaultManager } from "@/lib/vaultManager";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import ReactNativeModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Line } from "react-native-svg";
import { ROUTES } from "@/constants/AppConstants";

export default function MyVaultFolderScreen() {
  const insets = useSafeAreaInsets();

  const { folder } = useLocalSearchParams<{ folder: string }>();
  const [folderName, setFolderName] = useState<string>("");

  const [addCredentialVisible, setAddCredentialVisible] =
    useState<boolean>(false);
  const [addCredentialType, setAddCredentialType] = useState<
    "login" | "ssh_key"
  >("login");

  const [vaultData, setVaultData] = useState<DecryptedVaultItem[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<{
    [key: string]: boolean;
  }>({});

  const [filteredItems, setFilteredItems] = useState<DecryptedVaultItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedItem, setSelectedItem] = useState<DecryptedVaultItem>();
  const [viewCredentialVisible, setViewCredentialVisible] =
    useState<boolean>(false);
  const [editCredentialVisible, setEditCredentialVisible] =
    useState<boolean>(false);

  const { showAlert } = useAlert();
  const { copyToClipboard } = useClipboard();

  const fetchFolderName = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const folders = await getFolders(user.id);
      const currentFolder = folders.find((f) => f.id === folder);
      if (currentFolder) {
        setFolderName(currentFolder.name);
      }
    } catch (error) {
      console.error("Error fetching folder name:", error);
    }
  }, [folder]);

  const fetchVaultItems = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get items for this folder from vaultManager
      const folderItems = vaultManager.getItemsForFolder(folder as string);

      const sortedData = folderItems.sort((a, b) => {
        return a.item_name.localeCompare(b.item_name);
      });

      setVaultData(sortedData);
    } catch (err) {
      console.error("Failed to load vault items:", err);
      showAlert("Error", "Failed to load vault items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [folder, showAlert]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchFolderName();
      await fetchVaultItems();
      setIsLoading(false);
    };
    init();
  }, [fetchFolderName, fetchVaultItems]);

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredItems(vaultData);
      return;
    }

    const query = searchText.toLowerCase();
    const filtered = vaultData.filter((item) => {
      return (
        item.item_name?.toLowerCase().includes(query) ||
        item.username?.toLowerCase().includes(query) ||
        item.public_key?.toLowerCase().includes(query)
      );
    });
    setFilteredItems(filtered);
  }, [searchText, vaultData]);

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

            // Remove item from vault using vaultManager
            await vaultManager.deleteVaultItem(itemId);

            // Update local state
            setVaultData((prevVaultData) =>
              prevVaultData.filter(
                (item) => item.item_name !== selectedItem.item_name
              )
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
            await copyToClipboard(
              item.item_type === "login" ? item.username : item.public_key
            );
            closeDropdown(item.id);
          }}
        >
          <ThemedText fontSize={14} className="text-white">
            Copy {item.item_type === "login" ? "username" : "public key"}
          </ThemedText>
        </MenuOption>

        <MenuOption
          onSelect={async () => {
            await copyToClipboard(
              item.item_type === "login" ? item.password : item.private_key
            );
            closeDropdown(item.id);
          }}
        >
          <ThemedText fontSize={14} className="text-white">
            Copy {item.item_type === "login" ? "password" : "private key"}
          </ThemedText>
        </MenuOption>

        {item.item_type === "ssh_key" && (
          <MenuOption
            onSelect={async () => {
              await copyToClipboard(item.fingerprint);
              closeDropdown(item.id);
            }}
          >
            <ThemedText fontSize={14} className="text-white">
              Copy fingerprint
            </ThemedText>
          </MenuOption>
        )}

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
        <AddCredentialModal
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
            <ViewCredentialModal
              itemType={selectedItem.username ? "login" : "ssh_key"}
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
            <EditCredentialModal
              itemType={selectedItem.username ? "login" : "ssh_key"}
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
        leftButtonTarget={ROUTES.USER.MY_VAULT.INDEX}
        searchText={searchText}
        onSearchTextChange={setSearchText}
      />

      <RefreshableScrollView
        className="flex-1 px-3 pt-4"
        onRefresh={fetchVaultItems}
      >
        <ThemedText fontSize={12} fontWeight={800}>
          ITEMS ({filteredItems.length})
        </ThemedText>

        <Spacer size={4} />

        {filteredItems.length === 0 ? (
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
      </RefreshableScrollView>
      <View className="absolute bottom-0 right-0 px-12 pb-8">
        <AddItemModal
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

      <FullScreenLoadingOverlay
        visible={isLoading}
        text="Loading folder items..."
      />
    </View>
  );
}
