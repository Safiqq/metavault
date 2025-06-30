import { ThemedText } from "@/components/ThemedText";

const ThemedTextWithBoldNumbers = ({ text }: { text: string }) => {
  const renderTextWithBoldNumbers = () => {
    return text.split("").map((char, index) => {
      if (/\d/.test(char)) {
        return (
          <ThemedText key={index} fontSize={14} fontWeight={800}>
            {char}
          </ThemedText>
        );
      }
      return (
        <ThemedText key={index} fontSize={14}>
          {char}
        </ThemedText>
      );
    });
  };

  return (
    <ThemedText className="flex-1" fontSize={14}>
      {renderTextWithBoldNumbers()}
    </ThemedText>
  );
};

export default ThemedTextWithBoldNumbers;
