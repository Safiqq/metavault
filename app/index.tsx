import { ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";

export default function LandingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="mx-12 flex justify-between">
          <View>
            <ThemedText fontWeight={700} fontSize={28}>
              Create an Account without a Master Password
            </ThemedText>

            <Spacer size={16} />

            <View className="bg-[#EBEBEB] py-3 px-2">
              <ThemedText>
                <ThemedText fontSize={14}>
                  Master passwords, which are a{" "}
                </ThemedText>
                <ThemedText fontSize={14} fontWeight={700}>
                  'something you know'
                </ThemedText>
                <ThemedText fontSize={14}>
                  , type of authentication factor, are vulnerable, especially
                  since hardware capabilities are increasing exponentially.
                </ThemedText>
              </ThemedText>
            </View>

            <Spacer size={16} />

            <ThemedText>
              <ThemedText>
                Go passwordless and use another authentication factor (such as{" "}
              </ThemedText>
              <ThemedText fontWeight={700}>'something you have'</ThemedText>
              <ThemedText> or </ThemedText>
              <ThemedText fontWeight={700}>'something you are'</ThemedText>
              <ThemedText>) to log in.</ThemedText>
            </ThemedText>
            <ThemedText>
              Available authentication methods(s) for your device:
            </ThemedText>
            <ThemedText> • Fingerprint</ThemedText>
            <ThemedText> • Face authentication</ThemedText>
            <ThemedText> • Face ID</ThemedText>
            <ThemedText> • Secure, Quick, Reliable Login (SQRL)</ThemedText>
          </View>

          <View>
            <View className="bg-black w-full py-3">
              <ThemedText fontWeight={700} className="text-white cursor-pointer">
                Get started
              </ThemedText>
            </View>
            <Spacer size={8} />
            <View className="bg-[#D9D9D9] w-full py-3">
              <ThemedText>Learn more</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
