import { ArrowDownIcon, ProgrammingArrowsIcon } from "@/assets/images/icons";
import { BIP39_WORDLISTS } from "@/assets/wordlists";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import ThemedTextWithBoldNumbers from "@/components/ThemedTextWithBoldNumbers";
import { APP_CONSTANTS } from "@/constants/AppConstants";
import { useAlert } from "@/contexts/AlertProvider";
import { useAppState } from "@/contexts/AppStateProvider";
import { useClipboard } from "@/lib/clipboard";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Button } from "../Button";
import { DropdownMenu } from "../DropdownMenu";
import { Line } from "../Line";
import { MenuOption } from "../MenuOption";
import { Switch } from "../Switch";

interface UsernameGeneratorState {
  usernameType: "Plus addressed email" | "Random word";
  email: string;
  capitalize: boolean;
  includeNumber: boolean;
}

export function GeneratorUsername() {
  const [usernameGeneratorStates, setUsernameGeneratorStates] =
    useState<UsernameGeneratorState>({
      usernameType: "Plus addressed email",
      email: "",
      capitalize: false,
      includeNumber: false,
    });
  const [visible, setVisible] = useState<boolean>(false);
  const [generatedUsername, setGeneratedUsername] = useState<string>("");

  const { copyToClipboard } = useClipboard();
  const { showAlert } = useAlert();
  const { state, setState } = useAppState();

  // Function to generate the plus-addressed email
  const generatePlusAddressedEmail = useCallback(() => {
    const { email } = usernameGeneratorStates;
    if (!email) {
      return "";
    }
    const [localPart, domain] = email.split("@");
    const randomStringLength = 6; // Length of the random string after '+'
    const characters = APP_CONSTANTS.CHARACTER_SETS.ALPHANUMERIC;
    let randomString = "";
    for (let i = 0; i < randomStringLength; i++) {
      randomString += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return `${localPart}+${randomString}@${domain ?? ""}`;
  }, [usernameGeneratorStates]);

  // Function to generate a random word username
  const generateRandomWordUsername = useCallback(() => {
    let word =
      BIP39_WORDLISTS[Math.floor(Math.random() * BIP39_WORDLISTS.length)];
    let number = "";

    if (word && usernameGeneratorStates.capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }

    if (usernameGeneratorStates.includeNumber) {
      number = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0"); // 0000-9999
    }
    return `${word}${number}`;
  }, [usernameGeneratorStates]);

  // Effect to generate username whenever relevant states change
  useEffect(() => {
    if (usernameGeneratorStates.usernameType === "Plus addressed email") {
      setGeneratedUsername(generatePlusAddressedEmail());
    } else {
      setGeneratedUsername(generateRandomWordUsername());
    }
  }, [
    usernameGeneratorStates,
    generatePlusAddressedEmail,
    generateRandomWordUsername,
  ]);

  const handleCopyUsername = useCallback(() => {
    if (!generatedUsername) {
      showAlert("Error", "No username generated. Please check your settings.");
      return;
    }

    copyToClipboard(generatedUsername, "Username");
    setState({
      ...state,
      generatorData: [
        ...state.generatorData,
        {
          text: generatedUsername,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }, [generatedUsername, copyToClipboard, setState, state, showAlert]);

  return (
    <ScrollView className="flex-1 px-6 py-5">
      <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg">
        <View className="flex flex-row items-start gap-4">
          <View className="flex-1">
            <ThemedTextWithBoldNumbers text={generatedUsername} />
          </View>
          <Pressable
            onPress={() => {
              if (
                usernameGeneratorStates.usernameType === "Plus addressed email"
              ) {
                setGeneratedUsername(generatePlusAddressedEmail());
              } else {
                setGeneratedUsername(generateRandomWordUsername());
              }
            }}
          >
            <ProgrammingArrowsIcon width={20} height={20} />
          </Pressable>
        </View>
      </View>

      <Spacer size={8} />

      <Button text="Copy" type="primary-rounded" onPress={handleCopyUsername} />

      <Spacer size={16} />

      <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg gap-3">
        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Username type</ThemedText>
          <DropdownMenu
            visible={visible}
            handleOpen={() => setVisible(true)}
            handleClose={() => setVisible(false)}
            trigger={
              <View className="flex flex-row items-center gap-2 cursor-pointer">
                <ThemedText fontSize={14}>
                  {usernameGeneratorStates.usernameType}
                </ThemedText>
                <ArrowDownIcon width={16} height={16} />
              </View>
            }
          >
            <MenuOption
              onSelect={() => {
                setVisible(false);
                setUsernameGeneratorStates((prev) => ({
                  ...prev,
                  usernameType: "Plus addressed email",
                }));
              }}
            >
              <ThemedText fontSize={14} className="text-white">
                Plus addressed email
              </ThemedText>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                setVisible(false);
                setUsernameGeneratorStates((prev) => ({
                  ...prev,
                  usernameType: "Random word",
                }));
              }}
            >
              <ThemedText fontSize={14} className="text-white">
                Random word
              </ThemedText>
            </MenuOption>
          </DropdownMenu>
        </View>

        {usernameGeneratorStates.usernameType === "Plus addressed email" && (
          <>
            <Line />
            <View>
              <ThemedText fontSize={12} fontWeight={800}>
                Email address
              </ThemedText>
              <ThemedTextInput
                fontSize={14}
                className="flex-1 outline-none"
                placeholder="Enter your email address"
                value={usernameGeneratorStates.email}
                onChangeText={(text) =>
                  setUsernameGeneratorStates((prev) => ({
                    ...prev,
                    email: text,
                  }))
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </>
        )}

        {usernameGeneratorStates.usernameType === "Random word" && (
          <>
            <Line />
            <View className="flex flex-row items-center justify-between">
              <ThemedText fontSize={14}>Capitalize</ThemedText>
              <Switch
                state={usernameGeneratorStates.capitalize}
                callback={() =>
                  setUsernameGeneratorStates((prev) => ({
                    ...prev,
                    capitalize: !prev.capitalize,
                  }))
                }
              />
            </View>

            <Line />

            <View className="flex flex-row items-center justify-between">
              <ThemedText fontSize={14}>Include number</ThemedText>
              <Switch
                state={usernameGeneratorStates.includeNumber}
                callback={() =>
                  setUsernameGeneratorStates((prev) => ({
                    ...prev,
                    includeNumber: !prev.includeNumber,
                  }))
                }
              />
            </View>
          </>
        )}
      </View>

      <Spacer size={16} />

      <Spacer size={32} />
    </ScrollView>
  );
}
