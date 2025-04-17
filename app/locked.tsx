import { Image, Platform, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";

export default function LockedScreen() {
  return (
    <SafeAreaView
      className={`flex-1 my-32 ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      <ScrollView className="flex-1 px-12">
        <View>
          <Image
            className="max-w-15 max-h-15"
            source={require("@/assets/images/lock.png")}
          />

          <Spacer size={16} />

          <ThemedText fontWeight={700} fontSize={28}>
            Your vault is locked
          </ThemedText>

          <Spacer size={16} />

          <ThemedText>johndoe@gmail.com</ThemedText>
        </View>
      </ScrollView>
      <View>
        <Pressable className="bg-black w-full py-3 rounded-xl">
          <ThemedText fontWeight={700} className="text-white text-center">
            Unlock
          </ThemedText>
        </Pressable>
        <Spacer size={8} />
        <Pressable className="bg-[#D9D9D9] w-full py-3 rounded-xl">
          <ThemedText className="text-center">Log out</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
