// NotFoundScreen: Shown when a user navigates to a route that doesn't exist.
import { Link, router, Stack } from "expo-router";
import { View } from "react-native";

import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ROUTES } from "@/constants/AppConstants";
import { Button } from "@/components/ui/Button";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center p-5 bg-white">
        <ThemedText
          fontSize={24}
          fontWeight={700}
          className="text-center text-black"
        >
          Page Not Found
        </ThemedText>
        <Spacer size={16} />
        <ThemedText fontSize={16} className="text-center text-gray-600">
          This screen does not exist.
        </ThemedText>
        <Spacer size={24} />
        <View className="w-80">
          <Button
            text="Go to home screen"
            onPress={() => router.push(ROUTES.ROOT)}
          />
        </View>
      </View>
    </>
  );
}
