import { Image, Pressable, ScrollView, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useState } from "react";
import Slider from "@react-native-community/slider";
import { Switch } from "../Switch";
import { Line } from "../Line";

export function GeneratorPassword() {
  const [sliderValue, setSliderValue] = useState(12);
  const [passwordGeneratorStates, setPasswordGeneratorStates] = useState({
    uppercase: true,
    lowercase: true,
    number: true,
    special: true,
    minimumNumbers: 1,
    minimumSpecial: 5,
    avoidAmbiguous: false,
  });

  const onValueChange = (e: number) => {
    setSliderValue(e);
  };

  return (
    <ScrollView className="flex-1 mx-6 my-5">
      <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg flex flex-row items-center justify-between gap-4">
        <ThemedText fontSize={14}>
          HMmABQJibO
          <ThemedText fontSize={14} fontWeight={800}>
            9
          </ThemedText>
          qhSM
        </ThemedText>
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
        <View className="flex flex-row items-center gap-4">
          <ThemedText fontSize={14}>Length</ThemedText>
          <Slider
            style={{ flexGrow: 1 }}
            minimumValue={8}
            maximumValue={32}
            value={sliderValue}
            step={1}
            minimumTrackTintColor="#000000"
            maximumTrackTintColor="#000000"
            onValueChange={onValueChange}
            thumbTintColor="black"
          />
          <ThemedText fontSize={14}>{sliderValue}</ThemedText>
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>A-Z</ThemedText>
          <Switch
            state={passwordGeneratorStates.uppercase}
            callback={() =>
              setPasswordGeneratorStates({
                ...passwordGeneratorStates,
                uppercase: !passwordGeneratorStates.uppercase,
              })
            }
          />
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>a-z</ThemedText>
          <Switch
            state={passwordGeneratorStates.lowercase}
            callback={() =>
              setPasswordGeneratorStates({
                ...passwordGeneratorStates,
                lowercase: !passwordGeneratorStates.lowercase,
              })
            }
          />
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>0-9</ThemedText>
          <Switch
            state={passwordGeneratorStates.number}
            callback={() =>
              setPasswordGeneratorStates({
                ...passwordGeneratorStates,
                number: !passwordGeneratorStates.number,
              })
            }
          />
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>!@#$%^&*</ThemedText>
          <Switch
            state={passwordGeneratorStates.special}
            callback={() =>
              setPasswordGeneratorStates({
                ...passwordGeneratorStates,
                special: !passwordGeneratorStates.special,
              })
            }
          />
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Minimum numbers</ThemedText>
          <View className="flex flex-row items-center gap-2">
            {passwordGeneratorStates.minimumNumbers === 1 ? (
              <Image
                className="max-w-6 max-h-6"
                source={require("@/assets/images/minus-circle-disabled.png")}
              />
            ) : (
              <Pressable
                onPress={() =>
                  setPasswordGeneratorStates({
                    ...passwordGeneratorStates,
                    minimumNumbers: passwordGeneratorStates.minimumNumbers - 1,
                  })
                }
              >
                <Image
                  className="max-w-6 max-h-6"
                  source={require("@/assets/images/minus-circle.png")}
                />
              </Pressable>
            )}
            <ThemedText fontSize={14} className="w-2 text-center">
              {passwordGeneratorStates.minimumNumbers}
            </ThemedText>
            {passwordGeneratorStates.minimumNumbers === 5 ? (
              <Image
                className="max-w-6 max-h-6"
                source={require("@/assets/images/add-circle-disabled.png")}
              />
            ) : (
              <Pressable
                onPress={() =>
                  setPasswordGeneratorStates({
                    ...passwordGeneratorStates,
                    minimumNumbers: passwordGeneratorStates.minimumNumbers + 1,
                  })
                }
              >
                <Image
                  className="max-w-6 max-h-6"
                  source={require("@/assets/images/add-circle.png")}
                />
              </Pressable>
            )}
          </View>
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Minimum special</ThemedText>
          <View className="flex flex-row items-center gap-2">
            {passwordGeneratorStates.minimumSpecial === 1 ? (
              <Image
                className="max-w-6 max-h-6"
                source={require("@/assets/images/minus-circle-disabled.png")}
              />
            ) : (
              <Pressable
                onPress={() =>
                  setPasswordGeneratorStates({
                    ...passwordGeneratorStates,
                    minimumSpecial: passwordGeneratorStates.minimumSpecial - 1,
                  })
                }
              >
                <Image
                  className="max-w-6 max-h-6"
                  source={require("@/assets/images/minus-circle.png")}
                />
              </Pressable>
            )}
            <ThemedText fontSize={14} className="w-2 text-center">
              {passwordGeneratorStates.minimumSpecial}
            </ThemedText>
            {passwordGeneratorStates.minimumSpecial === 5 ? (
              <Image
                className="max-w-6 max-h-6"
                source={require("@/assets/images/add-circle-disabled.png")}
              />
            ) : (
              <Pressable
                onPress={() =>
                  setPasswordGeneratorStates({
                    ...passwordGeneratorStates,
                    minimumSpecial: passwordGeneratorStates.minimumSpecial + 1,
                  })
                }
              >
                <Image
                  className="max-w-6 max-h-6"
                  source={require("@/assets/images/add-circle.png")}
                />
              </Pressable>
            )}
          </View>
        </View>

        <Line />

        <View className="flex flex-row items-center justify-between">
          <ThemedText fontSize={14}>Avoid ambiguous characters</ThemedText>
          <Switch
            state={passwordGeneratorStates.avoidAmbiguous}
            callback={() =>
              setPasswordGeneratorStates({
                ...passwordGeneratorStates,
                avoidAmbiguous: !passwordGeneratorStates.avoidAmbiguous,
              })
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}
