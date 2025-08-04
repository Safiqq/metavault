import {
  FolderIcon,
  GlobalIcon,
  KeyIcon,
  MoreIcon,
  SearchNormalIcon,
  TrashIcon,
} from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Line } from "@/components/ui/Line";
import { MenuOption } from "@/components/ui/MenuOption";
import { AddCredentialModal } from "@/components/ui/Modal/AddCredentialModal";
import { AddFolderModal } from "@/components/ui/Modal/AddFolderModal";
import { AddItemModal } from "@/components/ui/Modal/AddItemModal";
import { EditFolderModal } from "@/components/ui/Modal/EditFolderModal";
import { FullScreenLoadingOverlay } from "@/components/ui/FullScreenLoadingOverlay";
import { RefreshableScrollView } from "@/components/ui/RefreshableScrollView";
import { ROUTES } from "@/constants/AppConstants";
import { useAlert } from "@/contexts/AlertProvider";
import { useAppState } from "@/contexts/AppStateProvider";
import { useClipboard } from "@/lib/clipboard";
import { FoldersRow } from "@/lib/types";
import {
  getFolders,
  deleteFolder,
  getCurrentUser,
} from "@/lib/supabase/database";
import { vaultManager } from "@/lib/vaultManager";
import { Href, router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import ReactNativeModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FolderItem extends FoldersRow {
  count: number;
}

export default function MyVaultScreen() {
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const [vaultsCount, setVaultsCount] = useState<{
    login: number;
    ssh_key: number;
    trash: number;
  }>({
    login: 0,
    ssh_key: 0,
    trash: 0,
  });
  const [foldersCount, setFoldersCount] = useState<Record<string, number>>({});
  const [folders, setFolders] = useState<FoldersRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [dropdownAddVisible, setDropdownAddVisible] = useState<boolean>(false);
  const [addFolderVisible, setAddFolderVisible] = useState<boolean>(false);
  const [addCredentialVisible, setAddCredentialVisible] =
    useState<boolean>(false);
  const [addCredentialType, setAddCredentialType] = useState<
    "login" | "ssh_key"
  >("login");

  const [selectedFolder, setSelectedFolder] = useState<FolderItem>();
  const [editFolderVisible, setEditFolderVisible] = useState<boolean>(false);
  const [isAlertShown, setIsAlertShown] = useState<boolean>(false);

  const { showAlert } = useAlert();
  const { copyToClipboard } = useClipboard();
  const { state } = useAppState();

  const initializeVaultIfNeeded = useCallback(async (): Promise<boolean> => {
    // Check if vault is already initialized
    console.log("vaultManager.isInitialized()", vaultManager.isInitialized());
    if (vaultManager.isInitialized()) {
      return true;
    }

    // Check if we have the necessary data to initialize
    if (!state.mnemonic || state.mnemonic.length === 0 || !state.email) {
      showAlert("Error", "Missing vault credentials. Please log in again.");
      return false;
    }

    // Show alert and initialize vault
    return new Promise<boolean>((resolve) => {
      setIsAlertShown(true);
      showAlert(
        "Preparing Your Vault",
        "After this, we'll derive your encryption keys from your seed phrase. This process may take a few moments.",
        [
          {
            text: "OK",
            onPress: async () => {
              try {
                setIsAlertShown(false);
                await vaultManager.initialize(state.mnemonic, state.email);
                resolve(true);
              } catch {
                showAlert(
                  "Error",
                  "Failed to initialize vault. Please try again.",
                  [
                    {
                      text: "OK",
                      onPress: () => setIsAlertShown(false),
                    },
                  ]
                );
                resolve(false);
              }
            },
          },
        ]
      );
    });
  }, [state, showAlert]);

  const fetchCounts = useCallback(async () => {
    try {
      // Initialize vault if needed
      const vaultReady = await initializeVaultIfNeeded();
      if (!vaultReady) return;

      // Get folders from database
      const user = await getCurrentUser();
      if (!user) return;

      const foldersData = await getFolders(user.id);
      setFolders(foldersData || []);

      // Get vault data from vaultManager
      const vaultData = vaultManager.getCachedVaultData();
      const trashData = vaultManager.getDeletedVaultData();
      console.log("vauldData", vaultData);
      if (!vaultData) return;

      // Count total vault items
      setVaultsCount({
        login: vaultData.filter((item) => item.item_type === "login").length,
        ssh_key: vaultData.filter((item) => item.item_type === "ssh_key")
          .length,
        trash: trashData.length,
      });

      // Count items per folder from vault data
      const combinedFoldersCount: { [key: string]: number } = {};

      vaultData.forEach((item) => {
        const folderId = item.folder_id;
        combinedFoldersCount[folderId] =
          (combinedFoldersCount[folderId] || 0) + 1;
      });

      setFoldersCount(combinedFoldersCount);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  }, [initializeVaultIfNeeded]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchCounts().finally(() => setIsLoading(false));
    }, [fetchCounts])
  );

  const toggleDropdown = (folderId: string) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const closeDropdown = (folderId: string) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [folderId]: false,
    }));
  };

  const handleDelete = async (folderId: string) => {
    showAlert("Delete Folder", "Are you sure you want to delete this folder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFolder(folderId);

            setFolders((prevFolders) =>
              prevFolders.filter((folder) => folder.id !== folderId)
            );
            showAlert("Success", "Folder deleted successfully");
          } catch (error) {
            console.error("Failed to delete folder:", error);
            showAlert("Error", "Failed to delete folder");
          }
        },
      },
    ]);
  };

  // Filter items based on search text
  const filteredTypes = () => {
    if (!searchText.trim()) return { showLogin: true, showSSHKey: true };

    const searchLower = searchText.toLowerCase();
    return {
      showLogin: "login".includes(searchLower),
      showSSHKey: "ssh key".includes(searchLower),
    };
  };

  const filteredFolders = () => {
    if (!searchText.trim()) return folders;

    const searchLower = searchText.toLowerCase();
    return folders.filter((folder) =>
      folder.name.toLowerCase().includes(searchLower)
    );
  };

  const showTrash = () => {
    if (!searchText.trim()) return true;

    const searchLower = searchText.toLowerCase();
    return "trash".includes(searchLower);
  };

  const hasSearchResults = () => {
    const types = filteredTypes();
    const folders = filteredFolders();
    const trash = showTrash();

    return types.showLogin || types.showSSHKey || folders.length > 0 || trash;
  };

  const renderFolder = (folder: FolderItem, index: number) => (
    <Pressable
      key={index}
      className="flex flex-row items-center justify-between"
      onPress={() =>
        router.push((ROUTES.USER.MY_VAULT.FOLDER + "/" + folder.id) as Href)
      }
    >
      <View className="flex flex-row items-center gap-3">
        <FolderIcon width={16} height={16} />
        <ThemedText fontSize={14}>{folder.name}</ThemedText>
      </View>
      <View className="flex flex-row gap-2 items-center">
        <ThemedText fontSize={14}>
          {isLoading ? "..." : folder.count}
        </ThemedText>
        <DropdownMenu
          visible={dropdownVisible[folder.id] || false}
          handleOpen={() => toggleDropdown(folder.id)}
          handleClose={() => closeDropdown(folder.id)}
          trigger={
            <MoreIcon width={16} height={16} className="cursor-pointer" />
          }
          pos="right"
        >
          <MenuOption
            onSelect={() => {
              closeDropdown(folder.id);
              router.push(`/myvault/folders/${folder.id}`);
            }}
          >
            <ThemedText fontSize={14} className="text-white">
              View
            </ThemedText>
          </MenuOption>

          <MenuOption
            onSelect={() => {
              closeDropdown(folder.id);
              setSelectedFolder(folder);
              setEditFolderVisible(true);
            }}
          >
            <ThemedText fontSize={14} className="text-white">
              Edit
            </ThemedText>
          </MenuOption>

          <MenuOption
            onSelect={async () => {
              await copyToClipboard(folder.name);
              closeDropdown(folder.id);
            }}
          >
            <ThemedText fontSize={14} className="text-white">
              Copy folder name
            </ThemedText>
          </MenuOption>

          {folders.length > 1 && (
            <MenuOption
              onSelect={() => {
                closeDropdown(folder.id);
                handleDelete(folder.id);
              }}
            >
              <ThemedText fontSize={14} className="text-[#FF4646]">
                Delete
              </ThemedText>
            </MenuOption>
          )}
        </DropdownMenu>
      </View>
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
        onSwipeComplete={async () => {
          setAddCredentialVisible(false);
        }}
        swipeDirection={["down"]}
        onBackdropPress={async () => {
          setAddCredentialVisible(false);
        }}
        style={{ margin: 0 }}
        animationInTiming={300}
        animationOutTiming={300}
      >
        <AddCredentialModal
          itemType={addCredentialType}
          onClose={() => setAddCredentialVisible(false)}
          onRefresh={async () => await fetchCounts()}
        />
      </ReactNativeModal>

      <ReactNativeModal
        isVisible={addFolderVisible}
        onSwipeComplete={async () => {
          setAddFolderVisible(false);
        }}
        swipeDirection={["down"]}
        onBackdropPress={async () => {
          setAddFolderVisible(false);
        }}
        style={{ margin: 0 }}
        animationInTiming={300}
        animationOutTiming={300}
      >
        <AddFolderModal
          onClose={() => setAddFolderVisible(false)}
          onRefresh={async () => await fetchCounts()}
        />
      </ReactNativeModal>

      <ReactNativeModal
        isVisible={editFolderVisible}
        onSwipeComplete={() => setEditFolderVisible(false)}
        swipeDirection={["down"]}
        onBackdropPress={() => setEditFolderVisible(false)}
        style={{ margin: 0 }}
        animationInTiming={300}
        animationOutTiming={300}
      >
        <EditFolderModal
          folder={selectedFolder}
          onClose={() => setEditFolderVisible(false)}
          onRefresh={async () => await fetchCounts()}
        />
      </ReactNativeModal>

      <View className="p-6 pb-5 border-b border-[#EBEBEB]">
        <View className="flex flex-row justify-between">
          <View className="w-8 h-8 bg-black rounded-full" />
        </View>

        <Spacer size={16} />

        <ThemedText fontSize={20} fontWeight={700}>
          My Vault
        </ThemedText>

        <Spacer size={16} />

        <View className="bg-[#EBEBEB] rounded-xl flex flex-row items-center gap-3 py-2 px-3">
          <SearchNormalIcon width={16} height={16} />
          <ThemedTextInput
            fontSize={14}
            className="flex-1 outline-none"
            placeholder="Search"
            placeholderTextColor="#4A5562"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <RefreshableScrollView
        className="flex-1 px-3 pt-4"
        onRefresh={fetchCounts}
      >
        {searchText.trim() && !hasSearchResults() ? (
          <View className="items-center py-12">
            <ThemedText fontSize={16} className="text-gray-600">
              No results found for &ldquo;{searchText}&rdquo;
            </ThemedText>
            <ThemedText fontSize={14} className="text-gray-500 mt-2">
              Try searching for types, folders, or trash
            </ThemedText>
          </View>
        ) : (
          <>
            {(filteredTypes().showLogin || filteredTypes().showSSHKey) && (
              <>
                <ThemedText fontSize={12} fontWeight={800}>
                  TYPES (
                  {(filteredTypes().showLogin ? 1 : 0) +
                    (filteredTypes().showSSHKey ? 1 : 0)}
                  )
                </ThemedText>

                <Spacer size={4} />

                <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg gap-4">
                  {filteredTypes().showLogin && (
                    <>
                      <Pressable
                        className="flex flex-row items-center justify-between"
                        onPress={() =>
                          router.push(ROUTES.USER.MY_VAULT.TYPES.LOGIN)
                        }
                      >
                        <View className="flex flex-row items-center gap-3">
                          <GlobalIcon width={16} height={16} />
                          <ThemedText fontSize={14}>Login</ThemedText>
                        </View>
                        <ThemedText fontSize={14}>
                          {isLoading ? "..." : vaultsCount.login}
                        </ThemedText>
                      </Pressable>
                      {filteredTypes().showSSHKey && <Line />}
                    </>
                  )}

                  {filteredTypes().showSSHKey && (
                    <Pressable
                      className="flex flex-row items-center justify-between"
                      onPress={() =>
                        router.push(ROUTES.USER.MY_VAULT.TYPES.SSH_KEY)
                      }
                    >
                      <View className="flex flex-row items-center gap-3">
                        <KeyIcon width={16} height={16} />
                        <ThemedText fontSize={14}>SSH key</ThemedText>
                      </View>
                      <ThemedText fontSize={14}>
                        {isLoading ? "..." : vaultsCount.ssh_key}
                      </ThemedText>
                    </Pressable>
                  )}
                </View>

                <Spacer size={16} />
              </>
            )}

            {!isLoading && filteredFolders().length > 0 && (
              <>
                <ThemedText fontSize={12} fontWeight={800}>
                  FOLDERS ({filteredFolders().length})
                </ThemedText>
                <Spacer size={4} />

                <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg gap-4">
                  {filteredFolders().map((folder, index) => {
                    const count = (foldersCount as any)[folder.id] || 0;
                    const folderWithCount = {
                      ...folder,
                      count: count,
                    };
                    return (
                      <React.Fragment key={index}>
                        {renderFolder(folderWithCount, index)}
                        {index < filteredFolders().length - 1 && <Line />}
                      </React.Fragment>
                    );
                  })}
                </View>

                <Spacer size={16} />
              </>
            )}

            {!searchText.trim() && folders.length === 0 && !isLoading && (
              <>
                <ThemedText fontSize={12} fontWeight={800}>
                  FOLDERS (0)
                </ThemedText>
                <Spacer size={4} />
                <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg items-center">
                  <ThemedText fontSize={14} className="text-gray-600">
                    No folders with items
                  </ThemedText>
                </View>
                <Spacer size={16} />
              </>
            )}

            {showTrash() && (
              <>
                <ThemedText fontSize={12} fontWeight={800}>
                  TRASH (1)
                </ThemedText>
                <Spacer size={4} />
                <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg gap-4">
                  <Pressable
                    className="flex flex-row items-center justify-between"
                    onPress={() => router.push(ROUTES.USER.MY_VAULT.TRASH)}
                  >
                    <View className="flex flex-row items-center gap-3">
                      <TrashIcon width={16} height={16} />
                      <ThemedText fontSize={14}>Trash</ThemedText>
                    </View>
                    <ThemedText fontSize={14}>
                      {isLoading ? "..." : vaultsCount.trash}
                    </ThemedText>
                  </Pressable>
                </View>
              </>
            )}
          </>
        )}

        <Spacer size={80} />
      </RefreshableScrollView>
      <View className="absolute bottom-0 right-0 px-6 pb-4">
        <AddItemModal
          dropdownVisible={dropdownAddVisible}
          setDropdownVisible={setDropdownAddVisible}
          callback={(e) => {
            if (e === "login" || e === "ssh_key") {
              setAddCredentialVisible(true);
              setAddCredentialType(e);
            } else {
              setAddFolderVisible(true);
            }
          }}
        />
      </View>

      <FullScreenLoadingOverlay
        visible={isLoading && !isAlertShown}
        text="Loading vault items..."
      />
    </View>
  );
}
