import { Image, Platform, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Link, useLocalSearchParams } from "expo-router";

export default function FingerprintScreen() {
  const { availableAuthMethods } = useLocalSearchParams();

  return (
    <SafeAreaView
      className={`flex-1 w-full ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      <ScrollView className="flex-1 px-12">
        <ProgressSteps currentStep={2} />
        <View className="mt-10">
          <Image
            className="max-w-15 max-h-15"
            source={require("@/assets/images/finger-scan.png")}
          />

          <Spacer size={16} />

          <ThemedText fontWeight={700} fontSize={24}>
            Use fingerprint to unlock MetaVault on this device?
          </ThemedText>

          <Spacer size={16} />

          <ThemedText>
            Unlock this app even faster with fingerprint. You can manage this in
            your MetaVault security settings at any time.
          </ThemedText>
        </View> 
      </ScrollView>
      <View className="mb-8 px-12">
        <Link
          href={
            availableAuthMethods.includes("2")
              ? `/authentication/faceauthentication?availableAuthMethods=${availableAuthMethods}`
              : availableAuthMethods.includes("4")
              ? `/authentication/sqrl?availableAuthMethods=${availableAuthMethods}`
              : "/"
          }
          asChild
        >
          <Pressable className="bg-black w-full py-3 rounded-xl">
            <ThemedText fontWeight={700} className="text-white text-center">
              Use fingerprint
            </ThemedText>
          </Pressable>
        </Link>
        <Spacer size={8} />
        <Pressable className="bg-[#D9D9D9] w-full py-3 rounded-xl">
          <ThemedText className="text-center">Skip for now</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
