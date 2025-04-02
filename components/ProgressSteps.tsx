import { View } from "react-native";
import { ThemedText } from "./ThemedText";

interface ProgressStepsProps {
  currentStep: number;
}

export function ProgressSteps(props: ProgressStepsProps) {
  return (
    <View className="mt-7">
      <ThemedText fontWeight={700} fontSize={20} className="text-center mb-5">
        MetaVault
      </ThemedText>
      <View className="flex-row justify-between items-center">
        <View className="flex-row justify-center w-full">
          <View className="w-24 items-start">
            <View
              className={`absolute mt-1.5 h-0.5 ml-4 w-full ${
                props.currentStep > 1 ? "bg-black/40" : "bg-black"
              }`}
            />
            <View
              className={`w-4 h-4 rounded-full justify-center items-center ${
                props.currentStep === 1
                  ? "bg-black"
                  : props.currentStep > 1
                  ? "border border-black/40"
                  : "border border-black"
              }`}
            >
              <ThemedText
                fontWeight={700}
                fontSize={8}
                className={`${
                  props.currentStep === 1
                    ? "text-white"
                    : props.currentStep > 1
                    ? "text-black/40"
                    : ""
                }`}
              >
                1
              </ThemedText>
            </View>
            <ThemedText
              fontSize={10}
              className={`-ml-8 max-w-20 text-center ${
                props.currentStep > 1 && "text-black/40"
              }`}
            >
              Create login methods
            </ThemedText>
          </View>
          <View className="w-24 items-center">
            <View
              className={`absolute mt-1.5 h-0.5 left-0 ml-4 w-6 ${
                props.currentStep > 1 ? "bg-black/40" : "bg-black"
              }`}
            />
            <View
              className={`absolute mt-1.5 h-0.5 right-0 mr-4 w-6 ${
                props.currentStep > 2 ? "bg-black/40" : "bg-black"
              }`}
            />
            <View
              className={`w-4 h-4 rounded-full justify-center items-center ${
                props.currentStep === 2
                  ? "bg-black"
                  : props.currentStep > 2
                  ? "border border-black/40"
                  : "border border-black"
              }`}
            >
              <ThemedText
                fontWeight={700}
                fontSize={8}
                className={`${
                  props.currentStep === 2
                    ? "text-white"
                    : props.currentStep > 2
                    ? "text-black/40"
                    : ""
                }`}
              >
                2
              </ThemedText>
            </View>
            <ThemedText
              fontSize={10}
              className={`max-w-20 text-center ${
                props.currentStep > 2 && "text-black/40"
              }`}
            >
              Secure vault
            </ThemedText>
          </View>
          <View className="w-24 items-end">
            <View
              className={`absolute mt-1.5 h-0.5 mr-4 w-full ${
                props.currentStep > 2 ? "bg-black/40" : "bg-black"
              }`}
            />
            <View
              className={`w-4 h-4 rounded-full justify-center items-center ${
                props.currentStep === 3 ? "bg-black" : "border border-black"
              }`}
            >
              <ThemedText
                fontWeight={700}
                fontSize={8}
                className={`${props.currentStep === 3 ? "text-white" : ""}`}
              >
                3
              </ThemedText>
            </View>
            <ThemedText fontSize={10} className="-mr-8 max-w-20 text-center">
              Confirm secret recovery phrase
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}
