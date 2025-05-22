import * as Clipboard from "expo-clipboard";

export const useClipboard = () => {
  const copyToClipboard = async (text: string, type: string) => {
    await Clipboard.setStringAsync(text);
  };

  return { copyToClipboard };
};
