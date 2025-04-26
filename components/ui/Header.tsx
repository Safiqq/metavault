import { View, Pressable } from "react-native";
import { ThemedText } from "../ThemedText";
import { Image } from "react-native";

interface HeaderProps {
  leftButtonText?: string;
  leftButtonBackImage?: boolean;
  leftButtonCallback?: () => void;
  titleText: string;
  rightButtonText?: string;
  rightButtonCallback?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  leftButtonText,
  leftButtonBackImage,
  leftButtonCallback,
  titleText,
  rightButtonText,
  rightButtonCallback,
}) => {
  return (
    <View className="p-6 border-b border-[#EBEBEB] flex flex-row items-center">
      {leftButtonText && (
        <View className="flex-1">
          <Pressable
            className="flex flex-row items-center"
            onPress={leftButtonCallback}
          >
            {leftButtonBackImage && (
              <Image
                className="max-w-6 max-h-6"
                source={require("@/assets/images/arrow-left.png")}
              />
            )}
            <ThemedText
              fontSize={10}
              fontWeight={600}
              className="text-[#0099FF] -ml-1"
            >
              {leftButtonText}
            </ThemedText>
          </Pressable>
        </View>
      )}
      <View className="flex-1">
        <ThemedText fontSize={20} fontWeight={700} className="text-center">
          {titleText}
        </ThemedText>
      </View>
      {rightButtonText && <View className="flex-1"></View>}
    </View>
  );
};
