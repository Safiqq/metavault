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
import { AddCredential } from "@/components/ui/Modal/AddCredential";
import { AddFolder } from "@/components/ui/Modal/AddFolder";
import { AddItem } from "@/components/ui/Modal/AddItem";
import { EditFolder } from "@/components/ui/Modal/EditFolder";
import { ROUTES } from "@/constants/AppConstants";
import { useAlert } from "@/contexts/AlertProvider";
import { useClipboard } from "@/lib/clipboard";
import { supabase } from "@/lib/supabase";
import { FoldersRow } from "@/lib/types";
import { Href, router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
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
  const [loginsCount, setLoginsCount] = useState<number>(0);
  const [sshKeysCount, setSshKeysCount] = useState<number>(0);
  const [foldersCount, setFoldersCount] = useState<Record<string, number>>({});
  const [folders, setFolders] = useState<FoldersRow[]>([]);
  const [trashCount, setTrashCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [dropdownAddVisible, setDropdownAddVisible] = useState<boolean>(false);
  const [addFolderVisible, setAddFolderVisible] = useState<boolean>(false);
  const [addCredentialVisible, setAddCredentialVisible] =
    useState<boolean>(false);
  const [addCredentialType, setAddCredentialType] = useState<
    "login" | "ssh_key"
  >("login");

  const [selectedFolder, setSelectedFolder] = useState<FolderItem>();
  const [editFolderVisible, setEditFolderVisible] = useState<boolean>(false);

  const { showAlert } = useAlert();
  const { copyToClipboard } = useClipboard();

  const fetchCounts = useCallback(async () => {
    const { data: foldersData, error: foldersError } = await supabase
      .from("folders")
      .select()
      .order("name");
    if (foldersError) return;
    setFolders(foldersData || []);

    const { data: loginsData, error: loginsError } = await supabase
      .from("logins")
      .select()
      .is("deleted_at", null);
    if (loginsError) return;
    setLoginsCount(loginsData.length || 0);

    const { data: sshKeysData, error: sshKeysError } = await supabase
      .from("ssh_keys")
      .select()
      .is("deleted_at", null);
    if (sshKeysError) return;
    setSshKeysCount(sshKeysData.length || 0);

    const { count: deletedLoginsCount, error: deletedLoginsError } =
      await supabase
        .from("logins")
        .select("*", { count: "exact", head: true })
        .not("deleted_at", "is", null);
    if (deletedLoginsError) return;

    const { count: deletedSshKeysCount, error: deletedSshKeysError } =
      await supabase
        .from("ssh_keys")
        .select("*", { count: "exact", head: true })
        .not("deleted_at", "is", null);
    if (deletedSshKeysError) return;

    setTrashCount((deletedLoginsCount || 0) + (deletedSshKeysCount || 0));

    const loginFoldersCount = loginsData.reduce((acc, item) => {
      const folderId = item.folder_id;
      acc[folderId] = (acc[folderId] || 0) + 1;
      return acc;
    }, {});
    const sshKeyFoldersCount = sshKeysData.reduce((acc, item) => {
      const folderId = item.folder_id;
      acc[folderId] = (acc[folderId] || 0) + 1;
      return acc;
    }, {});

    const combinedFoldersCount: { [key: string]: number } = {};
    const allFolderIds = new Set([
      ...Object.keys(loginFoldersCount),
      ...Object.keys(sshKeyFoldersCount),
    ]);

    allFolderIds.forEach((folderId) => {
      combinedFoldersCount[folderId] =
        (loginFoldersCount[folderId] || 0) +
        (sshKeyFoldersCount[folderId] || 0);
    });

    setFoldersCount(combinedFoldersCount);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchCounts().finally(() => setIsLoading(false));
    }, [fetchCounts])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchCounts();
    setIsRefreshing(false);
  }, [fetchCounts]);

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
            const { error } = await supabase
              .from("folders")
              .delete()
              .eq("id", folderId);

            if (error) {
              throw new Error("Failed to delete folder from database.");
            }

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
      showSSHKey: "ssh key".includes(searchLower) || "ssh".includes(searchLower) || "key".includes(searchLower),
    };
  };

  const filteredFolders = () => {
    if (!searchText.trim()) return folders;
    
    const searchLower = searchText.toLowerCase();
    return folders.filter(folder => 
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
              await copyToClipboard(folder.name, "Name");
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
        <AddCredential
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
        <AddFolder
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
        <EditFolder
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

      <ScrollView
        className="flex-1 px-3 pt-4"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
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
                  TYPES ({(filteredTypes().showLogin ? 1 : 0) + (filteredTypes().showSSHKey ? 1 : 0)})
                </ThemedText>

                <Spacer size={4} />

                <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg gap-4">
                  {filteredTypes().showLogin && (
                    <>
                      <Pressable
                        className="flex flex-row items-center justify-between"
                        onPress={() => router.push(ROUTES.USER.MY_VAULT.TYPES.LOGIN)}
                      >
                        <View className="flex flex-row items-center gap-3">
                          <GlobalIcon width={16} height={16} />
                          <ThemedText fontSize={14}>Login</ThemedText>
                        </View>
                        <ThemedText fontSize={14}>
                          {isLoading ? "..." : loginsCount}
                        </ThemedText>
                      </Pressable>
                      {filteredTypes().showSSHKey && <Line />}
                    </>
                  )}

                  {filteredTypes().showSSHKey && (
                    <Pressable
                      className="flex flex-row items-center justify-between"
                      onPress={() => router.push(ROUTES.USER.MY_VAULT.TYPES.SSH_KEY)}
                    >
                      <View className="flex flex-row items-center gap-3">
                        <KeyIcon width={16} height={16} />
                        <ThemedText fontSize={14}>SSH key</ThemedText>
                      </View>
                      <ThemedText fontSize={14}>
                        {isLoading ? "..." : sshKeysCount}
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

            {!searchText.trim() && isLoading && (
              <>
                <ThemedText fontSize={12} fontWeight={800}>
                  FOLDERS (...)
                </ThemedText>
                <Spacer size={4} />
                <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg items-center">
                  <ThemedText fontSize={14} className="text-gray-600">
                    Loading folders...
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
                      {isLoading ? "..." : trashCount}
                    </ThemedText>
                  </Pressable>
                </View>
              </>
            )}
          </>
        )}

        <Spacer size={80} />
      </ScrollView>
      <View className="absolute bottom-0 right-0 px-6 pb-4">
        <AddItem
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
    </View>
  );
}
