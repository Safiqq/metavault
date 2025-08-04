import { CopyIcon, MoreIcon } from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { useAppState } from "@/contexts/AppStateProvider";
import { formatDate } from "@/lib/utils";
import React, { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { Line } from "../Line";
import { MenuOption } from "../MenuOption";
import { ModalHeader } from "../ModalHeader";
import { useClipboard } from "@/lib/clipboard";

interface PasswordHistoryModalProps {
  callback: () => void;
}

export const PasswordHistoryModal: React.FC<PasswordHistoryModalProps> = ({
  callback,
}) => {
  const [visible, setVisible] = useState<boolean>(false);

  const { state, setState } = useAppState();
  const { copyToClipboard } = useClipboard();

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
  };

  const handleClear = () => {
    setVisible(false);
    setState({ ...state, generatorData: [] });
  };

  return (
    <View
      className={`flex-1 w-full rounded-t-lg bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ModalHeader title="Password history" onClose={callback}>
        <DropdownMenu
          visible={visible}
          handleOpen={() => setVisible(true)}
          handleClose={() => setVisible(false)}
          trigger={
            <MoreIcon width={24} height={24} className="cursor-pointer" />
          }
          pos="right"
        >
          <MenuOption onSelect={handleClear}>
            <ThemedText fontSize={14} className="text-white">
              Clear
            </ThemedText>
          </MenuOption>
        </DropdownMenu>
      </ModalHeader>
      <View className="mx-6">
        <Spacer size={20} />
        <View className="bg-[#EBEBEB] px-4 py-4 rounded-lg gap-2">
          {state.generatorData.length > 0 ? (
            state.generatorData.toReversed().map((item, index) => (
              <React.Fragment key={index}>
                <View>
                  <View className="flex flex-row justify-between gap-4 items-center">
                    <ThemedText fontSize={14}>{item.text}</ThemedText>
                    <Pressable onPress={() => handleCopy(item.text)}>
                      <CopyIcon width={24} height={24} />
                    </Pressable>
                  </View>
                  <Spacer size={4} />
                  <ThemedText fontSize={10} fontWeight={300}>
                    {formatDate(item.createdAt)}
                  </ThemedText>
                </View>
                {index < state.generatorData.length - 1 && <Line />}
              </React.Fragment>
            ))
          ) : (
            <ThemedText
              fontSize={14}
              className="text-gray-600 text-center py-2"
            >
              No password history yet.
            </ThemedText>
          )}
        </View>
        <Spacer size={20} />
      </View>
    </View>
  );
};
