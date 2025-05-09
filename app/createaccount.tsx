import { Image, Pressable, ScrollView, View, Platform } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Link, useLocalSearchParams } from "expo-router";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { useState } from "react";

export default function CreateAccountScreen() {
  const { availableAuthMethods } = useLocalSearchParams();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");

  return (
    <SafeAreaView
      className={`flex-1 w-full ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      <ScrollView className="flex-1 px-12">
        <ProgressSteps currentStep={1} />
        <View className="mt-10">
          <Image
            className="max-w-15 max-h-15"
            source={require("@/assets/images/devices.png")}
          />

          <Spacer size={16} />

          <ThemedText fontWeight={700} fontSize={24}>
            Create an account
          </ThemedText>

          <Spacer size={16} />

          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg">
            <View className="flex">
              <ThemedText fontSize={12} fontWeight={800}>
                Email (required)
              </ThemedText>
              <ThemedTextInput
                fontSize={14}
                className="flex-1 outline-none"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoFocus
              />
            </View>
          </View>

          <Spacer size={12} />

          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg">
            <View className="flex">
              <ThemedText fontSize={12} fontWeight={800}>
                Name
              </ThemedText>
              <ThemedTextInput
                fontSize={14}
                className="flex-1 outline-none"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>
          </View>

          <Spacer size={16} />

          <ThemedText>
            Your email is still needed to ensure that your account is unique and
            to prevent duplicate accounts.
          </ThemedText>
        </View>
      </ScrollView>
      <View className="mb-8 px-12">
        <ThemedText fontSize={12}>
          By continuing, you agree to the{" "}
          <ThemedText fontSize={12} fontWeight={500} className="text-[#0099FF]">
            Privacy Policy
          </ThemedText>
        </ThemedText>
        <Link
          href={
            // Go to faceauthentication first
            availableAuthMethods.includes("1")
              ? `/authentication/faceauthentication?availableAuthMethods=${availableAuthMethods}&email=${email}&name=${name}`
              : // : availableAuthMethods.includes("2")
                // ? // Go to fingerprint if no faceauthentication available
                `/authentication/fingerprint?availableAuthMethods=${availableAuthMethods}&email=${email}&name=${name}`
            // : // Go to sqrl if no fingerprint available
            // `/authentication/sqrl?availableAuthMethods=${availableAuthMethods}&email=${email}&name=${name}`
          }
          asChild
        >
          <Pressable className="bg-black w-full py-3 rounded-xl">
            <ThemedText fontWeight={700} className="text-white text-center">
              Continue
            </ThemedText>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
