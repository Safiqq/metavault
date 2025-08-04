import React from "react";
import { ActivityIndicator, View } from "react-native";
import { ThemedText } from "../ThemedText";

interface LoadingIndicatorProps {
  size?: "small" | "large";
  color?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = "large",
  color = "#000000",
  text = "Loading...",
  fullScreen = false,
  overlay = false,
}) => {
  if (overlay) {
    return (
      <View className="absolute inset-0 flex-1 justify-center items-center bg-black/50 z-50">
        <View className="bg-white rounded-xl p-6 items-center">
          <ActivityIndicator size={size} color={color} />
          {text && (
            <>
              <View className="h-4" />
              <ThemedText fontSize={16} className="text-gray-700">
                {text}
              </ThemedText>
            </>
          )}
        </View>
      </View>
    );
  }

  if (fullScreen) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size={size} color={color} />
        {text && (
          <>
            <View className="h-4" />
            <ThemedText fontSize={16} className="text-gray-600">
              {text}
            </ThemedText>
          </>
        )}
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-center py-4">
      <ActivityIndicator size={size} color={color} />
      {text && (
        <>
          <View className="w-3" />
          <ThemedText fontSize={14} className="text-gray-600">
            {text}
          </ThemedText>
        </>
      )}
    </View>
  );
};