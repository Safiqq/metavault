import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { MenuOption } from "../MenuOption";

interface EditFolderProps {
  folderName: string;
  callback: () => void;
}

export const EditFolder: React.FC<EditFolderProps> = ({
  folderName,
  callback,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <View className="absolute bg-white w-full z-20 bottom-0 rounded-t-lg h-3/4">
      <View className="rounded-t-lg bg-[#EBEBEB] flex flex-row justify-between py-3 px-6">
        <View className="flex-1">
          <Pressable onPress={callback}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Cancel
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1">
          <ThemedText
            fontSize={14}
            fontWeight={700}
            className="absolute w-full text-center"
          >
            Edit folder
          </ThemedText>
        </View>
        <View className="flex flex-row flex-1 justify-end items-center gap-3">
          <Pressable onPress={callback}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Save
            </ThemedText>
          </Pressable>
          <DropdownMenu
            visible={visible}
            handleOpen={() => setVisible(true)}
            handleClose={() => setVisible(false)}
            trigger={
              <Image
                className="max-w-6 max-h-6"
                source={require("@/assets/images/more.png")}
              />
            }
            pos="right"
          >
            <MenuOption
              onSelect={() => {
                setVisible(false);
                callback();
              }}
            >
              <ThemedText fontSize={14} className="text-[#FF4646]">
                Delete
              </ThemedText>
            </MenuOption>
          </DropdownMenu>
        </View>
      </View>
      <View className="bg-[#EBEBEB] mx-6 my-5 px-4 py-3 rounded-lg gap-2">
        <ThemedText fontSize={12} fontWeight={800}>Name</ThemedText>
        <ThemedText fontSize={14}>{folderName}</ThemedText>
      </View>
    </View>
  );
};
