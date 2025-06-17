import { CopyIcon, MoreIcon } from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { useAppState } from "@/contexts/AppStateProvider";
import { formatDate } from "@/lib/utils";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { Line } from "../Line";
import { MenuOption } from "../MenuOption";
import { useClipboard } from "@/lib/clipboard";

interface PasswordHistoryProps {
  callback: () => void;
}

export const PasswordHistory: React.FC<PasswordHistoryProps> = ({
  callback,
}) => {
  const [visible, setVisible] = useState<boolean>(false);

  const { state, setState } = useAppState();
  const { copyToClipboard } = useClipboard();

  const handleCopy = async (text: string) => {
    await copyToClipboard(text, "Passphrase");
  };

  const handleClear = () => {
    setVisible(false);
    setState({ ...state, generatorData: [] });
  };

  return (
    <View className="absolute bg-white w-full z-20 bottom-0 rounded-t-lg h-3/4">
      <View className="rounded-t-lg bg-[#EBEBEB] flex flex-row justify-between py-4 px-6 items-center">
        <View className="flex-1">
          <Pressable onPress={callback}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Close
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1 items-center">
          <ThemedText fontSize={14} fontWeight={700}>
            Password history
          </ThemedText>
        </View>
        <View className="flex-1 justify-center items-end">
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
        </View>
      </View>
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
            <ThemedText fontSize={14} className="text-gray-600 text-center py-2">
              No password history yet.
            </ThemedText>
          )}
        </View>
        <Spacer size={20} />
      </View>
    </View>
  );
};
