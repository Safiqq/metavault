import { ReactNode } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

export const MenuOption = ({
  onSelect,
  children,
}: {
  onSelect: () => void;
  children: ReactNode;
}) => {
  return (
    <TouchableOpacity onPress={onSelect} className="p-1 hover:opacity-60">
      {children}
    </TouchableOpacity>
  );
};
