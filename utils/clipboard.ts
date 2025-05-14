import * as Clipboard from "expo-clipboard";
import { useAlert } from "@/contexts/AlertContext";

export const useClipboard = () => {
  const { alert } = useAlert();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await Clipboard.setStringAsync(text);
      alert("", `${type} copied!`, [], 2000);
    } catch (error) {
      alert(
        "Error",
        "Failed to copy to clipboard",
        [
          {
            text: "OK",
          },
        ],
        2000
      );
    }
  };

  return { copyToClipboard };
};