import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { MenuOption } from "../MenuOption";
import { Line } from "../Line";

interface PasswordHistoryProps {
  callback: () => void;
}

export const PasswordHistory: React.FC<PasswordHistoryProps> = ({
  callback,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <View className="absolute bg-white w-full z-20 bottom-0 rounded-t-lg h-3/4">
      <View className="rounded-t-lg bg-[#EBEBEB] flex flex-row justify-between py-3 px-6">
        <View className="flex-1">
          <Pressable onPress={callback}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Close
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1">
          <ThemedText
            fontSize={14}
            fontWeight={700}
            className="absolute w-full text-center"
          >
            Password history
          </ThemedText>
        </View>
        <View className="flex-1 justify-center items-end">
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
              }}
            >
              <ThemedText fontSize={14} className="text-white">
                Clear
              </ThemedText>
            </MenuOption>
          </DropdownMenu>
        </View>
      </View>
      <View className="bg-[#EBEBEB] mx-6 my-5 px-4 py-3 rounded-lg gap-2">
        <View>
          <View className="flex flex-row justify-between gap-4 items-center">
            <ThemedText fontSize={14}>
              Hedge
              <ThemedText fontSize={14} fontWeight={800}>
                0960
              </ThemedText>
            </ThemedText>
            <Image
              className="max-w-6 max-h-6"
              source={require("@/assets/images/copy.png")}
            />
          </View>
          <ThemedText fontSize={10} fontWeight={300}>
            25/04/2024 09:58
          </ThemedText>
        </View>

        <Line />

        <View>
          <View className="flex flex-row justify-between gap-4 items-center">
            <ThemedText fontSize={14}>
              johndoe+v
              <ThemedText fontSize={14} fontWeight={800}>
                2
              </ThemedText>
              jfy
              <ThemedText fontSize={14} fontWeight={800}>
                6
              </ThemedText>
              rc@gmail.com
            </ThemedText>
            <Image
              className="max-w-6 max-h-6"
              source={require("@/assets/images/copy.png")}
            />
          </View>
          <ThemedText fontSize={10} fontWeight={300}>
            25/04/2024 09:55
          </ThemedText>
        </View>

        <Line />

        <View>
          <View className="flex flex-row justify-between gap-4 items-center">
            <ThemedText fontSize={14}>
              Jumble-Coil
              <ThemedText fontSize={14} fontWeight={800}>
                6
              </ThemedText>
              -Copier-Lend-Krypton-Reassure-Guileless-Unreached-Entomb-Extradite-Resample-Retying
            </ThemedText>
            <Image
              className="max-w-6 max-h-6"
              source={require("@/assets/images/copy.png")}
            />
          </View>
          <ThemedText fontSize={10} fontWeight={300}>
            25/04/2024 09:50
          </ThemedText>
        </View>

        <Line />

        <View>
          <View className="flex flex-row justify-between gap-4 items-center">
            <ThemedText fontSize={14}>
              HMmABQJibO
              <ThemedText fontSize={14} fontWeight={800}>
                9
              </ThemedText>
              qhSM
            </ThemedText>
            <Image
              className="max-w-6 max-h-6"
              source={require("@/assets/images/copy.png")}
            />
          </View>
          <ThemedText fontSize={10} fontWeight={300}>
            22/04/2024 09:58
          </ThemedText>
        </View>
      </View>
    </View>
  );
};
