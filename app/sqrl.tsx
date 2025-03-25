import { Image, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";

export default function SQRLScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white mt-7 mx-12">
      <ScrollView className="flex-1">
        <ProgressSteps currentStep={1} />
        <View>
          <Image
            className="max-w-15 max-h-15"
            source={require("@/assets/images/scan.png")}
          />

          <Spacer size={16} />

          <ThemedText fontWeight={700} fontSize={24}>
            Use Secure, Quick,Reliable Login (SQRL) to unlock MetaVault on this device?
          </ThemedText>

          <Spacer size={16} />

          <ThemedText>
            Unlock this app even faster with SQRL. You can manage this in
            your MetaVault security settings at any time.
          </ThemedText>
        </View>
      </ScrollView>
      <View className="mb-8">
        <Pressable className="bg-black w-full py-3 rounded-xl">
          <ThemedText fontWeight={700} className="text-white text-center">
            Use SQRL
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
