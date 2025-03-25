import { Image, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";

export default function FaceIDScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white mt-7 mx-12">
      <ScrollView className="flex-1">
        <ProgressSteps currentStep={1} />
        <View>
          <Image
            className="max-w-15 max-h-15"
            source={require("@/assets/images/scanning.png")}
          />

          <Spacer size={16} />

          <ThemedText fontWeight={700} fontSize={24}>
            Use Face ID to unlock MetaVault on this device?
          </ThemedText>

          <Spacer size={16} />

          <ThemedText>
            Unlock this app even faster with Face ID. You can manage this in
            your MetaVault security settings at any time.
          </ThemedText>
        </View>
      </ScrollView>
      <View className="mb-8">
        <Pressable className="bg-black w-full py-3 rounded-xl">
          <ThemedText fontWeight={700} className="text-white text-center">
            Use Face ID
          </ThemedText>
        </Pressable>
        <Spacer size={8} />
        <Pressable className="bg-[#D9D9D9] w-full py-3 rounded-xl">
          <ThemedText className="text-center">Skip for now</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
