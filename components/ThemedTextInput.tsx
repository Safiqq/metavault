import React, { forwardRef } from "react";
import { TextInput, TextInputProps } from "react-native";

interface ThemedTextInputProps extends TextInputProps {
  fontWeight?: 200 | 300 | 400 | 500 | 600 | 700 | 800;
  fontStyle?: "normal" | "italic";
  fontSize?: number;
  paddingVertical?: number;
}

// Font family mapping for better maintainability
const FONT_FAMILY_MAP = {
  normal: {
    200: "PlusJakartaSans_200ExtraLight",
    300: "PlusJakartaSans_300Light",
    400: "PlusJakartaSans_400Regular",
    500: "PlusJakartaSans_500Medium",
    600: "PlusJakartaSans_600SemiBold",
    700: "PlusJakartaSans_700Bold",
    800: "PlusJakartaSans_800ExtraBold",
  },
  italic: {
    200: "PlusJakartaSans_200ExtraLight_Italic",
    300: "PlusJakartaSans_300Light_Italic",
    400: "PlusJakartaSans_400Regular_Italic",
    500: "PlusJakartaSans_500Medium_Italic",
    600: "PlusJakartaSans_600SemiBold_Italic",
    700: "PlusJakartaSans_700Bold_Italic",
    800: "PlusJakartaSans_800ExtraBold_Italic",
  },
} as const;

const getFontFamily = (
  fontWeight: ThemedTextInputProps["fontWeight"] = 400,
  fontStyle: ThemedTextInputProps["fontStyle"] = "normal"
): string => {
  return FONT_FAMILY_MAP[fontStyle][fontWeight];
};

export const ThemedTextInput = forwardRef<TextInput, ThemedTextInputProps>(
  (props, ref) => {
    const {
      fontWeight = 400,
      fontStyle = "normal",
      fontSize = 16,
      paddingVertical = 6,
      style,
      ...restProps
    } = props;

    const fontFamily = getFontFamily(fontWeight, fontStyle);

    return (
      <TextInput
        ref={ref}
        style={[
          {
            fontSize,
            paddingVertical,
            fontFamily,
          },
          style,
        ]}
        placeholderTextColor="#999999"
        {...restProps}
      />
    );
  }
);

ThemedTextInput.displayName = "ThemedTextInput";
