import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { useAlert } from "@/contexts/AlertProvider";
import { insertFolder } from "@/lib/supabase/database";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";

import { useAppState } from "@/contexts/AppStateProvider";
import { useAuth } from "@/contexts/AuthProvider";
import { ModalHeader } from "../ModalHeader";

interface AddFolderModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export const AddFolderModal: React.FC<AddFolderModalProps> = ({
  onClose,
  onRefresh,
}) => {
  const [folderName, setFolderName] = useState<string>("");

  const { showAlert } = useAlert();
  const { state } = useAppState();
  const { user } = useAuth();

  const handleSave = async () => {
    try {
      if (!state.mnemonic) return;

      const userId = user?.id;
      if (!userId) return;

      await insertFolder({
        user_id: userId,
        name: folderName,
      });
      onClose();
      showAlert("Success", "Added a new folder.", [
        { text: "OK", onPress: onRefresh },
      ]);
    } catch (error) {
      console.error("Failed to save folder:", error);
      showAlert("Error", "Failed to save folder. Please try again.");
    }
  };

  const isComplete = () => {
    return folderName !== "";
  };

  return (
    <View
      className={`flex-1 w-full rounded-t-lg bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ModalHeader title="Add new folder" onClose={onClose}>
        <Pressable onPress={handleSave} disabled={!isComplete()}>
          <ThemedText
            fontSize={14}
            className={isComplete() ? "text-[#0099FF]" : "text-[#999999]"}
          >
            Save
          </ThemedText>
        </Pressable>
      </ModalHeader>

      <ScrollView>
        <View className="mx-6">
          <Spacer size={20} />
          <ThemedText fontSize={12} fontWeight={800}>
            ITEM DETAILS
          </ThemedText>

          <Spacer size={4} />

          <View className="bg-[#EBEBEB] px-4 py-4 rounded-lg gap-2">
            <View>
              <ThemedText fontSize={12} fontWeight={800}>
                Folder name
              </ThemedText>
              <View className="flex flex-row gap-2 items-center">
                <ThemedTextInput
                  fontSize={14}
                  className="flex-1 outline-none"
                  placeholder="Enter your folder name"
                  value={folderName}
                  onChangeText={(e) => setFolderName(e)}
                />
              </View>
            </View>
          </View>
          <Spacer size={20} />
        </View>
      </ScrollView>
    </View>
  );
};
