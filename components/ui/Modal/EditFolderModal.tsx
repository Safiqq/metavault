import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { useAlert } from "@/contexts/AlertProvider";
import { deleteFolder, updateFolder } from "@/lib/supabase/database";
import { FoldersRow } from "@/lib/types";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { MenuOption } from "../MenuOption";
import { ModalHeader } from "../ModalHeader";

import { MoreIcon } from "@/assets/images/icons";
import { useAppState } from "@/contexts/AppStateProvider";
import { useAuth } from "@/contexts/AuthProvider";

interface EditFolderModalProps {
  onClose: () => void;
  onRefresh: () => void;
  folder?: FoldersRow;
}

export const EditFolderModal: React.FC<EditFolderModalProps> = ({
  onClose,
  onRefresh,
  folder,
}) => {
  const [isMoreVisible, setIsMoreVisible] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>(folder?.name ?? "");

  const { showAlert } = useAlert();
  const { state } = useAppState();
  const { user } = useAuth();

  const isComplete = () => {
    return folderName !== "";
  };

  const handleSave = async () => {
    try {
      if (!state.mnemonic) return;

      if (!user?.id || !folder?.id) return;

      await updateFolder(folder?.id, { name: folderName });
      onClose();
      showAlert("Success", "Updated a folder.", [
        { text: "OK", onPress: onRefresh },
      ]);
    } catch (error) {
      console.error("Failed to save folder:", error);
      showAlert("Error", "Failed to save folder. Please try again.");
    }
  };

  const handleDelete = async () => {
    setIsMoreVisible(false);
    onClose();
    showAlert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          if (folder?.id) {
            await deleteFolder(folder.id);
          }
          showAlert("Success", "Deleted a folder.", [
            { text: "OK", onPress: onRefresh },
          ]);
        },
      },
    ]);
  };

  return (
    <View
      className={`flex-1 w-full rounded-t-lg bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ModalHeader title="Edit folder" onClose={onClose}>
        <View className="flex flex-row items-center gap-3">
          <Pressable onPress={handleSave} disabled={!isComplete()}>
            <ThemedText
              fontSize={14}
              className={isComplete() ? "text-[#0099FF]" : "text-[#999999]"}
            >
              Save
            </ThemedText>
          </Pressable>
          <DropdownMenu
            visible={isMoreVisible}
            handleOpen={() => setIsMoreVisible(true)}
            handleClose={() => setIsMoreVisible(false)}
            trigger={
              <MoreIcon width={16} height={16} className="cursor-pointer" />
            }
            pos="right"
          >
            <MenuOption
              onSelect={() => {
                setIsMoreVisible(false);
                onClose();
                handleDelete();
              }}
            >
              <ThemedText fontSize={14} className="text-[#FF4646]">
                Delete
              </ThemedText>
            </MenuOption>
          </DropdownMenu>
        </View>
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
