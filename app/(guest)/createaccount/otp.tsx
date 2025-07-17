import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, TextInput, View } from "react-native";

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
import ReactNativeModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// CreateAccountScreen (OTP): Handles OTP input, resend, and verification for account creation.
export default function CreateAccountScreen() {
  const insets = useSafeAreaInsets();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [privacyPolicyVisible, setPrivacyPolicyVisible] =
    useState<boolean>(false);

  // Create refs for each OTP input
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const { showAlert } = useAlert();
  const { state, setState } = useAppState();

  const signInWithEmailOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    });
    if (error) {
      showAlert("Error", "Error sending OTP. Please try again.");
    } else {
      showAlert("Success", "OTP sent successfully. Check your email.");
    }
  };

  // Handles OTP resend logic
  const handleResendOtp = async () => {
    if (!canResend && state.email) return;

    setIsLoading(true);
    try {
      await signInWithEmailOtp(state.email);
      setTimeLeft(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (error: unknown) {
      console.error("Failed to resend OTP:", error);
      showAlert("Error", "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
    return undefined;
  }, [timeLeft]);

  // Handles OTP input change
  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    if (value !== "" && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = () => {
    return otp.every((digit) => digit !== "");
  };

  // Handles OTP verification and navigation
  const handleContinue = async () => {
    if (!isOtpComplete()) {
      showAlert("Please complete all fields", "error");
      return;
    }

    setIsLoading(true);

    try {
      const otpString = otp.join("");

      const { error } = await supabase.auth.verifyOtp({
        email: state.email,
        token: otpString,
        type: "signup",
      });

      if (error) {
        showAlert("Error", error.message);
        return;
      }

      showAlert("Success", "Email has been verified.", [
        {
          text: "OK",
          onPress: () => {
            setState({
              ...state,
              currentState: APP_STATES.CREATE_ACCOUNT_OTP_VERIFIED,
              emailVerified: true,
            });
            router.push(ROUTES.GUEST.CREATE_ACCOUNT.PASSKEY);
          },
        },
      ]);
    } catch (error: unknown) {
      console.error("OTP verification failed:", error);
      showAlert("Error", "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`flex-1 w-full ${
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

          <Spacer size={16} />

          <ThemedText fontWeight={700} fontSize={24}>
            Verify your OTP
          </ThemedText>

          <Spacer size={16} />

          <ThemedText fontWeight={400} fontSize={16}>
            Verify the OTP that has been sent to your email ({state.email}
            ).
          </ThemedText>

          <Spacer size={16} />

          <View className="flex flex-row gap-2 justify-between">
            {otp.map((digit, index) => (
              <View key={index} className="flex-1 bg-[#EBEBEB] rounded-lg">
                <ThemedTextInput
                  ref={(ref) => {
                    otpRefs.current[index] = ref;
                  }}
                  fontSize={32}
                  className="outline-none text-center "
                  paddingVertical={16}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={index === 0}
                />
              </View>
            ))}
          </View>

          <Spacer size={16} />

          <View className="flex flex-row items-center gap-1">
            <Pressable
              onPress={handleResendOtp}
              disabled={!canResend || isLoading}
            >
              <ThemedText
                fontSize={14}
                fontWeight={canResend ? 500 : 400}
                className={canResend ? "text-[#0099FF]" : "text-black/40"}
              >
                Resend the OTP
              </ThemedText>
            </Pressable>
            {!canResend && (
              <ThemedText fontSize={14} className="text-black/40">
                ({Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")})
              </ThemedText>
            )}
          </View>
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
          text={isLoading ? "Verifying..." : "Continue"}
          type="primary"
          onPress={handleContinue}
          disabled={isLoading || !isOtpComplete()}
          fontWeight={700}
        />
      </View>
    </View>
  );
}
