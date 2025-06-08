import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Modal, View } from "react-native";

/**
 * Defines a button for the blocking alert dialog.
 */
export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AlertDialogProps {
  title: string;
  message: string;
  buttons: AlertButton[];
  onDismiss: () => void;
}

interface AlertContextType {
  showAlert: (title: string, message: string, buttons?: AlertButton[]) => void;
}

/**
 * A private component that renders a blocking, centered modal dialog.
 * It grabs the user's full attention with a dark backdrop.
 */
const AlertDialog: React.FC<AlertDialogProps> = ({
  title,
  message,
  buttons,
  onDismiss,
}) => {
  const handleButtonPress = useCallback(
    (button: AlertButton) => {
      button.onPress?.();
      onDismiss();
    },
    [onDismiss]
  );

  const getButtonType = useCallback((style?: AlertButton["style"]) => {
    switch (style) {
      case "destructive":
        return "primary" as const;
      case "cancel":
        return "secondary" as const;
      default:
        return "primary" as const;
    }
  }, []);

  const renderButtons = useMemo(() => {
    if (buttons.length === 1) {
      const button = buttons[0];
      if (!button) return;
      return (
        <View>
          <Spacer size={16} />
          <Button
            text={button.text}
            type={getButtonType(button.style)}
            onPress={() => handleButtonPress(button)}
            fontWeight={600}
          />
        </View>
      );
    }

    if (buttons.length === 2) {
      return (
        <View>
          <Spacer size={16} />
          <View className="flex-row gap-3">
            {buttons.map((button, index) => (
              <View key={index} className="flex-1">
                <Button
                  text={button.text}
                  type={getButtonType(button.style)}
                  onPress={() => handleButtonPress(button)}
                  fontWeight={button.style === "cancel" ? 400 : 600}
                />
              </View>
            ))}
          </View>
        </View>
      );
    }

    // For 3+ buttons, use vertical layout
    return (
      <View>
        <Spacer size={16} />
        <View className="gap-2">
          {buttons.map((button, index) => (
            <Button
              key={index}
              text={button.text}
              type={getButtonType(button.style)}
              onPress={() => handleButtonPress(button)}
              fontWeight={button.style === "cancel" ? 400 : 600}
            />
          ))}
        </View>
      </View>
    );
  }, [buttons, handleButtonPress, getButtonType]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      onRequestClose={onDismiss}
      statusBarTranslucent={true}
    >
      {/* Dark backdrop overlay */}
      <View className="flex-1 bg-black/25 items-center justify-center px-6">
        {/* Prevent backdrop tap from closing modal by using a non-pressable wrapper */}
        <View className="w-full max-w-2xl px-12">
          {/* Main alert container */}
          <View className="bg-white rounded-xl shadow-2xl">
            {/* Content area */}
            <View className="px-6">
              <Spacer size={24} />

              {/* Title */}
              <ThemedText
                fontSize={18}
                fontWeight={700}
                className="text-center text-black"
              >
                {title}
              </ThemedText>

              <Spacer size={12} />

              {/* Message */}
              <ThemedText
                fontSize={15}
                className="text-center text-gray-700 leading-6"
              >
                {message}
              </ThemedText>

              {/* Buttons */}
              {renderButtons}

              <Spacer size={20} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<Omit<
    AlertDialogProps,
    "onDismiss"
  > | null>(null);

  const showAlert = useCallback(
    (
      title: string,
      message: string,
      buttons: AlertButton[] = [{ text: "OK" }]
    ) => {
      setAlertConfig({ title, message, buttons });
    },
    []
  );

  const hideAlert = useCallback(() => setAlertConfig(null), []);

  const contextValue = useMemo<AlertContextType>(
    () => ({
      showAlert,
    }),
    [showAlert]
  );

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {alertConfig && <AlertDialog {...alertConfig} onDismiss={hideAlert} />}
    </AlertContext.Provider>
  );
};

/**
 * Custom hook to access alert function.
 */
export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
