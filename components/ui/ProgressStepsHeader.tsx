import React, { useMemo } from "react";
import { View, ViewStyle } from "react-native";
import Spacer from "../Spacer";
import { ThemedText } from "../ThemedText";

// Types
type StepStatus = "completed" | "active" | "upcoming";

interface StepConfig {
  number: number;
  label: string;
  key: string;
}

interface ProgressStepsProps {
  currentStep: number;
  className?: string;
  style?: ViewStyle;
  onStepPress?: (step: number) => void;
  disabled?: boolean;
  colors?: {
    active?: string;
    completed?: string;
    upcoming?: string;
    textActive?: string;
    textCompleted?: string;
    textUpcoming?: string;
    lineActive?: string;
    lineInactive?: string;
  };
}

const DEFAULT_COLORS = {
  active: "#000000", // Black for active
  completed: "#000000", // Black for completed
  upcoming: "#E5E5E5", // Light gray for upcoming
  textActive: "#FFFFFF", // White text on black
  textCompleted: "#FFFFFF", // White text on black
  textUpcoming: "#6B7280", // Gray text for upcoming
  lineActive: "#000000", // Black line for completed connections
  lineInactive: "#E5E5E5", // Light gray for inactive connections
} as const;

const STEPS: StepConfig[] = [
  { number: 1, label: "Assign an email", key: "email" },
  { number: 2, label: "Create login methods", key: "login" },
  { number: 3, label: "Secure your account", key: "secure" },
];

/**
 * Get the status of a step based on the current step
 */
const getStepStatus = (stepNumber: number, currentStep: number): StepStatus => {
  if (stepNumber < currentStep) return "completed";
  if (stepNumber === currentStep) return "active";
  return "upcoming";
};

/**
 * ProgressStepsHeader component displays a visual progress indicator with multiple steps.
 * It shows the current progress through a multi-step process.
 */
export const ProgressStepsHeader: React.FC<ProgressStepsProps> = ({
  currentStep,
}) => {
  // Merge default colors with custom colors
  const colors = useMemo(
    () => ({
      ...DEFAULT_COLORS,
    }),
    []
  );

  /**
   * Render a single step in the progress indicator
   */
  const renderStep = (step: StepConfig, index: number) => {
    const status = getStepStatus(step.number, currentStep);
    const isActive = status === "active";
    const isCompleted = status === "completed";
    const isUpcoming = status === "upcoming";

    const circleStyle: ViewStyle = {
      backgroundColor: isActive
        ? colors.active
        : isCompleted
        ? colors.completed
        : colors.upcoming,
      borderWidth: isUpcoming ? 2 : 0,
      borderColor: colors.lineInactive,
    };

    return (
      <View
        key={step.key}
        className="items-center flex-1 max-w-[100px]"
      >
        {/* Step circle */}
        <View
          style={circleStyle}
          className="w-5 h-5 rounded-full justify-center items-center"
        >
          <ThemedText
            fontSize={9}
            fontWeight={700}
            className={isActive || isCompleted ? "text-white" : "text-gray-500"}
          >
            {isCompleted ? "✓" : step.number}
          </ThemedText>
        </View>

        {/* Step label */}
        <Spacer size={8} />
        <ThemedText
          fontSize={10}
          className={`text-center ${
            isActive
              ? "text-black"
              : isCompleted
              ? "text-black"
              : "text-gray-400"
          }`}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {step.label}
        </ThemedText>
      </View>
    );
  };

  /**
   * Render connecting line between steps
   */
  const renderConnectingLine = (index: number) => {
    if (index >= STEPS.length - 1) return null;

    const isCompleted = currentStep > index + 1;
    const lineStyle: ViewStyle = {
      backgroundColor: isCompleted ? colors.lineActive : colors.lineInactive,
    };

    return (
      <View
        key={`line-${index}`}
        style={lineStyle}
        className="h-0.5 flex-1 mt-2.5 -mx-1"
      />
    );
  };

  return (
    <View className="py-7 px-12">
      <ThemedText
        fontWeight={700}
        fontSize={20}
        className="text-center text-black"
      >
        MetaVault
      </ThemedText>
      <Spacer size={24} />

      <View className="flex-row justify-between items-start w-full px-2">
        {STEPS.map((step, index) => (
          <React.Fragment key={step.key}>
            {renderStep(step, index)}
            {renderConnectingLine(index)}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

// Add display name for better debugging
ProgressStepsHeader.displayName = "ProgressStepsHeader";
