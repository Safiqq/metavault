import { Image, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { Line } from "@/components/ui/Line";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";

export default function MyVaultScreen() {
  const [searchText, setSearchText] = useState<string>("");
  const [loginCount, setLoginCount] = useState(0);
  const [sshKeyCount, setSshKeyCount] = useState(0);
  const [folderCounts, setFolderCounts] = useState({});
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);

        // Fetch all folders first
        const foldersResponse = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/folders?select=id,name`,
          {
            headers: {
              apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
              "Content-Type": "application/json",
            },
          }
        );

        let foldersData = [];
        if (foldersResponse.ok) {
          foldersData = await foldersResponse.json();
          setFolders(foldersData);
          console.log("Folders fetched:", foldersData);
        }

        // Fetch login counts
        const loginResponse = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/logins?select=folder_id`,
          {
            headers: {
              apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
              "Content-Type": "application/json",
            },
          }
        );

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          setLoginCount(loginData.length);
          console.log("Login data fetched:", loginData);

          // Group logins by folder_id (UUIDs are strings, keep them as strings)
          const loginFolderCounts = loginData.reduce((acc, item) => {
            const folderId = item.folder_id || "null"; // Use string "null" instead of null
            acc[folderId] = (acc[folderId] || 0) + 1;
            return acc;
          }, {});
          console.log("Login folder counts:", loginFolderCounts);

          // Fetch SSH key counts
          const sshResponse = await fetch(
            `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/ssh_keys?select=folder_id`,
            {
              headers: {
                apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
                "Content-Type": "application/json",
              },
            }
          );

          if (sshResponse.ok) {
            const sshData = await sshResponse.json();
            setSshKeyCount(sshData.length);
            console.log("SSH data fetched:", sshData);

            // Group SSH keys by folder_id (UUIDs are strings, keep them as strings)
            const sshFolderCounts = sshData.reduce((acc, item) => {
              const folderId = item.folder_id || "null"; // Use string "null" instead of null
              acc[folderId] = (acc[folderId] || 0) + 1;
              return acc;
            }, {});
            console.log("SSH folder counts:", sshFolderCounts);

            // Combine login and SSH key counts by folder
            const combinedFolderCounts = {};

            // Get all unique folder IDs from both tables
            const allFolderIds = new Set([
              ...Object.keys(loginFolderCounts),
              ...Object.keys(sshFolderCounts),
            ]);

            allFolderIds.forEach((folderId) => {
              // Don't parse UUIDs as integers - keep them as strings
              const folderIdKey = folderId === "null" ? null : folderId;
              combinedFolderCounts[folderIdKey] =
                (loginFolderCounts[folderId] || 0) + (sshFolderCounts[folderId] || 0);
            });

            console.log("Combined folder counts:", combinedFolderCounts);
            setFolderCounts(combinedFolderCounts);
          }
        }
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Get folders that have items, including "No folder" if there are items without folder_id
  const getFoldersWithItems = () => {
    const foldersWithItems = [];

    // Add existing folders that have items
    folders.forEach((folder) => {
      const count = folderCounts[folder.id] || 0;
      if (count > 0) {
        foldersWithItems.push({
          id: folder.id,
          name: folder.name,
          count: count,
        });
      }
    });

    // Add "No folder" if there are items without folder_id
    const noFolderCount = folderCounts[null] || 0;
    if (noFolderCount > 0) {
      foldersWithItems.push({
        id: null,
        name: "No folder",
        count: noFolderCount,
      });
    }

    console.log("Folders with items:", foldersWithItems);
    return foldersWithItems;
  };

  const renderFolderItem = (folder, index, totalFolders) => (
    <View key={folder.id || "no-folder"}>
      <Pressable
        className="flex flex-row items-center justify-between"
        onPress={() =>
          router.push(`/myvault/folders/${folder.id || "no-folder"}`)
        }
      >
        <View className="flex flex-row items-center gap-3">
          <Image
            className="max-w-4 max-h-4"
            source={require("@/assets/images/folder.png")}
          />
          <ThemedText fontSize={14}>{folder.name}</ThemedText>
        </View>
        <ThemedText fontSize={14}>{loading ? "..." : folder.count}</ThemedText>
      </Pressable>
      {index < totalFolders - 1 && <Line />}
    </View>
  );

  const foldersWithItems = getFoldersWithItems();

  return (
    <SafeAreaView
      className={`flex-1 w-full px-12 ${
        Platform.OS == "web" && "max-w-2xl mx-auto"
      }`}
    >
      <View className="p-6 pb-5 border-b border-[#EBEBEB]">
        <View className="flex flex-row justify-between">
          <View className="w-8 h-8 bg-black rounded-full" />
          <Image
            className="max-w-6 max-h-6"
            source={require("@/assets/images/more.png")}
          />
        </View>

        <Spacer size={16} />

        <ThemedText fontSize={20} fontWeight={700}>
          My Vault
        </ThemedText>

        <Spacer size={16} />

        <View className="bg-[#EBEBEB] rounded-xl flex flex-row items-center gap-3 py-2 px-3">
          <Image
            className="max-w-4 max-h-4"
            source={require("@/assets/images/search-normal.png")}
          />
          <ThemedTextInput
            fontSize={14}
            className="flex-1 outline-none"
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        </View>
      </View>

      <ScrollView className="flex-1 mx-6 my-5">
        <ThemedText fontSize={12} fontWeight={800}>
          TYPES (2)
        </ThemedText>

        <Spacer size={4} />

        <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-2">
          <Pressable
            className="flex flex-row items-center justify-between"
            onPress={() => router.push("/myvault/types/Login")}
          >
            <View className="flex flex-row items-center gap-3">
              <Image
                className="max-w-4 max-h-4"
                source={require("@/assets/images/global.png")}
              />
              <ThemedText fontSize={14}>Login</ThemedText>
            </View>
            <ThemedText fontSize={14}>{loading ? "..." : loginCount}</ThemedText>
          </Pressable>

          <Line />

          <Pressable
            className="flex flex-row items-center justify-between"
            onPress={() => router.push("/myvault/types/SSH+key")}
          >
            <View className="flex flex-row items-center gap-3">
              <Image
                className="max-w-4 max-h-4"
                source={require("@/assets/images/key.png")}
              />
              <ThemedText fontSize={14}>SSH key</ThemedText>
            </View>
            <ThemedText fontSize={14}>{loading ? "..." : sshKeyCount}</ThemedText>
          </Pressable>
        </View>

        <Spacer size={16} />

        <ThemedText fontSize={12} fontWeight={800}>
          FOLDERS ({loading ? "..." : foldersWithItems.length})
        </ThemedText>
        <Spacer size={4} />

        {foldersWithItems.length > 0 ? (
          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-2">
            {foldersWithItems.map((folder, index) =>
              renderFolderItem(folder, index, foldersWithItems.length)
            )}
          </View>
        ) : loading ? (
          <View className="bg-[#EBEBEB] py-8 px-4 rounded-lg items-center">
            <ThemedText fontSize={14} className="text-gray-600">
              Loading folders...
            </ThemedText>
          </View>
        ) : (
          <View className="bg-[#EBEBEB] py-8 px-4 rounded-lg items-center">
            <ThemedText fontSize={14} className="text-gray-600">
              No folders with items
            </ThemedText>
          </View>
        )}

        <Spacer size={16} />

        <ThemedText fontSize={12} fontWeight={800}>
          TRASH (1)
        </ThemedText>
        <Spacer size={4} />
        <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-3">
          <Pressable
            className="flex flex-row items-center justify-between"
            onPress={() => router.push("/myvault/trash")}
          >
            <View className="flex flex-row items-center gap-3">
              <Image
                className="max-w-4 max-h-4"
                source={require("@/assets/images/trash.png")}
              />
              <ThemedText fontSize={14}>Trash</ThemedText>
            </View>
            <ThemedText fontSize={14}>0</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}