import { Image, Platform, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Link } from "expo-router";

export default function SecureVaultScreen() {
  return (
    <SafeAreaView
      className={`flex-1 w-full ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      <ScrollView className="flex-1 px-12">
        <ProgressSteps currentStep={3} />
        <View className="mt-10">
          <ThemedText fontWeight={700} fontSize={24} className="text-center">
            Secure your vault
          </ThemedText>

          <Spacer size={16} />

          <Image
            className="max-w-40 max-h-40 mx-auto"
            source={require("@/assets/images/security-safe.png")}
          />

          <Spacer size={16} />

          <ThemedText>
            <ThemedText>
              Don't risk losing your credentials. Protect your vault by saving
              your{" "}
            </ThemedText>
            <ThemedText fontWeight={500} className="text-[#0099FF]">
              Secret Recovery Phrase
            </ThemedText>
            <ThemedText> in a place you trust. </ThemedText>
            <ThemedText fontWeight={700}>
              It's the only way to recover your wallet if you get locked out of
              the app or get a new device.
            </ThemedText>
          </ThemedText>
        </View>
      </ScrollView>
      <View className="mb-8 px-12">
        <Link href="/securevault2" asChild>
          <Pressable className="bg-black w-full py-3 rounded-xl">
            <ThemedText fontWeight={700} className="text-white text-center">
              Start
            </ThemedText>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
