import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { useAlert } from "@/contexts/AlertProvider";
import { supabase } from "@/lib/supabase";
import { FoldersRow } from "@/lib/types";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { MenuOption } from "../MenuOption";

import { MoreIcon } from "@/assets/images/icons";
import { useAppState } from "@/contexts/AppStateProvider";
import { useAuth } from "@/contexts/AuthProvider";

interface EditFolderProps {
  onClose: () => void;
  onRefresh: () => void;
  folder?: FoldersRow;
}

export const EditFolder: React.FC<EditFolderProps> = ({
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

      const userId = user?.id;
      if (!userId) return;

      const { error } = await supabase
        .from("folders")
        .update({
          name: folderName,
        })
        .eq("id", folder?.id);
      if (error) {
        throw error;
      }
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
          await supabase.from("folders").delete().eq("id", folder?.id);
          showAlert("Success", "Deleted a folder.", [
            { text: "OK", onPress: onRefresh },
          ]);
        },
      },
    ]);
  };

  return (
    <View className="absolute bg-white w-full z-20 bottom-0 rounded-t-lg h-3/4">
      <View className="rounded-t-lg bg-[#EBEBEB] flex flex-row justify-between py-4 px-6 items-center">
        <View className="flex-1">
          <Pressable onPress={onClose}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Close
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1 items-center">
          <ThemedText fontSize={14} fontWeight={700}>
            Edit folder
          </ThemedText>
        </View>
        <View className="flex-1 items-end">
          <View className="flex flex-row items-center gap-3">
            <Pressable onPress={handleSave} disabled={!isComplete()}>
              <ThemedText
                fontSize={14}
                className={isComplete() ? "text-[#0099FF]" : "text-black/40"}
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
        </View>
      </View>

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
