import React from "react";
import { Pressable, PressableProps } from "react-native";
import { ThemedText } from "../ThemedText";

type ButtonType = "primary" | "secondary" | "primary-rounded" | "secondary-rounded";

interface ButtonProps extends Omit<PressableProps, 'onPress'> {
  text: string;
  type?: ButtonType;
  onPress: () => void;
  fontWeight?: 200 | 300 | 400 | 500 | 600 | 700 | 800;
  fontSize?: number;
  disabled?: boolean;
}

const getButtonStyles = (type: ButtonType, disabled: boolean): string => {
  const baseStyles = "w-full py-5";
  const roundedStyles = type.includes("rounded") ? "rounded-full" : "rounded-xl";
  const colorStyles = type.includes("primary") 
    ? (disabled ? "bg-black opacity-50" : "bg-black") 
    : "bg-[#D9D9D9]";
  
  return `${baseStyles} ${roundedStyles} ${colorStyles}`;
};

const getTextStyles = (type: ButtonType, disabled: boolean): string => {
  const baseTextStyles = "text-center";
  const colorStyles = type.includes("primary") 
    ? (disabled ? "text-gray-500" : "text-white") 
    : "text-black";
  
  return `${baseTextStyles} ${colorStyles}`;
};

export const Button: React.FC<ButtonProps> = ({
  text,
  type = "primary",
  onPress,
  fontWeight,
  fontSize = 14,
  disabled = false,
  ...pressableProps
}) => {
  const buttonStyles = getButtonStyles(type, disabled);
  const textStyles = getTextStyles(type, disabled);
  const textFontWeight = fontWeight ?? (type.includes("primary") ? 700 : 400);

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

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
};
