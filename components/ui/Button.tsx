import React, { useCallback } from "react";
import { Pressable, PressableProps } from "react-native";
import { ThemedText } from "../ThemedText";

type ButtonType =
  | "primary"
  | "secondary"
  | "primary-rounded"
  | "secondary-rounded"
  | "danger-rounded";

type ButtonSize = "default" | "small";

interface ButtonProps extends Omit<PressableProps, "onPress"> {
  text: string;
  type?: ButtonType;
  size?: ButtonSize;
  onPress: () => void;
  fontWeight?: 200 | 300 | 400 | 500 | 600 | 700 | 800;
  fontSize?: number;
  disabled?: boolean;
}

const getButtonStyles = (type: ButtonType, size: ButtonSize, disabled: boolean): string => {
  const baseStyles = size === "small" ? "px-3 py-2" : "w-full py-5";
  const roundedStyles = type.includes("rounded")
    ? "rounded-full"
    : "rounded-xl";
  
  let colorStyles = "";
  if (type.includes("primary")) {
    colorStyles = disabled ? "bg-black opacity-50" : "bg-black";
  } else if (type.includes("danger")) {
    colorStyles = disabled ? "bg-red-500 opacity-50" : "bg-red-500";
  } else {
    colorStyles = "bg-[#D9D9D9]";
  }

  return `${baseStyles} ${roundedStyles} ${colorStyles}`;
};

const getTextStyles = (type: ButtonType, disabled: boolean): string => {
  const baseTextStyles = "text-center";
  let colorStyles = "";
  
  if (type.includes("primary") || type.includes("danger")) {
    colorStyles = "text-white";
  } else {
    colorStyles = "text-black";
  }

  return `${baseTextStyles} ${colorStyles}`;
};

const ButtonComponent = React.memo<ButtonProps>(({
  text,
  type = "primary",
  size = "default",
  onPress,
  fontWeight,
  fontSize = 14,
  disabled = false,
  ...pressableProps
}) => {
  const buttonStyles = getButtonStyles(type, size, disabled);
  const textStyles = getTextStyles(type, disabled);
  const textFontWeight = fontWeight ?? (type.includes("primary") || type.includes("danger") ? 700 : 400);

  const handlePress = useCallback(() => {
    if (!disabled) onPress();
  }, [disabled, onPress]);

  return (
    <Pressable
      className={buttonStyles}
      onPress={handlePress}
      disabled={disabled}
      {...pressableProps}
    >
      <ThemedText
        fontWeight={textFontWeight}
        fontSize={fontSize}
        className={textStyles}
      >
        {text}
      </ThemedText>
    </Pressable>
  );
});

ButtonComponent.displayName = 'Button';

export const Button = ButtonComponent;
