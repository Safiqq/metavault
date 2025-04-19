import { Image, Platform, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";
import React, { useEffect, useState } from "react";
import { Link } from "expo-router";
import { generateMnemonic } from "@/utils/bip39";
import * as SecureStore from "expo-secure-store";
import { useMnemonicSetup } from "@/contexts/MnemonicSetupContext";

export default function SecretRecoveryPhraseScreen() {
  const [visible, setVisible] = useState(false);
  const [srp, setSrp] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { setMnemonic } = useMnemonicSetup();

  useEffect(() => {
    async function generateSRP() {
      try {
        setSrp(await generateMnemonic());
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }

    generateSRP();
  }, []);

  // Loading state
  if (loading) {
    return <View />;
  }

  return (
    <SafeAreaView
      className={`flex-1 w-full ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ScrollView className="flex-1 px-12">
        <ProgressSteps currentStep={3} />
        <View className="mt-10 mb-8">
          <ThemedText fontWeight={700} fontSize={24} className="text-center">
            Write down your Secret Recovery Phrase
          </ThemedText>

          <Spacer size={16} />

          <ThemedText className="text-center">
            This is your Secret Recovery Phrase. Write it down on paper and keep
            it in a safe place. You'll be asked to re-enter this phrase (in
            order) on the next step.
          </ThemedText>

          <Spacer size={16} />

          <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg items-center -mx-6">
            {visible ? (
              <Image
                className="max-w-6 max-h-6"
                source={require("@/assets/images/eye.png")}
              />
            ) : (
              <Image
                className="max-w-6 max-h-6"
                source={require("@/assets/images/eye-slash.png")}
              />
            )}

            <Spacer size={16} />

            <ThemedText fontWeight={700}>
              Tap to {visible ? "hide" : "reveal"} your Secret Recovery Phrase
            </ThemedText>

            {visible ? (
              <Spacer size={16} />
            ) : (
              <>
                <Spacer size={8} />

                <ThemedText>
                  Make sure no one is watching your screen.
                </ThemedText>

                <Spacer size={24} />
              </>
            )}

            {visible && (
              <>
                <View className="flex flex-row gap-2 w-full justify-center">
                  {[0, 1].map((col) => (
                    <View key={col} className="flex-1 gap-2">
                      {srp.slice(col * 6, (col + 1) * 6).map((word, index) => (
                        <View
                          key={index}
                          className="border border-black rounded-xl"
                        >
                          <ThemedText fontWeight={700} className="text-center">
                            {col * 6 + index + 1}. {word}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>

                <Spacer size={24} />
              </>
            )}

            <Pressable
              className="bg-black w-full py-2 rounded-xl"
              onPress={() => setVisible(!visible)}
            >
              <ThemedText fontWeight={700} className="text-white text-center">
                {visible ? "Hide" : "View"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <View className="mt-4 mb-8 px-12">
        {visible ? (
          <Link href="/verifysrp" asChild>
            <Pressable
              className="bg-black w-full py-3 rounded-xl"
              onPress={() => {
                if (Platform.OS === "web") {
                  setMnemonic(srp);
                } else {
                  SecureStore.setItemAsync("temp_mnemonic", srp.join(","));
                }
              }}
            >
              <ThemedText fontWeight={700} className="text-white text-center">
                Continue
              </ThemedText>
            </Pressable>
          </Link>
        ) : (
          <Pressable className="bg-black/25 cursor-default w-full py-3 rounded-xl">
            <ThemedText fontWeight={700} className="text-white text-center">
              Continue
            </ThemedText>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
