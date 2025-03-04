import React from "react";

import { Text, TextProps } from "react-native";
import { forwardRef } from "react";

interface ThemedTextProps extends TextProps {
  fontWeight?: 200 | 300 | 400 | 500 | 600 | 700 | 800;
  fontStyle?: "normal" | "italic";
  fontSize?: number;
  paddingVertical?: number;
}

export const ThemedText = forwardRef((props: ThemedTextProps, ref) => {
  let fontSize = props.fontSize ?? 16;
  let paddingVertical = props.paddingVertical ?? 6;

  let fontFamily = "";
  let fontWeight = props.fontWeight ?? 400;
  let fontStyle = props.fontStyle ?? "normal";

  if (fontStyle == "italic") {
    if (fontWeight == 200) fontFamily = "PlusJakartaSans_200ExtraLight_Italic";
    else if (fontWeight == 300) fontFamily = "PlusJakartaSans_300Light_Italic";
    else if (fontWeight == 400)
      fontFamily = "PlusJakartaSans_400Regular_Italic";
    else if (fontWeight == 500) fontFamily = "PlusJakartaSans_500Medium_Italic";
    else if (fontWeight == 600)
      fontFamily = "PlusJakartaSans_600SemiBold_Italic";
    else if (fontWeight == 700) fontFamily = "PlusJakartaSans_700Bold_Italic";
    else if (fontWeight == 800)
      fontFamily = "PlusJakartaSans_800ExtraBold_Italic";
  } else {
    if (fontWeight == 200) fontFamily = "PlusJakartaSans_200ExtraLight";
    else if (fontWeight == 300) fontFamily = "PlusJakartaSans_300Light";
    else if (fontWeight == 400) fontFamily = "PlusJakartaSans_400Regular";
    else if (fontWeight == 500) fontFamily = "PlusJakartaSans_500Medium";
    else if (fontWeight == 600) fontFamily = "PlusJakartaSans_600SemiBold";
    else if (fontWeight == 700) fontFamily = "PlusJakartaSans_700Bold";
    else if (fontWeight == 800) fontFamily = "PlusJakartaSans_800ExtraBold";
  }

  return (
    <Text
      {...props}
      style={[
        props.style,
        {
          fontSize,
          paddingVertical,
          fontFamily,
        },
      ]}
    />
  );
});
