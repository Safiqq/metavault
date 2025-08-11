import { MoreIcon } from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Header } from "@/components/ui/Header";
import { Line } from "@/components/ui/Line";
import { MenuOption } from "@/components/ui/MenuOption";
import { AddCredentialModal } from "@/components/ui/Modal/AddCredentialModal";
import { AddItemModal } from "@/components/ui/Modal/AddItemModal";
import { EditCredentialModal } from "@/components/ui/Modal/EditCredentialModal";
import { ViewCredentialModal } from "@/components/ui/Modal/ViewCredentialModal";
import { FullScreenLoadingOverlay } from "@/components/ui/FullScreenLoadingOverlay";
import { useAlert } from "@/contexts/AlertProvider";
import { useClipboard } from "@/lib/clipboard";
import { DecryptedVaultItem } from "@/lib/types";
import { vaultManager } from "@/lib/vaultManager";
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
import { ROUTES } from "@/constants/AppConstants";

export default function MyVaultTypeScreen() {
  const insets = useSafeAreaInsets();

  const { type } = useLocalSearchParams<{ type: string }>();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
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

  const fetchVaultItems = useCallback(async () => {
    try {
      setIsLoading(true);

      if (type !== "Login" && type !== "SSH+key") return;

      // Use vaultManager instead of direct database queries
      const cachedVaultData = vaultManager.getCachedVaultData();
      if (!cachedVaultData) return;

      // Filter by item type
      const targetType = type === "Login" ? "login" : "ssh_key";
      const filteredData = cachedVaultData.filter((item) => {
        if (targetType === "login") {
          return item.username && item.password;
        } else {
          return item.public_key && item.private_key;
        }
      });

      // Transform to DecryptedVaultItem format
      const transformedData: DecryptedVaultItem[] = filteredData.map(
        (item) => ({
          id: item.id,
          folder_id: item.folder_id,
          folder_name: item.folder_name,
          item_name: item.item_name,
          item_type: targetType,
          username: item.username,
          password: item.password,
          public_key: item.public_key,
          private_key: item.private_key,
          fingerprint: item.fingerprint,
          created_at: item.created_at,
          updated_at: item.updated_at,
          deleted_at: item.deleted_at,
        })
      );

      setVaultData(transformedData);
    } catch (err) {
      console.error("Failed to load vault items:", err);
      showAlert("Error", "Failed to load vault items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, type]);

  useEffect(() => {
    setIsLoading(true);
    fetchVaultItems().finally(() => setIsLoading(false));
  }, [fetchVaultItems]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchVaultItems();
    setIsRefreshing(false);
  }, [fetchVaultItems]);

  useEffect(() => {
    const lowercasedSearchText = searchText.toLowerCase();
    const filtered = vaultData.filter((item) => {
      if (
        item.item_name &&
        item.item_name.toLowerCase().includes(lowercasedSearchText)
      ) {
        return true;
      }
      // Check for type-specific properties
      if (
        item.username &&
        item.username.toLowerCase().includes(lowercasedSearchText)
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
  }, [searchText, vaultData, type]);

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
            // Use vaultManager to delete item
            await vaultManager.deleteVaultItem(itemId);

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
            await copyToClipboard(type === "Login" ? item.username : item.public_key);
            closeDropdown(item.id);
          }}
        >
          <ThemedText fontSize={14} className="text-white">
            Copy {type === "Login" ? "username" : "public key"}
          </ThemedText>
        </MenuOption>

        <MenuOption
          onSelect={async () => {
            await copyToClipboard(type === "Login" ? item.password : item.private_key);
            closeDropdown(item.id);
          }}
        >
          <ThemedText fontSize={14} className="text-white">
            Copy {type === "Login" ? "password" : "private key"}
          </ThemedText>
        </MenuOption>

        {type === "SSH+key" && (
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

  if (type !== "Login" && type !== "SSH+key") {
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
        <AddCredentialModal
          itemType={addCredentialType}
          onClose={() => setAddCredentialVisible(false)}
          onRefresh={async () => await fetchVaultItems()}
        />
      </ReactNativeModal>

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
          itemType={type === "Login" ? "login" : "ssh_key"}
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
          itemType={type === "Login" ? "login" : "ssh_key"}
          onClose={() => setEditCredentialVisible(false)}
          onRefresh={async () => await fetchVaultItems()}
          item={selectedItem}
        />
      </ReactNativeModal>

      <Header
        titleText={type.replaceAll("+", " ")}
        leftButtonText="My Vault"
        leftButtonBackImage={true}
        leftButtonTarget={ROUTES.USER.MY_VAULT.INDEX}
        searchText={searchText}
        onSearchTextChange={setSearchText}
      />

      <ScrollView
        className="flex-1 px-6 pt-4"
        refreshControl={
          Platform.OS !== "web" ? (
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          ) : undefined
        }
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
          <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg gap-2 mb-3">
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
      <View className="absolute bottom-0 right-0 px-6 pb-4">
        <AddItemModal
          dropdownVisible={dropdownVisible["add_item"] || false}
          callback={(e) => {
            if (e === "login" || e === "ssh_key") {
              setAddCredentialVisible(true);
              setAddCredentialType(e);
            }
          }}
          itemType={type === "Login" ? "login" : "ssh_key"}
        />
      </View>

      <FullScreenLoadingOverlay
        visible={isLoading}
        text={`Loading ${type.toLowerCase()} items...`}
      />
    </View>
  );
}
