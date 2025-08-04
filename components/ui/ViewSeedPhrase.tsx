import { EyeIcon, EyeSlashIcon } from "@/assets/images/icons";
import { View } from "react-native";
import Spacer from "../Spacer";
import { ThemedText } from "../ThemedText";
import { Button } from "./Button";

interface ViewSeedPhraseProps {
  mnemonic: string[];
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
}

export const ViewSeedPhrase: React.FC<ViewSeedPhraseProps> = ({
  mnemonic,
  isVisible,
  setIsVisible,
}) => {
  return (
    <View className="bg-[#EBEBEB] py-3 px-4 rounded-lg items-center -mx-6">
      {isVisible ? (
        <EyeIcon width={24} height={24} />
      ) : (
        <EyeSlashIcon width={24} height={24} />
      )}

      <Spacer size={16} />

      <ThemedText fontWeight={700}>
        Tap to {isVisible ? "hide" : "reveal"} your Seed Phrase
      </ThemedText>

      {isVisible ? (
        <Spacer size={16} />
      ) : (
        <>
          <Spacer size={8} />

          <ThemedText>Make sure no one is watching your screen.</ThemedText>

          <Spacer size={24} />
        </>
      )}

      {isVisible && (
        <>
          <View className="flex flex-row gap-2 w-full justify-center">
            {[0, 1].map((col) => (
              <View key={col} className="flex-1 gap-2">
                {Array.from({ length: 6 }, (_, i) => {
                  const index = col * 6 + i;
                  const word = mnemonic[index];
                  return (
                    <View
                      key={index}
                      className="border rounded-xl p-2 bg-white border-black"
                    >
                      <ThemedText
                        fontWeight={700}
                        fontSize={14}
                        className="text-center"
                      >
                        {index + 1}. {word}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          <Spacer size={24} />
        </>
      )}

      <Button
        text={isVisible ? "Hide" : "View"}
        type="primary-rounded"
        onPress={() => setIsVisible(!isVisible)}
        fontWeight={700}
      />
    </View>
  );
};
