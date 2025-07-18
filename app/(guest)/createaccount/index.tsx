import { Platform, Pressable, ScrollView, View } from "react-native";

import { DevicesIcon } from "@/assets/images/icons";
import { ProgressSteps } from "@/components/ProgressSteps";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { Button } from "@/components/ui/Button";
import { PrivacyPolicy } from "@/components/ui/Modal/Information/PrivacyPolicy";
import { ROUTES } from "@/constants/AppConstants";
import { useAlert } from "@/contexts/AlertProvider";
import { useAppState } from "@/contexts/AppStateProvider";
import { supabase } from "@/lib/supabase";
import { APP_STATES } from "@/lib/types";
import { router } from "expo-router";
import { useState } from "react";
import ReactNativeModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateAccountScreen() {
  const insets = useSafeAreaInsets();

  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [privacyPolicyVisible, setPrivacyPolicyVisible] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");

  const { showAlert } = useAlert();
  const { state, setState } = useAppState();

  // Handles sending OTP to email and updating app state
  async function signInWithEmailOtp(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    });

    if (error) {
      showAlert("Error", "Your email isn't valid or your request is too fast.");
    } else {
      setState({
        ...state,
        currentState: APP_STATES.CREATE_ACCOUNT_WAIT_FOR_OTP,
        email: email,
        name: name,
      });
      showAlert("Success", "Check your email for an OTP code.", [
        { text: "OK", onPress: () => router.push(ROUTES.GUEST.CREATE_ACCOUNT.OTP) },
      ]);
    }

    setIsRegistering(false);
  }

  // Handles continue button: checks email validity and triggers OTP
  const handleContinue = async () => {
    setIsRegistering(true);

    const { data, error } = await supabase.functions.invoke("is-email-valid", {
      body: { email },
    });

    if (!error && data.length === 1) {
      showAlert("Error", "Email is already used.");

      setIsRegistering(false);
    } else if (error) {
      showAlert("Error", error.message);
    } else {
      signInWithEmailOtp(email);
    }
  };

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`bg-white flex-1 w-full ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ReactNativeModal
        isVisible={privacyPolicyVisible}
        onSwipeComplete={async () => {
          setPrivacyPolicyVisible(false);
        }}
        swipeDirection={["down"]}
        onBackdropPress={async () => {
          setPrivacyPolicyVisible(false);
        }}
        style={{ margin: 0 }}
        animationInTiming={300}
        animationOutTiming={300}
      >
        <PrivacyPolicy callback={() => setPrivacyPolicyVisible(false)} />
      </ReactNativeModal>

      <ScrollView className="flex-1 px-12">
        <ProgressSteps currentStep={1} />
        <View className="my-10">
          <DevicesIcon width={60} height={60} />

          <Spacer size={20} />

          <ThemedText 
            fontWeight={700} 
            fontSize={24} 
            className="text-black"
          >
            Create an account
          </ThemedText>

          <Spacer size={20} />

          <View className="bg-gray-100 py-4 px-4 rounded-xl">
            <ThemedText 
              fontSize={12} 
              fontWeight={700} 
              className="text-black"
            >
              Email (required)
            </ThemedText>
            <Spacer size={8} />
            <ThemedTextInput
              fontSize={14}
              className="outline-none text-black"
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Spacer size={16} />

          <View className="bg-gray-100 py-4 px-4 rounded-xl">
            <ThemedText 
              fontSize={12} 
              fontWeight={700} 
              className="text-black"
            >
              Name (optional)
            </ThemedText>
            <Spacer size={8} />
            <ThemedTextInput
              fontSize={14}
              className="outline-none text-black"
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <Spacer size={16} />

          <ThemedText className="text-gray-600 text-center px-4">
            Your email is needed to ensure your account is unique and prevent duplicates.
          </ThemedText>
        </View>
      </ScrollView>
      <View className="px-12 pb-8">
        <ThemedText fontSize={12} className="text-gray-600 text-center">
          By continuing, you agree to the{" "}
          <Pressable onPress={() => setPrivacyPolicyVisible(true)}>
            <ThemedText
              fontSize={12}
              fontWeight={600}
              className="text-black underline"
            >
              Privacy Policy
            </ThemedText>
          </Pressable>
        </ThemedText>

        <Spacer size={16} />

        <Button
          text={isRegistering ? "Registering..." : "Continue"}
          type="primary"
          onPress={handleContinue}
          disabled={isRegistering || email === ""}
          fontWeight={700}
        />
      </View>
    </View>
  );
}
