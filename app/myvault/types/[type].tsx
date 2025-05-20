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
import { useEffect, useState } from "react";
import { Header } from "@/components/ui/Header";
import { useLocalSearchParams } from "expo-router";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { MenuOption } from "@/components/ui/MenuOption";
import * as Clipboard from "expo-clipboard";
import { useAlert } from "@/contexts/AlertContext";

export default function VaultScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const [searchText, setSearchText] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const [copiedText, setCopiedText] = useState<string>("");

  const [vaultItems, setVaultItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { alert } = useAlert();

  useEffect(() => {
    const fetchVaultItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch vaults data with optional type filtering
        let url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/${type
          .toLowerCase()
          .replaceAll("+", "_")}s`;

        const response = await fetch(url, {
          headers: {
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch vault items: ${response.statusText}`
          );
        }

        const data = await response.json();
        setVaultItems(data);
      } catch (err) {
        console.error("Error fetching vault items:", err);
        setError(err.message);
        Alert.alert("Error", "Failed to load vault items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVaultItems();
  }, [type]);

  const filteredItems = vaultItems.filter((item) =>
    item.item_name?.toLowerCase().includes(searchText.toLowerCase())
  );

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

  // Handle copy actions
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await Clipboard.setStringAsync(text);
      // setCopiedText(`${type.replaceAll("+", " ")} copied!`);
      alert("", `${type.replaceAll("+", " ")} copied!`,null, 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  // Handle delete action
  const handleDelete = async (itemId: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(
              `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/${type
                .toLowerCase()
                .replaceAll("+", "_")}s?id=eq.${itemId}`,
              {
                method: "DELETE",
                headers: {
                  apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.ok) {
              // Remove item from local state
              setVaultItems((prev) =>
                prev.filter((item) => item.id !== itemId)
              );
              Alert.alert("Success", "Item deleted successfully");
            } else {
              throw new Error("Failed to delete item");
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete item");
          }
        },
      },
    ]);
  };

  const renderVaultItem = (item) => (
    <Pressable
      key={item.id}
      className="flex flex-row items-center justify-between"
    >
      <View className="flex-1">
        <ThemedText fontSize={14}>
          {item.item_name || "Unnamed Item"}
        </ThemedText>
      </View>

      <DropdownMenu
        visible={dropdownVisible[item.id] || false}
        handleOpen={() => toggleDropdown(item.id)}
        handleClose={() => closeDropdown(item.id)}
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
            closeDropdown(item.id);
            // Navigate to view/edit screen
            // router.push(`/item/${item.id}`);
          }}
        >
          <ThemedText fontSize={14} className="text-white">
            View
          </ThemedText>
        </MenuOption>

        <MenuOption
          onSelect={() => {
            closeDropdown(item.id);
            // Navigate to edit screen
            // router.push(`/edit/${item.id}`);
          }}
        >
          <ThemedText fontSize={14} className="text-white">
            Edit
          </ThemedText>
        </MenuOption>

        <MenuOption
          onSelect={async () => {
            await copyToClipboard(item.username_hash || "", "Username");
            closeDropdown(item.id);
          }}
        >
          <ThemedText fontSize={14} className="text-white">
            Copy username
          </ThemedText>
        </MenuOption>

        <MenuOption
          onSelect={async () => {
            await copyToClipboard(item.password_hash || "", "Password");
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

  return (
    <SafeAreaView
      className={`flex-1 w-full px-12 ${
        Platform.OS == "web" && "max-w-2xl mx-auto"
      }`}
    >
      <Header
        titleText={type.replaceAll("+", " ")}
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
                : "No items in this type"}
            </ThemedText>
          </View>
        ) : (
          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-1 mb-3">
            {filteredItems.map(renderVaultItem)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
