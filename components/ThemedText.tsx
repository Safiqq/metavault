import React, { forwardRef, memo, useMemo } from "react";
import {
  Text,
  TextProps,
  TextStyle,
  Platform,
} from "react-native";

// Types
type FontWeight = 200 | 300 | 400 | 500 | 600 | 700 | 800;
type FontStyle = "normal" | "italic";

export interface ThemedTextProps extends TextProps {
  /** Font weight (200-800) - handled via props, not className */
  fontWeight?: FontWeight;
  /** Font style (normal or italic) - handled via props, not className */
  fontStyle?: FontStyle;
  /** Font size in pixels - handled via props, not className */
  fontSize?: number;
  /** CSS class names for styling (except fontFamily and fontSize) */
  className?: string;
}

// Constants
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_FONT_WEIGHT: FontWeight = 400;
const DEFAULT_FONT_STYLE: FontStyle = "normal";

/**
 * Font family mapping for better maintainability and type safety
 * Maps font weights and styles to their corresponding font family names
 */
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

/**
 * Get the appropriate font family based on weight and style
 * @param fontWeight - Font weight (200-800)
 * @param fontStyle - Font style (normal or italic)
 * @returns The corresponding font family name
 */
const getFontFamily = (
  fontWeight: FontWeight = DEFAULT_FONT_WEIGHT,
  fontStyle: FontStyle = DEFAULT_FONT_STYLE
): string => {
  try {
    const fontFamily = FONT_FAMILY_MAP[fontStyle]?.[fontWeight];
    if (!fontFamily) {
      console.error(
        `Invalid font configuration - weight: ${fontWeight}, style: ${fontStyle}`
      );
      return FONT_FAMILY_MAP.normal[DEFAULT_FONT_WEIGHT];
    }
    return fontFamily;
  } catch (error) {
    console.error(
      `Invalid font configuration - weight: ${fontWeight}, style: ${fontStyle}`,
      error
    );
    return FONT_FAMILY_MAP.normal[DEFAULT_FONT_WEIGHT];
  }
};


/**
 * A customizable text component that supports theming, accessibility, and platform-specific styles.
 * Uses className for most styling attributes, except fontFamily and fontSize which are handled via props.
 */
const ThemedTextComponent = forwardRef<Text, ThemedTextProps>((props, ref) => {
  const {
    fontWeight = DEFAULT_FONT_WEIGHT,
    fontStyle = DEFAULT_FONT_STYLE,
    fontSize = DEFAULT_FONT_SIZE,
    className,
    style,
    children,
    ...restProps
  } = props;

  const fontFamily = getFontFamily(fontWeight, fontStyle);

  // Memoize only the font-related styles to prevent unnecessary recalculations
  const fontStyles = useMemo<TextStyle>(
    () => ({
      fontFamily,
      fontSize,
      // Platform-specific font rendering optimizations
      ...Platform.select({
        android: {
          includeFontPadding: false, // Remove default padding on Android
        },
        web: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      }),
    }),
    [fontFamily, fontSize]
  );

  return (
    <Text
      ref={ref}
      style={[fontStyles, style]}
      className={className}
      accessibilityRole="text"
      accessible={true}
      {...restProps}
    >
      {children}
    </Text>
  );
});

ThemedTextComponent.displayName = "ThemedText";

// Memoize the component to prevent unnecessary re-renders
export const ThemedText = memo(ThemedTextComponent);
ThemedText.displayName = "ThemedText";

// Export the type for consumers
export type ThemedTextType = typeof ThemedText;
