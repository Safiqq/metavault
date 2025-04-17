import { Image, Platform, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Link } from "expo-router";

export default function ConfirmSecretRecoveryPhraseScreen() {
  return (
    <SafeAreaView
      className={`flex-1 w-full ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      <ScrollView className="flex-1 px-12">
        <ProgressSteps currentStep={3} />
        <View className="mt-10 mb-8">
          <ThemedText fontWeight={700} fontSize={24} className="text-center">
            Congratulations!
          </ThemedText>

          <Spacer size={16} />

          <Image
            className="max-w-40 max-h-40 mx-auto"
            source={require("@/assets/images/medal-star.png")}
          />

          <Spacer size={16} />

          <ThemedText className="text-center">
            Your vault is protected and ready to use. You can find your Secret
            Recovery Phrase in{" "}
            <ThemedText fontWeight={700}>
              Settings {">"} Security & Privacy.
            </ThemedText>
          </ThemedText>

          <Spacer size={16} />

          <ThemedText fontWeight={500} className="text-[#0099FF]">
            Leave yourself a hint?
          </ThemedText>

          <Spacer size={16} />

          <ThemedText>
            Keep a reminder of your Secret Recovery Phrase somewhere safe. If
            you lose it, no one can help you get it back. Even worse, you won't
            be able to access to your wallet ever again.{" "}
            <ThemedText fontWeight={500} className="text-[#0099FF]">
              Learn more
            </ThemedText>
          </ThemedText>
        </View>
      </ScrollView>
      <View className="mt-4 mb-8">
        <Link href="/main" asChild>
          <Pressable className="bg-black w-full py-3 rounded-xl">
            <ThemedText fontWeight={700} className="text-white text-center">
              Done
            </ThemedText>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
