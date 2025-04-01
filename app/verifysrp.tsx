import { Image, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";

export default function VerifySecretRecoveryPhraseScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white mx-12">
      <ScrollView className="flex-1">
        <ProgressSteps currentStep={2} />
        <View className="mt-10 mb-8">
          <ThemedText fontWeight={700} fontSize={24} className="text-center">
            Verify your Secret Recovery Phrase
          </ThemedText>

          <Spacer size={16} />

          <ThemedText className="text-center">
            Enter your Secret Recovery Phrase.
          </ThemedText>

          <Spacer size={16} />

          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg items-center">
            <ThemedText className="text-center">
              Secret Recovery Phrase
            </ThemedText>

            <Spacer size={16} />

            <View className="flex flex-row gap-2 w-full justify-center">
              <View className="flex-1 gap-2">
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">1. ...</ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">2. ...</ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">3. ...</ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">4. ...</ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">5. ...</ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">6. ...</ThemedText>
                </View>
              </View>
              <View className="flex-1 gap-2">
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">7. ...</ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">8. ...</ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">9. ...</ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">10. ...</ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">11. ...</ThemedText>
                </View>
                <View className="border border-black rounded-xl">
                  <ThemedText fontWeight={700} className="text-center">12. ...</ThemedText>
                </View>
              </View>
            </View>
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
