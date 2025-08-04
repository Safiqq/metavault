import { Pressable, ScrollView, View } from "react-native";
import { Slider } from "../Slider";

import {
  AddCircleIcon,
  MinusCircleIcon,
  ProgrammingArrowsIcon,
} from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import ThemedTextWithBoldNumbers from "@/components/ThemedTextWithBoldNumbers";
import { APP_CONSTANTS } from "@/constants/AppConstants";
import { useAppState } from "@/contexts/AppStateProvider";
import { useClipboard } from "@/lib/clipboard";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../Button";
import { Line } from "../Line";
import { Switch } from "../Switch";

interface PasswordGeneratorState {
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  avoidAmbiguous: boolean;
  minimumUppercase: number;
  minimumLowercase: number;
  minimumNumbers: number;
  minimumSpecial: number;
}

export function GeneratorPassword() {
  const [sliderValue, setSliderValue] = useState<number>(
    APP_CONSTANTS.DEFAULT_PASSWORD_LENGTH
  );
  const [passwordGeneratorStates, setPasswordGeneratorStates] =
    useState<PasswordGeneratorState>({
      uppercase: true,
      lowercase: true,
      number: true,
      special: false,
      avoidAmbiguous: false,
      minimumUppercase: 1,
      minimumLowercase: 1,
      minimumNumbers: 1,
      minimumSpecial: 0,
    });
  const [generatedPassword, setGeneratedPassword] = useState<string>("");

  const { copyToClipboard } = useClipboard();
  const { state, setState } = useAppState();

  const onValueChange = (value: number) => {
    const roundedValue = Math.round(value);
    setSliderValue(roundedValue);
    setPasswordGeneratorStates((prevStates) => {
      // Calculate total of all minimums
      const totalMinimums =
        prevStates.minimumUppercase +
        prevStates.minimumLowercase +
        prevStates.minimumNumbers +
        prevStates.minimumSpecial;

      // If current totals exceed new length, proportionally reduce them
      if (totalMinimums > roundedValue) {
        const ratio = roundedValue / totalMinimums;
        const newMinUppercase = Math.floor(prevStates.minimumUppercase * ratio);
        const newMinLowercase = Math.floor(prevStates.minimumLowercase * ratio);
        const newMinNumbers = Math.floor(prevStates.minimumNumbers * ratio);
        const newMinSpecial = Math.floor(prevStates.minimumSpecial * ratio);

        // Ensure we don't exceed the total length
        const adjustedTotal =
          newMinUppercase + newMinLowercase + newMinNumbers + newMinSpecial;
        const remaining = roundedValue - adjustedTotal;

        return {
          ...prevStates,
          minimumUppercase: newMinUppercase,
          minimumLowercase: newMinLowercase,
          minimumNumbers: newMinNumbers,
          minimumSpecial: Math.min(newMinSpecial + remaining, newMinSpecial),
        };
      }

      return prevStates;
    });
  };

  const generatePassword = useCallback(() => {
    let charset = "";
    let generatedPassword = "";

    const uppercaseChars = APP_CONSTANTS.CHARACTER_SETS.UPPERCASE;
    const lowercaseChars = APP_CONSTANTS.CHARACTER_SETS.LOWERCASE;
    const numberChars = APP_CONSTANTS.CHARACTER_SETS.NUMBERS;
    const specialChars = APP_CONSTANTS.CHARACTER_SETS.SPECIAL;
    const ambiguousChars = APP_CONSTANTS.CHARACTER_SETS.AMBIGUOUS;

    // Build the character set based on active states
    if (passwordGeneratorStates.uppercase) charset += uppercaseChars;
    if (passwordGeneratorStates.lowercase) charset += lowercaseChars;
    if (passwordGeneratorStates.number) charset += numberChars;
    if (passwordGeneratorStates.special) charset += specialChars;

    // --- Validation: Ensure at least one character type is enabled ---
    if (charset.length === 0) {
      // If no character types are enabled, default to lowercase for a basic password
      charset = lowercaseChars;
      // Optionally, you might want to alert the user or disable the generate button
      // Or you could set a default state, e.g., set lowercase to true
      // setPasswordGeneratorStates(prev => ({ ...prev, lowercase: true }));
    }

    if (passwordGeneratorStates.avoidAmbiguous) {
      charset = charset
        .split("")
        .filter((char) => !ambiguousChars.includes(char))
        .join("");
    }

    // Ensure minimum uppercase characters
    for (let i = 0; i < passwordGeneratorStates.minimumUppercase; i++) {
      if (passwordGeneratorStates.uppercase && uppercaseChars.length > 0) {
        generatedPassword += uppercaseChars.charAt(
          Math.floor(Math.random() * uppercaseChars.length)
        );
      }
    }

    // Ensure minimum lowercase characters
    for (let i = 0; i < passwordGeneratorStates.minimumLowercase; i++) {
      if (passwordGeneratorStates.lowercase && lowercaseChars.length > 0) {
        generatedPassword += lowercaseChars.charAt(
          Math.floor(Math.random() * lowercaseChars.length)
        );
      }
    }

    // Ensure minimum numbers
    for (let i = 0; i < passwordGeneratorStates.minimumNumbers; i++) {
      if (passwordGeneratorStates.number && numberChars.length > 0) {
        generatedPassword += numberChars.charAt(
          Math.floor(Math.random() * numberChars.length)
        );
      }
    }

    // Ensure minimum special characters
    for (let i = 0; i < passwordGeneratorStates.minimumSpecial; i++) {
      if (passwordGeneratorStates.special && specialChars.length > 0) {
        generatedPassword += specialChars.charAt(
          Math.floor(Math.random() * specialChars.length)
        );
      }
    }

    // Fill the rest with random characters from the charset
    const remainingLength = sliderValue - generatedPassword.length;
    for (let i = 0; i < remainingLength; i++) {
      if (charset.length > 0) {
        generatedPassword += charset.charAt(
          Math.floor(Math.random() * charset.length)
        );
      }
    }

    // Shuffle the password to avoid predictable patterns
    const shuffledPassword = generatedPassword
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setGeneratedPassword(shuffledPassword);
  }, [sliderValue, passwordGeneratorStates]);

  const handleCopyPassword = () => {
    copyToClipboard(generatedPassword, "Password");
    setState({
      ...state,
      generatorData: [
        ...state.generatorData,
        {
          text: generatedPassword,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  };

  useEffect(() => {
    generatePassword();
  }, [sliderValue, passwordGeneratorStates, generatePassword]);

  return (
    <ScrollView className="flex-1 px-6 py-5">
      {/* Generated Password - Top Section */}
      <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg">
        <View className="flex flex-row items-start gap-4">
          <View className="flex-1">
            <ThemedTextWithBoldNumbers text={generatedPassword} />
          </View>
          <Pressable onPress={generatePassword}>
            <ProgrammingArrowsIcon width={20} height={20} />
          </Pressable>
        </View>
      </View>

      <Spacer size={8} />

      <Button text="Copy" type="primary-rounded" onPress={handleCopyPassword} />

      <Spacer size={16} />

      {/* Length Configuration */}
      <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg">
        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14} fontWeight={600}>
            Length: {sliderValue}
          </ThemedText>
          <ThemedText fontSize={12} className="text-gray-600">
            Min: {APP_CONSTANTS.MIN_PASSWORD_LENGTH} | Max:{" "}
            {APP_CONSTANTS.MAX_PASSWORD_LENGTH}
          </ThemedText>
        </View>
        <Spacer size={8} />
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={APP_CONSTANTS.MIN_PASSWORD_LENGTH}
          maximumValue={APP_CONSTANTS.MAX_PASSWORD_LENGTH}
          value={sliderValue}
          onValueChange={onValueChange}
          step={1}
        />
      </View>

      <Spacer size={16} />

      {/* Character Types */}
      <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg gap-3">
        <ThemedText fontSize={14} fontWeight={600}>
          Character Types
        </ThemedText>

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Uppercase (A-Z)</ThemedText>
          <Switch
            state={passwordGeneratorStates.uppercase}
            callback={() =>
              setPasswordGeneratorStates((prev) => ({
                ...prev,
                uppercase: !prev.uppercase,
              }))
            }
          />
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Lowercase (a-z)</ThemedText>
          <Switch
            state={passwordGeneratorStates.lowercase}
            callback={() =>
              setPasswordGeneratorStates((prev) => ({
                ...prev,
                lowercase: !prev.lowercase,
              }))
            }
          />
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Numbers (0-9)</ThemedText>
          <Switch
            state={passwordGeneratorStates.number}
            callback={() =>
              setPasswordGeneratorStates((prev) => ({
                ...prev,
                number: !prev.number,
              }))
            }
          />
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Special characters (!@#$%^&*)</ThemedText>
          <Switch
            state={passwordGeneratorStates.special}
            callback={() =>
              setPasswordGeneratorStates((prev) => ({
                ...prev,
                special: !prev.special,
              }))
            }
          />
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Avoid ambiguous characters</ThemedText>
          <Switch
            state={passwordGeneratorStates.avoidAmbiguous}
            callback={() =>
              setPasswordGeneratorStates((prev) => ({
                ...prev,
                avoidAmbiguous: !prev.avoidAmbiguous,
              }))
            }
          />
        </View>
      </View>

      <Spacer size={16} />

      {/* Minimum Requirements */}
      <View className="bg-[#EBEBEB] py-4 px-4 rounded-lg gap-3">
        <ThemedText fontSize={14} fontWeight={600}>
          Minimum Requirements
        </ThemedText>

        <View className="flex flex-row items-center justify-between">
          <ThemedText
            fontSize={14}
            style={{ opacity: passwordGeneratorStates.uppercase ? 1 : 0.5 }}
          >
            Minimum uppercase
          </ThemedText>
          <View className="flex flex-row items-center gap-2">
            <Pressable
              disabled={
                !passwordGeneratorStates.uppercase ||
                passwordGeneratorStates.minimumUppercase <= 0
              }
              onPress={() =>
                setPasswordGeneratorStates((prev) => ({
                  ...prev,
                  minimumUppercase: Math.max(0, prev.minimumUppercase - 1),
                }))
              }
            >
              <MinusCircleIcon
                width={24}
                height={24}
                color={
                  !passwordGeneratorStates.uppercase ||
                  passwordGeneratorStates.minimumUppercase <= 0
                    ? "#BBBBBB"
                    : "#000000"
                }
              />
            </Pressable>
            <ThemedText
              fontSize={14}
              className="w-6 text-center"
              style={{ opacity: passwordGeneratorStates.uppercase ? 1 : 0.5 }}
            >
              {passwordGeneratorStates.minimumUppercase}
            </ThemedText>
            <Pressable
              disabled={
                !passwordGeneratorStates.uppercase ||
                passwordGeneratorStates.minimumUppercase +
                  passwordGeneratorStates.minimumLowercase +
                  passwordGeneratorStates.minimumNumbers +
                  passwordGeneratorStates.minimumSpecial >=
                  sliderValue
              }
              onPress={() =>
                setPasswordGeneratorStates((prev) => {
                  const totalOthers =
                    prev.minimumLowercase +
                    prev.minimumNumbers +
                    prev.minimumSpecial;
                  const maxAllowed = sliderValue - totalOthers;
                  return {
                    ...prev,
                    minimumUppercase: Math.min(
                      maxAllowed,
                      prev.minimumUppercase + 1
                    ),
                  };
                })
              }
            >
              <AddCircleIcon
                width={24}
                height={24}
                color={
                  !passwordGeneratorStates.uppercase ||
                  passwordGeneratorStates.minimumUppercase +
                    passwordGeneratorStates.minimumLowercase +
                    passwordGeneratorStates.minimumNumbers +
                    passwordGeneratorStates.minimumSpecial >=
                    sliderValue
                    ? "#BBBBBB"
                    : "#000000"
                }
              />
            </Pressable>
          </View>
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText
            fontSize={14}
            style={{ opacity: passwordGeneratorStates.lowercase ? 1 : 0.5 }}
          >
            Minimum lowercase
          </ThemedText>
          <View className="flex flex-row items-center gap-2">
            <Pressable
              disabled={
                !passwordGeneratorStates.lowercase ||
                passwordGeneratorStates.minimumLowercase <= 0
              }
              onPress={() =>
                setPasswordGeneratorStates((prev) => ({
                  ...prev,
                  minimumLowercase: Math.max(0, prev.minimumLowercase - 1),
                }))
              }
            >
              <MinusCircleIcon
                width={24}
                height={24}
                color={
                  !passwordGeneratorStates.lowercase ||
                  passwordGeneratorStates.minimumLowercase <= 0
                    ? "#BBBBBB"
                    : "#000000"
                }
              />
            </Pressable>
            <ThemedText
              fontSize={14}
              className="w-6 text-center"
              style={{ opacity: passwordGeneratorStates.lowercase ? 1 : 0.5 }}
            >
              {passwordGeneratorStates.minimumLowercase}
            </ThemedText>
            <Pressable
              disabled={
                !passwordGeneratorStates.lowercase ||
                passwordGeneratorStates.minimumUppercase +
                  passwordGeneratorStates.minimumLowercase +
                  passwordGeneratorStates.minimumNumbers +
                  passwordGeneratorStates.minimumSpecial >=
                  sliderValue
              }
              onPress={() =>
                setPasswordGeneratorStates((prev) => {
                  const totalOthers =
                    prev.minimumUppercase +
                    prev.minimumNumbers +
                    prev.minimumSpecial;
                  const maxAllowed = sliderValue - totalOthers;
                  return {
                    ...prev,
                    minimumLowercase: Math.min(
                      maxAllowed,
                      prev.minimumLowercase + 1
                    ),
                  };
                })
              }
            >
              <AddCircleIcon
                width={24}
                height={24}
                color={
                  !passwordGeneratorStates.lowercase ||
                  passwordGeneratorStates.minimumUppercase +
                    passwordGeneratorStates.minimumLowercase +
                    passwordGeneratorStates.minimumNumbers +
                    passwordGeneratorStates.minimumSpecial >=
                    sliderValue
                    ? "#BBBBBB"
                    : "#000000"
                }
              />
            </Pressable>
          </View>
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText
            fontSize={14}
            style={{ opacity: passwordGeneratorStates.number ? 1 : 0.5 }}
          >
            Minimum numbers
          </ThemedText>
          <View className="flex flex-row items-center gap-2">
            <Pressable
              disabled={
                !passwordGeneratorStates.number ||
                passwordGeneratorStates.minimumNumbers <= 0
              }
              onPress={() =>
                setPasswordGeneratorStates((prev) => ({
                  ...prev,
                  minimumNumbers: Math.max(0, prev.minimumNumbers - 1),
                }))
              }
            >
              <MinusCircleIcon
                width={24}
                height={24}
                color={
                  !passwordGeneratorStates.number ||
                  passwordGeneratorStates.minimumNumbers <= 0
                    ? "#BBBBBB"
                    : "#000000"
                }
              />
            </Pressable>
            <ThemedText
              fontSize={14}
              className="w-6 text-center"
              style={{ opacity: passwordGeneratorStates.number ? 1 : 0.5 }}
            >
              {passwordGeneratorStates.minimumNumbers}
            </ThemedText>
            <Pressable
              disabled={
                !passwordGeneratorStates.number ||
                passwordGeneratorStates.minimumUppercase +
                  passwordGeneratorStates.minimumLowercase +
                  passwordGeneratorStates.minimumNumbers +
                  passwordGeneratorStates.minimumSpecial >=
                  sliderValue
              }
              onPress={() =>
                setPasswordGeneratorStates((prev) => {
                  const totalOthers =
                    prev.minimumUppercase +
                    prev.minimumLowercase +
                    prev.minimumSpecial;
                  const maxAllowed = sliderValue - totalOthers;
                  return {
                    ...prev,
                    minimumNumbers: Math.min(
                      maxAllowed,
                      prev.minimumNumbers + 1
                    ),
                  };
                })
              }
            >
              <AddCircleIcon
                width={24}
                height={24}
                color={
                  !passwordGeneratorStates.number ||
                  passwordGeneratorStates.minimumUppercase +
                    passwordGeneratorStates.minimumLowercase +
                    passwordGeneratorStates.minimumNumbers +
                    passwordGeneratorStates.minimumSpecial >=
                    sliderValue
                    ? "#BBBBBB"
                    : "#000000"
                }
              />
            </Pressable>
          </View>
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText
            fontSize={14}
            style={{ opacity: passwordGeneratorStates.special ? 1 : 0.5 }}
          >
            Minimum special characters
          </ThemedText>
          <View className="flex flex-row items-center gap-2">
            <Pressable
              disabled={
                !passwordGeneratorStates.special ||
                passwordGeneratorStates.minimumSpecial <= 0
              }
              onPress={() =>
                setPasswordGeneratorStates((prev) => ({
                  ...prev,
                  minimumSpecial: Math.max(0, prev.minimumSpecial - 1),
                }))
              }
            >
              <MinusCircleIcon
                width={24}
                height={24}
                color={
                  !passwordGeneratorStates.special ||
                  passwordGeneratorStates.minimumSpecial <= 0
                    ? "#BBBBBB"
                    : "#000000"
                }
              />
            </Pressable>
            <ThemedText
              fontSize={14}
              className="w-6 text-center"
              style={{ opacity: passwordGeneratorStates.special ? 1 : 0.5 }}
            >
              {passwordGeneratorStates.minimumSpecial}
            </ThemedText>
            <Pressable
              disabled={
                !passwordGeneratorStates.special ||
                passwordGeneratorStates.minimumUppercase +
                  passwordGeneratorStates.minimumLowercase +
                  passwordGeneratorStates.minimumNumbers +
                  passwordGeneratorStates.minimumSpecial >=
                  sliderValue
              }
              onPress={() =>
                setPasswordGeneratorStates((prev) => {
                  const totalOthers =
                    prev.minimumUppercase +
                    prev.minimumLowercase +
                    prev.minimumNumbers;
                  const maxAllowed = sliderValue - totalOthers;
                  return {
                    ...prev,
                    minimumSpecial: Math.min(
                      maxAllowed,
                      prev.minimumSpecial + 1
                    ),
                  };
                })
              }
            >
              <AddCircleIcon
                width={24}
                height={24}
                color={
                  !passwordGeneratorStates.special ||
                  passwordGeneratorStates.minimumUppercase +
                    passwordGeneratorStates.minimumLowercase +
                    passwordGeneratorStates.minimumNumbers +
                    passwordGeneratorStates.minimumSpecial >=
                    sliderValue
                    ? "#BBBBBB"
                    : "#000000"
                }
              />
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
