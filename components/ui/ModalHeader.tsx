import { Pressable, View } from "react-native";
import { ThemedText } from "../ThemedText";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  onCloseDisabled?: boolean;
  children?: React.ReactNode;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  onCloseDisabled = false,
  children,
}) => {
  return (
    <View className="rounded-t-lg bg-[#EBEBEB] flex flex-row justify-between py-5 px-6">
      <View className="flex-1 items-start justify-center">
        <Pressable onPress={onClose} disabled={onCloseDisabled}>
          <ThemedText fontSize={14} className={onCloseDisabled ? "text-[#999999]" : "text-[#0099FF]"}>
            Close
          </ThemedText>
        </Pressable>
      </View>
      <View className="flex-2 items-center justify-center">
        <ThemedText
          fontSize={14}
          fontWeight={700}
          className="w-full text-center"
        >
          {title}
        </ThemedText>
      </View>
      <View className="flex-1 items-end justify-center">
        {children}
      </View>
    </View>
  );
};
