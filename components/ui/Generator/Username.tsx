import { Image, Pressable, ScrollView, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import React, { useState } from "react";
import { DropdownMenu } from "../DropdownMenu";
import { MenuOption } from "../MenuOption";
import { Switch } from "../Switch";
import { Line } from "../Line";

export function GeneratorUsername() {
  const [usernameGeneratorStates, setUsernameGeneratorStates] = useState({
    usernameType: "Plus addressed email",
    email: "",
    capitalize: false,
    includeNumber: false,
  });
  const [visible, setVisible] = useState(false);

  return (
    <ScrollView className="flex-1 mx-6 my-5">
      <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg flex flex-row items-center justify-between gap-4">
        {usernameGeneratorStates.usernameType == "Plus addressed email" && (
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
        )}
        {usernameGeneratorStates.usernameType == "Random word" && (
          <ThemedText fontSize={14}>
            Hedge
            <ThemedText fontSize={14} fontWeight={800}>
              0960
            </ThemedText>
          </ThemedText>
        )}
        <Image
          className="max-w-4 max-h-4 -mt-1"
          source={require("@/assets/images/programming-arrows.png")}
        />
      </View>

      <Spacer size={8} />

      <View className="rounded-full bg-black py-2">
        <ThemedText
          fontSize={14}
          fontWeight={700}
          className="text-white text-center"
        >
          Copy
        </ThemedText>
      </View>

      <Spacer size={16} />

      <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-2">
        <View className="flex">
          <ThemedText fontSize={12} fontWeight={800}>
            Username type
          </ThemedText>
          <DropdownMenu
            visible={visible}
            handleOpen={() => setVisible(true)}
            handleClose={() => setVisible(false)}
            trigger={
              <View className="flex flex-row justify-between items-center">
                <ThemedText fontSize={14}>
                  {usernameGeneratorStates.usernameType === "Plus addressed email"
                    ? "Plus addressed email"
                    : "Random word"}
                </ThemedText>
                <Image
                  className="max-w-4 max-h-4 -mt-1"
                  source={require("@/assets/images/arrow-down.png")}
                />
              </View>
            }
          >
            <MenuOption
              onSelect={() => {
                setVisible(false);
                setUsernameGeneratorStates({
                  ...usernameGeneratorStates,
                  usernameType: "Plus addressed email",
                });
              }}
            >
              <ThemedText fontSize={14} className="text-white">
                Plus addressed email
              </ThemedText>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                setVisible(false);
                setUsernameGeneratorStates({
                  ...usernameGeneratorStates,
                  usernameType: "Random word",
                });
              }}
            >
              <ThemedText fontSize={14} className="text-white">
                Random word
              </ThemedText>
            </MenuOption>
          </DropdownMenu>
        </View>
        {usernameGeneratorStates.usernameType == "Plus addressed email" && (
          <>
            <Line />

            <ThemedText fontSize={14} fontWeight={600}>
              Use your email provider's subaddress capabilities
            </ThemedText>
          </>
        )}
      </View>

      <Spacer size={8} />

      {usernameGeneratorStates.usernameType == "Plus addressed email" && (
        <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-2">
          <View className="flex">
            <ThemedText fontSize={12} fontWeight={800}>
              Email (required)
            </ThemedText>
            <ThemedText fontSize={14}>johndoe@gmail.com</ThemedText>
          </View>
        </View>
      )}
      {usernameGeneratorStates.usernameType == "Random word" && (
        <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg gap-2">
          <View className="flex flex-row items-center justify-between">
            <ThemedText fontSize={14}>Capitalize</ThemedText>
            <Switch
              state={usernameGeneratorStates.capitalize}
              callback={() =>
                setUsernameGeneratorStates({
                  ...usernameGeneratorStates,
                  capitalize: !usernameGeneratorStates.capitalize,
                })
              }
            />
          </View>

          <Line />

          <View className="flex flex-row items-center justify-between">
            <ThemedText fontSize={14}>Include number</ThemedText>
            <Switch
              state={usernameGeneratorStates.includeNumber}
              callback={() =>
                setUsernameGeneratorStates({
                  ...usernameGeneratorStates,
                  includeNumber: !usernameGeneratorStates.includeNumber,
                })
              }
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
