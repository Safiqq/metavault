import { Image, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";

export default function SecretRecoveryPhrase2Screen() {
  return (
    <SafeAreaView className="flex-1 bg-white mx-12">
      <ScrollView className="flex-1">
        <ProgressSteps currentStep={2} />
        <View className="mt-10 mb-8">
          <ThemedText fontWeight={700} fontSize={24} className="text-center">
            Write down your Secret Recovery Phrase
          </ThemedText>

          <Spacer size={16} />

          <ThemedText className="text-center">
            This is your Secret Recovery Phrase. Write it down on paper and keep
            it in a safe place. You'll be asked to re-enter this phrase (in
            order) on the next step.
          </ThemedText>

          <Spacer size={16} />

          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg items-center">
            <Image
              className="max-w-6 max-h-6"
              source={require("@/assets/images/eye.png")}
            />

            <Spacer size={16} />

            <ThemedText fontWeight={700}>
              Tap to hide your Secret Recovery Phrase
            </ThemedText>

            <Spacer size={16} />

            <View className="flex flex-row gap-2 w-full justify-center">
              <View className="flex-1 gap-2">
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">
                    1. abandon
                  </ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">
                    2. ability
                  </ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">
                    3. able
                  </ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">
                    4. about
                  </ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">
                    5. above
                  </ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">
                    6. absent
                  </ThemedText>
                </View>
              </View>
              <View className="flex-1 gap-2">
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">
                    7. absorb
                  </ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">
                    8. abstract
                  </ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">
                    9. absurd
                  </ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">
                    10. abuse
                  </ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">
                    11. access
                  </ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">
                    12. accident
                  </ThemedText>
                </View>
              </View>
            </View>

            <Spacer size={24} />

            <Pressable className="bg-black w-full py-2 rounded-xl">
              <ThemedText fontWeight={700} className="text-white text-center">
                Hide
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <View className="mt-4 mb-8">
        <Pressable className="bg-black w-full py-3 rounded-xl">
          <ThemedText fontWeight={700} className="text-white text-center">
            Continue
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
