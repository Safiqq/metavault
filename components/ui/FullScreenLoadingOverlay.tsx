import React from "react";
import { Modal, View, ActivityIndicator } from "react-native";
import { ThemedText } from "../ThemedText";

interface FullScreenLoadingOverlayProps {
  visible: boolean;
  text?: string;
  size?: "small" | "large";
  color?: string;
}

export const FullScreenLoadingOverlay: React.FC<
  FullScreenLoadingOverlayProps
> = ({ visible, text = "Loading...", size = "small", color = "#000000" }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl p-8 items-center shadow-2xl min-w-[200px]">
          <ActivityIndicator size={size} color={color} />
          {text && (
            <>
              <View className="h-4" />
              <ThemedText fontSize={14} className="text-gray-700 text-center">
                {text}
              </ThemedText>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
