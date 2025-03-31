import { Image, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";

export default function SecretRecoveryPhraseScreen() {
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
              source={require("@/assets/images/eye-slash.png")}
            />

            <Spacer size={16} />

            <ThemedText fontWeight={700}>
              Tap to reveal your Secret Recovery Phrase
            </ThemedText>

            <Spacer size={8} />

            <ThemedText>Make sure no one is watching your screen.</ThemedText>

            <Spacer size={24} />

            <Pressable className="bg-black w-full py-2 rounded-xl">
              <ThemedText fontWeight={700} className="text-white text-center">
                View
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <View className="mt-4 mb-8">
        <Pressable className="bg-black/25 w-full py-3 rounded-xl">
          <ThemedText fontWeight={700} className="text-white text-center">
            Start
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
