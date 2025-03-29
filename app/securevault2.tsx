import { Image, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";

export default function SecureVault2Screen() {
  return (
    <SafeAreaView className="flex-1 bg-white mx-12">
      <ScrollView className="flex-1">
        <ProgressSteps currentStep={2} />
        <View className="mt-10 mb-8">
          <Image
            className="max-w-10 max-h-10 mx-auto"
            source={require("@/assets/images/security-safe.png")}
          />

          <Spacer size={16} />

          <ThemedText fontWeight={700} fontSize={24} className="text-center">
            Secure your vault
          </ThemedText>

          <Spacer size={16} />

          <ThemedText className="text-center">
            <ThemedText>Secure your vault's </ThemedText>
            <ThemedText fontWeight={500} className="text-[#0099FF]">
              Secret Recovery Phrase.
            </ThemedText>
          </ThemedText>

          <Spacer size={16} />

          <View className="flex flex-row items-center justify-center gap-2">
            <Image
              className="max-w-10 max-h-10"
              source={require("@/assets/images/info-circle-blue.png")}
            />

            <ThemedText fontWeight={500} className="text-[#0099FF]">
              Why is it important?
            </ThemedText>
          </View>

          <Spacer size={16} />
          
          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg">
            <ThemedText fontWeight={700}>Manual</ThemedText>

            <Spacer size={8} />

            <ThemedText>
              Write down your Secret Recover Phrase on a piece of paper and
              store in a safe place.
            </ThemedText>

            <Spacer size={12} />

            <ThemedText>Security level: Very strong</ThemedText>

            <Spacer size={4} />

            <View className="flex flex-row gap-0.5">
              <View className="bg-[#0099FF] w-9 h-2" />
              <View className="bg-[#0099FF] w-9 h-2" />
              <View className="bg-[#0099FF] w-9 h-2" />
            </View>

            <Spacer size={12} />

            <ThemedText>Risks are:</ThemedText>
            <ThemedText> - You lose it</ThemedText>
            <ThemedText> - You forget where you put it</ThemedText>
            <ThemedText> - Someone else finds it</ThemedText>

            <Spacer size={12} />

            <ThemedText>Other options: Doesn't have to be paper!</ThemedText>

            <Spacer size={12} />

            <ThemedText>Tips:</ThemedText>
            <ThemedText> - Store in bank vault</ThemedText>
            <ThemedText> - Store in a safe</ThemedText>
            <ThemedText> - Store in multiple secret places</ThemedText>
          </View>
        </View>
      </ScrollView>
      <View className="mt-4 mb-8">
        <Pressable className="bg-black w-full py-3 rounded-xl">
          <ThemedText fontWeight={700} className="text-white text-center">
            Start
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
