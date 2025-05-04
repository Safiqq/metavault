// AlertContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { View, Pressable } from "react-native";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface ModalProps {
  title: string;
  message: string;
  buttons: AlertButton[];
  onDismiss: () => void;
}

const Modal: React.FC<ModalProps> = ({
  title,
  message,
  buttons,
  onDismiss,
}) => {
  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
    onDismiss();
  };

  const renderButtons = () => {
    if (buttons.length <= 2) {
      // Use flex-row for 1-2 buttons
      return (
        <View className="flex flex-row items-center justify-center">
          {buttons.map((button, index) => (
            <React.Fragment key={index}>
              <Pressable
                className="flex-1 items-center"
                onPress={() => handleButtonPress(button)}
              >
                <ThemedText
                  className={
                    button.style === "destructive"
                      ? "text-red-500"
                      : button.style === "cancel"
                      ? "text-gray-500"
                      : "text-blue-500"
                  }
                  fontWeight={button.style === "cancel" ? 400 : 600}
                >
                  {button.text}
                </ThemedText>
              </Pressable>
              {index < buttons.length - 1 && (
                <View className="h-8 bg-gray-300 w-[1]" />
              )}
            </React.Fragment>
          ))}
        </View>
      );
    } else {
      // Use vertical stack for 3+ buttons
      return (
        <View>
          {buttons.map((button, index) => (
            <React.Fragment key={index}>
              {index > 0 && <View className="h-[1] bg-gray-300 w-full" />}
              <Pressable
                className="items-center py-3"
                onPress={() => handleButtonPress(button)}
              >
                <ThemedText
                  className={
                    button.style === "destructive"
                      ? "text-red-500"
                      : button.style === "cancel"
                      ? "text-gray-500"
                      : "text-blue-500"
                  }
                  fontWeight={button.style === "cancel" ? 400 : 600}
                >
                  {button.text}
                </ThemedText>
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      );
    }
  };

  return (
    <View className="absolute h-full w-full bg-black/50 z-20 items-center justify-center">
      <View className="bg-white rounded-xl px-4 py-3 w-3/5">
        <ThemedText fontSize={16} fontWeight={700} className="text-center">
          {title}
        </ThemedText>
        <ThemedText fontSize={14} className="text-center">
          {message}
        </ThemedText>
        <Spacer size={12} />
        {renderButtons()}
      </View>
    </View>
  );
};

interface AlertOptions {
  title: string;
  message: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertOptions | null>(null);

  const alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    const defaultButtons: AlertButton[] = [{ text: "OK" }];

    setAlertConfig({
      title,
      message: message || "",
      buttons: buttons || defaultButtons,
    });
  };

  const hideAlert = () => {
    setAlertConfig(null);
  };

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      {alertConfig && (
        <Modal
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons!}
          onDismiss={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
